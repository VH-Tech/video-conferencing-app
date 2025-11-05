/**
 * Script to update Daily.co webhook to subscribe to transcript.ready-to-download
 * Usage: npx tsx scripts/update-webhook-events.ts <webhook-id>
 */

const DAILY_API_KEY = process.env.DAILY_API_KEY

async function updateWebhook(webhookId: string) {
  if (!DAILY_API_KEY) {
    console.error('❌ DAILY_API_KEY not found in environment variables')
    process.exit(1)
  }

  console.log('🔄 Updating webhook:', webhookId)

  try {
    const response = await fetch(`https://api.daily.co/v1/webhooks/${webhookId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        eventTypes: ['transcript.ready-to-download'],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Failed to update webhook:', data)
      process.exit(1)
    }

    console.log('✅ Webhook updated successfully!')
    console.log('📋 Webhook Details:')
    console.log('   ID:', data.id)
    console.log('   URL:', data.url)
    console.log('   Events:', data.eventTypes)
    console.log('   Status:', data.state)

    return data
  } catch (error) {
    console.error('❌ Error updating webhook:', error)
    process.exit(1)
  }
}

async function listWebhooks() {
  console.log('\n📋 Current webhooks:')

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

    return data.data
  } catch (error) {
    console.error('❌ Error listing webhooks:', error)
  }
}

// Main
;(async () => {
  const webhooks = await listWebhooks()

  if (!webhooks || webhooks.length === 0) {
    console.error('\n❌ No webhooks found. Create one first using setup-webhook.ts')
    process.exit(1)
  }

  const webhookId = process.argv[2] || webhooks[0].id

  console.log(`\n🎯 Using webhook ID: ${webhookId}`)

  await updateWebhook(webhookId)
  await listWebhooks()
})()
