# Advanced Transformation Pipeline Guide

## 🎯 Overview
The **Advanced Transformations** feature allows you to build custom data transformation pipelines to shape your data before comparison. This is more powerful than simple value mapping and supports complex transformations.

## 🚀 How to Use

### 1. **Open the Pipeline Builder**
In any field mapping, expand **"⚙️ Advanced Transformations (Optional)"** and click **"▶ Open Pipeline Builder"**

### 2. **Choose Operations by Category**

#### **Text Operations**
- **Trim whitespace** - Remove leading/trailing spaces
- **Lowercase** - Convert to lowercase
- **Uppercase** - Convert to UPPERCASE
- **Capitalize** - First letter uppercase
- **Title Case** - Capitalize Each Word
- **Remove all spaces** - Strip all whitespace

#### **Manipulation**
- **Replace text** - Replace occurrences: `replace(old,new)`
- **Extract substring** - Get portion of text: `substring(0,5)`

#### **Conversion**
- **Convert to integer** - Parse as number
- **Convert to decimal** - Parse as float

#### **Advanced**
- **Add prefix** - Prepend text to value
- **Extract numbers only** - Remove non-numeric characters

### 3. **Build Your Pipeline**
Click on operations to add them to your pipeline. They execute in order from left to right.

**Example Pipeline:**
```
trim|lower|replace( ,_)|substring(0,10)
```
This pipeline:
1. Trims whitespace
2. Converts to lowercase
3. Replaces spaces with underscores
4. Takes first 10 characters

## 📋 Real-World Examples

### Example 1: Normalize Email Addresses
```
trim|lower
```
**Input:** `  JohnDoe@EXAMPLE.COM  `
**Output:** `johndoe@example.com`

### Example 2: Extract User ID from Prefixed String
```
replace(user_,)|to_int
```
**Input:** `user_12345`
**Output:** `12345`

### Example 3: Clean Phone Numbers
```
strip_spaces|replace(-,)|replace((,)|replace(),)
```
**Input:** `(555) 123-4567`
**Output:** `5551234567`

### Example 4: Format Product Codes
```
trim|upper|substring(0,8)
```
**Input:** `  abc-12345-xyz  `
**Output:** `ABC-1234`

### Example 5: Standardize Country Codes
```
trim|upper|substring(0,2)
```
**Input:** `  united states  `
**Output:** `UN`

## 🔗 Combining with Value Mapping

You can use **both** Advanced Transformations and Value Mapping together:

1. **Advanced Transformations** run first (normalize the format)
2. **Value Mapping** runs second (lookup/replace specific values)

**Example Workflow:**
```
Field: status_code
Advanced Transform: trim|to_int
Value Mapping: 
  1 → active
  2 → inactive
  3 → pending

Input: "  1  " → trim|to_int → 1 → map → "active"
```

## 💡 Tips & Best Practices

1. **Start Simple** - Add one operation at a time and test
2. **Order Matters** - Operations execute left to right
3. **Use Direct Input** - For complex pipelines, type them manually
4. **Test with Value Mapping** - Combine both for powerful transformations
5. **Common Pattern**: `trim|lower` - Almost always useful for text comparison

## 🛠️ Available Operations Reference

| Operation | Syntax | Example |
|-----------|--------|---------|
| Trim | `trim` | `"  hello  "` → `"hello"` |
| Lowercase | `lower` | `"HELLO"` → `"hello"` |
| Uppercase | `upper` | `"hello"` → `"HELLO"` |
| Replace | `replace(old,new)` | `replace(foo,bar)` |
| Substring | `substring(start,end)` | `substring(0,5)` |
| To Integer | `to_int` | `"123"` → `123` |
| To Float | `to_float` | `"123.45"` → `123.45` |
| Map Values | `map({"key":"val"})` | Auto-added from Value Mapping |

## ⚠️ Important Notes

- Transformations are applied to **EACH VALUE** in the field
- Invalid operations are skipped with warnings in logs
- Value mapping is automatically appended to your custom pipeline
- Pipelines are separated by the pipe `|` character
- Arguments are comma-separated inside parentheses

## 🎓 Advanced: Custom Pipeline Syntax

If you're comfortable with pipeline syntax, you can type directly:

```
trim|lower|replace(old,new)|substring(0,10)|map({"a":"b"})
```

Each operation is separated by `|` and executes left-to-right on the value.

---

**Need Help?** The builder provides templates for common operations. Start there and customize as needed!
