const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use SERVICE ROLE KEY to bypass RLS for this test
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing credentials.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testInsert() {
    console.log('Attempting server-side insert with Service Role Key (Bypassing RLS)...');

    const testUrl = "https://example.com/test-image.jpg";

    const { data, error } = await supabase
        .from('hero_slides')
        .insert([{ image_url: testUrl }])
        .select();

    if (error) {
        console.error('SERVER-SIDE INSERT FAILED:', error);
    } else {
        console.log('SERVER-SIDE INSERT SUCCESS:', data);

        // Clean up
        console.log('Cleaning up test row...');
        await supabase.from('hero_slides').delete().eq('image_url', testUrl);
    }
}

testInsert();
