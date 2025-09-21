import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  message: string;
  systemPrompt: string;
  currentPage: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, systemPrompt, currentPage }: ChatRequest = await request.json();

    // Get Gemini API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'Gemini API key not configured',
          response: generateFallbackResponse(message, currentPage)
        },
        { status: 200 } // Return 200 with fallback response
      );
    }

    // Call Google Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nUser message: ${message}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('Gemini API Error:', errorData);
      
      return NextResponse.json({
        response: generateFallbackResponse(message, currentPage),
        source: 'fallback',
        error: `Gemini API error: ${geminiResponse.status}`
      });
    }

    const data = await geminiResponse.json();
    
    // Extract response text from Gemini's response structure
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                        generateFallbackResponse(message, currentPage);

    return NextResponse.json({
      response: responseText,
      source: 'gemini',
      currentPage: currentPage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    return NextResponse.json({
      response: generateFallbackResponse('', ''),
      source: 'fallback',
      error: 'Internal server error'
    });
  }
}

// Fallback response generator when Gemini is not available
function generateFallbackResponse(message: string, currentPage: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Content creation responses
  if (lowerMessage.includes('content') || lowerMessage.includes('create')) {
    return `🎨 As your Content Manager, I recommend leveraging SocialHive's AI tools for maximum impact! Try our Content Workflow for end-to-end creation: image generation → video → music → optimization. Since you're on ${currentPage}, you're in the perfect spot to start creating engaging content that resonates with your audience.`;
  }
  
  // Analytics and performance
  if (lowerMessage.includes('analytics') || lowerMessage.includes('performance') || lowerMessage.includes('metrics')) {
    return `📊 Great question! Your Analytics dashboard is your command center for social media success. I recommend tracking engagement rate, reach, and click-through rates as your key performance indicators. Let's dive into your data to identify what content performs best and create a winning strategy around those insights.`;
  }
  
  // Trends and hashtags
  if (lowerMessage.includes('trend') || lowerMessage.includes('hashtag') || lowerMessage.includes('viral')) {
    return `📈 Trending analysis is crucial for social media success! Based on current market data, I suggest using trending hashtags within 24-48 hours of peak popularity. Check our Trends section for real-time hashtag analysis across Asian markets. Want me to show you the hottest trends that align with your content strategy?`;
  }
  
  // Strategy and planning
  if (lowerMessage.includes('strategy') || lowerMessage.includes('plan') || lowerMessage.includes('grow')) {
    return `🎯 Excellent! As your Marketing Advisor, here's my strategic recommendation: 1) Audit your top-performing content, 2) Identify audience preferences, 3) Create content pillars, 4) Maintain consistent posting schedule. Currently on ${currentPage} - perfect place to start implementing these strategies!`;
  }
  
  // Navigation and help
  if (lowerMessage.includes('navigate') || lowerMessage.includes('help') || lowerMessage.includes('show me')) {
    return `🧭 I'm your personal SocialHive navigator! I can guide you to any feature: Analytics for performance insights, Content Workflow for AI-powered creation, Trends for market analysis, or any other section. Just tell me what you want to accomplish and I'll get you there efficiently!`;
  }
  
  // Engagement and growth
  if (lowerMessage.includes('engagement') || lowerMessage.includes('followers') || lowerMessage.includes('audience')) {
    return `🚀 Engagement growth is my specialty! Here's my proven formula: Post when your audience is most active, use trending hashtags strategically, engage with comments within 1 hour, and create shareable, value-driven content. Want me to analyze your current engagement patterns and suggest improvements?`;
  }
  
  // Default professional response
  return `💡 That's an insightful question! As your dedicated Content Manager and Marketing Advisor, I'm analyzing this from a strategic perspective. Currently you're on ${currentPage} - would you like me to suggest relevant actions for this section, or shall we explore other areas of SocialHive that might help achieve your social media goals?`;
}

// Optional: Add rate limiting or user session management here
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'SocialHive Content Manager AI is ready',
    features: [
      'Content Strategy Advice',
      'Marketing Consultation', 
      'Platform Navigation',
      'Performance Analysis',
      'Trend Insights',
      'AI Tool Guidance'
    ],
    geminiConnected: !!process.env.GEMINI_API_KEY
  });
}