/**
 * Script to list Daily.co webhooks
 * Usage: npx tsx scripts/list-webhooks.ts
 */

const DAILY_API_KEY = process.env.DAILY_API_KEY

async function listWebhooks() {
  if (!DAILY_API_KEY) {
    console.error('❌ DAILY_API_KEY not found in environment variables')
    process.exit(1)
  }

  console.log('📋 Listing webhooks from Daily.co...\n')

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
      process.exit(1)
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
    process.exit(1)
  }
}

;(async () => {
  await listWebhooks()
})()
