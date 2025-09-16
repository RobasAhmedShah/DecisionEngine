import { NextRequest, NextResponse } from 'next/server';
import DataService from '../../../lib/modules/DataService';
import CreditCardDecisionEngine from '../../../lib/CreditCardDecisionEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId } = body;
    
    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    console.log('🚀 API: Starting full process for application:', applicationId);

    const dataService = new DataService();
    const decisionEngine = new CreditCardDecisionEngine();
    
    // Fetch and process application data
    const applicationData = await dataService.processApplication(parseInt(applicationId));
    console.log('📥 API: Fetched application data:', JSON.stringify(applicationData, null, 2));
    
    // Calculate decision
    const result = decisionEngine.calculateDecision(applicationData);
    
    console.log('📤 API: Process result:', JSON.stringify(result, null, 2));
    
    return NextResponse.json({ decision: result });
  } catch (error) {
    console.error('❌ API Error processing application:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to process application', details: errorMessage },
      { status: 500 }
    );
  }
}




