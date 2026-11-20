# DomisLinker Milestones 40, 41, 45, 46 — implementation and release gates

## Implemented on feature branch
- **40:** D1 migration `0007_community_discovery_enquiries.sql` adds country, state, city, district, neighbourhood, verified flag and optional community-centre coordinates. Community detail and nearby APIs return verified records only.
- **41:** Community storefronts display an interactive OpenStreetMap embed when a verified community has coordinates. Map marks the **community centre**, not private property addresses. External OSM map content loads only on map-bearing community pages.
- **45:** Dynamic `/onelink/community/[slug]` pages display community metadata and published, unexpired listings; empty communities show a clear empty state. No fictitious records or bulk SEO doorway pages.
- **46:** Signed-in OneLink users submit private listing enquiries, limited to three per identity per hour; listing owners access their own enquiry inbox. WhatsApp sharing is initiated by the visitor; there is **no automated WhatsApp messaging or advertiser WhatsApp contact number** in this milestone.

## Deployment and data migration
The new migration is included in fresh database bootstrap, lifecycle tests, release preflight, and Worker readiness. On an **existing** database, do not run the fresh bootstrap script: back up D1, inspect schema, then apply only `0007_community_discovery_enquiries.sql` once using a reviewed Wrangler command.

The `verified` flag defaults to zero. An operator must validate and approve geographical records before they appear publicly; the repository does not auto-mark imported records as verified. Existing community data therefore needs a controlled verification pass after migration.

## Privacy and operational controls
- Enquiry messages and email addresses are returned only to the OneLink-verified owner of the listing. Do not expose the inbox as a public API.
- Deploy Cloudflare WAF / Turnstile and abuse monitoring before broad public launch; the per-account rate limit is an initial safeguard, not a substitute.
- Define retention and deletion policies for enquiry personal data before production.
- Map coordinates are community centres, not addresses or user GPS.
- The listing feed is still capped at 50 records; pagination, indexed geospatial queries and full country/state filters remain follow-on work.

## Release acceptance
1. Confirm CI Worker tests, SQLite migration tests and Next.js build pass.
2. Apply migration 0007 to D1 and verify `/api/ready` returns 200.
3. Verify one approved community appears in search and its storefront, while an unverified community does not.
4. Verify map renders only when coordinates exist; verify listing-to-community links.
5. Test OneLink authenticated enquiry, self-enquiry denial, rate limit, and owner-only inbox.
6. Confirm the WhatsApp share action opens a share draft; no messages are sent automatically.
7. Complete earlier OneLink/Paystack sandbox gates before declaring production ready.
