const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    const { data, error } = await supabaseAdmin
        .from('activities')
        .select('id, title, reference_code')
        .order('created_at', { ascending: true });

    console.log("Data:", data);
    if (error) console.log("Error:", error);
}
test();
