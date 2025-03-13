// Script to list all tables in Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function listTables() {
  try {
    console.log('Supabase URL:', process.env.SUPABASE_URL);
    console.log('Supabase Key length:', process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.length : 'undefined');
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    
    console.log('Supabase client created');
    
    // Query to list all tables in the public schema
    const { data, error } = await supabase
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (error) {
      console.error('Error fetching tables:', error);
      return;
    }
    
    console.log('Tables in public schema:');
    if (data && data.length > 0) {
      data.forEach(table => {
        console.log(`- ${table.tablename}`);
      });
    } else {
      console.log('No tables found');
    }
    
    // Check if worlds table exists
    const { data: worldsData, error: worldsError } = await supabase
      .from('worlds')
      .select('count(*)');
    
    if (worldsError) {
      console.error('Error checking worlds table:', worldsError);
    } else {
      console.log('Worlds table exists with count:', worldsData[0].count);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

listTables();
