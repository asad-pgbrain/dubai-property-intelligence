# Dubai Property Intelligence — Master Build Specification

**Version:** 1.0  
**Specification date:** 30 September 2026  
**Product status:** Build-ready / MVP-first  
**Primary market:** Dubai / UAE  
**Secondary audience:** UK, USA, Europe and other international property researchers  
**Language:** English-first; localization-ready  
**Business constraint:** Near-zero cash at launch  
**Primary data source:** Dubai Land Department (DLD) official real-estate data  
**Product principle:** Data product first, content second; earn before spending

---

## 0. Executive Decision

This product is **not** a generic Dubai property-listing portal.

It is a **Dubai Property Intelligence platform** that combines official/publicly available market data, transparent calculations, research tools and, later, qualified lead generation.

The core user promise:

> **Understand Dubai property prices, rents, transactions, projects and potential rental economics using transparent, source-attributed data.**

The flagship product is **Property Reality Check**:

1. User enters a property/listing's area, type, size and asking price.
2. The system finds relevant available market observations.
3. It calculates AED/sqft, comparable ranges, area statistics and rental metrics.
4. It clearly separates registered transaction data from asking/listing data.
5. It shows data freshness, sample size and limitations.
6. It does **not** tell the user to buy or not buy.

### Non-negotiable constraints

- MVP should require no paid DLD API.
- Do not scrape portals as a core dependency.
- Do not sell or redistribute raw DLD data without confirming applicable rights.
- Do not fabricate missing data.
- Every important number must have provenance.
- AI must be grounded in product data and show sources/limitations.
- The product must be useful without AI.
- Do not make investment recommendations or personalized financial advice.
- Do not make the site dependent on AdSense for survival.

---

# 1. Product Vision

## 1.1 Vision

Build the easiest trustworthy way for a user to research Dubai real estate using current/available official data and understandable analytics.

## 1.2 Mission

Turn difficult property-market data into:

- simple answers
- transparent comparisons
- useful calculators
- project/area intelligence
- decision-support research
- qualified professional-service leads

## 1.3 Positioning

**Bad positioning:**
> "The best website for Dubai properties."

**Preferred positioning:**
> "Dubai property data, market intelligence and research tools."

This is narrower, more defensible and better aligned with a zero-budget launch.

---

# 2. Business Model

## 2.1 Launch model

Revenue experiments should prioritize:

1. Qualified real-estate leads
2. Broker/developer profile and lead partnerships
3. Mortgage/property-finance referrals where legally and commercially appropriate
4. Display advertising after meaningful traffic
5. Affiliate/referral products where relevant and compliant

## 2.2 Later models

- Premium market reports
- Pro dashboards
- Broker intelligence subscriptions
- Developer intelligence
- B2B analytics
- API/data products, only after rights/licensing are established

## 2.3 Revenue rule

Do not pay for infrastructure to solve a problem that has not produced evidence of demand.

---

# 3. Target Users

## Persona A — International Buyer

Needs:
- understand area prices
- compare areas
- estimate rent
- assess an asking price
- avoid misleading marketing claims

## Persona B — Dubai Investor/Owner

Needs:
- rental economics
- price trends
- project intelligence
- market monitoring

## Persona C — Property Researcher

Needs:
- historical transaction/rental data
- charts
- project/developer information
- downloadable/visual research

## Persona D — Broker/Professional

Needs:
- market statistics
- area reports
- leads
- client-facing research

## Persona E — Developer/Marketing Team

Needs:
- project/area intelligence
- market context
- qualified prospects

---

# 4. Jobs To Be Done

### Primary JTBD

> "Help me understand whether the price/rent information I am seeing is consistent with available market evidence."

### Secondary JTBDs

> "Compare Dubai areas using data."

> "Estimate gross rental yield."

> "Understand transaction activity."

> "Research projects and developers."

> "Find a licensed professional if I need assistance."

---

# 5. Product Principles

1. **Evidence over hype**
2. **Simple before sophisticated**
3. **Data provenance everywhere**
4. **AI is an interface, not the source of truth**
5. **Fast first**
6. **Mobile-first**
7. **Accessible**
8. **No dark patterns**
9. **No fake precision**
10. **No investment promises**
11. **Free-first**
12. **Build modularly**

---

# 6. Data Source Strategy

## 6.1 Primary source

Dubai Land Department's official Real Estate Data service currently exposes categories including:

- Transactions
- Rents
- Project
- Valuations
- Land
- Building
- Unit
- Broker
- Developer

The transaction dataset includes fields such as transaction number/date/type, registration type, freehold status, usage, area, property type/subtype, amount, transaction/property size, rooms, parking, nearby landmarks and project information.

