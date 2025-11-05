/**
 * Script to create a Daily.co webhook for meeting.ended events
 * Usage: npx tsx scripts/setup-webhook.ts <webhook-url>
 */

const DAILY_API_KEY = process.env.DAILY_API_KEY

async function createWebhook(webhookUrl: string) {
  if (!DAILY_API_KEY) {
    console.error('❌ DAILY_API_KEY not found in environment variables')
    process.exit(1)
  }

  console.log('🔗 Creating webhook for:', webhookUrl)

  try {
    const response = await fetch('https://api.daily.co/v1/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        url: webhookUrl,
        eventTypes: ['transcript.ready-to-download'],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Failed to create webhook:', data)
      process.exit(1)
    }

    console.log('✅ Webhook created successfully!')
    console.log('📋 Webhook Details:')
    console.log('   ID:', data.id)
    console.log('   URL:', data.url)
    console.log('   Events:', data.eventTypes)
    console.log('   Status:', data.state)

    if (data.hmacSecret) {
      console.log('\n🔐 HMAC Secret (save this securely):')
      console.log('   ', data.hmacSecret)
      console.log('\n   Add this to your .env.local:')
      console.log(`   DAILY_WEBHOOK_SECRET=${data.hmacSecret}`)
    }

    return data
  } catch (error) {
    console.error('❌ Error creating webhook:', error)
    process.exit(1)
  }
}

async function listWebhooks() {
  console.log('\n📋 Existing webhooks:')

  try {
    const response = await fetch('https://api.daily.co/v1/webhooks', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Failed to list webhooks:', data)
      return
    }

    if (!data.data || data.data.length === 0) {
      console.log('   No webhooks configured')
      return
    }

    data.data.forEach((webhook: any, index: number) => {
      console.log(`\n   ${index + 1}. ${webhook.url}`)
      console.log(`      ID: ${webhook.id}`)
      console.log(`      Events: ${webhook.eventTypes.join(', ')}`)
      console.log(`      Status: ${webhook.state}`)
    })
  } catch (error) {
    console.error('❌ Error listing webhooks:', error)
  }
}

// Main
const webhookUrl = process.argv[2]

if (!webhookUrl) {
  console.error('❌ Usage: npx tsx scripts/setup-webhook.ts <webhook-url>')
  console.error('   Example: npx tsx scripts/setup-webhook.ts https://your-domain.com/api/webhooks/daily')
  process.exit(1)
}

;(async () => {
  await createWebhook(webhookUrl)
  await listWebhooks()
})()
