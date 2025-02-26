# Supabase Row Level Security (RLS) Setup

This directory contains SQL scripts to set up proper Row Level Security (RLS) policies for your Supabase database.

## What is Row Level Security?

Row Level Security (RLS) is a feature that allows you to control which rows in a table a user can access. It's a powerful way to implement access control at the database level, ensuring that users can only see and modify data they're authorized to.

## Checking Your Database Schema

Before applying RLS policies, it's important to understand your database schema:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `check_schema.sql`
4. Paste into the SQL Editor and run the commands
5. Review the results to understand your table structure

This will help you understand:
- What tables exist in your database
- What columns each table has
- Whether RLS is already enabled
- What existing RLS policies are in place
- How many rows are in your tables
- What the data looks like

## How to Apply RLS Policies

After understanding your schema:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `rls_policies.sql` 
4. **Important**: Modify the policies as needed to match your schema
5. Paste into the SQL Editor
6. Run the SQL commands

## Understanding the Policies

The policies in `rls_policies.sql` implement the following access controls:

1. **Anonymous Read Access**: Anyone can read marketplace items, assets, and stories
2. **Authenticated Insert/Update/Delete**: Authenticated users can modify marketplace items

## Troubleshooting

If you're still having issues accessing data after applying these policies:

1. **Check Table Structure**: Ensure your tables have the expected columns
2. **Verify RLS is Enabled**: Make sure RLS is enabled on your tables
3. **Test with the Supabase UI**: Try querying the tables directly in the Supabase Table Editor
4. **Check Authentication**: Ensure your client is properly authenticated if trying to perform write operations
5. **Review Logs**: Check the console logs in your application for any errors or warnings

## Customizing Policies

You may need to adjust these policies based on your specific schema and requirements. For example:

- If your marketplace items have a `type` field, you can use it to filter items by type
- If your marketplace items have a `user_id` field, you can restrict updates and deletes to the item owner
- If you want to restrict read access to certain items, you can modify the read policy

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

## Handling Enum Types in Supabase

If your database uses enum types for fields like `asset_type`, you might encounter errors like:

```
invalid input value for enum asset_type: "avatar"
```

This happens when the value you're trying to use doesn't match any of the allowed enum values. To fix this:

### 1. Check Valid Enum Values

Run this query in the SQL Editor to see all valid values for an enum:

```sql
SELECT enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE t.typname = 'asset_type';
```

Replace `'asset_type'` with the name of your enum type.

### 2. Use the Provided Function

We've created a helper function `get_enum_values` that you can use to check valid enum values:

```sql
SELECT get_enum_values('asset_type');
```

### 3. Update Your Application Code

Make sure your application code uses the correct enum values. For example, if your enum values are `'character'`, `'environment'`, and `'prop'`, but your code is trying to use `'avatar'`, you'll need to update your code to use the correct values.

### 4. Add New Enum Values (If Needed)

If you need to add new values to an enum type, you can use:

```sql
ALTER TYPE asset_type ADD VALUE 'avatar';
```

This will add 'avatar' as a valid value for the asset_type enum.

## Troubleshooting Common RLS Issues

### Issue: Cannot Access Table Data

If you're getting errors like "No data returned" or "Permission denied", check:

1. RLS is enabled on the table
2. Appropriate policies are in place
3. You're authenticated (if required by the policies)

### Issue: Invalid Enum Values

If you're getting "invalid input value for enum" errors:

1. Check the valid enum values using the query above
2. Update your application code to use valid values
3. Consider adding new enum values if needed

### Issue: Cannot Filter by Type

If you can't filter items by type because the schema doesn't have a type field:

1. Consider adding a type field to your table
2. Use related tables (like assets.type) for filtering
3. Implement a fallback mechanism in your code to handle missing fields 