The rental dataset includes registration/start/end dates, contract and annual amount, area, property size, property type/subtype, rooms, usage, parking and project information.

DLD's page provides CSV download controls and points users to Dubai Pulse/data.dubai for previous-year data.

## 6.2 DLD APIs

DLD has a separate API Gateway with services including Rental Index, Dubai Brokers and Trakheesi-related services.

The API Gateway currently shows paid API services and prerequisites for some integrations. Therefore:

**MVP must not depend on paid DLD APIs.**

## 6.3 Data rights

"Open data" must not be interpreted as automatic permission to resell or redistribute every raw field.

Before launching:
- document source
- retain acquisition date
- retain source URL
- retain original file checksum
- review DLD terms/licensing
- determine permitted commercial reuse
- avoid exposing sensitive/private information
- do not create a paid raw-data mirror unless rights are verified

## 6.4 Asking vs registered transaction

These must be separate concepts.

**Registered transaction price**
= actual transaction information available from DLD.

**Asking price**
= seller/agent/developer advertised price from an external source.

Never display asking price as if it were a registered transaction.

---

# 7. MVP Scope

## Must Have

### M1 — Market Overview

- total transaction count
- transaction volume
- median price
- median AED/sqft
- median rent
- gross rental yield estimate
- trend chart
- last updated date
- source/provenance

### M2 — Area Explorer

Filters:
- area
- property type
- subtype
- rooms
- date range
- freehold/leasehold where appropriate

### M3 — Rental Explorer

- annual rent
- rent/sqft
- transaction count
- trend
- property-type breakdown

### M4 — Area Comparison

Compare 2–4 areas.

### M5 — Rental Yield Calculator

Inputs:
- purchase price
- annual rent
- optional annual expenses

Outputs:
- gross yield
- optional estimated net yield
- assumptions

### M6 — Property Reality Check

Inputs:
- area
- property type
- bedrooms/rooms
- size
- asking price
- optional expected rent

Outputs:
- asking AED/sqft
- market transaction statistics
- comparable distribution
- estimated rent range from available data
- gross yield
- data sample size
- data freshness
- confidence/coverage indicator

### M7 — Data Methodology

Public methodology page.

### M8 — SEO landing pages

Only create pages when enough data exists to make the page genuinely useful.

---

# 8. Post-MVP

- Project explorer
- Developer explorer
- Building explorer
- map interface
- saved searches
- email alerts
- user accounts
- broker directory
- lead management
- downloadable reports
- advanced AI research assistant

---

# 9. Future

- real-time official APIs
- B2B dashboards
- broker SaaS
- developer intelligence
- data/API products
- predictive analytics
- anomaly detection
- multilingual interface

---

# 10. Information Architecture

```text
/
├── /market
├── /areas
│   └── /areas/{area-slug}
├── /transactions
├── /rents
├── /compare
├── /calculators
│   ├── /rental-yield
│   └── /roi
├── /reality-check
├── /projects
│   └── /projects/{project-slug}
├── /developers
│   └── /developers/{developer-slug}
├── /research
├── /methodology
├── /data-sources
├── /about
├── /contact
├── /privacy
├── /terms
└── /disclaimer
```

---

# 11. Homepage UX

## Hero

Headline:

> **Dubai Property Intelligence, Without the Guesswork**

Subheadline:

> Explore transactions, rents, areas and property economics using transparent market data.

Primary CTA:

**Check a Property**

Secondary CTA:

**Explore Dubai Market**

## Hero interaction

A compact Reality Check form:

- Area
- Property type
- Size
- Asking price
- Check

## Below hero

1. Market snapshot
2. Popular areas
3. Property Reality Check explanation
4. Area comparison
5. Rental yield calculator
6. Latest research
7. Data methodology
8. Lead CTA

---

# 12. UI/UX Design System

## 12.1 Design philosophy

- premium financial/data-product feel
- minimal visual noise
- strong typography
- clear numbers
- generous whitespace
- restrained cards
- charts as evidence, not decoration

## 12.2 Navigation

Desktop:
- Logo
- Market
- Areas
- Compare
- Calculators
- Reality Check
- Projects
- Research

Right:
- Search
- optional language
- optional account later

Mobile:
- bottom navigation or compact menu
- Reality Check should remain easy to access

## 12.3 Global search

Search should understand:
- area
- project
- developer
- building

Examples:

"Dubai Marina"

"JVC"

"Business Bay"

"Downtown Dubai"

Later:
"1 bedroom in Marina"

---

# 13. Core Dashboard UX

Every dashboard should have:

### Header
- page title
- short explanation
- last updated
- source

### Filter bar
- date
- area
- property type
- rooms
- reset

### KPI row

Example:
- Median price
- AED/sqft
- Transactions
- Median rent
- Gross yield

### Charts

