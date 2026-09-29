CREATE UNIQUE INDEX IF NOT EXISTS "bid_submissions_tender_bidder_unique" ON "bid_submissions" ("tender_id", "bidder_id");
