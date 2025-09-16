import { NextRequest, NextResponse } from 'next/server';
import CreditCardDecisionEngine from '../../../lib/CreditCardDecisionEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationData, cbsData, systemChecksData, creditLimitData } = body;
    
    if (!applicationData) {
      return NextResponse.json(
        { error: 'Application data is required' },
        { status: 400 }
      );
    }

    console.log('🚀 API: Starting decision calculation');
    console.log('📥 Application Data:', JSON.stringify(applicationData, null, 2));
    console.log('📥 CBS Data:', JSON.stringify(cbsData, null, 2));
    console.log('📥 System Checks Data:', JSON.stringify(systemChecksData, null, 2));
    console.log('📥 Credit Limit Data:', JSON.stringify(creditLimitData, null, 2));

    const decisionEngine = new CreditCardDecisionEngine();
    const result = decisionEngine.calculateDecision(applicationData, cbsData, systemChecksData, creditLimitData);
    
    console.log('📤 API: Decision result:', JSON.stringify(result, null, 2));
    
    return NextResponse.json({ decision: result });
  } catch (error) {
    console.error('❌ API Error calculating decision:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to calculate decision', details: errorMessage },
      { status: 500 }
    );
  }
}





