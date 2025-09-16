import { NextRequest, NextResponse } from 'next/server';

/**
 * Direct test route to fetch from external API
 * This bypasses DataService to test the connection directly
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = parseInt(params.id);
    
    if (isNaN(applicationId)) {
      return NextResponse.json(
        { error: 'Invalid application ID' },
        { status: 400 }
      );
    }

    console.log(`🧪 Testing direct connection to external API for ID: ${applicationId}`);
    
    // Direct fetch to your external API (use 127.0.0.1 to force IPv4)
    const externalApiUrl = `http://127.0.0.1:5000/api/applications/${applicationId}`;
    console.log(`🌐 Direct API call to: ${externalApiUrl}`);
    
    const response = await fetch(externalApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'NextJS-DirectTest/1.0',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    console.log(`📡 Direct API Response: ${response.status} ${response.statusText}`);
    console.log(`📡 Response Headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error Response Body:`, errorText);
      return NextResponse.json(
        { 
          error: 'External API Error',
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: externalApiUrl
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched data from external API`);
    console.log(`📋 Data sample:`, JSON.stringify(data, null, 2).substring(0, 500) + '...');
    
    return NextResponse.json({
      success: true,
      source: 'Direct External API Call',
      url: externalApiUrl,
      data: data
    });
    
  } catch (error) {
    console.error('❌ Direct API test error:', error);
    return NextResponse.json(
      { 
        error: 'Direct API test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name || 'Unknown'
      },
      { status: 500 }
    );
  }
}
