# External → Velaris CSV Comparison Client

This React + Vite client lets you upload two CSV files (an External source and a Velaris export), define a JSON-based mapping configuration, and submit both CSVs plus the config to the FastAPI server for record-level comparison.

## Flow
1. Upload External CSV.
2. Upload Velaris CSV.
3. Choose key fields (unique identifiers) for each file.
4. Add mapping rows specifying:
	 - `external_field`
	 - `velaris_field`
	 - `rule` (equals | case_insensitive_equals | contains)
	 - Optional transforms for each side (`trim`, `lower`, `upper`).
5. Preview the generated JSON config.
6. Click Compare to send a multipart request containing both CSV files and the JSON mapping config to the server endpoint `POST /compare/external-velaris`.
7. View counts of matched, mismatched, and missing records plus detailed field-level differences.

## Mapping Config Schema
```jsonc
{
	"key_fields": {
		"external_field": "ExternalID",
		"velaris_field": "VelarisID"
	},
	"mappings": [
		{
			"external_field": "ExternalName",
			"velaris_field": "Name",
			"rule": "case_insensitive_equals",
			"external_transforms": ["trim", "lower"],
			"velaris_transforms": ["trim", "lower"]
		}
	]
}
```

## Development
### Install
```bash
npm install
```

### Run Dev Server
```bash
npm run dev
```

Make sure the FastAPI server is running on `http://localhost:8000` with the compare route mounted at `/compare`.

## Environment Assumptions
No environment variables are required; adjust the API base URL inside `App.jsx` if your backend differs.

## License
Internal / not for redistribution.
