def compare_values(a, b, rule):
    if rule == "equals":
        return a == b
    if rule == "case_insensitive_equals":
        return str(a).lower() == str(b).lower()
    if rule == "contains":
        return str(a) in str(b)
    return False

def compare_records(external, velaris, config):
    key_e = config["key_fields"]["external"]
    key_v = config["key_fields"]["velaris"]

    external = external.set_index(key_e)
    velaris = velaris.set_index(key_v)

    results = {
        "matched": [],
        "mismatched": [],
        "missing_in_velaris": [],
        "missing_in_external": []
    }

    # Compare matching keys
    for key in external.index:
        if key not in velaris.index:
            results["missing_in_velaris"].append(key)
            continue

        diff = {}
        for m in config["mappings"]:
            e = m["external"]
            v = m["velaris"]
            rule = m["rule"]

            a = external.loc[key][e]
            b = velaris.loc[key][v]

            if not compare_values(a, b, rule):
                diff[e] = { "external": a, "velaris": b }

        if diff:
            results["mismatched"].append({"id": key, "differences": diff})
        else:
            results["matched"].append(key)

    # Find velaris rows missing in external
    for key in velaris.index:
        if key not in external.index:
            results["missing_in_external"].append(key)

    return results
