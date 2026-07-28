# CoreFlow CRM Command Center

Arabic-first responsive CRM command-center prototype based on the supplied
`Secure Multi-Product Lead Distribution CRM` master specification.

## Implemented in this checkpoint

- Super Admin dashboard with multi-product selector and Cairo timezone.
- Lead explorer with source, Marketing Owner, sales owner, status and E.164
  sample phone data.
- Product-scoped visual reporting for raw occurrences, unique leads,
  duplication, revenue and SLA.
- Sales presence, capacity and standard Round Robin operational view.
- Integrations screen for Meta Lead Ads, WhatsApp Cloud API, Google Sheets,
  EasyOrders, Generic Webhooks, CSV, Messenger and future adapters.
- Marketing Mapping rules that keep `Unattributed` leads moving to sales.
- Product settings for currency, timezone, phone country, capacity, MFA and
  attribution model.
- Responsive RTL UI and a compact mobile sales/admin experience.
- Safe diagnostics center with:
  - stable error codes;
  - human-readable causes;
  - suggested remediation;
  - correlation IDs;
  - service and detection time;
  - one-click support report copy;
  - explicit token/PII redaction notice.

## Current boundary

This repository currently contains a production-buildable, interactive product
prototype. The dashboard data and actions are deterministic demo state. Real
provider ingestion, credential vaulting, PostgreSQL/Redis workers, telephony,
recording storage, MFA identity provider, and production concurrency locking
require the backend phases and external credentials/approvals described in the
master specification. The interface never claims those connections are
production-verified.

## Error report format

When a problem appears, open **مركز الأخطاء**, select the event, and copy the
support report. It contains:

```text
Error Code: META_TOKEN_EXPIRED
Correlation ID: evt_7JK2-META-91D
Service: Meta Lead Ads
Reason: <redacted human-readable cause>
```

Send that block when requesting a fix. Never send an access token, password,
authorization header, raw webhook payload, or real customer data.

## Local development

Requirements:

- Node.js `>=22.13.0`

Commands:

```bash
npm ci
npm run dev
npm run lint
npm run build
npm test
```

## Verification

The current checkpoint passes:

- ESLint
- TypeScript/build compilation
- Vinext production artifact validation
- rendered HTML smoke test
- browser interaction checks for navigation, integration health, diagnostic
  details and support-report copy

## Security notes

- No secrets or real customer data are included.
- Provider errors shown in the UI are curated and redacted.
- Saved tokens must be write-only from the admin perspective in backend phases.
- The master specification recommends a private repository with secret scanning
  and branch protection before any production credentials are configured.
