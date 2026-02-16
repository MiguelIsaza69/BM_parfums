const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log('Error: Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    console.log('Checking connection to Supabase...');

    // Try to select from the table
    const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error connecting to hero_slides table:', error.message);
        if (error.code === '42P01') {
            console.error('Table "hero_slides" does not exist. Please run the migration SQL.');
        }
    } else {
        console.log('Access to hero_slides table successful.');
        console.log('Row count:', data ? data.length : 0);
    }
}

checkTable();
