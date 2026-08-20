const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function generateSKU(category_type) {
    const prefixMap = {
        tour: 'T',
        event: 'E',
        transport: 'TR'
    };
    const prefix = prefixMap[category_type] || 'A';

    const { data, error } = await supabaseAdmin
        .from('activities')
        .select('reference_code')
        .eq('category_type', category_type)
        .not('reference_code', 'is', 'null')
        .order('reference_code', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Error fetching latest SKU:", error);
    }

    let nextNumber = 1;
    if (data && data.length > 0 && data[0].reference_code) {
        const latestCode = data[0].reference_code;
        const match = latestCode.match(/\d+$/);
        if (match) {
            nextNumber = parseInt(match[0], 10) + 1;
        }
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

async function test() {
    // Find Secret Sunset Surf Lesson
    const { data: activity, error: fetchError } = await supabaseAdmin
        .from('activities')
        .select('id, title, category_type, reference_code')
        .ilike('title', '%Secret Sunset Surf Lesson%')
        .single();

    if (fetchError) {
        console.error("Error fetching activity:", fetchError);
        return;
    }

    console.log("Activity:", activity);

    const newSku = await generateSKU(activity.category_type);
    console.log("Generated SKU:", newSku);

    const { error: updateError } = await supabaseAdmin
        .from('activities')
        .update({ reference_code: newSku })
        .eq('id', activity.id);

    console.log("Update Error:", updateError);
}

test();
