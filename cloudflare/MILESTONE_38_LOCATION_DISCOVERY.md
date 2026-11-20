# Milestone 38 — Community discovery and filtering

The marketplace now uses `/api/onelink/communities?q=...` to discover real D1 communities and filters public listings with `/api/onelink/public-listings?community=slug`.

The interface provides a community selector, a clear-location action, and category/text filtering. Search is debounced, and the community API is accessed through the same-origin Next.js backend.

## Acceptance
- Search for an existing community and select it. Only published, unexpired listings in that community should be returned.
- Clear the location to restore all-community results.
- Combine a community filter with rent/sale/service/tenant category buttons and text search.
- Confirm no fabricated communities or placeholder properties appear in live results.
- Verify the D1 database contains approved community seed records before expecting populated options.

## Future scale
The current Worker limits listing results to 50 and community suggestions to 30. A later milestone should implement cursor-based pagination and hierarchical country/city/neighbourhood metadata for 20,000+ communities. Do not generate thousands of unverified SEO pages from an empty database.
