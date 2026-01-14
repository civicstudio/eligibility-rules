# User Personas

**Last Updated:** January 2025

This document defines the three primary personas that EligibilityRules.org serves. Understanding these distinct user groups helps inform design decisions, content strategy, and feature prioritization.

---

## Persona 1: The Seeker

**Role:** Individual or family member looking for government benefits

**Primary Goal:** Understand what programs they might qualify for and how to access them

### Demographics
- Age: 18-75+
- Digital literacy: Varies widely (low to moderate)
- Device: Often mobile-first, may use public library computers
- Language: May need multilingual support

### Context & Motivations
Seekers are navigating a significant life experience—job loss, new baby, approaching retirement, disability, or recovering from a disaster. They're often stressed, time-constrained, and dealing with multiple bureaucratic processes simultaneously.

**They want to know:**
- "What programs might I qualify for?"
- "What are the income limits?"
- "Where do I apply?"
- "How long does this take?"

### Pain Points
- Overwhelming number of programs across federal, state, and local levels
- Confusing eligibility language and acronyms
- Fear of making mistakes or being denied
- Distrust of complex systems
- Limited time to research
- May not know what they don't know

### How EligibilityRules.org Serves Them
- Plain-language descriptions of eligibility rules
- Clear source attribution (builds trust)
- Links to official application portals
- Jurisdiction-aware filtering (show relevant programs)
- Mobile-friendly interface

### Journey Touchpoints
1. Google search for specific benefit (e.g., "food stamps California")
2. Land on service detail page
3. Scan eligibility rules
4. Click through to application portal

### Success Metrics
- Time to find relevant program
- Comprehension of eligibility requirements
- Click-through to application links

---

## Persona 2: The Builder

**Role:** Developer, civic technologist, or product team integrating eligibility data

**Primary Goal:** Access structured eligibility data to build applications, chatbots, or screening tools

### Demographics
- Age: 25-55
- Technical background: Software engineering, data science, or technical product management
- Affiliation: Civic tech nonprofits, government contractors, tech companies, independent hackers
- Device: Desktop (for development work)

### Context & Motivations
Builders are creating tools that help people access benefits—eligibility screeners, chatbots, case management systems, or research platforms. They need reliable, structured data that machines can process.

**They want to know:**
- "What's the data schema?"
- "How do I fetch the rules programmatically?"
- "How often is the data updated?"
- "What's the license?"

### Pain Points
- Eligibility rules scattered across PDFs and agency websites
- No standard format or API
- Rules change frequently without notice
- Difficult to maintain accuracy at scale
- Legal uncertainty about reuse

### How EligibilityRules.org Serves Them
- Machine-readable YAML format
- JSON Schema documentation
- Raw file access via GitHub
- Clear licensing (open source)
- Integration guide with rule engine specs
- Distillation prompt for AI-assisted encoding

### Journey Touchpoints
1. Discover via GitHub, civic tech community, or search
2. Review `/integration/` page
3. Clone repository or fetch raw files
4. Build rule evaluation logic
5. Periodically sync for updates

### Success Metrics
- GitHub stars, forks, clones
- External tools citing EligibilityRules.org as data source
- Contributions back to the repository

---

## Persona 3: The Provider

**Role:** Government staff, policy expert, or advocate who knows eligibility rules

**Primary Goal:** Contribute accurate eligibility information or verify existing data

### Demographics
- Age: 30-65
- Technical literacy: Moderate (comfortable with forms, may not know Git)
- Affiliation: Government agencies, nonprofit advocates, legal aid organizations, academic researchers
- Device: Desktop (work computer)

### Context & Motivations
Providers have deep knowledge of specific programs—they administer them, help people navigate them, or research them. They want this knowledge to be more accessible but may not have the technical skills to contribute code.

**They want to know:**
- "How do I correct an error?"
- "How do I add a new program?"
- "Who reviews contributions?"
- "How is accuracy verified?"

