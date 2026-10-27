import { z } from 'zod'
import { GoogleGenAI } from '@google/genai'
import {
  GeminiAnalysisResult,
  ProductCategory,
  ReferenceImage,
} from '@/types/ai-generator'

export const GeminiAnalysisSchema = z.object({
  category: z.string(),
  detectedObjects: z.array(z.string()).default([]),
  estimatedDimensions: z.object({
    width: z.number().default(50),
    height: z.number().default(70),
    depth: z.number().default(30),
    unit: z.string().default('cm'),
  }),
  symmetry: z.enum(['symmetric_bilateral', 'asymmetric', 'radial']).default('symmetric_bilateral'),
  suggestedHierarchy: z.object({
    rootName: z.string().default('ProductRoot'),
    parts: z.array(
      z.object({
        name: z.string(),
        customizable: z.boolean().default(false),
        suggestedZone: z.string().optional(),
        confidence: z.number().optional().default(0.85),
      })
    ).default([]),
  }),
  materialCharacteristics: z.object({
    baseColorDescription: z.string().default('Neutral Matte'),
    likelyMaterialType: z.string().default('cotton_fabric'),
    roughnessEstimate: z.number().min(0).max(1).default(0.8),
    metalnessEstimate: z.number().min(0).max(1).default(0.05),
  }),
  reconstructionComplexity: z.enum(['low', 'medium', 'high']).default('medium'),
  hiddenSurfacesWarning: z.array(z.string()).default([]),
  recommendedNextSteps: z.array(z.string()).default([]),
  hiddenGeometryUncertainty: z.enum(['low', 'medium', 'high']).default('medium'),
  requiresManualReview: z.boolean().default(true),
  suggestedOrientation: z.string().default('Y-up, front facing +Z'),
  potentialCustomizableParts: z.array(z.string()).default([]),
})

export type ValidatedGeminiAnalysis = z.infer<typeof GeminiAnalysisSchema>

export interface AnalyzeImageOptions {
  category?: ProductCategory | string
  prompt?: string
  dimensions?: { width?: number; height?: number; depth?: number; unit?: string }
  quality?: string
  images: ReferenceImage[]
}

export function buildFallbackAnalysis(
  category: string = 'apparel',
  prompt?: string,
  userDimensions?: { width?: number; height?: number; depth?: number; unit?: string }
): GeminiAnalysisResult {
  const cat = category.toLowerCase()

  if (cat.includes('hoodie') || cat.includes('apparel') || cat.includes('shirt') || cat.includes('jacket')) {
    const isHoodie = cat.includes('hoodie') || (prompt && prompt.toLowerCase().includes('hoodie'))
    const isTShirt = cat.includes('shirt') || (prompt && prompt.toLowerCase().includes('shirt'))

    return {
      category: isHoodie ? 'hoodie' : isTShirt ? 't_shirt' : 'garment',
      detectedObjects: isHoodie
        ? ['Hooded Sweatshirt', 'Torso Panel', 'Sleeves', 'Hood', 'Kangaroo Pocket', 'Ribbed Cuffs']
        : ['T-Shirt Garment', 'Front Torso', 'Back Torso', 'Left Sleeve', 'Right Sleeve', 'Collar Ribbing'],
      estimatedDimensions: {
        width: userDimensions?.width ?? 65,
        height: userDimensions?.height ?? 75,
        depth: userDimensions?.depth ?? 35,
        unit: userDimensions?.unit ?? 'cm',
      },
      symmetry: 'symmetric_bilateral',
      suggestedHierarchy: {
        rootName: isHoodie ? 'HoodieRoot' : 'TShirtRoot',
        parts: isHoodie
          ? [
              { name: 'Body_Main', customizable: true, suggestedZone: 'body_front', confidence: 0.95 },
              { name: 'Body_Back', customizable: true, suggestedZone: 'body_back', confidence: 0.88 },
              { name: 'Sleeve_Left', customizable: true, suggestedZone: 'sleeve_left', confidence: 0.9 },
              { name: 'Sleeve_Right', customizable: true, suggestedZone: 'sleeve_right', confidence: 0.9 },
              { name: 'Hood', customizable: true, suggestedZone: 'hood', confidence: 0.85 },
              { name: 'Pocket_Front', customizable: true, suggestedZone: 'pocket_front', confidence: 0.8 },
              { name: 'Cuff_Left', customizable: false, confidence: 0.9 },
              { name: 'Cuff_Right', customizable: false, confidence: 0.9 },
            ]
          : [
              { name: 'Body_Front', customizable: true, suggestedZone: 'body_front', confidence: 0.95 },
              { name: 'Body_Back', customizable: true, suggestedZone: 'body_back', confidence: 0.92 },
              { name: 'Sleeve_Left', customizable: true, suggestedZone: 'sleeve_left', confidence: 0.9 },
              { name: 'Sleeve_Right', customizable: true, suggestedZone: 'sleeve_right', confidence: 0.9 },
              { name: 'Collar', customizable: false, confidence: 0.85 },
            ],
      },
      materialCharacteristics: {
        baseColorDescription: 'Dark Graphite Cotton Fabric',
        likelyMaterialType: 'cotton_fabric',
        roughnessEstimate: 0.92,
        metalnessEstimate: 0.02,
      },
      reconstructionComplexity: 'medium',
      hiddenSurfacesWarning: [
        'Back panel surface cannot be verified without back reference photo; symmetry inference applied.',
        'Underarm seam junctions require topology inspection.',
      ],
      recommendedNextSteps: [
        'Generate volumetric 3D mesh with image-to-3d provider.',
        'Inspect UV unwrap for front and back artwork customization zones.',
        'Verify BlackBullet garment contract naming.',
      ],
      hiddenGeometryUncertainty: 'medium',
      requiresManualReview: true,
      suggestedOrientation: 'Y-up, chest facing +Z',
      potentialCustomizableParts: ['body_front', 'body_back', 'sleeve_left', 'sleeve_right'],
    }
  }

  // Generic product fallback (footwear, hardgoods, packaging, accessories)
  return {
    category: category || 'product',
    detectedObjects: ['Main Body Structure', 'Surface Features', 'Base Support'],
    estimatedDimensions: {
      width: userDimensions?.width ?? 30,
      height: userDimensions?.height ?? 30,
      depth: userDimensions?.depth ?? 30,
      unit: userDimensions?.unit ?? 'cm',
    },
    symmetry: 'symmetric_bilateral',
    suggestedHierarchy: {
      rootName: 'ProductRoot',
      parts: [
        { name: 'Main_Body', customizable: true, suggestedZone: 'body_front', confidence: 0.9 },
        { name: 'Base_Trim', customizable: false, confidence: 0.8 },
      ],
    },
    materialCharacteristics: {
      baseColorDescription: 'Neutral Matte Finish',
      likelyMaterialType: 'plastic',
      roughnessEstimate: 0.6,
      metalnessEstimate: 0.1,
    },
    reconstructionComplexity: 'medium',
    hiddenSurfacesWarning: [
      'Occluded rear and bottom surfaces estimated from visible contours.',
      'Dimensions are approximate estimates from reference views.',
    ],
    recommendedNextSteps: [
      'Proceed with 3D model generation.',
      'Review generated geometry and scale to true dimensions in editor.',
    ],
    hiddenGeometryUncertainty: 'high',
    requiresManualReview: true,
    suggestedOrientation: 'Y-up, front facing +Z',
    potentialCustomizableParts: ['Main_Body'],
  }
}

