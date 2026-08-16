const url = 'https://zudfmigkmswcmffluizt.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1ZGZtaWdrbXN3Y21mZmx1aXp0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDc1MDU2MSwiZXhwIjoyMTAwMzI2NTYxfQ.Szoc1kKLKgxJEwR_jwjlixzTcI_nwZ98mBR6ZXrXQ32A';

const mocks = [
  {
    title: 'Secret Sunset Surf Lesson', slug: 'secret-sunset-surf-hiriketiya',
    location: 'Hiriketiya', duration: '2 hours', price_usd: 35.00, price_lkr_approx: 10500.00,
    max_capacity: 6, category_type: 'event', status: 'published',
    description: 'Join our expert local instructors for a magical sunset surf session in the hidden bay of Hiriketiya. Perfect for beginners and intermediates. We provide everything you need to catch your first wave or improve your skills as the sun dips below the Indian Ocean.',
    inclusions: ['Surfboard rental', '1.5 hours of instruction', 'Rash guard', 'Post-surf king coconut'],
    cover_image_url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    gallery_urls: ['https://images.unsplash.com/photo-1537519646099-335112f03225?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']
  },
  {
    title: 'Yala Leopard Safari in 4x4', slug: 'yala-leopard-safari',
    location: 'Yala', duration: 'Half Day', price_usd: 75.00, price_lkr_approx: 22500.00,
    max_capacity: 6, category_type: 'event', status: 'published',
    description: 'Experience the thrill of spotting leopards in their natural habitat.',
    cover_image_url: 'https://images.pexels.com/photos/247376/pexels-photo-247376.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    title: 'Ella Nine Arch Trek', slug: 'ella-nine-arch-trek',
    location: 'Ella', duration: '6 hours', price_usd: 45.00, price_lkr_approx: 13500.00,
    max_capacity: 10, category_type: 'event', status: 'published',
    description: 'Trek through the lush tea plantations to the iconic Nine Arch Bridge.',
    cover_image_url: 'https://images.pexels.com/photos/1368382/pexels-photo-1368382.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    title: 'Sigiriya Rock Climb', slug: 'sigiriya-rock-fortress-climb',
    location: 'Sigiriya', duration: '3 hours', price_usd: 20.00, price_lkr_approx: 6000.00,
    max_capacity: 15, category_type: 'event', status: 'published',
    description: 'Climb the ancient rock fortress of Sigiriya.',
    cover_image_url: 'https://images.pexels.com/photos/2444403/pexels-photo-2444403.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];

async function run() {
  for (const mock of mocks) {
    const res = await fetch(url + '/rest/v1/activities', {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(mock)
    });
    if (!res.ok) {
      console.error('Error inserting', mock.title, await res.text());
    } else {
      console.log('Inserted', mock.title);
    }
  }
}
run();
