# Value Mapping Feature Guide

## Overview
The Value Mapping feature allows you to normalize and transform field values during comparison. This is especially useful for:
- ID normalization (e.g., `1` → `user_1`)
- Status mapping (e.g., `0` → `inactive`, `1` → `active`)
- Code lookups (e.g., `NY` → `New York`)

## How It Works

### UI Interface
When you create a field mapping, you'll now see a **"Value Mapping (Optional)"** section where you can:

1. **Add Value Mappings**: Enter key-value pairs
   - **From value**: The original value in the CSV
   - **To value**: What it should be transformed to
   - Press Enter or click "Add" to save

2. **View Mappings**: All defined mappings are shown below with an easy remove option

3. **Preview**: The "Advanced Pipeline" section shows the final pipeline that will be executed

### Example Use Cases

#### Case 1: ID Normalization
**Scenario**: External CSV has numeric IDs, Velaris has prefixed IDs

**External CSV**:
```csv
id,name
1,John
2,Jane
```

**Velaris CSV**:
```csv
user_id,full_name
user_1,John Doe
user_2,Jane Smith
```

**Setup in UI**:
- Map `id` → `user_id`
- In External Value Map, add:
  - `1` → `user_1`
  - `2` → `user_2`

#### Case 2: Status Code Translation
**Scenario**: Different status representations

**External CSV**:
```csv
id,status
101,0
102,1
```

**Velaris CSV**:
```csv
id,account_status
101,inactive
102,active
```

**Setup in UI**:
- Map `status` → `account_status`
- In External Value Map, add:
  - `0` → `inactive`
  - `1` → `active`

#### Case 3: State Code Expansion
**Scenario**: Abbreviations vs full names

**External CSV**:
```csv
customer_id,state
C1,NY
C2,CA
```

**Velaris CSV**:
```csv
customer_id,state_name
C1,New York
C2,California
```

**Setup in UI**:
- Map `state` → `state_name`
- In External Value Map, add:
  - `NY` → `New York`
  - `CA` → `California`

## Combined with Other Transforms

You can combine value mapping with other transforms:

1. **Value Map + Trim**:
   - Select "trim" checkbox
   - Add value mappings
   - Result: Values are trimmed first, then mapped

2. **Pipeline + Value Map**:
   - Add custom pipeline: `lower|trim`
   - Add value mappings
   - Result: Pipeline executes first, then value mapping

### Execution Order:
1. Selected transforms (trim, lower, upper)
2. Custom pipeline operations
3. Value mapping (automatically appended)

## Backend Implementation

The value mappings are automatically converted to `map({"key":"value"})` operations in the pipeline.

**Example**:
```
Value Map: {"1": "user_1", "2": "user_2"}
↓
Pipeline: map({"1":"user_1","2":"user_2"})
```

## Tips

- **Exact Matching**: Value mapping uses exact string matching
- **Case Sensitive**: `"Active"` ≠ `"active"` (use transforms if needed)
- **Missing Values**: Unmapped values pass through unchanged
- **Combine Wisely**: Use transforms before mapping for normalization

## Advanced: Direct Pipeline Entry

If you prefer, you can skip the UI and directly write in the Advanced Pipeline:
```
trim|lower|map({"ny":"New York","ca":"California"})
```

The Visual Value Mapping interface is recommended for clarity and ease of use.
