import { NextRequest, NextResponse } from 'next/server'
import { analyzeReferenceImagesWithGemini } from '@/integrations/ai/gemini-analyzer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { category, prompt, dimensions, images, quality } = body

    const analysis = await analyzeReferenceImagesWithGemini({
      category,
      prompt,
      dimensions,
      quality,
      images: images || [],
    })

    const hasApiKey = !!(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY)

    return NextResponse.json({
      success: true,
      analysis,
      isFallback: !hasApiKey,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
      },
      { status: 500 }
    )
  }
}
