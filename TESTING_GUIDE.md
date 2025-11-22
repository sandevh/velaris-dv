# CSV Comparison Tool - Testing Guide

This guide walks you through testing all features of the CSV comparison tool using the provided sample files.

## Sample Data Overview

### External CSV (`sample_external.csv`)
- **Key Field**: `customer_id` (format: `ext_001`, `ext_002`, etc.)
- **Fields**: customer_id, customer_name, email_address, subscription_status, monthly_revenue, region, signup_date, account_tier
- **8 records** with various data quality issues to test transformations

### Velaris CSV (`sample_velaris.csv`)
- **Key Field**: `account_id` (format: `001`, `002`, etc.)
- **Fields**: account_id, company_name, contact_email, status, mrr, territory, onboarding_date, plan_type
- **6 records** with different formats and naming conventions

---

## Test Scenarios

### 1. Basic Key Field Mapping (ID Transformation)
**Objective**: Match records by transforming external IDs to match Velaris format

**Steps**:
1. Upload both CSV files
2. In **Key Fields** section:
   - External: Select `customer_id`
   - Velaris: Select `account_id`
3. Click **Add Transformation** on `customer_id`
4. Use this code to remove "ext_" prefix:
   ```javascript
   // Remove 'ext_' prefix to match Velaris ID format
   return value.replace('ext_', '');
   ```
5. Click **Test** - should show: `ext_001` → `001`
6. Click **Save**, then **Compare CSVs**

**Expected Result**: Should match 5 records (001, 002, 003, 006, 007)

---

### 2. Email Standardization (Case Normalization)
**Objective**: Compare emails by converting to lowercase

**Steps**:
1. Upload both CSVs and set key fields (with ID transformation from Test 1)
2. Add field comparison:
   - External: `email_address`
   - Velaris: `contact_email`
3. Click **Add Transformation** on `email_address`
4. Add this transformation:
   ```javascript
   // Normalize email to lowercase for comparison
   return value.toLowerCase();
   ```
5. Test with sample: `CONTACT@ACME.COM` → `contact@acme.com`

**Expected Result**: Emails should match correctly despite case differences

---

### 3. Status Value Mapping (Conditional Logic)
**Objective**: Map different status values to standard format

**Steps**:
1. Add field comparison:
   - External: `subscription_status`
   - Velaris: `status`
2. Click **Add Transformation** on `subscription_status`
3. Use the **✨ AI Help** button with prompt:
   ```
   Convert status to lowercase. Map INACTIVE to inactive, ACTIVE to active, TRIAL to trial, PAUSED to paused, CANCELLED to churned
   ```
   OR manually add:
   ```javascript
   // Normalize status values
   var normalized = value.toLowerCase();
   if (normalized === 'cancelled') return 'churned';
   return normalized;
   ```

**Expected Result**: Status values standardized for accurate comparison

---

### 4. Numeric Data Cleaning (Whitespace Handling)
**Objective**: Clean numeric values with extra whitespace

**Steps**:
1. Add field comparison:
   - External: `monthly_revenue`
   - Velaris: `mrr`
2. Click **Add Transformation** on `monthly_revenue`
3. Select template **"Parse Number"** or add:
   ```javascript
   // Remove whitespace and convert to number
   return parseFloat(value.toString().trim());
   ```

**Expected Result**: Revenue values compared correctly (ext_007 has `  3500  ` with spaces)

---

### 5. Region/Territory Mapping (Complex Transformation)
**Objective**: Map detailed region codes to simplified territories

**Steps**:
1. Add field comparison:
   - External: `region`
   - Velaris: `territory`
2. Click **Add Transformation** on `region`
3. Use AI Help with prompt:
   ```
   Map "North America" to "US-EAST", "Europe" to "EU-WEST", "Asia Pacific" to "APAC"
   ```
   OR manually add:
   ```javascript
   // Map region to territory codes
   if (value === 'North America') return 'US-EAST';
   if (value === 'Europe') return 'EU-WEST';
   if (value === 'Asia Pacific') return 'APAC';
   return value;
   ```

