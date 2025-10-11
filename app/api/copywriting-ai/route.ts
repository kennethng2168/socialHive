import { NextRequest, NextResponse } from 'next/server';

// FastAPI MCP Server URL
const FASTAPI_SERVER_URL = process.env.FASTAPI_SERVER_URL || 'https://awshackathon1.pagekite.me';

interface CopywritingRequest {
  prompt: string;
  platform: string;
  tone: string;
  contentType: string;
  targetAudience: string;
  keywords: string;
  maxLength: number;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      prompt, 
      platform, 
      tone, 
      contentType, 
      targetAudience, 
      keywords, 
      maxLength 
    }: CopywritingRequest = await request.json();

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('Calling Amazon Nova Pro for copywriting via FastAPI MCP Server...');
    console.log('FastAPI URL:', FASTAPI_SERVER_URL);

    // Create specialized copywriting prompt
    const copywritingPrompt = `You are an expert social media copywriter. Create engaging ${platform} content based on these specifications:

CONTENT BRIEF:
- Topic/Product: ${prompt}
- Platform: ${platform}
- Tone: ${tone}
- Content Type: ${contentType}
- Target Audience: ${targetAudience || 'general audience'}
- Keywords to include: ${keywords || 'none specified'}
- Maximum length: ${maxLength} characters

REQUIREMENTS:
1. Write compelling copy that matches the ${tone} tone
2. Include relevant emojis where appropriate for ${platform}
3. Add 3-5 relevant hashtags at the end
4. Keep within ${maxLength} character limit
5. Make it engaging for ${targetAudience || 'the target audience'}
6. Include a clear call-to-action
7. Use the specified keywords naturally: ${keywords}

RESPONSE FORMAT:
Content: [Your copy here]
Hashtags: [#hashtag1, #hashtag2, #hashtag3]
Engagement Score: [Predicted score 1-10]

Create content that will drive engagement and achieve marketing goals for this ${contentType} on ${platform}.`;

    // Call FastAPI server
    const response = await fetch(`${FASTAPI_SERVER_URL}/nova/pro/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: copywritingPrompt,
        temperature: 0.8, // Higher creativity for copywriting
        max_tokens: 1024,
        top_p: 0.95
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      console.error('FastAPI error:', errorData);
      
      // Return fallback copy
      return NextResponse.json({
        content: generateFallbackCopy(prompt, platform, tone, contentType, targetAudience, keywords, maxLength),
        hashtags: generateHashtags(keywords, prompt),
        engagement_score: Math.random() * 2 + 8,
        source: 'fallback',
        error: errorData.detail || errorData.error || 'FastAPI server error'
      });
    }

    const data = await response.json();
    
    if (!data.success || !data.generated_text) {
      // Return fallback copy
      return NextResponse.json({
        content: generateFallbackCopy(prompt, platform, tone, contentType, targetAudience, keywords, maxLength),
        hashtags: generateHashtags(keywords, prompt),
        engagement_score: Math.random() * 2 + 8,
        source: 'fallback',
        error: 'No text generated'
      });
    }

    // Parse the structured response
    const parsedResponse = parseNovaCopyResponse(data.generated_text);
    
    // Ensure content fits platform limits
    if (parsedResponse.content.length > maxLength) {
      parsedResponse.content = parsedResponse.content.substring(0, maxLength - 3) + '...';
    }

    return NextResponse.json({
      content: parsedResponse.content,
      hashtags: parsedResponse.hashtags || generateHashtags(keywords, prompt),
      engagement_score: parsedResponse.engagement_score || Math.random() * 2 + 8,
      source: 'amazon-nova-pro',
      platform: platform,
      timestamp: new Date().toISOString(),
      model: 'amazon.nova-pro-v1:0'
    });

  } catch (error) {
    console.error('Copywriting API Error:', error);
    
    const fallbackRequest = await request.json();
    return NextResponse.json({
      content: generateFallbackCopy(
        fallbackRequest.prompt, 
        fallbackRequest.platform, 
        fallbackRequest.tone, 
        fallbackRequest.contentType, 
        fallbackRequest.targetAudience, 
        fallbackRequest.keywords, 
        fallbackRequest.maxLength
      ),
      hashtags: generateHashtags(fallbackRequest.keywords, fallbackRequest.prompt),
      engagement_score: Math.random() * 2 + 8,
      source: 'fallback',
      error: 'Internal server error'
    });
  }
}

function parseNovaCopyResponse(response: string): {
  content: string;
  hashtags?: string[];
  engagement_score?: number;
} {
  try {
    console.log('Raw Nova Pro response:', response.substring(0, 300));
    
    // Try to extract content between **Content:** and **Hashtags:**
    const contentRegex = /\*\*Content:\*\*\s*\n?([\s\S]*?)(?=\n\s*\*\*Hashtags?:|\n\s*\*\*Engagement|$)/i;
    const hashtagsRegex = /\*\*Hashtags?:\*\*\s*\n?([\s\S]*?)(?=\n\s*\*\*Engagement Score:|\n\s*\*\*Rationale|$)/i;
    const scoreRegex = /\*\*Engagement Score:\*\*\s*(\d+(?:\.\d+)?)/i;
    
    const contentMatch = response.match(contentRegex);
    const hashtagsMatch = response.match(hashtagsRegex);
    const scoreMatch = response.match(scoreRegex);
    
    let content = '';
    if (contentMatch && contentMatch[1]) {
      content = contentMatch[1]
        .trim()
        .replace(/\n\s+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // Fallback: line-by-line parsing
    if (!content || content.length < 10) {
      const lines = response.split('\n');
      let captureContent = false;
      let contentLines: string[] = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (/\*\*Content:\*\*/i.test(trimmedLine)) {
          captureContent = true;
          const sameLine = trimmedLine.replace(/\*\*Content:\*\*\s*/i, '');
          if (sameLine) contentLines.push(sameLine);
          continue;
        }
        
        if (captureContent && /\*\*(?:Hashtags?|Engagement|Rationale):/i.test(trimmedLine)) {
          break;
        }
        
        if (captureContent && trimmedLine && !trimmedLine.startsWith('**')) {
          contentLines.push(trimmedLine);
        }
      }
      
      content = contentLines.join(' ').replace(/\s+/g, ' ').trim();
    }
    
    // Extract hashtags
    let hashtags: string[] | undefined;
    if (hashtagsMatch && hashtagsMatch[1]) {
      const hashtagText = hashtagsMatch[1].trim();
      const arrayMatch = hashtagText.match(/\[(.*?)\]/);
      if (arrayMatch) {
        hashtags = arrayMatch[1]
          .split(',')
          .map(h => h.trim())
          .filter(h => h)
          .map(h => h.startsWith('#') ? h : '#' + h);
      } else {
        hashtags = hashtagText
          .split(/[\s,]+/)
          .map(h => h.trim())
          .filter(h => h.startsWith('#'));
      }
    }
    
    // Extract inline hashtags if no hashtags section found
    if (!hashtags || hashtags.length === 0) {
      const inlineHashtags = content.match(/#[\w]+/g);
      if (inlineHashtags) {
        hashtags = inlineHashtags.slice(0, 5);
        content = content.replace(/#[\w]+/g, '').replace(/\s+/g, ' ').trim();
      }
    }
    
    const engagement_score = scoreMatch ? parseFloat(scoreMatch[1]) : undefined;

    console.log('✅ Parsed content length:', content.length);
    console.log('✅ Parsed hashtags:', hashtags);
    console.log('✅ Parsed score:', engagement_score);

    return {
      content: content || response.trim(),
      hashtags,
      engagement_score
    };
  } catch (error) {
    console.error('❌ Error parsing Nova response:', error);
    return {
      content: response.trim()
    };
  }
}

function generateFallbackCopy(
  prompt: string, 
  platform: string, 
  tone: string, 
  contentType: string, 
  targetAudience: string, 
  keywords: string, 
  maxLength: number
): string {
  const toneStarters: Record<string, string> = {
    'Professional': '📢 Introducing',
    'Casual': 'Hey there! 👋',
    'Friendly': 'We\'re excited to share',
    'Authoritative': 'Industry leaders know',
    'Humorous': '😂 Ready for something awesome?',
    'Inspirational': '✨ Transform your',
    'Urgent': '⏰ Limited time:',
    'Conversational': 'Let\'s talk about',
    'Educational': '💡 Did you know?',
    'Promotional': '🔥 Special offer:'
  };

  const starter = toneStarters[tone] || '🌟 Discover';
  
  let copy = `${starter} ${prompt}`;
  
  // Add platform-specific elements
  if (platform === 'instagram') {
    copy += ' ✨ Join thousands who\'ve already made the switch! 🚀';
  } else if (platform === 'tiktok') {
    copy += ' 🔥 This is about to blow up! Comment "YES" if you agree 👇';
  } else if (platform === 'twitter') {
    copy += ' 🧵 Thread below ⬇️';
  } else if (platform === 'facebook') {
    copy += ' Tag someone who needs to see this! 👇';
  } else if (platform === 'youtube') {
    copy += ' Watch the full breakdown in our latest video!';
  }

  // Add call to action
  const ctas = [
    'Learn more in our bio link! 🔗',
    'What do you think? Let us know! 💭',
    'Share your experience below! ⬇️',
    'Save this post for later! 📌',
    'Follow for more updates! ➕'
  ];
  
  copy += ` ${ctas[Math.floor(Math.random() * ctas.length)]}`;

  // Trim to max length
  if (copy.length > maxLength) {
    copy = copy.substring(0, maxLength - 3) + '...';
  }

  return copy;
}

function generateHashtags(keywords: string, prompt: string): string[] {
  const keywordTags = keywords 
    ? keywords.split(',').map(k => `#${k.trim().replace(/\s+/g, '')}`).filter(k => k.length > 1)
    : [];
  
  const promptWords = prompt.toLowerCase().split(' ')
    .filter(word => word.length > 3)
    .slice(0, 3)
    .map(word => `#${word.replace(/[^a-zA-Z0-9]/g, '')}`);
  
  const defaultTags = ['#SocialMedia', '#Content', '#Marketing', '#Business', '#Growth'];
  
  const allTags = [...keywordTags, ...promptWords, ...defaultTags];
  const uniqueTags = Array.from(new Set(allTags));
  
  return uniqueTags.slice(0, 5);
}

// Health check endpoint
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${FASTAPI_SERVER_URL}/nova/info`);
    const data = await response.json();
    
    return NextResponse.json({
      status: 'SocialHive Copywriting AI is ready',
      model: 'Amazon Nova Pro v1.0',
      provider: 'FastAPI MCP Server',
      server_url: FASTAPI_SERVER_URL,
      features: [
        'Multi-platform copywriting',
        'Tone customization',
        'Content type optimization',
        'Hashtag generation',
        'Engagement prediction',
        'Character limit enforcement',
        'AWS Bedrock powered'
      ],
      awsConfigured: response.ok,
      supportedPlatforms: ['Instagram', 'Twitter/X', 'Facebook', 'TikTok', 'YouTube', 'General'],
      modelCapabilities: {
        maxTokens: 1024,
        temperature: 0.8,
        provider: 'Amazon Bedrock',
        modelId: 'amazon.nova-pro-v1:0'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'SocialHive Copywriting AI is ready',
      model: 'Amazon Nova Pro v1.0',
      provider: 'FastAPI MCP Server',
      server_url: FASTAPI_SERVER_URL,
      awsConfigured: false,
      error: 'Cannot connect to FastAPI server'
    });
  }
}
