import json
import re

# JavaScript-to-Python translation for custom functions
def execute_custom_function(value, js_code):
    """
    Execute user-provided JavaScript-like transformation code safely.
    Translates common JS patterns to Python.
    """
    if not js_code or not js_code.strip():
        return value
    
    try:
        # Clean up the code
        code = js_code.strip()
        
        # Remove comments
        code = re.sub(r'//.*$', '', code, flags=re.MULTILINE)
        code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
        
        # Translate common JS to Python
        translations = [
            (r'value\.toString\(\)', 'str(value)'),
            (r'value\.trim\(\)', 'str(value).strip()'),
            (r'value\.toLowerCase\(\)', 'str(value).lower()'),
            (r'value\.toUpperCase\(\)', 'str(value).upper()'),
            (r'parseInt\(([^)]+)\)', r'int(\1)'),
            (r'parseFloat\(([^)]+)\)', r'float(\1)'),
            (r'\.replace\(([^,]+),\s*([^)]+)\)', r'.replace(\1, \2)'),
            (r'\.split\(([^)]+)\)', r'.split(\1)'),
            (r'\.join\(([^)]+)\)', r'.join(\1)'),
            (r'\.substring\(([^)]+)\)', r'[\1]'),
            (r'\.includes\(([^)]+)\)', r' in '),
        ]
        
        for pattern, replacement in translations:
            code = re.sub(pattern, replacement, code)
        
        # Handle simple return statements
        if 'return' not in code:
            # If no explicit return and it's a single expression, add return
            has_multiple_statements = ';' in code or code.count('\n') > 0
            has_control_flow = any(kw in code for kw in ['if ', 'for ', 'while ', 'def '])
            
            if not has_multiple_statements and not has_control_flow:
                code = f'return {code}'
        
        # Create a safe execution environment
        safe_globals = {
            '__builtins__': {
                'str': str,
                'int': int,
                'float': float,
                'len': len,
                'range': range,
                'True': True,
                'False': False,
                'None': None,
            }
        }
        safe_locals = {'value': value}
        
        # Execute the code
        exec(f"def transform_fn(value):\n    {code.replace(chr(10), chr(10) + '    ')}", safe_globals, safe_locals)
        result = safe_locals['transform_fn'](value)
        
        return result if result is not None else value
        
    except Exception as e:
        print(f"Warning: Custom function execution failed: {e}")
        return value

# Dynamic transform registry - add new transforms here (simple, no-arg)
TRANSFORM_REGISTRY = {
    "trim": lambda x: str(x).strip(),
    "lower": lambda x: str(x).lower(),
    "upper": lambda x: str(x).upper(),
    "strip_spaces": lambda x: str(x).replace(" ", ""),
    "capitalize": lambda x: str(x).capitalize(),
    "title": lambda x: str(x).title(),
}

# Allowed pipeline operations with (optional) arguments.
# Each entry maps to a handler that receives (value, *args)
PIPELINE_OPERATIONS = {
    "replace": lambda v, old, new: str(v).replace(old, new),
    "substring": lambda v, start, end=None: str(v)[int(start): (int(end) if end is not None else None)],
    "to_int": lambda v: int(str(v)) if str(v).strip() != '' else v,
    "to_float": lambda v: float(str(v)) if str(v).strip() != '' else v,
    "map": lambda v, mapping: mapping.get(str(v), v),  # mapping is a dict
}

PIPELINE_SAFE_BUILTINS = {"True": True, "False": False, "None": None}

def apply_transform(val, transforms):
    """
    Apply transforms dynamically from the registry.
    New transforms can be added to TRANSFORM_REGISTRY without code changes.
    """
    if not transforms:
        return val
    for t in transforms:
        if t in TRANSFORM_REGISTRY:
            val = TRANSFORM_REGISTRY[t](val)
        else:
            # Skip unknown transforms or log warning
            print(f"Warning: Unknown transform '{t}' skipped")
    return val

