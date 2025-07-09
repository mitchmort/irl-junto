-- Migration: Add url_slug column to events table
-- Description: Adds a unique url_slug column to replace numeric IDs in public URLs

-- Add the url_slug column as nullable initially for migration
ALTER TABLE events 
ADD COLUMN url_slug TEXT;

-- Create a unique index on url_slug (will be enforced once we populate the data)
CREATE UNIQUE INDEX CONCURRENTLY events_url_slug_idx ON events(url_slug) WHERE url_slug IS NOT NULL;

-- Function to generate random URL slug
CREATE OR REPLACE FUNCTION generate_random_slug(length INTEGER DEFAULT 12)
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER;
    segment_length INTEGER := 3;
    segments INTEGER;
BEGIN
    segments := CEIL(length::DECIMAL / 4);
    
    FOR s IN 1..segments LOOP
        IF s > 1 THEN
            result := result || '-';
        END IF;
        
        FOR i IN 1..segment_length LOOP
            result := result || substring(chars, floor(random() * length(chars))::int + 1, 1);
        END LOOP;
    END LOOP;
    
    -- Add remaining characters if needed
    WHILE length(result) - (segments - 1) < length LOOP
        result := result || substring(chars, floor(random() * length(chars))::int + 1, 1);
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to ensure unique slug generation
CREATE OR REPLACE FUNCTION generate_unique_event_slug()
RETURNS TEXT AS $$
DECLARE
    new_slug TEXT;
    slug_exists BOOLEAN;
BEGIN
    LOOP
        new_slug := generate_random_slug(12);
        
        SELECT EXISTS(SELECT 1 FROM events WHERE url_slug = new_slug) INTO slug_exists;
        
        IF NOT slug_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- Populate url_slug for existing events
UPDATE events 
SET url_slug = generate_unique_event_slug()
WHERE url_slug IS NULL;

-- Now make the column NOT NULL and add the unique constraint
ALTER TABLE events 
ALTER COLUMN url_slug SET NOT NULL;

-- Add unique constraint (the index we created earlier will support this)
ALTER TABLE events 
ADD CONSTRAINT events_url_slug_unique UNIQUE USING INDEX events_url_slug_idx;

-- Create trigger to auto-generate slug for new events
CREATE OR REPLACE FUNCTION trigger_generate_event_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.url_slug IS NULL THEN
        NEW.url_slug := generate_unique_event_slug();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_generate_slug_trigger
    BEFORE INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_event_slug();

-- Update any existing share_link values to use the new slug format
-- This is optional and can be done separately if needed
-- UPDATE events 
-- SET share_link = 'https://junto.app/event/' || url_slug
-- WHERE share_link IS NOT NULL;