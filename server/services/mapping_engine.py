# Dynamic transform registry - add new transforms here
TRANSFORM_REGISTRY = {
    "trim": lambda x: str(x).strip(),
    "lower": lambda x: str(x).lower(),
    "upper": lambda x: str(x).upper(),
    "strip_spaces": lambda x: str(x).replace(" ", ""),
    "capitalize": lambda x: str(x).capitalize(),
    "title": lambda x: str(x).title(),
}

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

def apply_mapping(external_df, velaris_df, config):
    """
    Apply transforms defined in mapping config to BOTH external and velaris CSVs.
    Mapping entries now use keys:
      external_field, velaris_field, external_transforms, velaris_transforms
    """
    external = external_df.copy()
    velaris = velaris_df.copy()

    for m in config["mappings"]:
        e = m.get("external_field")
        v = m.get("velaris_field")
        ext_transforms = m.get("external_transforms", [])
        vel_transforms = m.get("velaris_transforms", [])

        if e in external.columns and ext_transforms:
            external[e] = external[e].apply(lambda x: apply_transform(x, ext_transforms))
        if v in velaris.columns and vel_transforms:
            velaris[v] = velaris[v].apply(lambda x: apply_transform(x, vel_transforms))

    return external, velaris
