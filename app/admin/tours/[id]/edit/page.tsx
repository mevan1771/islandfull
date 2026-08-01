import { supabase } from "@/lib/supabase"
import TourForm from "@/components/admin/TourForm"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic';

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: tour, error } = await supabase
    .from('activities')
    .select('*, categories(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Supabase Edit Fetch Error:", error);
  }

  if (!tour) {
    notFound();
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name');

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <TourForm categories={categories || []} initialData={tour} />
      </div>
    </div>
  )
}
