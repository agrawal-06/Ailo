CREATE TABLE IF NOT EXISTS occasions (
 id UUID PRIMARY KEY,
 name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
 kind TEXT NOT NULL CHECK (kind IN ('Birthday','Anniversary','Other')),
 day SMALLINT NOT NULL CHECK (day BETWEEN 1 AND 31),
 month SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
 custom BOOLEAN NOT NULL DEFAULT false,
 first_call TIME NOT NULL DEFAULT '23:50',
 second_call TIME NOT NULL DEFAULT '00:00',
 second_enabled BOOLEAN NOT NULL DEFAULT true,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS occasions_month_day_idx ON occasions(month,day);
-- Development-only single-user schema. Add user ownership and authentication before deployment.
