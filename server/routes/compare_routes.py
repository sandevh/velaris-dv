from fastapi import APIRouter, UploadFile, File, Form
from services.csv_loader import read_csv
from services.mapping_engine import apply_mapping
from services.comparison_engine import compare_records
from services.filter_engine import apply_filters
import json

router = APIRouter()

@router.post("/external-velaris")
async def compare_external_velaris(
        external_csv: UploadFile = File(...),
        velaris_csv: UploadFile = File(...),
        mapping_config: str = Form(...)
):
        """Compare two CSVs with mapping + optional filters.

        Extended mapping_config schema example:
        {
            "key_fields": {"external_field": "ExternalID", "velaris_field": "VelarisID"},
            "mappings": [
                {
                    "external_field": "ExternalName",
                    "velaris_field": "Name",
                    "rule": "case_insensitive_equals",
                    "external_transforms": ["trim","lower"],
                    "velaris_transforms": ["trim","lower"]
                }
            ],
            "filters": {
                "external": {"logic": "AND", "conditions": [ {"field": "Amount", "operator": "less_than", "data_type": "number", "value": 1000} ]},
                "velaris": {"logic": "AND", "conditions": []}
            }
        }
        """
        mapping = json.loads(mapping_config)

        external_data = read_csv(await external_csv.read())
        velaris_data = read_csv(await velaris_csv.read())

        # Apply filters if provided
        filter_cfg = mapping.get("filters", {})
        external_data, external_filter_stats = apply_filters(external_data, filter_cfg.get("external"))
        velaris_data, velaris_filter_stats = apply_filters(velaris_data, filter_cfg.get("velaris"))

        mapped_external, mapped_velaris = apply_mapping(external_data, velaris_data, mapping)

        result = compare_records(mapped_external, mapped_velaris, mapping)
        result["filter_stats"] = {
                "external": external_filter_stats,
                "velaris": velaris_filter_stats
        }
        return result