Use:
- line chart for time
- bar chart for comparison
- distribution chart for price ranges

Avoid:
- 3D charts
- decorative gauges
- excessive gradients
- misleading dual-axis charts

### Data table

Must include:
- sorting
- pagination
- responsive behavior
- export only where legally appropriate

---

# 14. States

Every data component must support:

### Loading
Skeleton UI.

### Empty
Explain:
> "No matching records were found for these filters."

### Error
Explain what happened and provide retry.

### Partial data
Display:
> "Limited data available for this combination."

### Stale data
Show:
> "Data last refreshed: YYYY-MM-DD"

### No permission
Never silently fail.

---

# 15. Accessibility

Target WCAG 2.2 AA principles.

Requirements:
- keyboard navigation
- visible focus
- semantic HTML
- labels on all controls
- accessible chart summaries
- color must not be the only information carrier
- minimum practical touch targets
- reduced-motion support
- readable contrast
- screen-reader-friendly tables

---

# 16. Responsive Design

Breakpoints should be content-driven, not device-driven.

Mobile:
- one-column layouts
- sticky primary action where useful
- horizontal filter scrolling only where necessary
- charts optimized for narrow screens
- tables convert to cards where appropriate

Tablet:
- two-column dashboard where useful

Desktop:
- multi-column analytics
- persistent filters

---

# 17. AI-Native Product Strategy

AI should be deeply integrated but controlled.

## AI Feature A — Property Research Assistant

User can ask:

> "What is the recent transaction range for 1-bedroom apartments in Dubai Marina?"

The AI should:

1. parse the question
2. identify filters
3. query structured database
4. calculate metrics
5. answer
6. cite the underlying dataset/time period
7. disclose limitations

## AI Feature B — Natural-language filters

Instead of manually selecting filters:

> "Show me apartment transactions in JVC from January to June 2026."

AI converts this to structured filters.

## AI Feature C — Explain a chart

User clicks:

**Explain this trend**

AI summarizes only the displayed/queried data.

## AI Feature D — Property Reality Check explanation

AI explains:
- how the calculation was made
- what comparison population was used
- why the result may be unreliable with low sample size

## AI Feature E — Research report generator

Future:
- select area/project
- generate structured report
- include citations/provenance

---

# 18. AI Safety / Accuracy Rules

AI must never:

- invent transactions
- invent DLD statistics
- invent developer facts
- claim a property will appreciate
- tell user to buy/sell
- produce fake citations
- hide low sample sizes
- turn estimates into facts

## Grounding architecture

```text
User question
    ↓
Intent parser
    ↓
Structured query
    ↓
PostgreSQL / analytics
    ↓
Validated result
    ↓
LLM explanation
    ↓
Source + methodology
    ↓
Answer
```

The LLM should not directly "guess" the market number.

---

# 19. AI Context Contract

Every AI answer should have access to:

```json
{
  "source": "DLD",
  "dataset": "transactions",
  "period_start": "YYYY-MM-DD",
  "period_end": "YYYY-MM-DD",
  "filters": {},
  "sample_size": 0,
  "calculation_method": "",
  "generated_at": "",
  "data_freshness": ""
}
```

---

# 20. AI Prompt Rules

System-level rules:

1. Use supplied structured data.
2. Do not invent missing values.
3. If data is insufficient, say so.
4. Distinguish transaction data from asking data.
5. State sample size when relevant.
6. Do not give financial advice.
7. Use neutral language.
8. Do not make future price predictions unless a separately validated forecasting product exists and uncertainty is clearly shown.
9. Never expose internal prompts/secrets.
10. Never execute arbitrary user-generated SQL.

---

# 21. Database Architecture

PostgreSQL is the source of truth.

Use schemas:

```text
raw
core
analytics
app
audit
```

## 21.1 Core entity model

```text
core.areas
core.property_types
core.projects
core.developers
core.brokers
core.properties/buildings/units (future)
core.transactions
core.rent_transactions
core.valuations
```

---

# 22. Database Tables

## core.areas

