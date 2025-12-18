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
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

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

    const companionText = {
      girlfriend: 'your romantic partner',
      friends: 'a group of friends',
      family: 'family members',
      solo: 'solo (by yourself)',
    }[companionType] || companionType

    const prompt = `You are an expert local travel guide for Vasai-Virar, Maharashtra, India. Create a detailed ${timeAvailable}-hour itinerary for someone traveling with ${companionText}.

📍 Starting Location: ${startLocation}

REQUIREMENTS:
1. Include 2-3 REAL places from Vasai-Virar:
   - Vasai Fort (Portuguese ruins, ocean views)
   - Arnala Beach (peaceful beach, seafood)
   - Tungareshwar Temple (forest trek, hilltop temple)
   - Global Vipassana Pagoda (meditation center)
   - Local markets (Virar Market, Vasai Market)
   - Popular cafes and restaurants

2. For EACH place provide:
   📍 Place name
   🕐 Specific timing (e.g., 9:00 AM - 10:30 AM)
   🎯 Activities (be specific and exciting)
   💰 Cost in ₹ (realistic prices)
   🚗 Travel time and transport method

3. Match companion type:
   - Romantic partner: romantic spots, cafes, sunset views
   - Friends: fun activities, street food
   - Family: safe, all-ages friendly
   - Solo: peaceful spots, photography

4. Format clearly with emojis and sections

5. End with 3-4 practical tips for Vasai-Virar

6. Keep total cost ₹500-2000 range

Make it exciting and authentic! Use conversational tone.`

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
