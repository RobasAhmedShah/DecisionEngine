import { NextRequest, NextResponse } from 'next/server';
import CreditCardDecisionEngine from '../../../lib/CreditCardDecisionEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationData, cbsData, ilosData, systemChecksData, creditLimitData } = body;
    
    if (!applicationData) {
      return NextResponse.json(
        { error: 'Application data is required' },
        { status: 400 }
      );
    }

    console.log('🚀 API: Starting decision calculation');
    console.log('📥 Application Data:', JSON.stringify(applicationData, null, 2));
    console.log('📥 CBS Data:', JSON.stringify(cbsData, null, 2));
    console.log('📥 ILOS Data (DBR):', JSON.stringify(ilosData, null, 2));
    console.log('📥 System Checks Data:', JSON.stringify(systemChecksData, null, 2));
    console.log('📥 Credit Limit Data:', JSON.stringify(creditLimitData, null, 2));

    // Merge ilosData (DBR fields) into applicationData for DBR module access
    const enhancedApplicationData = {
      ...applicationData,
      ...(ilosData || {}), // Merge DBR fields like existing_monthly_obligations, credit_card_limit, etc.
    };

    console.log('📊 Enhanced Application Data (with DBR):', JSON.stringify(enhancedApplicationData, null, 2));
    
    // Debug: Check specific DBR fields in enhancedApplicationData
    console.log('🔍 DBR Fields Debug:');
    console.log('  • existing_monthly_obligations:', enhancedApplicationData.existing_monthly_obligations);
    console.log('  • credit_card_limit:', enhancedApplicationData.credit_card_limit);
    console.log('  • overdraft_annual_interest:', enhancedApplicationData.overdraft_annual_interest);
    console.log('  • amount_requested:', enhancedApplicationData.amount_requested);
    console.log('  • net_monthly_income:', enhancedApplicationData.net_monthly_income);

    const decisionEngine = new CreditCardDecisionEngine();
    const result = decisionEngine.calculateDecision(enhancedApplicationData, cbsData, systemChecksData, creditLimitData);
    
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





