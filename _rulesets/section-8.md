---
name: section-8
service_id: section-8
ruleset:
  service_id: section-8
  name: Section 8 Housing Choice Voucher
  jurisdiction_id: united-states
  effective_date: "2024-01-01"
  rules:
    - id: income
      key: household_income_ami
      operator: less_than_or_equal
      value: 50
      unit: percent
      requirement: required
      label: Income Limit
      description: "Household income must be at or below 50% of Area Median Income (AMI). 75% of vouchers must go to extremely low-income families (30% AMI)."
      source_url: "https://www.hud.gov/topics/housing_choice_voucher_program_section_8"
    - id: citizenship
      key: citizenship_status
      operator: in
      values:
        - us_citizen
        - permanent_resident
      requirement: required
      label: Citizenship
      description: "At least one household member must be a U.S. citizen or eligible immigrant."
    - id: background
      key: has_drug_conviction
      operator: equals
      value: false
      requirement: required
      label: Background Check
      description: "Must pass criminal background screening requirements."
    - id: eviction-history
      key: evicted_from_public_housing
      operator: equals
      value: false
      requirement: required
      label: Eviction History
      description: "Must not have been evicted from public housing in the past 3 years."
---