export async function analyzeReferenceImagesWithGemini(
  options: AnalyzeImageOptions
): Promise<GeminiAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!apiKey) {
    return buildFallbackAnalysis(options.category, options.prompt, options.dimensions)
  }

  try {
    const ai = new GoogleGenAI({ apiKey })

    const systemPrompt = `You are a Principal 3D Computer Vision Engineer and Computational Geometry Specialist for the BlackBullet 3D customization platform.
Analyze the provided product reference images, product category, and user specifications.
Return a STRICT JSON object conforming to this specification:
{
  "category": string (e.g. "hoodie", "t_shirt", "shoe", "bottle", "box"),
  "detectedObjects": array of strings (major visual parts and features),
  "estimatedDimensions": { "width": number, "height": number, "depth": number, "unit": "cm" },
  "symmetry": "symmetric_bilateral" | "asymmetric" | "radial",
  "suggestedHierarchy": {
    "rootName": string,
    "parts": [
      {
        "name": string (descriptive name like "Body_Main", "Sleeve_Left", "Hood", "Lid", "Sole"),
        "customizable": boolean,
        "suggestedZone": string (e.g. "body_front", "body_back", "sleeve_left", "sleeve_right", "hood"),
        "confidence": number between 0.0 and 1.0
      }
    ]
  },
  "materialCharacteristics": {
    "baseColorDescription": string,
    "likelyMaterialType": string (e.g. "cotton_fabric", "leather", "metal", "plastic", "glass", "rubber"),
    "roughnessEstimate": number between 0.0 and 1.0,
    "metalnessEstimate": number between 0.0 and 1.0
  },
  "reconstructionComplexity": "low" | "medium" | "high",
  "hiddenSurfacesWarning": array of strings (specific warnings about occluded angles or hidden geometry),
  "recommendedNextSteps": array of strings,
  "hiddenGeometryUncertainty": "low" | "medium" | "high",
  "requiresManualReview": boolean (always true for single-angle photos, true if hidden surfaces exist),
  "suggestedOrientation": string,
  "potentialCustomizableParts": array of strings
}
Do NOT include markdown formatting or backticks. Return pure parseable JSON only.`

    const userPrompt = `Product Category: ${options.category || 'apparel'}. Description: ${options.prompt || 'None'}. User specified dimensions: ${JSON.stringify(options.dimensions || {})}.`

    const contents: any[] = [{ text: systemPrompt }, { text: userPrompt }]

    for (const img of options.images) {
      if (img.dataUrl && img.dataUrl.includes(',')) {
        const parts = img.dataUrl.split(',')
        const mimeMatch = parts[0].match(/:(.*?);/)
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg'
        const base64Data = parts[1]
        contents.push({
          inlineData: {
            data: base64Data,
            mimeType,
          },
        })
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
    })

    const text = response.text || ''
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    const validated = GeminiAnalysisSchema.parse(parsed)
    return validated as GeminiAnalysisResult
  } catch (err) {
    console.warn('[GeminiAnalyzer] Analysis with GoogleGenAI failed, using fallback:', err)
    return buildFallbackAnalysis(options.category, options.prompt, options.dimensions)
  }
}
