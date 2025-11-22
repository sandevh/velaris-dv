from fastapi import APIRouter, UploadFile, File, Form
from services.csv_loader import read_csv
from services.mapping_engine import apply_mapping
from services.comparison_engine import compare_records
import json

router = APIRouter()

@router.post("/external-velaris")
async def compare_external_velaris(
        external_csv: UploadFile = File(...),
        velaris_csv: UploadFile = File(...),
        mapping_config: str = Form(...)
):
        """
        Accept two CSVs plus a JSON mapping configuration and return comparison results.
        New mapping_config schema:
        {
            "key_fields": {"external_field": "ExternalID", "velaris_field": "VelarisID"},
            "mappings": [
                 {
                     "external_field": "ExternalName",
                     "velaris_field": "Name",
                     "rule": "case_insensitive_equals",  # equals | case_insensitive_equals | contains
                     "external_transforms": ["trim","lower"],
                     "velaris_transforms": ["trim","lower"]
                 }
            ]
        }
        """
        mapping = json.loads(mapping_config)

        external_data = read_csv(await external_csv.read())
        velaris_data = read_csv(await velaris_csv.read())

        mapped_external, mapped_velaris = apply_mapping(external_data, velaris_data, mapping)

        result = compare_records(mapped_external, mapped_velaris, mapping)

        return result
