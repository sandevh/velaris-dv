def apply_transform(val, transforms):
    if not transforms:
        return val
    for t in transforms:
        if t == "trim":
            val = str(val).strip()
        if t == "lower":
            val = str(val).lower()
        if t == "upper":
            val = str(val).upper()
    return val

def apply_mapping(external_df, velaris_df, config):
    """
    Apply transforms defined in mapping config to external CSV
    """
    external = external_df.copy()
    velaris = velaris_df.copy()

    for m in config["mappings"]:
        e = m["external"]
        v = m["velaris"]
        transforms = m.get("transform", [])

        if e in external.columns:
            external[e] = external[e].apply(lambda x: apply_transform(x, transforms))

    return external, velaris
