import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Function to create OpenAI client only when needed
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is missing')
  }
  
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
}

export async function POST(req: NextRequest) {
  try {
    const { userMessage, assistantResponse } = await req.json()

    if (!userMessage || !assistantResponse) {
      return NextResponse.json(
        { error: 'Se requieren el mensaje del usuario y la respuesta del asistente' },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not available, using fallback title generation')
      const fallbackTitle = extractSimpleTitle(userMessage)
      return NextResponse.json({ 
        title: fallbackTitle,
        warning: 'Título generado con método de respaldo'
      })
    }

    // Create OpenAI client only when needed
    const openai = getOpenAIClient()

    // Generate intelligent title using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Eres un experto en generar títulos descriptivos y concisos para conversaciones sobre nutrición.

Tu tarea es crear un título de máximo 6 palabras que capture el tema principal de la conversación.

Reglas importantes:
- Máximo 6 palabras
- Debe ser descriptivo y específico
- Enfócate en el tema nutricional principal
- Usa lenguaje profesional pero accesible
- No uses comillas ni signos de puntuación
- Ejemplos de buenos títulos:
  * "Plan para ganar masa muscular"
  * "Dieta para control de diabetes"  
  * "Recetas vegetarianas altas en proteína"
  * "Estrategias para pérdida de peso"
  * "Alimentación durante el embarazo"
  * "Suplementos para deportistas"

Analiza el intercambio y genera un título que refleje el tema principal de la consulta nutricional.`
        },
        {
          role: 'user',
          content: `Usuario preguntó: "${userMessage}"\n\nAsistente respondió: "${assistantResponse.substring(0, 300)}..."\n\nGenera un título descriptivo de máximo 6 palabras para esta conversación nutricional:`
        }
      ],
      max_tokens: 50,
      temperature: 0.3,
    })

    const generatedTitle = completion.choices[0]?.message?.content?.trim()
    
    if (!generatedTitle) {
      throw new Error('No se pudo generar el título')
    }

    // Clean and validate the title
    let cleanTitle = generatedTitle
      .replace(/["""]/g, '') // Remove quotes
      .replace(/^\d+\.\s*/, '') // Remove numbering
      .trim()

    // Ensure it's not too long (fallback)
    if (cleanTitle.split(' ').length > 6) {
      cleanTitle = cleanTitle.split(' ').slice(0, 6).join(' ')
    }

    // If title is too generic or empty, provide a fallback
    if (!cleanTitle || cleanTitle.length < 3) {
      cleanTitle = 'Consulta nutricional'
    }

    return NextResponse.json({ 
      title: cleanTitle,
      originalUserMessage: userMessage
    })

  } catch (error) {
    console.error('Error generating title:', error)
    
    // Return a fallback title based on user message
    const { userMessage } = await req.json().catch(() => ({ userMessage: '' }))
    const fallbackTitle = extractSimpleTitle(userMessage || '')
    
    return NextResponse.json({ 
      title: fallbackTitle,
      error: 'Título generado con método de respaldo'
    })
  }
}

// Fallback function to extract simple title from user message
function extractSimpleTitle(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Simple keyword matching for common topics
  if (lowerMessage.includes('masa muscular')) return 'Plan para masa muscular'
  if (lowerMessage.includes('perder peso')) return 'Plan para perder peso'
  if (lowerMessage.includes('ganar peso')) return 'Plan para ganar peso'
  if (lowerMessage.includes('diabetes')) return 'Alimentación para diabetes'
  if (lowerMessage.includes('recetas')) return 'Recetas saludables'
  if (lowerMessage.includes('proteína')) return 'Consulta sobre proteínas'
  if (lowerMessage.includes('desayuno')) return 'Ideas para desayuno'
  if (lowerMessage.includes('cena')) return 'Opciones para cena'
  
  // Generic fallback
  return 'Consulta nutricional'
} 