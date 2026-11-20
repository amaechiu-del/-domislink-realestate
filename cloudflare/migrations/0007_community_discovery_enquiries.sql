-- Milestones 40/41/45/46: opt-in verified location metadata and privacy-conscious enquiries.
ALTER TABLE communities ADD COLUMN country_code TEXT;
ALTER TABLE communities ADD COLUMN state_name TEXT;
ALTER TABLE communities ADD COLUMN city_name TEXT;
ALTER TABLE communities ADD COLUMN district_name TEXT;
ALTER TABLE communities ADD COLUMN neighborhood_name TEXT;
ALTER TABLE communities ADD COLUMN latitude REAL CHECK(latitude BETWEEN -90 AND 90);
ALTER TABLE communities ADD COLUMN longitude REAL CHECK(longitude BETWEEN -180 AND 180);
ALTER TABLE communities ADD COLUMN verified INTEGER NOT NULL DEFAULT 0 CHECK(verified IN (0,1));
CREATE INDEX IF NOT EXISTS idx_communities_hierarchy ON communities(country_code,state_name,city_name,district_name);
CREATE INDEX IF NOT EXISTS idx_communities_verified ON communities(verified,slug);
CREATE TABLE IF NOT EXISTS listing_enquiries (
 id TEXT PRIMARY KEY,
 listing_id TEXT NOT NULL REFERENCES listings(id),
 sender_name TEXT NOT NULL CHECK(length(sender_name) BETWEEN 2 AND 100),
 sender_email TEXT NOT NULL,
 message TEXT NOT NULL CHECK(length(message) BETWEEN 10 AND 2000),
 status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','reviewed','closed')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_enquiries_listing_created ON listing_enquiries(listing_id,created_at);