```sql
CREATE TABLE core.areas (
    area_id BIGSERIAL PRIMARY KEY,
    source_area_name TEXT NOT NULL,
    normalized_name TEXT NOT NULL UNIQUE,
    zone_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## core.projects

```sql
CREATE TABLE core.projects (
    project_id BIGSERIAL PRIMARY KEY,
    source_project_number TEXT,
    project_name TEXT,
    developer_id BIGINT REFERENCES core.developers(developer_id),
    area_id BIGINT REFERENCES core.areas(area_id),
    project_type TEXT,
    project_value NUMERIC(18,2),
    project_status TEXT,
    completed_percent NUMERIC(5,2),
    start_date DATE,
    end_date DATE,
    adoption_date DATE,
    inspection_date DATE,
    completion_date DATE,
    master_project TEXT,
    source_name TEXT,
    source_record_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## core.developers

```sql
CREATE TABLE core.developers (
    developer_id BIGSERIAL PRIMARY KEY,
    source_developer_number TEXT,
    developer_name TEXT NOT NULL,
    registration_date DATE,
    license_source TEXT,
    license_type TEXT,
    legal_status TEXT,
    website TEXT,
    source_record_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## core.transactions

```sql
CREATE TABLE core.transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    source_transaction_number TEXT NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_type TEXT,
    transaction_sub_type TEXT,
    registration_type TEXT,
    is_freehold BOOLEAN,
    usage TEXT,
    area_id BIGINT REFERENCES core.areas(area_id),
    property_type TEXT,
    property_sub_type TEXT,
    amount NUMERIC(20,2),
    transaction_size_sqm NUMERIC(18,4),
    property_size_sqm NUMERIC(18,4),
    rooms TEXT,
    parking TEXT,
    nearest_metro TEXT,
    nearest_mall TEXT,
    nearest_landmark TEXT,
    buyer_count INTEGER,
    seller_count INTEGER,
    master_project TEXT,
    project_id BIGINT REFERENCES core.projects(project_id),
    source_record_hash TEXT,
    ingestion_batch_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(source_transaction_number, transaction_date)
);
```

## core.rent_transactions

```sql
CREATE TABLE core.rent_transactions (
    rent_id BIGSERIAL PRIMARY KEY,
    registration_date DATE,
    start_date DATE,
    end_date DATE,
    version TEXT,
    area_id BIGINT REFERENCES core.areas(area_id),
    contract_amount NUMERIC(20,2),
    annual_amount NUMERIC(20,2),
    is_freehold BOOLEAN,
    property_size_sqm NUMERIC(18,4),
    property_type TEXT,
    property_sub_type TEXT,
    rooms TEXT,
    usage TEXT,
    nearest_metro TEXT,
    nearest_mall TEXT,
    nearest_landmark TEXT,
    parking TEXT,
    unit_count INTEGER,
    master_project TEXT,
    project_id BIGINT REFERENCES core.projects(project_id),
    source_record_hash TEXT,
    ingestion_batch_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

# 23. Audit / Provenance

## audit.ingestion_batches

```sql
CREATE TABLE audit.ingestion_batches (
    batch_id UUID PRIMARY KEY,
    source_name TEXT NOT NULL,
    source_url TEXT,
    dataset_name TEXT NOT NULL,
    acquired_at TIMESTAMPTZ NOT NULL,
    source_file_name TEXT,
    source_file_sha256 TEXT,
    row_count INTEGER,
    status TEXT NOT NULL,
    error_message TEXT,
    completed_at TIMESTAMPTZ
);
```

Every transformed record should be traceable to an ingestion batch.

---

# 24. Raw Data

Raw files should never be overwritten.

```text
data/raw/dld/
    transactions/
        YYYY/MM/
    rents/
        YYYY/MM/
    projects/
        YYYY/MM/
```

Filename convention:

```text
dld_transactions_YYYYMMDD_<hash>.csv
```

---

# 25. Data Quality Rules

Reject or quarantine rows when:

- amount is negative where not logically valid
- property size <= 0
- transaction date is invalid
- annual rent is negative
- required identifiers are missing
- impossible date relationships exist
- duplicate source records are detected

Do not silently delete bad records.

Use:

```text
raw → quarantine → cleaned
```

---

# 26. Analytics Views

## analytics.area_transaction_monthly

Fields:

```text
month
area_id
property_type
transaction_count
total_volume
median_price
median_price_sqm
median_price_sqft
```

## analytics.area_rent_monthly

Fields:

```text
month
area_id
property_type
rent_count
median_annual_rent
median_rent_sqm
median_rent_sqft
```

## analytics.area_market_summary

Fields:

```text
area_id
latest_period
transaction_count
median_price
median_price_sqft
median_rent
gross_yield_estimate
data_quality_score
```

---

# 27. Calculation Standards

## AED/sqft

If DLD provides square meters:

```text
sqft = sqm × 10.7639104167

AED/sqft = amount / sqft
```

Never divide by zero.

## Median

Use median as the default market center for skewed property prices.

Also retain:
- count
- p25
- p75
- optionally p10/p90

## Gross rental yield

```text
gross_yield = annual_rent / purchase_price × 100
```

This is a gross estimate.

Do not call it net yield unless costs are included.

## Estimated net yield

Future calculation:

```text
net_income =
annual_rent
- service_charges
- maintenance
- vacancy
- management
- other documented assumptions

net_yield =
net_income / total_acquisition_cost × 100
```

Every assumption must be visible.

---

# 28. Comparability Engine

A property comparison should prefer records matching:

1. same area
2. same property type
3. same subtype
4. same room count
5. similar size
6. recent period

Fallback progressively if sample size is insufficient.

Example:

```text
Tier 1:
same area + type + rooms + size band

Tier 2:
same area + type + rooms

Tier 3:
same area + type

Tier 4:
area-wide
```

Always tell the user which tier was used.

---

# 29. Confidence / Coverage

Do not call this statistical "confidence" unless formally defined.

Use a user-facing label such as:

**Data coverage: High / Medium / Limited**

Based on:
- sample size
- recency
- match quality
- missingness

---

# 30. API Architecture

Use FastAPI.

```text
/api/v1/market/summary
/api/v1/areas
/api/v1/areas/{area_id}
/api/v1/areas/{area_id}/transactions
/api/v1/areas/{area_id}/rents
/api/v1/compare
/api/v1/calculators/yield
/api/v1/reality-check
/api/v1/projects
/api/v1/developers
/api/v1/metadata/sources
```

## Example

```http
GET /api/v1/areas/123/transactions?from=2026-01-01&to=2026-06-30&property_type=Apartment
```

Response:

```json
{
  "data": {
    "transaction_count": 1234,
    "median_price": 1250000,
    "median_aed_sqft": 1450
  },
  "filters": {},
  "period": {
    "from": "2026-01-01",
    "to": "2026-06-30"
  },
  "source": {
    "name": "Dubai Land Department",
    "dataset": "Transactions"
  }
}
```

---

# 31. API Rules

- version APIs
- validate all inputs
- whitelist filter fields
- parameterized SQL only
- pagination
- rate limiting
- structured errors
- no raw SQL from users
- no secret keys in frontend
- cache expensive analytics
- log API failures

---

# 32. Frontend Architecture

Recommended:

- Next.js
- TypeScript
- Tailwind CSS
- accessible component library
- chart library
- React Query/TanStack Query or equivalent
- Zod or equivalent validation

The architecture should permit replacing any library later.

---

# 33. Component Inventory

```text
AppShell
Header
MobileNav
SearchBar
GlobalSearch
FilterBar
FilterDrawer
MetricCard
DataFreshnessBadge
SourceBadge
ChartCard
TrendChart
DistributionChart
ComparisonTable
PropertyCard
ProjectCard
DataTable
Pagination
EmptyState
ErrorState
Skeleton
Tooltip
Modal
Drawer
CalculatorForm
RealityCheckForm
RealityCheckResult
MethodologyPanel
AIResearchPanel
CitationList
LeadForm
Cookie/Privacy controls
```

---

# 34. Performance

Target:

- fast first render
- mobile-first
- Core Web Vitals in the good range
- server-render SEO pages where appropriate
- cache expensive analytics
- lazy-load charts
- compress images
- avoid unnecessary client-side JavaScript

Do not sacrifice performance for animation.

---

# 35. SEO

## Programmatic SEO

Potential pages:

```text
/dubai-marina/property-prices
/jvc/property-prices
/business-bay/property-prices
```

But only generate pages when enough useful data exists.

## Each SEO page should contain

- unique useful explanation
- actual data
- source
- last updated
- methodology
- charts
- internal links
- related areas
- calculator CTA

Avoid thousands of near-identical thin pages.

---

# 36. SEO Content Rule

AI can assist writing.

AI must not be used to manufacture fake expertise.

Every market claim should come from:
- structured data
- official source
- clearly attributed external source

---

# 37. Security

## Threats

- SQL injection
- prompt injection
- API abuse
- credential leakage
- malicious file upload
- scraping
- bot abuse
- XSS
- CSRF
- fake lead submissions
- data poisoning

## Controls

- parameterized queries
- strict validation
- output encoding
- CSP where practical
- secure cookies
- rate limiting
- server-side secrets
- file type validation
- audit logs
- backups
- dependency updates
- AI prompt isolation

---

# 38. Privacy

Collect the minimum possible personal data.

Lead form initially:

- name
- email
- optional phone
- interest
- consent

Do not collect unnecessary identity/property information.

Provide:
- Privacy Policy
- Terms
- Cookie policy/controls where applicable
- Lead-consent language
- data retention policy

For UK/EU users, design privacy controls so the product can later meet applicable GDPR/UK GDPR obligations. Obtain jurisdiction-specific legal review before operating a large-scale lead database.

---

# 39. Real Estate Compliance

The product must distinguish:

### Market research
from

### Property advertising

DLD provides a Real Estate Ad Permit service covering electronic advertisements, classified advertisements, real-estate promotion platforms and other advertising categories.

Therefore, before hosting third-party property advertisements/listings or promoting properties as ads, verify the applicable DLD/RERA/Trakheesi requirements.

For MVP, prefer:

**market intelligence + calculators + research**

over:

**user-submitted property advertisements.**

---

# 40. Monetization UX

Never make monetization destroy trust.

### CTA

After Reality Check:

> Need professional help with a Dubai property?

Then:

- explain that the site is a research platform
- disclose partner/lead relationships
- collect consent
- route to appropriate licensed professionals

Do not imply:
> "This agent is recommended because they are best."

---

# 41. Analytics

Track:

### Acquisition
- organic sessions
- search impressions
- landing pages

### Engagement
- Reality Check starts
- Reality Check completions
- calculator completions
- area searches
- compare actions

### Conversion
- lead form starts
- lead submissions
- qualified leads
- partner conversion if available

### Product quality
- API error rate
- data freshness
- missing-data rate
- AI answer fallback rate

---

# 42. North Star Metrics

Early:

**Completed Property Research Sessions**

A completed session means a user performs a meaningful research action, such as:
- Reality Check completion
- area comparison
- yield calculation

Later:

**Qualified commercial leads generated per month**

---

# 43. Testing

## Unit tests

- currency calculations
- sqm → sqft
- median
- yield
- filters
- comparability

## Data tests

- duplicates
- null rates
- date validity
- amount ranges
- foreign keys
- row counts

## API tests

- valid filters
- invalid filters
- pagination
- rate limits
- empty results

## UI tests

- mobile
- desktop
- keyboard
- screen reader basics
- loading
- errors
- empty state

## AI tests

Create a fixed evaluation set:

```text
Known question → expected database query/result
```

Test:
- hallucination
- wrong date range
- wrong area
- wrong property type
- missing-data handling
- citation correctness

---

# 44. Deployment — Zero/Low Budget

## Development

Existing environment:

```text
Windows 10
WSL2 Ubuntu
VS Code
Python 3.12
PostgreSQL 15
Docker
```

## Production

Start with free tiers where currently available.

Architecture:

```text
GitHub
   ↓
CI
   ↓
Frontend hosting
   ↓
FastAPI
   ↓
Managed PostgreSQL
```

If a free PostgreSQL tier becomes too restrictive:

- move to low-cost managed PostgreSQL
- or deploy PostgreSQL on a small VPS

Do not buy infrastructure until necessary.

---

# 45. Repository

```text
dubai-property-intelligence/
│
├── apps/
│   ├── web/
│   └── api/
│
├── data/
│   ├── raw/
│   ├── processed/
│   └── quarantine/
│
├── etl/
│   ├── extract/
│   ├── transform/
│   ├── load/
│   └── jobs/
│
├── db/
│   ├── migrations/
│   ├── seeds/
│   └── sql/
│
├── analytics/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── data/
│   └── ai/
│
├── docs/
│   ├── prd.md
│   ├── ui-ux.md
│   ├── data-dictionary.md
│   ├── architecture.md
│   ├── methodology.md
│   └── compliance.md
│
├── infra/
│   ├── docker/
│   └── ci/
│
├── scripts/
├── .env.example
├── docker-compose.yml
├── README.md
└── LICENSE
```

---

# 46. AI Coding-Agent Rules

Any AI coding agent working on this repository must follow:

1. Read `/docs/prd.md` before modifying product behavior.
2. Read `/docs/architecture.md` before changing architecture.
3. Never invent DLD fields.
4. Never silently change calculation definitions.
5. Add tests with meaningful logic changes.
6. Do not introduce paid dependencies without approval.
7. Do not expose secrets.
8. Do not create a second database model when an existing model can be extended.
9. Preserve backward compatibility for public APIs.
10. Explain migration impact before schema changes.
11. Keep UI responsive.
12. Keep accessibility requirements.
13. Never add fake demo statistics to production UI.
14. Clearly label mock/demo data.
15. AI-generated explanations must use structured backend data.
16. No investment recommendations.
17. No raw-data redistribution feature without legal/data-rights confirmation.
18. Prefer simple maintainable code over clever code.
19. Keep functions small and testable.
20. Update documentation when behavior changes.

---

# 47. Environment Variables

Example:

```env
APP_ENV=development

DATABASE_URL=postgresql://...
DATABASE_POOL_SIZE=10

DLD_SOURCE_BASE_URL=https://dubailand.gov.ae/

AI_PROVIDER=
AI_MODEL=

NEXT_PUBLIC_API_BASE_URL=

RATE_LIMIT_PER_MINUTE=60

SENTRY_DSN=
```

Never commit `.env`.

---

# 48. CI/CD

Pipeline:

```text
push
 ↓
lint
 ↓
type check
 ↓
unit tests
 ↓
data tests
 ↓
build
 ↓
integration tests
 ↓
deploy
```

Production deployment should be blocked if critical tests fail.

---

# 49. Backups

Minimum:

- database daily backup
- retain multiple generations
- raw source files preserved
- source checksums preserved
- migration files version-controlled

Never rely on a single database copy.

---

# 50. Observability

Monitor:

- API latency
- database latency
- error rate
- ETL success/failure
- data row count
- data freshness
- frontend errors
- AI failures
- lead failures

---

# 51. Data Freshness

Every data-driven page must expose:

```text
Data source: Dubai Land Department
Dataset: Transactions
Period covered: ...
Last processed: ...
```

Do not claim "live" unless the underlying source is actually live.

---

# 52. Product Trust UX

Every important number should answer:

**Where did this come from?**

Add a compact:

> Source & methodology

drawer under charts.

Example:

> Source: Dubai Land Department Transactions dataset  
> Period: Jan–Jun 2026  
> Sample: 1,245 transactions  
> Calculation: median registered transaction price  
> Updated: 30 Sep 2026

---

# 53. AI Assistant UI

Desktop:

```text
┌──────────────────────────────────────────────┐
│ Ask Dubai Property Intelligence              │
│                                              │
│ "Compare Marina and JVC for rental yield"    │
│                                  [Ask]       │
└──────────────────────────────────────────────┘
```

Response:

```text
Answer
──────
...

Data used
─────────
Transactions: ...
Rents: ...

Method
──────
...

Sources
───────
DLD Transactions
DLD Rents
```

Mobile:
- bottom-sheet assistant
- suggested questions
- voice later

---

# 54. Suggested Questions

- "What are the latest transaction trends in Dubai Marina?"
- "Compare JVC and Business Bay."
- "What is the median AED/sqft?"
- "How many transactions were recorded?"
- "Estimate gross rental yield for this property."
- "Explain this chart."

---

# 55. AI Cost Control

Because the user is cashless:

### Do not call an LLM for:

- ordinary filters
- ordinary calculations
- ordinary charts
- database search

Use deterministic software.

### Use AI only for:

- natural-language queries
- explanation
- summarization
- research assistant

This dramatically reduces AI cost.

---

# 56. Free-First AI Architecture

Start with:

```text
Normal UI
    ↓
Structured API
    ↓
No AI cost
```

Then:

```text
AI assistant
    ↓
Structured query generation
    ↓
Database
    ↓
Deterministic calculations
    ↓
AI explanation
```

This makes the AI layer replaceable.

---

# 57. Industry-Grade Product Roadmap

## Phase 0 — Foundation

- repository
- Docker
- PostgreSQL
- migrations
- logging
- config

## Phase 1 — Data

- DLD transaction ingestion
- DLD rent ingestion
- validation
- provenance

## Phase 2 — Analytics

- area metrics
- rent metrics
- trends
- yield

## Phase 3 — MVP UI

- home
- market
- areas
- compare
- calculators
- Reality Check

## Phase 4 — Public launch

- SEO
- analytics
- methodology
- privacy
- monitoring

## Phase 5 — AI

- natural-language search
- explanations
- research assistant

## Phase 6 — Monetization

- leads
- partner profiles
- ads
- premium research

## Phase 7 — B2B

- broker dashboard
- developer dashboard
- subscriptions

---

# 58. First 7 Days

## Day 1

- create repository
- create project folders
- Docker Compose
- PostgreSQL
- environment config
- README

## Day 2

- acquire first DLD transaction dataset
- preserve raw file
- document source
- inspect columns

## Day 3

- acquire rental dataset
- inspect columns
- write data dictionary

## Day 4

- build transaction ETL
- validation
- normalization
- PostgreSQL load

## Day 5

- build rental ETL
- database indexes
- ingestion audit

## Day 6

- SQL analytics
- median price
- AED/sqft
- rent
- yield

## Day 7

- first API endpoint
- first dashboard
- end-to-end demo

---

# 59. Definition of Done — MVP

The MVP is done when:

### Data

- DLD transaction data loads successfully
- rental data loads successfully
- ingestion is repeatable
- data lineage exists
- quality checks exist

### Backend

- API works
- filters work
- calculations are tested
- errors are handled

### Frontend

- mobile works
- desktop works
- Reality Check works
- charts work
- source information is visible

### AI

- assistant can answer grounded questions
- unsupported questions are refused or redirected
- no fake statistics
- citations/provenance appear

### Business

- lead CTA exists
- analytics installed
- conversion event tracking works

### Compliance

- methodology
- privacy
- terms
- disclaimer
- data-source disclosure

---

# 60. Launch Checklist

## Before public launch

- [ ] DLD source verified
- [ ] data rights reviewed
- [ ] data freshness documented
- [ ] calculations independently tested
- [ ] no fake data in production
- [ ] no exposed secrets
- [ ] privacy page
- [ ] terms
- [ ] disclaimer
- [ ] responsive UI
- [ ] accessibility pass
- [ ] performance pass
- [ ] sitemap
- [ ] robots.txt
- [ ] metadata
- [ ] analytics
- [ ] error monitoring
- [ ] backups
- [ ] lead consent
- [ ] real-estate advertising compliance checked before any property ads

---

# 61. What Not To Build Initially

Do not build:

- full listing marketplace
- user accounts
- chat between buyer and broker
- payments
- property posting
- complex maps
- mobile app
- real-time websocket architecture
- paid API integration
- machine-learning price prediction
- blockchain
- tokenization
- massive CRM

These are distractions until product-market evidence exists.

---

# 62. Competitive Differentiation

The product should differentiate on:

### 1. Data transparency

Show:
- source
- period
- sample size
- method

### 2. Transaction vs asking distinction

Make this extremely clear.

### 3. Easy research

A normal person should understand the dashboard without being a data analyst.

### 4. AI interface

Users can ask questions naturally.

### 5. Tools

The user gets an answer, not just an article.

### 6. Lead monetization

Useful research naturally leads to optional professional assistance.

---

# 63. Long-Term Product Architecture

```text
                    DLD / AUTHORIZED SOURCES
                             │
                             ▼
                      DATA INGESTION
                             │
                             ▼
                    RAW + PROVENANCE
                             │
                             ▼
                    TRANSFORM / QUALITY
                             │
                             ▼
                         POSTGRES
                             │
                 ┌───────────┴───────────┐
                 ▼                       ▼
             ANALYTICS               SEARCH INDEX
                 │                       │
                 └───────────┬───────────┘
                             ▼
                           API
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
        WEB UI              AI                B2B
          │                  │                  │
          └──────────────────┼──────────────────┘
                             ▼
                       USER VALUE
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
                  LEADS             REVENUE
```

---

# 64. Final Strategic Rule

This project must not become:

> "A beautiful website with no users."

It must become:

> **A useful data product that earns the right to become a business.**

The order is:

**Authentic data → useful tool → users → trust → leads/revenue → reinvestment → advanced product.**

Not:

**Huge website → huge spending → hope for traffic.**

---

# 65. Official Sources To Keep In The Project

- Dubai Land Department — Real Estate Data:
  https://dubailand.gov.ae/en/open-data/real-estate-data/

- Dubai Land Department — API Gateway:
  https://dubailand.gov.ae/en/eservices/api-gateway/

- Dubai Land Department — Real Estate Ad Permit:
  https://dubailand.gov.ae/en/eservices/real-estate-ad-permit/

The project must re-check these official pages before each major data/compliance milestone because access methods, pricing, requirements and terms can change.

---

# 66. Recommended Build Order

**Do not start with the frontend.**

Build in this exact order:

```text
1. Repository
2. Docker/PostgreSQL
3. DLD raw-data acquisition
4. Data dictionary
5. ETL
6. Data quality
7. Database
8. Analytics SQL
9. FastAPI
10. Frontend design system
11. Market dashboard
12. Calculators
13. Reality Check
14. SEO
15. Analytics
16. Compliance pages
17. AI assistant
18. Lead generation
19. Public launch
20. Iterate from actual user behavior
```

This sequence minimizes rework and keeps the project compatible with the user's existing data-engineering environment.

---

# 67. Master Success Criteria

The project succeeds when a first-time visitor can:

**arrive → search an area/property → understand the data → run a calculation → inspect the methodology → take an optional next action**

in under a few minutes, without needing to understand real-estate jargon.

The system succeeds technically when:

**source → ingestion → database → analytics → API → UI → AI explanation**

is traceable end-to-end.

The business succeeds when:

**useful research → repeat usage → qualified commercial intent → measurable revenue**

can be demonstrated.

---

## Current external-source verification note

As of the specification date, DLD's official Real Estate Data page lists Transactions, Rents, Project, Valuations, Land, Building, Unit, Broker and Developer data and exposes CSV download controls. It also directs users to Dubai Pulse/data.dubai for previous-year data. citeturn0search2turn0search4

DLD's API Gateway currently lists services such as Rental Index, Dubai Brokers and Trakheesi integrations; several API offerings shown on the current page carry prerequisites and paid pricing, reinforcing the decision not to make paid API access an MVP dependency. citeturn0search0turn0search1

DLD also has a Real Estate Ad Permit service covering electronic advertisements and real-estate promotion platforms, so property-advertising functionality must be treated as a separate compliance phase rather than assumed to be freely available. citeturn0search5

---

**End of Master Specification**
