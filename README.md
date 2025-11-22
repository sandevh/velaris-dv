# CSV Comparison Tool - Fully Dynamic Configuration

A fully dynamic CSV comparison tool with zero hardcoding. Everything is configurable via environment variables and registries.

## 🎯 Features

- **100% Dynamic Configuration**: No hardcoded values
- **Custom CSV Labels**: Name your CSVs anything you want
- **Extensible Transforms**: Add new data transforms without code changes
- **Flexible Comparison Rules**: Define custom comparison logic
- **Environment-Based Config**: Easy deployment across environments
- **Registry Pattern**: Add new features by registering them

## 🚀 Quick Start

### Frontend Setup

1. Copy environment template:
```bash
cd client
copy .env.example .env
```

2. Customize `.env` file:
```env
VITE_API_URL=http://localhost:8000
VITE_CSV1_LABEL=Source Data
VITE_CSV2_LABEL=Target Data
VITE_APP_TITLE=My Custom CSV Tool
VITE_APP_SUBTITLE=Compare any CSV files
VITE_TRANSFORM_OPTIONS=trim,lower,upper,strip_spaces
```

3. Install and run:
```bash
npm install
npm run dev
```

### Backend Setup

1. Copy environment template:
```bash
cd server
copy .env.example .env
```

2. Customize `.env` file:
```env
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:5173,https://myapp.com
AVAILABLE_TRANSFORMS=trim,lower,upper,capitalize
```

3. Run server:
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

Or with Docker:
```bash
docker build -t csv-compare-api .
docker run -p 8000:8000 csv-compare-api
```

## ⚙️ Configuration Options

### Frontend Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` | `https://api.myapp.com` |
| `VITE_CSV1_LABEL` | Label for first CSV | `External CSV` | `Source Data` |
| `VITE_CSV2_LABEL` | Label for second CSV | `Velaris CSV` | `Target Data` |
| `VITE_APP_TITLE` | Application title | `CSV Comparison Tool` | `Data Validator` |
| `VITE_APP_SUBTITLE` | Subtitle text | Auto-generated | `Enterprise CSV Comparison` |
| `VITE_TRANSFORM_OPTIONS` | Available transforms (comma-separated) | `trim,lower,upper` | `trim,lower,upper,capitalize,title` |
| `VITE_COMPARISON_RULES` | Comparison rules (JSON) | See below | Custom rules JSON |

### Backend Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `API_HOST` | Server host | `0.0.0.0` | `127.0.0.1` |
| `API_PORT` | Server port | `8000` | `3000` |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | `*` | `http://localhost:5173` |
| `AVAILABLE_TRANSFORMS` | Backend transforms | `trim,lower,upper` | Custom list |
| `AVAILABLE_RULES` | Comparison rules (JSON array) | See below | Custom rules |
| `ENABLE_LOGGING` | Enable logging | `true` | `false` |
| `MAX_CSV_SIZE_MB` | Max file size | `50` | `100` |

## 🔧 Extending Functionality

### Adding New Transforms

**Frontend**: Update your `.env`:
```env
VITE_TRANSFORM_OPTIONS=trim,lower,upper,my_new_transform
```

**Backend**: Add to `services/mapping_engine.py`:
```python
TRANSFORM_REGISTRY = {
    "trim": lambda x: str(x).strip(),
    "lower": lambda x: str(x).lower(),
    "upper": lambda x: str(x).upper(),
    "my_new_transform": lambda x: str(x).replace("old", "new"),  # Add this
}
```

### Adding New Comparison Rules

**Frontend**: Update your `.env`:
```env
VITE_COMPARISON_RULES=[{"value":"equals","label":"Equals"},{"value":"my_rule","label":"My Custom Rule"}]
```

**Backend**: Add to `services/comparison_engine.py`:
```python
COMPARISON_REGISTRY = {
    "equals": lambda a, b: a == b,
    "my_rule": lambda a, b: custom_logic(a, b),  # Add this
}
```

### Built-in Transforms

| Transform | Description |
|-----------|-------------|
| `trim` | Remove leading/trailing whitespace |
| `lower` | Convert to lowercase |
| `upper` | Convert to uppercase |
| `strip_spaces` | Remove all spaces |
| `capitalize` | Capitalize first letter |
| `title` | Title case (each word capitalized) |

### Built-in Comparison Rules

| Rule | Description |
|------|-------------|
| `equals` | Exact match |
| `case_insensitive_equals` | Case-insensitive match |
| `contains` | Check if external value is in velaris value |
| `starts_with` | Check if velaris value starts with external value |
| `ends_with` | Check if velaris value ends with external value |
| `not_equals` | Values are different |
| `greater_than` | Numeric comparison (>) |
| `less_than` | Numeric comparison (<) |

## 📝 Example Use Cases

### Use Case 1: CRM Data Validation
```env
VITE_CSV1_LABEL=Salesforce Export
VITE_CSV2_LABEL=HubSpot Export
VITE_APP_TITLE=CRM Data Validator
VITE_TRANSFORM_OPTIONS=trim,lower,strip_spaces
```

### Use Case 2: E-commerce Inventory
```env
VITE_CSV1_LABEL=Warehouse Inventory
VITE_CSV2_LABEL=Shopify Products
VITE_APP_TITLE=Inventory Reconciliation
VITE_COMPARISON_RULES=[{"value":"equals","label":"Exact Match"},{"value":"greater_than","label":"Stock Level Check"}]
```

### Use Case 3: Financial Data
```env
VITE_CSV1_LABEL=Bank Statement
VITE_CSV2_LABEL=Accounting System
VITE_APP_TITLE=Financial Reconciliation
VITE_TRANSFORM_OPTIONS=trim,upper
```

## 🐳 Docker Deployment

Build with custom environment:
```bash
docker build -t csv-compare-api --build-arg API_PORT=3000 .
docker run -p 3000:3000 -e CORS_ORIGINS=https://myapp.com csv-compare-api
```

## 🧪 Testing

The tool automatically validates:
- Key fields exist in uploaded CSVs
- Mapped fields exist in both CSVs
- Unknown transforms and rules (logs warnings)
- Empty mappings are filtered out

## 📦 No More Hardcoding!

Everything is now dynamic:
- ✅ API endpoints
- ✅ CSV labels
- ✅ Transform operations
- ✅ Comparison rules
- ✅ UI text and branding
- ✅ CORS settings
- ✅ Feature flags

## 🔒 Security Note

For production:
1. Set specific `CORS_ORIGINS` (not `*`)
2. Limit `MAX_CSV_SIZE_MB`
3. Enable `ENABLE_LOGGING`
4. Use environment secrets for sensitive config

## 🤝 Contributing

To add new features:
1. Add to appropriate registry (TRANSFORM_REGISTRY or COMPARISON_REGISTRY)
2. Update environment examples
3. Update this README
4. No code logic changes needed!

## 📄 License

MIT
