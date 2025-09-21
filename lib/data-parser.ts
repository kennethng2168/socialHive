export interface RegionalHashtagData {
  hashtag_name: string;
  hashtag_id: string;
  full_hashtag: string;
  country: string;
  country_name: string;
  region: string;
  rank: number;
  rank_diff?: number;
  rank_diff_type?: number;
  posts_count?: number;
  views?: number;
  trend?: TrendPoint[];
  creators?: Creator[];
  publish_cnt?: number;
  video_views?: number;
  aggregated_rank?: number;
}

export interface TrendPoint {
  time: number;
  value: number;
}

export interface Creator {
  nick_name: string;
  avatar_url: string;
}

export interface WordCloudData {
  text: string;
  value: number;
  color?: string;
  country?: string;
  region?: string;
  rank?: number;
  trend?: 'up' | 'down' | 'stable';
  trendData?: TrendPoint[];
  creators?: Creator[];
  publish_cnt?: number;
  video_views?: number;
  hashtag_id?: string;
  aggregated_rank?: number;
}

export interface RegionData {
  name: string;
  countries: string[];
  color: string;
}

export const REGIONS: Record<string, RegionData> = {
  southeast_asia: {
    name: 'Southeast Asia',
    countries: ['MY', 'SG', 'ID', 'TH', 'VN', 'PH'],
    color: '#10b981' // green
  },
  east_asia: {
    name: 'East Asia',
    countries: ['TW', 'HK', 'KR', 'JP', 'CN'],
    color: '#3b82f6' // blue
  },
  south_asia: {
    name: 'South Asia',
    countries: ['IN', 'BD', 'LK', 'NP', 'PK'],
    color: '#8b5cf6' // purple
  },
  central_asia: {
    name: 'Central Asia',
    countries: ['KZ', 'UZ', 'KG', 'TJ', 'TM'],
    color: '#f59e0b' // amber
  }
};

export const COUNTRY_COLORS: Record<string, string> = {
  'MY': '#e11d48', // Malaysia - Red
  'SG': '#059669', // Singapore - Green  
  'TH': '#dc2626', // Thailand - Red
  'TW': '#2563eb', // Taiwan - Blue
  'KR': '#7c3aed', // Korea - Purple
  'ID': '#ea580c', // Indonesia - Orange
  'VN': '#0891b2', // Vietnam - Cyan
  'HK': '#be123c', // Hong Kong - Rose
  'JP': '#c2410c', // Japan - Orange
  'PH': '#0d9488', // Philippines - Teal
};

export const COUNTRY_NAMES: Record<string, string> = {
  'MY': 'Malaysia',
  'SG': 'Singapore',
  'ID': 'Indonesia',
  'TH': 'Thailand',
  'VN': 'Vietnam',
  'PH': 'Philippines',
  'TW': 'Taiwan',
  'HK': 'Hong Kong',
  'KR': 'South Korea',
  'JP': 'Japan',
  'CN': 'China',
  'IN': 'India',
  'BD': 'Bangladesh',
  'LK': 'Sri Lanka',
  'NP': 'Nepal',
  'PK': 'Pakistan',
  'KZ': 'Kazakhstan',
  'UZ': 'Uzbekistan',
  'KG': 'Kyrgyzstan',
  'TJ': 'Tajikistan',
  'TM': 'Turkmenistan'
};

export function parseAsianMarketsData(jsonData: any): WordCloudData[] {
  const wordCloudData: WordCloudData[] = [];
  
  if (!jsonData.countries) return wordCloudData;

  // Process each country's data
  Object.entries(jsonData.countries).forEach(([countryCode, countryData]: [string, any]) => {
    if (!countryData.hashtags) return;

    // Get region info
    const region = countryData.region || 'unknown';
    const regionData = REGIONS[region];
    const color = regionData?.color || '#6b7280';

    // Process ALL hashtags from each country
    countryData.hashtags.forEach((hashtag: any, index: number) => {
      const rankValue = hashtag.additional_data?.rank || hashtag.aggregated_rank || (index + 1);
      
      // Calculate value based on video views and rank (higher views + lower rank = higher value)
      const viewsScore = hashtag.additional_data?.video_views ? Math.log10(hashtag.additional_data.video_views) * 10 : 0;
      const rankScore = Math.max(200 - rankValue, 10); // Higher score for lower rank numbers
      const baseScore = rankScore + viewsScore;

      const trend = hashtag.additional_data?.rank_diff_type === 1 ? 'up' : 
                   hashtag.additional_data?.rank_diff_type === 3 ? 'down' : 'stable';

      wordCloudData.push({
        text: hashtag.hashtag_name,
        value: baseScore,
        color: COUNTRY_COLORS[countryCode] || color,
        country: countryCode,
        region: region,
        rank: rankValue,
        trend: trend,
        trendData: hashtag.additional_data?.trend || [],
        creators: hashtag.additional_data?.creators || [],
        publish_cnt: hashtag.additional_data?.publish_cnt || 0,
        video_views: hashtag.additional_data?.video_views || 0,
        hashtag_id: hashtag.hashtag_id,
        aggregated_rank: hashtag.aggregated_rank
      });
    });
  });

  // Aggregate hashtags that appear in multiple countries
  const hashtagMap = new Map<string, WordCloudData>();
  
  wordCloudData.forEach(item => {
    const existing = hashtagMap.get(item.text);
    if (existing) {
      // Combine values, keep best rank, and merge additional data
      existing.value = Math.max(existing.value, item.value);
      existing.rank = Math.min(existing.rank || 1000, item.rank || 1000);
      existing.publish_cnt = (existing.publish_cnt || 0) + (item.publish_cnt || 0);
      existing.video_views = (existing.video_views || 0) + (item.video_views || 0);
      
      // Merge trend data (keep the most recent)
      if (item.trendData && item.trendData.length > 0) {
        existing.trendData = item.trendData;
      }
      
      // Merge creators
      if (item.creators && item.creators.length > 0) {
        existing.creators = [...(existing.creators || []), ...item.creators].slice(0, 10);
      }
    } else {
      hashtagMap.set(item.text, { ...item });
    }
  });

  // Return ALL hashtags sorted by rank (no limit)
  return Array.from(hashtagMap.values())
    .sort((a, b) => (a.rank || 999) - (b.rank || 999));
}

