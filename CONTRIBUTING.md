# Contributing to EligibilityRules.org

Thank you for your interest in contributing to open government eligibility data.

## How to Contribute

### Adding or Updating Eligibility Rules

1. **Fork the repository** on GitHub
2. **Create a branch** for your changes
3. **Add or edit YAML files** in the appropriate directory
4. **Run validation** to check your changes
5. **Submit a pull request** with source citations

### Directory Structure

Rules are organized by jurisdiction:

```
data/jurisdictions/
├── federal/                    # Federal programs
│   ├── _jurisdiction.yaml
│   ├── agencies/
│   └── services/
└── states/
    └── [state-name]/           # State programs
        ├── _jurisdiction.yaml
        ├── agencies/
        ├── services/
        └── counties/
            └── [county-name]/  # County programs
                └── cities/
                    └── [city]/ # City programs
```

### YAML File Formats

#### Service Definition

```yaml
id: calfresh                    # Unique ID (kebab-case)
name: CalFresh                  # Official name
alternate_names:                # Other names
  - California Food Stamps
jurisdiction_id: california     # Parent jurisdiction
agency_id: cdss                 # Administering agency
service_type: benefit           # benefit, permit, license, etc.
category: food-assistance       # Category for browsing
description: |
  Human-readable description of the service.
application_url: https://...    # Where to apply
source_urls:                    # Official sources
  - https://...
last_verified: 2026-01-13       # When info was verified

ruleset:
  service_id: calfresh
  effective_date: 2024-10-01
  rules:
    # ... see below
```

#### Eligibility Rules

```yaml
rules:
  - id: income-gross            # Unique within ruleset
    key: household_income_fpl   # Attribute to check
    operator: less_than_or_equal
    value: 200
    unit: percent
    requirement: required       # required, optional, disqualifying
    label: Gross Income         # Short display label
    description: |
      Human-readable explanation.
    source_url: https://...     # Specific source for this rule

    # Nested conditions (AND logic)
    conditions:
      - id: sub-condition
        key: some_attribute
        operator: equals
        value: true

    # Alternative conditions (OR logic)
    any_of:
      - id: alt-1
        key: has_disability
        operator: equals
        value: true
        description: Has a disability
      - id: alt-2
        key: has_dependent_child
        operator: equals
        value: true
        description: Cares for dependent child
```

### Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `equals` | Exact match | `value: CA` |
| `not_equals` | Not equal | `value: false` |
| `less_than` | < | `value: 65` |
| `less_than_or_equal` | <= | `value: 200` |
| `greater_than` | > | `value: 18` |
| `greater_than_or_equal` | >= | `value: 62` |
| `in` | In list | `values: [a, b, c]` |
| `not_in` | Not in list | `values: [x, y]` |
| `between` | Range | `min: 18, max: 49` |
| `exists` | Has value | - |
| `not_exists` | No value | - |
| `matches` | Regex match | `value: "^CA"` |

### Common Keys (Attributes)

Use these standardized keys when possible:

| Key | Type | Description |
|-----|------|-------------|
| `age` | number | Age in years |
| `household_income_fpl` | number | Household income as % of FPL |
| `household_income` | number | Household income in dollars |
| `countable_assets` | number | Countable resources in dollars |
| `citizenship_status` | string | us_citizen, permanent_resident, etc. |
| `state_residency` | string | State abbreviation (CA, TX, etc.) |
| `county_residency` | string | County name |
| `has_disability` | boolean | Has qualifying disability |
| `has_dependent_child` | boolean | Has dependent child |
| `is_pregnant` | boolean | Currently pregnant |

### Validation

Before submitting, validate your YAML files:

```bash
# Install dependencies
npm install

# Validate all files
npm run validate

# Validate specific file
npm run validate -- data/jurisdictions/states/california/services/calfresh.yaml
```

### Review Criteria

Pull requests are reviewed for:

1. **Source citation** - Every rule needs a `source_url` pointing to official government documentation
2. **Accuracy** - Rules must match the cited source
3. **Schema validity** - YAML must pass schema validation
4. **Completeness** - Include all required fields
5. **Clarity** - Descriptions should be understandable

### Source Requirements

- Sources must be official government websites (.gov preferred)
- Link to the specific page containing the rule
- If rules come from legislation, link to the relevant section
- If rules change frequently, note the effective date

### Questions?

- Open an issue on GitHub
- Check existing rules for examples
- Refer to the JSON schemas in `data/schema/`

## Code of Conduct

Be respectful and constructive. We're all working toward the same goal: making government eligibility information more accessible.

## License

- **Data** (YAML files): CC0 Public Domain
- **Code** (website, tools): MIT License

By contributing, you agree to license your contributions under these terms.
