import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/lib/supabase' // Needed for bypassing RLS on update if required, though RLS allows the provider to update it

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId } = await req.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'Invalid QR code. No booking ID found.' }, { status: 400 })
    }

    // Get the host profile for the logged in user
    const { data: host } = await supabase
      .from('hosts')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!host) {
      return NextResponse.json({ error: 'Host profile not found.' }, { status: 404 })
    }

    // Since RLS is enabled, the provider can only select bookings that belong to their activities.
    // The RLS policy will automatically use the hosts table mapping.
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('id, status, tourist_name, pax_count, activities(host_id)')
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: 'Ticket not found or you do not have permission to scan this ticket.' }, { status: 404 })
    }

    // Validation Logic
    if (booking.status === 'pending_payment' || booking.status === 'pending') {
      return NextResponse.json({ error: 'Ticket not paid or confirmed yet.' }, { status: 400 })
    }

    if (booking.status === 'cancelled') {
        return NextResponse.json({ error: 'This ticket has been cancelled.' }, { status: 400 })
    }

    if (booking.status === 'redeemed') {
      return NextResponse.json({ error: 'Ticket already used.' }, { status: 400 })
    }

    // Update the booking status to REDEEMED
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status: 'redeemed',
        scanned_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Update Error:', updateError)
      return NextResponse.json({ error: 'Failed to update ticket status.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      name: booking.tourist_name,
      pax: booking.pax_count
    })

  } catch (error: any) {
    console.error('Verify Ticket Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