export function parseApparelData(jsonData: any): WordCloudData[] {
  const wordCloudData: WordCloudData[] = [];
  
  if (!jsonData.countries) return wordCloudData;

  // Process each country's fashion data
  Object.entries(jsonData.countries).forEach(([countryCode, countryData]: [string, any]) => {
    if (!countryData.hashtags) return;

    // Get region info
    const region = countryData.region || 'unknown';
    const regionData = REGIONS[region];
    const color = '#ec4899'; // pink for fashion

    // Process ALL fashion hashtags
    countryData.hashtags.forEach((hashtag: any, index: number) => {
      const rankValue = hashtag.additional_data?.rank || hashtag.aggregated_rank || (index + 1);
      
      // Calculate value based on video views and rank for fashion
      const viewsScore = hashtag.additional_data?.video_views ? Math.log10(hashtag.additional_data.video_views) * 8 : 0;
      const rankScore = Math.max(150 - rankValue, 5);
      const baseScore = rankScore + viewsScore;

      const trend = hashtag.additional_data?.rank_diff_type === 1 ? 'up' : 
                   hashtag.additional_data?.rank_diff_type === 3 ? 'down' : 'stable';

      wordCloudData.push({
        text: hashtag.hashtag_name,
        value: baseScore,
        color: COUNTRY_COLORS[countryCode] || color,
        country: countryCode,
        region: region,
        rank: rankValue,
        trend: trend,
        trendData: hashtag.additional_data?.trend || [],
        creators: hashtag.additional_data?.creators || [],
        publish_cnt: hashtag.additional_data?.publish_cnt || 0,
        video_views: hashtag.additional_data?.video_views || 0,
        hashtag_id: hashtag.hashtag_id,
        aggregated_rank: hashtag.aggregated_rank
      });
    });
  });

  // Aggregate and return top 60 fashion hashtags
  const hashtagMap = new Map<string, WordCloudData>();
  
  wordCloudData.forEach(item => {
    const existing = hashtagMap.get(item.text);
    if (existing) {
      existing.value = Math.max(existing.value, item.value);
      existing.rank = Math.min(existing.rank || 1000, item.rank || 1000);
      existing.publish_cnt = (existing.publish_cnt || 0) + (item.publish_cnt || 0);
      existing.video_views = (existing.video_views || 0) + (item.video_views || 0);
      
      if (item.trendData && item.trendData.length > 0) {
        existing.trendData = item.trendData;
      }
      
      if (item.creators && item.creators.length > 0) {
        existing.creators = [...(existing.creators || []), ...item.creators].slice(0, 10);
      }
    } else {
      hashtagMap.set(item.text, { ...item });
    }
  });

  // Return ALL fashion hashtags sorted by rank (no limit)
  return Array.from(hashtagMap.values())
    .sort((a, b) => (a.rank || 999) - (b.rank || 999));
}

export async function loadRegionalData(): Promise<{
  generalData: WordCloudData[];
  fashionData: WordCloudData[];
  generalSummary: any;
  fashionSummary: any;
}> {
  try {
    // Load both data files
    const [generalResponse, fashionResponse] = await Promise.all([
      fetch('/data/asian_markets_comprehensive_20250920_134700.json'),
      fetch('/data/apparel_accessories_asian_markets_20250920_135634.json')
    ]);

    const generalJson = await generalResponse.json();
    const fashionJson = await fashionResponse.json();

    return {
      generalData: parseAsianMarketsData(generalJson),
      fashionData: parseApparelData(fashionJson),
      generalSummary: generalJson.summary,
      fashionSummary: fashionJson.summary
    };
  } catch (error) {
    console.error('Error loading regional data:', error);
    return {
      generalData: [],
      fashionData: [],
      generalSummary: null,
      fashionSummary: null
    };
  }
}
