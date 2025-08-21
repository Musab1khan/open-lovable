import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Check for required API key first
    if (!process.env.FIRECRAWL_API_KEY) {
      return NextResponse.json({
        error: 'FIRECRAWL_API_KEY is required. Please add it to your .env.local file.',
        details: 'Get your API key from https://firecrawl.dev and add FIRECRAWL_API_KEY=your_key to .env.local'
      }, { status: 500 });
    }

    // Use Firecrawl API to capture screenshot
    let firecrawlResponse;
    let data;
    
    try {
      firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          formats: ['screenshot'], // Regular viewport screenshot, not full page
          waitFor: 3000, // Wait for page to fully load
          timeout: 30000,
          blockAds: true,
          actions: [
            {
              type: 'wait',
              milliseconds: 2000 // Additional wait for dynamic content
            }
          ]
        })
      });

      if (!firecrawlResponse.ok) {
        const error = await firecrawlResponse.text();
        throw new Error(`Firecrawl API error: ${error}`);
      }

      data = await firecrawlResponse.json();
    } catch (fetchError) {
      console.error('Firecrawl fetch error:', fetchError);
      throw new Error(`Failed to connect to Firecrawl API: ${(fetchError as Error).message}`);
    }
    
    if (!data.success || !data.data?.screenshot) {
      throw new Error('Failed to capture screenshot');
    }

    return NextResponse.json({
      success: true,
      screenshot: data.data.screenshot,
      metadata: data.data.metadata
    });

  } catch (error: any) {
    console.error('Screenshot capture error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to capture screenshot' 
    }, { status: 500 });
  }
}