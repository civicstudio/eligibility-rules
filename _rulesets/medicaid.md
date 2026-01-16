---
name: medicaid
service_id: medicaid
ruleset:
  service_id: medicaid
  name: Medicaid
  jurisdiction_id: united-states
  effective_date: "2024-01-01"
  rules:
    - id: income-adults
      key: household_income_fpl
      operator: less_than_or_equal
      value: 138
      unit: percent
      requirement: required
      label: Income Limit (Adults)
      description: "For adults in expansion states, household income must be at or below 138% of the Federal Poverty Level."
      source_url: "https://www.medicaid.gov/medicaid/eligibility/index.html"
    - id: residency
      key: state_residency
      operator: exists
      requirement: required
      label: State Residency
      description: "Must be a resident of the state where applying."
    - id: citizenship
      key: citizenship_status
      operator: in
      values:
        - us_citizen
        - us_national
        - qualified_alien
      requirement: required
      label: Citizenship/Immigration
      description: "Must be a U.S. citizen, U.S. national, or qualified immigrant."
      source_url: "https://www.medicaid.gov/medicaid/eligibility/index.html"
    - id: not-incarcerated
      key: is_incarcerated
      operator: equals
      value: false
      requirement: required
      label: Not Incarcerated
      description: "Cannot be incarcerated (with some exceptions for inpatient care)."
---
