import { NextRequest, NextResponse } from 'next/server';
import DataService from '../../../../lib/modules/DataService';

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

    console.log(`🌐 API Route: Fetching application data for ID: ${applicationId}`);
    
    const dataService = new DataService();
    // Use processApplication which includes DBR data and comprehensive fallback
    const applicationData = await dataService.processApplication(applicationId);
    
    console.log(`✅ API Route: Successfully processed application ID: ${applicationId}`);
    console.log(`📋 API Route: Data source: ${applicationData.full_name?.includes('Fallback') ? 'FALLBACK' : 'API'}`);
    
    return NextResponse.json(applicationData);
  } catch (error) {
    // This should rarely happen now since DataService has comprehensive fallbacks
    console.error('❌ API Route: Unexpected error:', error);
    
    // Even if something goes wrong, provide basic fallback
    const dataService = new DataService();
    const fallbackData = await dataService.processApplication(parseInt(params.id));
    
    return NextResponse.json(fallbackData);
  }
}