### Pain Points
- GitHub can be intimidating for non-technical users
- YAML syntax is unfamiliar
- Unclear what information format is needed
- Don't want to break things
- Limited time outside core responsibilities

### How EligibilityRules.org Serves Them
- "Suggest a Program" form for non-technical contributions
- "Edit on GitHub" links on every service page
- Clear contribution guidelines
- YAML examples with inline comments
- Community review process for quality assurance

### Journey Touchpoints
1. Find service page for a program they know about
2. Notice missing or incorrect information
3. Click "Edit on GitHub" or "Suggest a Program"
4. Submit correction or new program details
5. Receive feedback when merged

### Success Metrics
- Contributions from non-developer accounts
- Geographic diversity of contributors
- Agency staff participation
- Data accuracy improvement over time

---

## Persona Interaction Model

```
                    ┌─────────────┐
                    │   Seeker    │
                    │  (Consumer) │
                    └──────┬──────┘
                           │ uses
                           ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Builder   │────▶│ Eligibility │◀────│  Provider   │
│ (Developer) │     │   Rules     │     │(Contributor)│
└─────────────┘     │   Database  │     └─────────────┘
      │             └─────────────┘            │
      │                    ▲                   │
      │                    │                   │
      │                    │                   │
      ▼                    │                   │
┌─────────────┐            │                   │
│  Tools &    │────────────┘                   │
│  Services   │ (screeners, chatbots, etc.)   │
└─────────────┘                                │
      │                                        │
      └────────────────────────────────────────┘
                    serves Seekers
```

**The virtuous cycle:**
1. **Providers** contribute eligibility knowledge
2. **Builders** transform data into accessible tools
3. **Seekers** benefit from better access to programs
4. Increased usage surfaces errors → more Provider contributions

---

## Life Experiences Framework

Inspired by [Performance.gov's Life Experiences initiative](https://www.performance.gov/cx/projects/), EligibilityRules.org recognizes that people don't search for benefits—they search for solutions to life situations.

### Key Life Experiences

| Life Experience | Emotional State | Relevant Programs |
|-----------------|-----------------|-------------------|
| Having a baby | Hopeful, overwhelmed | WIC, Medicaid, Child Care Assistance |
| Losing a job | Anxious, urgent | Unemployment, SNAP, Medicaid |
| Facing a disability | Vulnerable, uncertain | SSI, SSDI, Medicaid, Housing assistance |
| Approaching retirement | Planning, confused | Medicare, Social Security, SSI |
| Recovering from disaster | Traumatized, desperate | FEMA, SBA loans, Emergency assistance |
| Immigration journey | Hopeful, fearful | Refugee assistance, Qualified non-citizen programs |

### Design Implications

For **Seekers**, we should:
- Lead with life situations, not program names
- Acknowledge emotional context
- Provide clear next steps
- Reduce cognitive load

For **Builders**, we should:
- Tag programs by life experience
- Enable life-experience-based filtering
- Support journey-based interfaces

For **Providers**, we should:
- Request life experience tags when encoding programs
- Connect related programs together

---

## Accessibility Considerations

### Seeker-Specific Needs
- Screen reader compatibility
- High contrast for low vision
- Mobile-first responsive design
- Plain language (8th grade reading level)
- Multilingual content (Spanish priority)

### Builder-Specific Needs
- Clear API documentation
- Code examples in multiple languages
- Syntax-highlighted examples
- Copy-to-clipboard functionality

### Provider-Specific Needs
- Non-technical contribution pathways
- Step-by-step wizards
- Preview before submission
- Validation with helpful errors

---

## Next Steps

1. **Seeker experience audit**: Review all user-facing pages for plain language and emotional resonance
2. **Life experience taxonomy**: Add life experience tags to service schema
3. **Life experience landing pages**: Create `/life-experiences/` section
4. **Non-GitHub contribution form**: Implement form-based program suggestions
5. **Provider recognition**: Acknowledge contributors on the site
