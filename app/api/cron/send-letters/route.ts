import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Service key for admin access
)

export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // Get all letters scheduled for today that haven't been sent
    const { data: letters, error } = await supabase
      .from('letters')
      .select(`
        id,
        recipient_name,
        content,
        notes,
        send_date,
        user_id,
        users:user_id (
          email
        )
      `)
      .eq('send_date', today)
      .eq('is_sent', false)

    if (error) {
      console.error('Error fetching letters:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!letters || letters.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No letters to send today',
        count: 0 
      })
    }

    // Send emails via Resend
    const results = await Promise.all(
      letters.map(async (letter: any) => {
        try {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Stilte Ruimte <brieven@stilteruimte.onrender.com>',
              to: letter.users.email,
              subject: `Brief aan ${letter.recipient_name}`,
              html: `
                <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                  <h1 style="color: #6B7280; font-weight: 300; font-size: 32px; margin-bottom: 20px;">
                    Brief aan ${letter.recipient_name}
                  </h1>
                  
                  <p style="color: #9CA3AF; margin-bottom: 30px;">
                    Je schreef deze brief eerder en vroeg om hem vandaag te ontvangen.
                  </p>
                  
                  <div style="background: #F9FAFB; border-left: 4px solid #10B981; padding: 30px; margin: 30px 0; border-radius: 8px;">
                    <p style="color: #374151; white-space: pre-wrap; line-height: 1.8; font-size: 16px;">
                      ${letter.content}
                    </p>
                  </div>
                  
                  ${letter.notes ? `
                    <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <p style="color: #92400E; font-size: 14px; margin: 0;">
                        <strong>Je notitie:</strong> ${letter.notes}
                      </p>
                    </div>
                  ` : ''}
                  
                  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                    <p style="color: #9CA3AF; font-size: 14px; text-align: center;">
                      Dit is een herinnering van <strong>Stilte Ruimte</strong><br>
                      Je persoonlijke ruimte voor rouwverwerking
                    </p>
                  </div>
                </div>
              `,
            }),
          })

          if (!response.ok) {
            throw new Error(`Resend API error: ${response.statusText}`)
          }

          // Mark as sent
          await supabase
            .from('letters')
            .update({ is_sent: true })
            .eq('id', letter.id)

          return { id: letter.id, success: true }
        } catch (error) {
          console.error(`Error sending letter ${letter.id}:`, error)
          return { id: letter.id, success: false, error: String(error) }
        }
      })
    )

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failCount,
      total: letters.length,
      results
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
