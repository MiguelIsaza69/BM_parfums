
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vadcwkvtdweaksikenzs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZGN3a3Z0ZHdlYWtzaWtlbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4OTk0ODMsImV4cCI6MjA4NjQ3NTQ4M30.j9b3nemJ5UDWtoawYqo5hswh6VK0xxIV49RpXC_EGok';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getIds() {
    const { data: brands } = await supabase.from('brands').select('id, name').limit(1);
    const { data: categories } = await supabase.from('categories').select('id, name').limit(1);
    const { data: genders } = await supabase.from('genders').select('id, name').limit(1);

    console.log(JSON.stringify({
        brand: brands?.[0],
        category: categories?.[0],
        gender: genders?.[0]
    }));
}

getIds();
