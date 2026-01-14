# EligibilityRules.org: Open Source Eligibility Rules Project

This document outlines the vision, rationale, and planning instructions for an open source project to encode government service eligibility rules in a transparent, contributable, and machine-readable way.

**Target domain:** eligibilityrules.org

## Vision

A public, open source database of eligibility rules for government services—federal, state, and local—that anyone can browse, contribute to, and build upon.

**Core principles:**
1. **Open by default**: All rules visible, all contributions public
2. **GitHub-native**: Pull requests as the primary contribution mechanism
3. **Human + machine readable**: Rules encoded in structured format with human descriptions
4. **Jurisdiction-aware**: Rules organized by federal/state/local hierarchy
5. **Community-maintained**: Distributed stewardship, not centralized authority

## Problem Statement

Citizens struggle to determine which government services they qualify for because:

1. **Eligibility information is scattered** across thousands of agency websites
2. **Rules are expressed as prose**, not structured data
3. **No single source of truth** exists for cross-jurisdictional comparison
4. **AI assistants can't reliably match** citizens to services
5. **Rules change frequently** but updates are poorly tracked

## Data Model

### Core Entities (YAML/JSON)

**Service:**
```yaml
id: calfresh
name: CalFresh (SNAP)
agency: california-department-of-social-services
jurisdiction: california
service_type: benefit
category: food-assistance
description: |
  CalFresh provides monthly food benefits to eligible
  low-income households.
application_url: https://benefitscal.com/
source_urls:
  - https://www.cdss.ca.gov/calfresh
last_verified: 2026-01-15
```

**Eligibility Rule:**
```yaml
service_id: calfresh
rules:
  - id: income-gross
    type: income_fpl
    operator: less_than_or_equal
    value: 200
    value_type: percentage
    requirement: required
    description: |
      Gross monthly income must be at or below
      200% of the Federal Poverty Level.
    source_url: https://www.cdss.ca.gov/calfresh/eligibility

  - id: residency
    type: residency
    operator: equals
    value: CA
    requirement: required
    description: Must be a California resident.

  - id: citizenship
    type: citizenship
    operator: in_list
    value:
      - us_citizen
      - permanent_resident
      - refugee
      - asylee
    requirement: required
    description: |
      Must be a U.S. citizen or qualified immigrant.
```

**Agency:**
```yaml
id: california-department-of-social-services
name: California Department of Social Services
jurisdiction: california
agency_type: department
website: https://www.cdss.ca.gov/
```

**Jurisdiction:**
```yaml
id: california
name: California
level: state
parent: united-states
geoid: "06"
```

### Directory Structure

```
eligibility-rules/
├── README.md
├── CONTRIBUTING.md
├── schema/
│   ├── service.schema.json
│   ├── rule.schema.json
│   ├── agency.schema.json
│   └── jurisdiction.schema.json
├── jurisdictions/
│   ├── federal/
│   │   ├── _jurisdiction.yaml
│   │   ├── agencies/
│   │   │   └── ssa/
│   │   │       ├── _agency.yaml
│   │   │       └── services/
│   │   │           ├── social-security-retirement.yaml
│   │   │           └── ssdi.yaml
│   │   └── services/
│   │       ├── snap.yaml
│   │       └── medicaid.yaml
│   └── states/
│       ├── california/
│       │   ├── _jurisdiction.yaml
│       │   ├── agencies/
│       │   ├── services/
│       │   │   └── calfresh.yaml
│       │   └── counties/
│       │       └── san-francisco/
│       │           ├── _jurisdiction.yaml
│       │           ├── agencies/
│       │           └── services/
│       └── texas/
│           └── ...
└── website/
    ├── (static site or Elixir app)
    └── ...
```

## Website Features

### Public Interface

1. **Browse by Jurisdiction**
   - Hierarchical navigation: Federal → State → County → City
   - Map-based selection
   - "What jurisdictions affect this address?"

2. **Browse by Service Category**
   - Life events (having a baby, losing a job, etc.)
   - Service types (benefits, permits, licenses)
   - Agency type (health, transportation, etc.)

3. **Browse by Agency**
   - Agency directory
   - Services per agency
   - Rules per service

