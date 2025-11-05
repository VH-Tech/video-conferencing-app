import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface MeetingSummary {
  title: string
  description?: string
  executive_summary: string
  key_points: string[]
  important_numbers: string[]
  action_items: string[]
  speaker_insights?: string[]
  questions_raised: string[]
  open_questions: string[]
}

export async function generateMeetingSummary(
  transcriptText: string
): Promise<MeetingSummary | null> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `Please create a detailed summary of this meeting transcript. The transcript is in a mix of Hindi and English (Hinglish). Please:

Title: Generate a concise, descriptive title for this meeting (3-8 words)

Description: Provide a brief description of the meeting's purpose and agenda. (1 sentence)

Executive Summary: Provide a 2-3 sentence overview of the main discussion

Key Points Discussed: Extract and organize the main topics covered

Important Numbers/Metrics: Highlight any significant figures, dates, or statistics mentioned

Action Items: If any next steps or follow-ups are mentioned, list them

Speaker Insights: Summarize the key insights or lessons shared by the speakers

Questions Raised: List any questions that were asked during the meeting by any participants.

Open Questions: If there are any unresolved questions or topics that need further discussion, list them.

Please translate any Hindi/Hinglish portions to English and provide the summary in clear, professional English.

<transcript>
${transcriptText}
</transcript>

Please structure your response as a JSON object with the following format:
{
    "title": "...",
    "description": "...",
    "executive_summary": "...",
    "key_points": ["point 1", "point 2", "..."],
    "important_numbers": ["metric 1", "metric 2", "..."],
    "action_items": ["action 1", "action 2", "..."],
    "speaker_insights": ["insight 1", "insight 2", "..."],
    "questions_raised": ["question 1", "question 2", "..."],
    "open_questions": ["open question 1", "open question 2", "..."],
}

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no code blocks, just pure JSON.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Clean up the response - remove markdown code blocks if present
    let jsonText = text.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '')
    }

    const summary: MeetingSummary = JSON.parse(jsonText)
    return summary
  } catch (error) {
    console.error('Error generating meeting summary:', error)
    return null
  }
}

/**
 * Parse WebVTT transcript to extract plain text
 */
export function parseWebVTTToText(vttContent: string): string {
  const lines = vttContent.split('\n')
  const textLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip WEBVTT header, timestamps, and empty lines
    if (
      line === '' ||
      line.startsWith('WEBVTT') ||
      line.startsWith('NOTE') ||
      line.startsWith('transcript:') ||
      line.match(/^\d{2}:\d{2}:\d{2}\.\d{3}/)
    ) {
      continue
    }

    // Extract text from speaker tags: <v>speaker:</v>text
    const speakerMatch = line.match(/<v>([^<]+):<\/v>(.*)/)
    if (speakerMatch) {
      const speaker = speakerMatch[1].trim()
      const text = speakerMatch[2].trim()
      textLines.push(`${speaker}: ${text}`)
    } else {
      // Plain text line
      textLines.push(line)
    }
  }

  return textLines.join('\n')
}
