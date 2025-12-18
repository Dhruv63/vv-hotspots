import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

// Load all 5 API keys from environment
const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
].filter(Boolean) as string[]

let currentKeyIndex = 0

function getNextApiKey(): string {
  if (API_KEYS.length === 0) {
    throw new Error('No API keys configured')
  }
  const key = API_KEYS[currentKeyIndex]
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length
  return key
}

async function generateWithRetry(prompt: string): Promise<string> {
  let lastError: any = null

  for (let i = 0; i < API_KEYS.length; i++) {
    try {
      const apiKey = getNextApiKey()
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

      const result = await model.generateContent(prompt)
      const text = result.response.text()

      console.log(`✅ Generated with key ${currentKeyIndex}`)
      return text

    } catch (error: any) {
      console.log(`❌ Key ${currentKeyIndex} failed:`, error.message)
      lastError = error

      if (error.message?.includes('quota') ||
          error.message?.includes('limit') ||
          error.message?.includes('429')) {
        console.log('Rate limit - trying next key...')
        continue
      }

      throw error
    }
  }

  throw new Error(`All API keys exhausted: ${lastError?.message}`)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Please log in to use AI Planner' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { timeAvailable, companionType, startLocation } = body

    if (!timeAvailable || !companionType || !startLocation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const hours = parseInt(timeAvailable)
    if (isNaN(hours) || hours < 1 || hours > 12) {
      return NextResponse.json(
        { error: 'Time must be between 1 and 12 hours' },
        { status: 400 }
      )
    }

    if (startLocation.length > 100) {
      return NextResponse.json(
        { error: 'Location name too long' },
        { status: 400 }
      )
    }

    const companionMap: Record<string, string> = {
      girlfriend: 'your romantic partner',
      friends: 'a group of friends',
      family: 'family members',
      solo: 'solo (by yourself)',
    }

    const companionText = companionMap[companionType] || companionType

    const prompt = `Create a concise ${timeAvailable}-hour itinerary in Vasai-Virar for ${companionText}.

Starting: ${startLocation}

FORMAT (keep it short!):
🗓️ ${timeAvailable}-Hour Plan
📍 Start: ${startLocation}

1️⃣ [Place Name] (Time: X:XX - Y:YY)
   🎯 What to do: [brief description]
   💰 Cost: ₹XX
   🚗 Travel: XX mins by [transport]

2️⃣ [Place Name] (Time: X:XX - Y:YY)
   🎯 What to do: [brief description]
   💰 Cost: ₹XX
   🚗 Travel: XX mins

Include 2-3 places only from: Vasai Fort, Arnala Beach, Tungareshwar Temple, local markets, cafes.

💡 Tips (2-3 only):
• Tip 1
• Tip 2

Total Cost: ₹XXX-XXX

KEEP IT UNDER 300 WORDS! Be concise and practical.`

    console.log(`🤖 Generating for ${session.user.email}...`)
    const itinerary = await generateWithRetry(prompt)

    return NextResponse.json({
      success: true,
      itinerary,
      generatedAt: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('❌ Error:', error)

    return NextResponse.json(
      {
        error: error.message?.includes('quota') || error.message?.includes('limit')
          ? 'Service busy. Try again in a few minutes.'
          : 'Failed to generate. Please try again.',
      },
      { status: 500 }
    )
  }
}
