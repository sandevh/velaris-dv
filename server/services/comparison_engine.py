# Dynamic comparison rules registry - add new rules here
COMPARISON_REGISTRY = {
    "equals": lambda a, b: a == b,
    "case_insensitive_equals": lambda a, b: str(a).lower() == str(b).lower(),
    "contains": lambda a, b: str(a) in str(b),
    "starts_with": lambda a, b: str(b).startswith(str(a)),
    "ends_with": lambda a, b: str(b).endswith(str(a)),
    "not_equals": lambda a, b: a != b,
    "greater_than": lambda a, b: float(a) > float(b) if str(a).replace('.','',1).isdigit() and str(b).replace('.','',1).isdigit() else False,
    "less_than": lambda a, b: float(a) < float(b) if str(a).replace('.','',1).isdigit() and str(b).replace('.','',1).isdigit() else False,
}

def compare_values(a, b, rule):
    """
    Compare values dynamically from the registry.
    New comparison rules can be added to COMPARISON_REGISTRY without code changes.
    """
    if rule in COMPARISON_REGISTRY:
        try:
            return COMPARISON_REGISTRY[rule](a, b)
        except Exception as e:
            print(f"Warning: Error in comparison rule '{rule}': {e}")
            return False
    else:
        print(f"Warning: Unknown rule '{rule}', defaulting to 'equals'")
        return a == b

def compare_records(external, velaris, config):
    key_e = config["key_fields"]["external_field"]
    key_v = config["key_fields"]["velaris_field"]

    # Validate key fields exist
    if key_e not in external.columns:
        raise ValueError(f"Key field '{key_e}' not found in external CSV")
    if key_v not in velaris.columns:
        raise ValueError(f"Key field '{key_v}' not found in velaris CSV")

    external = external.set_index(key_e)
    velaris = velaris.set_index(key_v)

    results = {
        "matched": [],
        "mismatched": [],
        "missing_in_velaris": [],
        "missing_in_external": []
    }

    for key in external.index:
        if key not in velaris.index:
            results["missing_in_velaris"].append(str(key))
            continue

        diff = {}
        for m in config["mappings"]:
            e = m["external_field"]
            v = m["velaris_field"]
            rule = m["rule"]

            # Skip if the field is the key field (it's now the index, not a column)
            if e == key_e or v == key_v:
                continue

            # Check if fields exist in the dataframe
            if e not in external.columns:
                raise ValueError(f"Field '{e}' not found in external CSV")
            if v not in velaris.columns:
                raise ValueError(f"Field '{v}' not found in velaris CSV")

            a = external.loc[key][e]
            b = velaris.loc[key][v]

            if not compare_values(a, b, rule):
                diff[e] = {"external": str(a), "velaris": str(b)}

        if diff:
            results["mismatched"].append({"id": str(key), "differences": diff})
        else:
            results["matched"].append(str(key))

    for key in velaris.index:
        if key not in external.index:
            results["missing_in_external"].append(str(key))

    return results