4. **Service Detail Pages**
   - Human-readable description
   - Structured eligibility rules
   - Application links
   - Source citations
   - Last verified date
   - Edit history (link to GitHub)

5. **Eligibility Screener** (future)
   - Simple questionnaire
   - Matches to potentially eligible services
   - Clear disclaimer: "preliminary screening only"

### Contributor Interface

1. **"Edit on GitHub" links** on every page
2. **Contribution guide** with examples
3. **Schema documentation** with validators
4. **Issue templates** for:
   - New service requests
   - Rule correction reports
   - Data quality issues

### Technical Options

**Option A: Static Site (Hugo/Jekyll/Astro)**
- Pros: Simple hosting, no server, GitHub Pages
- Cons: Limited interactivity, no server-side processing
- Best for: MVP, initial launch

**Option B: Elixir/Phoenix LiveView**
- Pros: Rich interactivity, real-time search, eligibility calculator
- Cons: Requires hosting, more complex
- Best for: Full-featured version with eligibility screening

**Recommendation:** Start with static site, migrate to Elixir as features require.

## Contribution Model

### GitHub-Centric Workflow

1. **All data lives in Git**
   - YAML/JSON files in structured directories
   - Version history for every change
   - Attribution via Git commits

2. **Pull Request Process**
   ```
   Contributor:
   1. Fork repository
   2. Add/edit YAML files
   3. Run local validation (npm run validate)
   4. Submit pull request
   5. Automated CI checks schema validity
   6. Human reviewer verifies source citations
   7. Merge to main
   8. Website rebuilds automatically
   ```

3. **Review Criteria**
   - Source URL required for all rules
   - Source must be official government document
   - Rules must match source (spot-checked)
   - YAML must pass schema validation

4. **Recognition**
   - Contributors listed on website
   - Git history shows attribution
   - Optional: contributor badges/stats

### Quality Assurance

1. **Schema Validation**: CI rejects invalid YAML
2. **Source Citation Required**: Every rule needs source_url
3. **Last Verified Date**: Track when rules were confirmed
4. **Community Review**: PRs require approval
5. **Issue Reporting**: Public issues for corrections

## Governance

### Open Source License

**Recommended: CC0 (Public Domain) for data, MIT for code**

Rationale:
- Government eligibility rules are public information
- Maximum reuse potential
- No attribution burden for consumers
- Code (website) under MIT for standard open source

### Stewardship

1. **Maintainer team**: Core contributors with merge rights
2. **Advisory board**: Representatives from civic tech orgs
3. **No single owner**: Distributed stewardship model
4. **Succession plan**: Document how to transfer if maintainers leave

## Integration Points

### For Jurisdictional

EligibilityRules.org data could be imported into Jurisdictional's `eligibility_rules` table:

```elixir
# Sync from eligibility-rules repository
def sync_eligibility_rules do
  # Fetch YAML files from GitHub
  # Parse and validate
  # Upsert into eligibility_rules table
  # Track source_url for attribution
end
```

### For Other Projects

- **PolicyEngine**: Could contribute their rules in our format
- **Benefits screeners**: Can consume our data via API/JSON
- **AI assistants**: Structured rules for MCP tools
- **Government agencies**: Official source to publish their rules

## Roadmap

### Phase 1: Foundation (MVP)
- [ ] Create GitHub repository
- [ ] Define JSON/YAML schemas
- [ ] Seed with 10-20 federal programs
- [ ] Static site with basic browsing
- [ ] CONTRIBUTING.md with clear instructions
- [ ] Domain: eligibilityrules.org

### Phase 2: State Coverage
- [ ] Add 5 states as pilots (CA, TX, NY, FL, IL)
- [ ] State-specific programs (CalFresh, TANF variants)
- [ ] Improve navigation UI
- [ ] Search functionality

### Phase 3: Local Coverage
- [ ] Add major cities (NYC, LA, Chicago, Houston)
- [ ] County-level programs
- [ ] Special districts

### Phase 4: Interactive Features
- [ ] Eligibility screener (preliminary)
- [ ] API for programmatic access
- [ ] Migrate to Elixir/Phoenix if needed

### Phase 5: Community Growth
- [ ] Outreach to civic tech community
- [ ] Partnerships with existing projects
- [ ] Government agency adoption