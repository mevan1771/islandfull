import { supabase } from "@/lib/supabase"
import TourForm from "@/components/admin/TourForm"

export const dynamic = 'force-dynamic';

export default async function NewTourPage() {
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <TourForm categories={categories || []} />
      </div>
    </div>
  )
}
