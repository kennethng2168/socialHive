import { NextRequest, NextResponse } from 'next/server';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

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

    // Get AWS credentials from environment
    const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'us-east-1';
    
    if (!awsAccessKeyId || !awsSecretAccessKey) {
      return NextResponse.json(
        { 
          error: 'AWS credentials not configured',
          content: generateFallbackCopy(prompt, platform, tone, contentType, targetAudience, keywords, maxLength),
          hashtags: generateHashtags(keywords, prompt),
          engagement_score: Math.random() * 2 + 8,
          source: 'fallback'
        },
        { status: 200 }
      );
    }

    // Create specialized copywriting prompt
    const copywritingPrompt = createCopywritingPrompt(
      prompt, platform, tone, contentType, targetAudience, keywords, maxLength
    );

    // Initialize Amazon Nova Pro client
    const novaClient = new BedrockRuntimeClient({
      region,
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
      }
    });

    console.log('Calling Amazon Nova Pro for copywriting generation...');

    // Call Amazon Nova Pro via Converse API
    const command = new ConverseCommand({
      modelId: 'amazon.nova-pro-v1:0',
      messages: [
        {
          role: 'user',
          content: [
            {
              text: copywritingPrompt
            }
          ]
        }
      ],
      inferenceConfig: {
        temperature: 0.8, // Higher creativity for copywriting
        topP: 0.95,
        maxTokens: 1024,
      }
    });

    const novaResponse = await novaClient.send(command);
    
    // Extract response text from Nova's response structure
    const responseText = novaResponse.output?.message?.content?.[0]?.text || '';
    
    if (!responseText) {
      console.error('Nova Pro returned empty response');
      return NextResponse.json({
        content: generateFallbackCopy(prompt, platform, tone, contentType, targetAudience, keywords, maxLength),
        hashtags: generateHashtags(keywords, prompt),
        engagement_score: Math.random() * 2 + 8,
        source: 'fallback',
        error: 'Empty response from Nova Pro'
      });
    }
    
    console.log('Nova Pro response received successfully');
    
    // Parse the structured response
    const parsedResponse = parseNovaCopyResponse(responseText);
    
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

function createCopywritingPrompt(
  prompt: string, 
  platform: string, 
  tone: string, 
  contentType: string, 
  targetAudience: string, 
  keywords: string, 
  maxLength: number
): string {
  const platformSpecs = {
    instagram: 'Instagram post with engaging visuals focus, use emojis strategically',
    twitter: 'Twitter/X post, be concise and punchy, use relevant hashtags',
    facebook: 'Facebook post, can be longer and more conversational',
    tiktok: 'TikTok video caption, trendy and engaging, use viral language and hashtags',
    youtube: 'YouTube description/comment, engaging and searchable',
    general: 'General social media post, adaptable format'
  };

  return `You are an expert social media copywriter. Create engaging ${platform} content based on these specifications:

CONTENT BRIEF:
- Topic/Product: ${prompt}
- Platform: ${platform} (${platformSpecs[platform as keyof typeof platformSpecs] || 'general social media'})
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
}

function parseNovaCopyResponse(response: string): {
  content: string;
  hashtags?: string[];
  engagement_score?: number;
} {
  try {
    console.log('Raw Nova Pro response:', response.substring(0, 300));
    
    // Split into sections by markdown headers
    const sections = response.split(/\*\*[A-Za-z\s]+:\*\*/);
    
    // Try to extract content between **Content:** and **Hashtags:**
    // Allow for optional newlines after the header
    const contentRegex = /\*\*Content:\*\*\s*\n?([\s\S]*?)(?=\n\s*\*\*Hashtags?:|\n\s*\*\*Engagement|$)/i;
    const hashtagsRegex = /\*\*Hashtags?:\*\*\s*\n?([\s\S]*?)(?=\n\s*\*\*Engagement Score:|\n\s*\*\*Rationale|$)/i;
    const scoreRegex = /\*\*Engagement Score:\*\*\s*(\d+(?:\.\d+)?)/i;
    
    const contentMatch = response.match(contentRegex);
    const hashtagsMatch = response.match(hashtagsRegex);
    const scoreMatch = response.match(scoreRegex);
    
    console.log('🔍 Regex matches:', {
      hasContentMatch: !!contentMatch,
      contentLength: contentMatch?.[1]?.length || 0,
      hasHashtagsMatch: !!hashtagsMatch,
      hasScoreMatch: !!scoreMatch
    });
    
    // Extract and clean content
    let content = '';
    if (contentMatch && contentMatch[1]) {
      content = contentMatch[1]
        .trim()
        .replace(/\n\s+/g, ' ') // Replace newlines with spaces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      console.log('✅ Extracted content via regex, length:', content.length);
    } else {
      console.log('⚠️  No content match found, trying fallback...');
    }
    
    // If no content found, try fallback line-by-line parsing
    if (!content || content.length < 10) {
      const lines = response.split('\n');
      let captureContent = false;
      let contentLines: string[] = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (/\*\*Content:\*\*/i.test(trimmedLine)) {
          captureContent = true;
          // Check if content starts on the same line
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
      // Extract hashtags from array format [#tag1, #tag2] or from inline text #tag1 #tag2
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
    
    // Also extract inline hashtags from content if no hashtags section found
    if (!hashtags || hashtags.length === 0) {
      const inlineHashtags = content.match(/#[\w]+/g);
      if (inlineHashtags) {
        hashtags = inlineHashtags.slice(0, 5);
        // Remove hashtags from content
        content = content.replace(/#[\w]+/g, '').replace(/\s+/g, ' ').trim();
      }
    }
    
    // Extract engagement score
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
    // Fallback to using the entire response as content
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
  const toneStarters = {
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

  const starter = toneStarters[tone as keyof typeof toneStarters] || '🌟 Discover';
  
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
  const awsConfigured = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  
  return NextResponse.json({
    status: 'SocialHive Copywriting AI is ready',
    model: 'Amazon Nova Pro v1.0',
    features: [
      'Multi-platform copywriting',
      'Tone customization',
      'Content type optimization',
      'Hashtag generation',
      'Engagement prediction',
      'Character limit enforcement',
      'AWS Bedrock powered'
    ],
    awsConfigured: awsConfigured,
    supportedPlatforms: ['Instagram', 'Twitter/X', 'Facebook', 'TikTok', 'YouTube', 'General'],
    modelCapabilities: {
      maxTokens: 1024,
      temperature: 0.8,
      provider: 'Amazon Bedrock',
      modelId: 'amazon.nova-pro-v1:0'
    }
  });
}