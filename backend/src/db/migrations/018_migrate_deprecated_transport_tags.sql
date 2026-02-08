-- Migration 018: Migrate deprecated transport tags to 'promet'
-- This is idempotent - safe to run multiple times
-- Replaces cestovni_promet and pomorski_promet with promet, deduplicating if needed

-- Replace cestovni_promet with promet (only if cestovni_promet exists)
UPDATE inbox_messages
SET tags = (
  SELECT array_agg(DISTINCT t ORDER BY t)
  FROM unnest(
    array_replace(tags, 'cestovni_promet'::inbox_tag, 'promet'::inbox_tag)
  ) AS t
)
WHERE 'cestovni_promet'::inbox_tag = ANY(tags);

-- Replace pomorski_promet with promet (only if pomorski_promet exists)
UPDATE inbox_messages
SET tags = (
  SELECT array_agg(DISTINCT t ORDER BY t)
  FROM unnest(
    array_replace(tags, 'pomorski_promet'::inbox_tag, 'promet'::inbox_tag)
  ) AS t
)
WHERE 'pomorski_promet'::inbox_tag = ANY(tags);