**Note**: This won't match all records perfectly (demonstrates data inconsistency)

---

### 6. Date Format Transformation
**Objective**: Convert date formats for comparison

**Steps**:
1. Add field comparison:
   - External: `signup_date`
   - Velaris: `onboarding_date`
2. Click **Add Transformation** on `signup_date`
3. Use this code to convert YYYY-MM-DD to MM/DD/YYYY:
   ```javascript
   // Convert date format from YYYY-MM-DD to MM/DD/YYYY
   var parts = value.split('-');
   return parts[1] + '/' + parts[2] + '/' + parts[0];
   ```
4. Test with: `2023-01-15` → `01/15/2023`

**Expected Result**: Dates formatted consistently for comparison

---

### 7. Plan/Tier Standardization
**Objective**: Map similar plan names with case differences

**Steps**:
1. Add field comparison:
   - External: `account_tier`
   - Velaris: `plan_type`
2. Click **Add Transformation** on `account_tier`
3. Use template **"Capitalize First Letter"** or add:
   ```javascript
   // Capitalize first letter to match format
   return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
   ```

**Expected Result**: Plans match (premium→Premium, enterprise→Enterprise, etc.)

---

### 8. Using Filters
**Objective**: Compare only active/trial accounts

**Steps**:
1. Before field mapping, go to **Filters** section
2. Add External filter:
   - Field: `subscription_status`
   - Operator: `contains`
   - Value: `ACTIVE,TRIAL` (comma-separated)
3. Add Velaris filter:
   - Field: `status`
   - Operator: `equals`
   - Value: `active`
4. Proceed with comparison

**Expected Result**: Only active/trial records compared, others excluded

---

### 9. AI-Generated Transformations
**Objective**: Test Gemini AI code generation

**Try these prompts**:
- "Extract only the numbers from the value"
- "Convert to uppercase and remove spaces"
- "If value is greater than 5000, return 'high', else return 'low'"
- "Add prefix 'EXT-' to the value"
- "Parse as integer and multiply by 1.1"

**Note**: Review generated code before saving!

---

## Expected Comparison Results

With proper transformations, you should see:

### Matched Records (5):
- ext_001 ↔ 001 (Acme Corporation)
- ext_002 ↔ 002 (TechStart Inc)
- ext_003 ↔ 003 (Global Solutions)
- ext_006 ↔ 006 (Enterprise Co)
- ext_007 ↔ 007 (StartupHub)

### Only in External (3):
- ext_004 (Innovation Labs)
- ext_005 (Digital Dynamics)
- ext_008 (CloudFirst Inc)

### Only in Velaris (1):
- 009 (DataCorp)

### Field-Level Differences:
- **ext_002/002**: Revenue mismatch (2500 vs 3000)
- **ext_006/006**: Status differs (PAUSED/paused if not transformed)
- **ext_007/007**: May have territory/region mismatch

---

## Pro Tips

1. **Use Live Testing**: Always test transformations with sample values before saving
2. **Build Incrementally**: Start with key field matching, then add field comparisons one by one
3. **Check Results**: Review the comparison output to verify transformations worked
4. **AI Assistant**: Great for complex logic, but always review and test the generated code
5. **Templates**: Quick starting point for common transformations
6. **Reset**: Use "Reset All" button to clear everything and start fresh

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| No matches found | Check key field transformation is correct |
| Too many mismatches | Review field transformations, check for whitespace/case issues |
| Transformation error | Use simpler JavaScript, avoid ES6 features like arrow functions |
| AI generates function wrapper | This is now fixed - AI should only return function body |

---

## Next Steps

After testing:
1. Try your own CSV files
2. Save successful transformation patterns for reuse
3. Experiment with complex multi-step transformations
4. Use filters to focus on specific subsets of data
5. Export results for further analysis

Happy testing! 🚀
