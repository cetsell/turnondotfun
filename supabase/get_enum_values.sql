-- Function to get enum values for a given enum type
CREATE OR REPLACE FUNCTION get_enum_values(enum_name text)
RETURNS text[] AS $$
DECLARE
    enum_values text[];
BEGIN
    -- Query the PostgreSQL information schema to get enum values
    SELECT array_agg(e.enumlabel)
    INTO enum_values
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = enum_name;
    
    RETURN enum_values;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anon roles
GRANT EXECUTE ON FUNCTION get_enum_values(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_enum_values(text) TO anon;

-- Example usage:
-- SELECT get_enum_values('asset_type'); 