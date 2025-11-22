from typing import List, Union, Optional, Any, Dict, Literal, Tuple
from pydantic import BaseModel, Field
from datetime import datetime
import re
import logging
import pandas as pd

logger = logging.getLogger(__name__)

# Supported operators and data types
Operator = Literal['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'not_null', 'regex']
DataType = Literal['string', 'number', 'date', 'boolean']
Logic = Literal['AND', 'OR']

class FilterCondition(BaseModel):
    field: str
    operator: Operator
    data_type: DataType
    value: Optional[Union[str, int, float, bool]] = None

class FilterGroup(BaseModel):
    logic: Logic = 'AND'
    conditions: List[FilterCondition] = Field(default_factory=list)

# Coercion helper

def coerce_value(value: Any, target_type: DataType) -> Any:
    if value is None:
        return None
    try:
        if target_type == 'string':
            return str(value)
        elif target_type == 'number':
            if isinstance(value, (int, float)):
                return value
            return float(value)
        elif target_type == 'boolean':
            if isinstance(value, bool):
                return value
            return str(value).lower() == 'true'
        elif target_type == 'date':
            if isinstance(value, datetime):
                return value
            return datetime.fromisoformat(str(value))
    except (ValueError, TypeError):
        logger.warning(f"Failed to coerce value '{value}' to type '{target_type}'")
        return None
    return value


def evaluate_condition(record: Dict[str, Any], condition: FilterCondition) -> bool:
    field_value = record.get(condition.field)
    if condition.operator == 'not_null':
        return field_value is not None

    # Missing field -> fail condition (could choose True for not_equals but keep simple)
    if condition.field not in record:
        return False

    coerced_record_value = coerce_value(field_value, condition.data_type)
    coerced_condition_value = coerce_value(condition.value, condition.data_type)

    if coerced_record_value is None or (coerced_condition_value is None and condition.operator not in ['not_null']):
        if condition.operator == 'not_equals':
            return True
        return False

    if condition.data_type == 'string':
        if isinstance(coerced_record_value, str):
            coerced_record_value = coerced_record_value.lower()
        if isinstance(coerced_condition_value, str):
            coerced_condition_value = coerced_condition_value.lower()

    try:
        op = condition.operator
        if op == 'equals':
            return coerced_record_value == coerced_condition_value
        if op == 'not_equals':
            return coerced_record_value != coerced_condition_value
        if op == 'greater_than':
            return coerced_record_value > coerced_condition_value
        if op == 'less_than':
            return coerced_record_value < coerced_condition_value
        if op == 'contains':
            if condition.data_type != 'string':
                return False
            return str(coerced_condition_value) in str(coerced_record_value)
        if op == 'regex':
            if condition.data_type != 'string':
                return False
            return bool(re.match(str(coerced_condition_value), str(coerced_record_value)))
    except TypeError:
        logger.warning(f"Type error comparing {coerced_record_value} {condition.operator} {coerced_condition_value}")
        return False
    return False


def evaluate_group(record: Dict[str, Any], group: FilterGroup) -> bool:
    if not group.conditions:
        return True
    results = [evaluate_condition(record, c) for c in group.conditions]
    if group.logic == 'AND':
        return all(results)
    return any(results)


def apply_filters(df: pd.DataFrame, group_data: Optional[Dict[str, Any]]) -> Tuple[pd.DataFrame, Dict[str, int]]:
    """Apply filters to DataFrame and return filtered DataFrame plus stats."""
    if not group_data:
        return df, {"original": len(df), "kept": len(df), "dropped": 0}
    try:
        group = FilterGroup(**group_data)
    except Exception as e:
        logger.warning(f"Invalid filter group payload: {e}")
        return df, {"original": len(df), "kept": len(df), "dropped": 0}

    # Sanitize conditions: drop incomplete ones (empty field or missing value when required)
    sanitized: List[FilterCondition] = []
    for c in group.conditions:
        if not c.field:
            continue
        if c.operator != 'not_null' and (c.value is None or (isinstance(c.value, str) and c.value.strip() == '')):
            continue
        sanitized.append(c)
    dropped_incomplete = len(group.conditions) - len(sanitized)
    group.conditions = sanitized

    if dropped_incomplete:
        logger.info(f"Sanitized filter group: removed {dropped_incomplete} incomplete conditions")

    mask = []
    for _, row in df.iterrows():
        record = row.to_dict()
        mask.append(evaluate_group(record, group))
    filtered = df[mask]
    stats = {"original": len(df), "kept": len(filtered), "dropped": len(df) - len(filtered), "incomplete_conditions_removed": dropped_incomplete}
    return filtered, stats
