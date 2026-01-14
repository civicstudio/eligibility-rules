# EligibilityRules.org - Implementation Plan

## Overview
Build an open source eligibility rules database with a browsable interface, starting with federal programs and California (state, Solano County, Vacaville).

## User Stories

### Phase 1: Static Site Foundation
- [x] **US1**: As a visitor, I can view a landing page that explains the project and lets me browse rules
- [x] **US2**: As a visitor, I can see a list of jurisdictions (Federal, California, Solano, Vacaville)

### Phase 2: Repository Structure & Schemas
- [x] **US3**: As a contributor, I can understand the YAML schema by reading schema documentation
- [x] **US4**: As a contributor, I can validate my YAML files against JSON Schema

### Phase 3: YAML Schema Design
- [x] **US5**: As a system, I can parse service definitions with all required fields
- [x] **US6**: As a system, I can parse eligibility rules with conditions and operators

### Phase 4: Seed Data
- [x] **US7**: As a visitor, I can browse 10+ federal programs (SNAP, Medicaid, SSI, etc.)
- [x] **US8**: As a visitor, I can browse California-specific programs (CalFresh, Medi-Cal)
- [x] **US9**: As a visitor, I can browse Solano County and Vacaville local programs

### Phase 5: Ruleset Viewer Component
- [x] **US10**: As a visitor, I can view a ruleset in a full-page legal/query-builder style interface
- [x] **US11**: As a visitor, I can see conditions grouped by AND/OR logic visually
- [x] **US12**: As a user, I can match my attributes against a ruleset and see validation results

### Phase 6: Validation Events
- [x] **US13**: As a system, I can produce validation events (like Ecto changesets) when matching
- [x] **US14**: As an admin, I can view logged validation events

---

## Completed Structure

```
eligibility-rules/
├── PLAN.md
├── ELIGIBILITY_RULES_ORG.md
├── CONTRIBUTING.md
├── data/
│   ├── schema/
│   │   ├── jurisdiction.schema.json
│   │   ├── agency.schema.json
│   │   ├── service.schema.json
│   │   └── ruleset.schema.json
│   └── jurisdictions/
│       ├── federal/
│       │   ├── _jurisdiction.yaml
│       │   ├── agencies/
│       │   │   ├── ssa.yaml
│       │   │   ├── usda-fns.yaml
│       │   │   ├── cms.yaml
│       │   │   └── hud.yaml
│       │   └── services/
│       │       ├── snap.yaml
│       │       ├── medicaid.yaml
│       │       ├── medicare.yaml
│       │       ├── ssi.yaml
│       │       ├── ssdi.yaml
│       │       ├── social-security-retirement.yaml
│       │       ├── section-8.yaml
│       │       ├── wic.yaml
│       │       ├── liheap.yaml
│       │       ├── tanf.yaml
│       │       ├── eitc.yaml
│       │       └── chip.yaml
│       └── states/
│           └── california/
│               ├── _jurisdiction.yaml
│               ├── agencies/
│               │   ├── cdss.yaml
│               │   ├── dhcs.yaml
│               │   └── ftb.yaml
│               ├── services/
│               │   ├── calfresh.yaml
│               │   ├── medi-cal.yaml
│               │   ├── calworks.yaml
│               │   └── cal-eitc.yaml
│               └── counties/
│                   └── solano/
│                       ├── _jurisdiction.yaml
│                       ├── agencies/
│                       │   └── hhss.yaml
│                       ├── services/
│                       │   ├── general-assistance.yaml
│                       │   └── in-home-supportive-services.yaml
│                       └── cities/
│                           └── vacaville/
│                               ├── _jurisdiction.yaml
│                               ├── agencies/
│                               │   └── community-services.yaml
│                               └── services/
│                                   ├── senior-services.yaml
│                                   └── utility-assistance.yaml
└── website/
    ├── _config.yml
    ├── _layouts/
    │   └── default.html
    ├── assets/
    │   ├── css/main.css
    │   └── js/
    │       ├── ruleset-viewer.js
    │       └── validation-engine.js
    ├── index.html
    └── demo.html
```

## Next Steps

1. Set up GitHub Actions for YAML validation
2. Add browse pages that dynamically load YAML data
3. Implement search functionality
4. Add "Edit on GitHub" links to all pages
5. Deploy to GitHub Pages