def parse_pipeline(pipeline_str):
    """Parse a pipeline string into a list of (op, args) tuples.
    Syntax examples:
      trim|lower|replace(foo,bar)|substring(0,3)|map({"NY":"New York"})|to_int
    Whitespace around tokens is ignored.
    """
    steps = []
    if not pipeline_str or not pipeline_str.strip():
        return steps
    tokens = [t.strip() for t in pipeline_str.split('|') if t.strip()]
    for token in tokens:
        m = re.match(r'^(\w+)(\((.*)\))?$', token)
        if not m:
            print(f"Warning: Invalid pipeline token '{token}' skipped")
            continue
        op = m.group(1)
        arg_str = m.group(3)
        args = []
        if arg_str:
            # Special handling for map(...) containing JSON
            if op == 'map':
                try:
                    args.append(json.loads(arg_str))
                except Exception as e:
                    print(f"Warning: map() JSON parse failed for '{arg_str}': {e}")
                    continue
            else:
                raw_args = [a.strip() for a in arg_str.split(',')]
                args.extend(raw_args)
        steps.append((op, args))
    return steps

def apply_custom_pipeline(val, pipeline_str):
    """Apply a parsed pipeline of operations to a single value."""
    if val is None:
        return val
    steps = parse_pipeline(pipeline_str)
    for op, args in steps:
        # First check simple TRANSFORM_REGISTRY (no args)
        if op in TRANSFORM_REGISTRY and not args:
            try:
                val = TRANSFORM_REGISTRY[op](val)
            except Exception as e:
                print(f"Warning: transform '{op}' failed: {e}")
            continue
        # Then pipeline operations with args
        if op in PIPELINE_OPERATIONS:
            handler = PIPELINE_OPERATIONS[op]
            try:
                val = handler(val, *args)
            except Exception as e:
                print(f"Warning: pipeline op '{op}' failed: {e}")
        else:
            print(f"Warning: unknown pipeline op '{op}'")
    return val

def apply_mapping(external_df, velaris_df, config):
    """
    Apply transforms defined in mapping config to BOTH external and velaris CSVs.
    Mapping entries now use keys:
      external_field, velaris_field, external_transforms, velaris_transforms,
      external_custom (pipeline or JS function), velaris_custom
    """
    external = external_df.copy()
    velaris = velaris_df.copy()

    for m in config["mappings"]:
        e = m.get("external_field")
        v = m.get("velaris_field")
        ext_transforms = m.get("external_transforms", [])
        vel_transforms = m.get("velaris_transforms", [])
        ext_custom = m.get("external_custom", "")
        vel_custom = m.get("velaris_custom", "")

        if e in external.columns:
            if ext_transforms:
                external[e] = external[e].apply(lambda x: apply_transform(x, ext_transforms))
            if ext_custom:
                # Check if it's a pipeline (contains |) or custom JS function
                if '|' in ext_custom or any(op in ext_custom for op in ['trim', 'lower', 'upper', 'replace(', 'map(']):
                    # Pipeline operations
                    external[e] = external[e].apply(lambda x: apply_custom_pipeline(x, ext_custom))
                else:
                    # Custom JavaScript function
                    external[e] = external[e].apply(lambda x: execute_custom_function(x, ext_custom))
        if v in velaris.columns:
            if vel_transforms:
                velaris[v] = velaris[v].apply(lambda x: apply_transform(x, vel_transforms))
            if vel_custom:
                # Check if it's a pipeline (contains |) or custom JS function
                if '|' in vel_custom or any(op in vel_custom for op in ['trim', 'lower', 'upper', 'replace(', 'map(']):
                    # Pipeline operations
                    velaris[v] = velaris[v].apply(lambda x: apply_custom_pipeline(x, vel_custom))
                else:
                    # Custom JavaScript function
                    velaris[v] = velaris[v].apply(lambda x: execute_custom_function(x, vel_custom))

    return external, velaris
