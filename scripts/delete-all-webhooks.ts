/**
 * Script to delete all Daily.co webhooks
 * Usage: npx tsx scripts/delete-all-webhooks.ts
 */

const DAILY_API_KEY = process.env.DAILY_API_KEY

async function deleteWebhook(webhookId: string) {
  try {
    const response = await fetch(`https://api.daily.co/v1/webhooks/${webhookId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    })

    if (!response.ok) {
      const data = await response.json()
      console.error(`❌ Failed to delete webhook ${webhookId}:`, data)
      return false
    }

    console.log(`✅ Deleted webhook: ${webhookId}`)
    return true
  } catch (error) {
    console.error(`❌ Error deleting webhook ${webhookId}:`, error)
    return false
  }
}

async function listAndDeleteAllWebhooks() {
  if (!DAILY_API_KEY) {
    console.error('❌ DAILY_API_KEY not found in environment variables')
    process.exit(1)
  }

  console.log('📋 Fetching all webhooks...\n')

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

    console.log(`Found ${data.data.length} webhook(s):\n`)

    for (const webhook of data.data) {
      console.log(`   ${webhook.url}`)
      console.log(`   ID: ${webhook.id}`)
      console.log(`   Events: ${webhook.eventTypes.join(', ')}`)
      console.log(`   Status: ${webhook.state}\n`)

      await deleteWebhook(webhook.id)
    }

    console.log('\n✅ All webhooks deleted!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

;(async () => {
  await listAndDeleteAllWebhooks()
})()
