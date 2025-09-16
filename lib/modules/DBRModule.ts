/**
 * DBR (Debt-to-Income Ratio) Module
 * Handles debt-to-income ratio calculation with dynamic thresholds
 * 
 * Team: Credit Risk & Debt Analysis
 * Responsibility: DBR calculation, dynamic threshold determination, debt capacity assessment
 */

export interface DBRInput {
  // Application data
  gross_monthly_income?: number | string;
  grossMonthlySalary?: number | string;
  total_income?: number | string;
  net_monthly_income?: number | string;
  netMonthlyIncome?: number | string;
  proposed_loan_amount?: number | string;
  amount_requested?: number | string;
  loan_amount?: number | string;
  amountRequested?: number | string;
  cnic?: string;
  // SBP R-3 aligned optional inputs
  monthly_installment?: number | string; // explicit proposed EMI (if given)
  proposed_principal?: number | string; // loan principal for EMI calculation
  proposed_tenure_months?: number | string; // n
  proposed_annual_rate?: number | string; // annual nominal rate (e.g., 0.25 for 25%)
  zero_interest?: boolean; // if zero-interest plan
  existing_monthly_obligations?: number | string; // aggregated existing EMIs
  credit_card_limit?: number | string; // for 5% component
  overdraft_annual_interest?: number | string; // annual OD interest amount
  date_of_birth?: string; // for age override
  
  // DBR data from external engine (optional)
  dbrData?: {
    dbr?: number;
    dbr_details?: {
      net_income?: number;
      total_obligations?: number;
    };
    threshold?: number;
    status?: string;
  };
}

export interface DBRResult {
  score: number;
  raw: number;
  dbrPercentage: number;
  dbrThreshold: number;
  isWithinThreshold: boolean;
  netIncome: number;
  totalObligations: number;
  notes: string[];
  flags: string[];
  details: {
    calculationMethod: string;
    incomeSource: string;
    obligationsSource: string;
    thresholdType: string;
    riskCategory: string;
    statusReason: string;
    decisionBand?: 'PASS' | 'CONDITIONAL' | 'FAIL';
  };
}

export default class DBRModule {
  /**
   * Calculate income score for dynamic threshold (simplified version)
   */
  private calculateIncomeScore(netIncome: number): number {
    if (netIncome >= 100000) return 50;
    if (netIncome >= 75000) return 40;
    if (netIncome >= 50000) return 30;
    if (netIncome >= 30000) return 20;
    return 10;
  }

  /**
   * Calculate obligations score for dynamic threshold (simplified version)
   */
  private calculateObligationsScore(totalObligations: number): number {
    if (totalObligations <= 10000) return 50;
    if (totalObligations <= 25000) return 40;
    if (totalObligations <= 50000) return 30;
    if (totalObligations <= 75000) return 20;
    return 10;
  }

  /**
   * Calculate dynamic threshold based on income and obligations
   */
  private calculateDynamicThreshold(incomeScore: number, obligationsScore: number): number {
    const combinedScore = incomeScore + obligationsScore;
    
    if (combinedScore >= 90) return 45; // Best case: more strict threshold
    if (combinedScore >= 70) return 40; // Good case: standard threshold
    if (combinedScore >= 50) return 35; // Fair case: lenient threshold
    return 30; // Worst case: more lenient threshold
  }

  /**
   * Calculate DBR score based on percentage
   */
  private calculateDBRScore(dbrPercentage: number): number {
    if (dbrPercentage <= 20) return 100;
    if (dbrPercentage <= 35) return 75;
    if (dbrPercentage <= 50) return 50;
    if (dbrPercentage <= 60) return 25;
    return 0;
  }

  /**
   * Get risk category based on DBR percentage
   */
  private getRiskCategory(dbrPercentage: number, threshold: number): string {
    if (dbrPercentage > threshold) return 'CRITICAL';
    if (dbrPercentage > threshold * 0.8) return 'HIGH';
    if (dbrPercentage > threshold * 0.6) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Calculate DBR with dynamic threshold and scoring
   * EXACT logic from original Deceng.js (simplified for core functionality)
   */
  public calculate(input: DBRInput): DBRResult {
    console.log('='.repeat(80));
    console.log('💳 DBR MODULE CALCULATION');
    console.log('='.repeat(80));
    console.log('📥 INPUTS:');
    console.log('  • Application Data:', input ? 'Available' : 'Not Available');
    console.log('  • DBR Data:', input.dbrData ? 'Available' : 'Not Available');
    
    if (input.dbrData) {
      console.log('  • DBR Data Details:', JSON.stringify(input.dbrData, null, 2));
    }

    let dbrPercentage = 0;
    let notes: string[] = [];
    let netIncome = 0;
    let totalObligations = 0;
    // SBP R-3 decision bands (adjusted for credit cards): PASS ≤50, CONDITIONAL ≤60, FAIL >60
    const PASS_THRESHOLD = 50;
    const CONDITIONAL_THRESHOLD = 60;
    let threshold = CONDITIONAL_THRESHOLD; // for reporting and risk category
    let isWithinThreshold = false;
    let calculationMethod = 'FALLBACK';
    let incomeSource = 'APPLICATION';
    let obligationsSource = 'ESTIMATED';

    // Check if we have DBR data from the API
    if (input.dbrData && input.dbrData.dbr !== undefined && input.dbrData.dbr !== null) {
      console.log('🔍 PROCESSING DBR DATA FROM ENGINE:');
      console.log('  • Raw dbrData:', JSON.stringify(input.dbrData, null, 2));
      console.log('  • dbrData.dbr:', input.dbrData.dbr);
      console.log('  • dbrData.dbr_details:', input.dbrData.dbr_details);
      
      dbrPercentage = input.dbrData.dbr;
      netIncome = input.dbrData.dbr_details?.net_income || 0;
      totalObligations = input.dbrData.dbr_details?.total_obligations || 0;
      threshold = input.dbrData.threshold || CONDITIONAL_THRESHOLD;
      isWithinThreshold = input.dbrData.status === 'pass';
      calculationMethod = 'DATA_ENGINE';
      incomeSource = 'DATA_ENGINE';
      obligationsSource = 'DATA_ENGINE';
      
      console.log('  • DBR Percentage:', dbrPercentage + '%');
      console.log('  • Net Income:', netIncome);
      console.log('  • Total Obligations:', totalObligations);
      console.log('  • Threshold:', threshold + '%');
      console.log('  • Status:', input.dbrData.status);
      console.log('  • Within Threshold:', isWithinThreshold);
      
      notes.push(`DBR from data engine: ${dbrPercentage.toFixed(2)}%`);
      notes.push(`Net Income: PKR ${netIncome.toLocaleString()}`);
      notes.push(`Total Obligations: PKR ${totalObligations.toLocaleString()}`);
      notes.push(`DBR Threshold: ${threshold}% (Dynamic)`);
      notes.push(`Status: ${input.dbrData.status?.toUpperCase()}`);
      
      // If status is fail, return 0 score
      if (input.dbrData.status === 'fail') {
        console.log('❌ DBR STATUS: FAIL');
        console.log('📤 OUTPUTS:');
        console.log('  • Score: 0/100 (DBR Fail)');
        console.log('  • DBR Percentage:', dbrPercentage + '%');
        console.log('  • Threshold:', threshold + '%');
        console.log('  • Notes:', notes);
        console.log('='.repeat(80));
        
        notes.push(`DBR status is FAIL - Score 0`);
        return {
          score: 0,
          raw: 0,
          dbrPercentage,
          dbrThreshold: threshold,
          isWithinThreshold: false,
          netIncome,
          totalObligations,
          notes,
          flags: ["DBR_FAIL"],
          details: {
            calculationMethod,
            incomeSource,
            obligationsSource,
            thresholdType: 'DYNAMIC',
            riskCategory: 'CRITICAL',
            statusReason: 'DATA_ENGINE_FAIL'
          }
        };
      }
    } else {
      // Fallback: Calculate DBR directly from application data (SBP-aligned)
      console.log('⚠️ FALLBACK: No DBR data available, calculating directly from application data...');
      
      // Extract income data from application - check both field naming conventions
      const grossIncome = parseFloat(String(input.gross_monthly_income || input.grossMonthlySalary || 0));
      const netIncomeValue = parseFloat(String(input.total_income || input.net_monthly_income || input.netMonthlyIncome || 0)); // treat as NDMI if given
      const loanAmount = parseFloat(String(input.proposed_loan_amount || input.amount_requested || input.loan_amount || input.amountRequested || 0));
      const monthlyInstallment = parseFloat(String(input.monthly_installment || 0));
      const principal = parseFloat(String(input.proposed_principal || loanAmount || 0));
      const tenureMonths = parseInt(String(input.proposed_tenure_months || 0), 10);
      const annualRate = parseFloat(String(input.proposed_annual_rate || 0));
      const existingObligations = parseFloat(String(input.existing_monthly_obligations || 0));
      const ccLimit = parseFloat(String(input.credit_card_limit || 0));
      const odAnnualInterest = parseFloat(String(input.overdraft_annual_interest || 0));
      const ccComponent = ccLimit > 0 ? ccLimit * 0.05 : 0; // 5% of CC limit
      const odMonthly = odAnnualInterest > 0 ? odAnnualInterest / 12 : 0; // OD monthly interest
      
      console.log('  • Available fields:', Object.keys(input));
      console.log('  • Gross Income:', grossIncome);
      console.log('  • Net Income:', netIncomeValue);
      console.log('  • Loan Amount:', loanAmount);
      
      // Calculate DBR
      if (netIncomeValue > 0) {
        // Compute proposed EMI
        let proposedEmi = 0;
        if (!isNaN(monthlyInstallment) && monthlyInstallment > 0) {
          proposedEmi = monthlyInstallment;
          notes.push('Using provided monthly_installment for proposed EMI');
        } else if (principal > 0 && tenureMonths > 0) {
          if (input.zero_interest) {
            proposedEmi = principal / tenureMonths;
            notes.push('Zero-interest plan detected: EMI = Principal / Tenure');
          } else if (annualRate > 0) {
            const r = annualRate / 12; // monthly rate
            const n = tenureMonths;
            const pow = Math.pow(1 + r, n);
            proposedEmi = (principal * r * pow) / (pow - 1);
            notes.push(`Interest-bearing EMI computed via SBP formula (r=${r.toFixed(6)}, n=${n})`);
          } else {
            proposedEmi = principal / tenureMonths; // fallback if no rate provided
            notes.push('No rate provided; approximating EMI as Principal / Tenure');
          }
        } else if (loanAmount > 0) {
          // Backward-compat: if only loanAmount provided, treat as monthly obligation (legacy behavior)
          proposedEmi = loanAmount;
          notes.push('Legacy input: treating proposed_loan_amount as monthly obligation');
        } else if (parseFloat(String(input.amount_requested || input.amountRequested || 0)) > 0) {
          // For credit cards, amount_requested is the credit limit, not a monthly obligation
          // DBR should only consider existing obligations, not the requested credit limit
          proposedEmi = 0;
          notes.push('Credit card application: amount_requested is credit limit, not monthly obligation');
        }

        const totalMonthlyObligations = (existingObligations || 0) + ccComponent + odMonthly + (proposedEmi || 0);
        
        // SBP DBR: Total Monthly Obligations / Net Disposable Monthly Income
        dbrPercentage = (totalMonthlyObligations / netIncomeValue) * 100;
        netIncome = netIncomeValue;
        totalObligations = totalMonthlyObligations;
        calculationMethod = 'APPLICATION_DATA';
        
        // SBP thresholds: PASS ≤35, CONDITIONAL ≤40, FAIL >40
        threshold = dbrPercentage <= PASS_THRESHOLD ? PASS_THRESHOLD : CONDITIONAL_THRESHOLD;
        isWithinThreshold = dbrPercentage <= CONDITIONAL_THRESHOLD;
        
        if (!proposedEmi && !loanAmount && !(principal > 0 && tenureMonths > 0) && !(parseFloat(String(input.amount_requested || input.amountRequested || 0)) > 0)) {
          notes.push('No proposed obligation provided; assuming 0 for proposed EMI');
        }
        
        notes.push(`DBR calculated from application data: ${dbrPercentage.toFixed(2)}%`);
        notes.push(`Net Income: PKR ${netIncome.toLocaleString()}`);
        notes.push(`Components → Existing: PKR ${(existingObligations||0).toLocaleString()}, CC(5%): PKR ${ccComponent.toLocaleString()}, OD/12: PKR ${odMonthly.toLocaleString()}, Proposed EMI: PKR ${(proposedEmi||0).toLocaleString()}`);
        notes.push(`Total Obligations: PKR ${totalObligations.toLocaleString()}`);
        notes.push(`Threshold Bands: PASS ≤ ${PASS_THRESHOLD}%, CONDITIONAL ≤ ${CONDITIONAL_THRESHOLD}%`);
        notes.push(`Status: ${dbrPercentage <= PASS_THRESHOLD ? 'PASS' : (dbrPercentage <= CONDITIONAL_THRESHOLD ? 'CONDITIONAL' : 'FAIL')}`);
      } else {
        console.log('❌ Cannot calculate DBR: Net income is 0 or missing');
        notes.push("No DBR data available from data engine or API");
        
        return {
          score: 0,
          raw: 0,
          dbrPercentage: 0,
          dbrThreshold: threshold,
          isWithinThreshold: false,
          netIncome: 0,
          totalObligations: 0,
          notes,
          flags: ["NO_DBR_DATA"],
          details: {
            calculationMethod: 'FAILED',
            incomeSource: 'NONE',
            obligationsSource: 'NONE',
            thresholdType: 'DEFAULT',
            riskCategory: 'CRITICAL',
            statusReason: 'NO_DATA'
          }
        };
      }
    }

    // Calculate score based on DBR percentage
    const dbrScore = this.calculateDBRScore(dbrPercentage);
    const riskCategory = this.getRiskCategory(dbrPercentage, threshold);
    const decisionBand: 'PASS' | 'CONDITIONAL' | 'FAIL' = dbrPercentage <= PASS_THRESHOLD ? 'PASS' : (dbrPercentage <= CONDITIONAL_THRESHOLD ? 'CONDITIONAL' : 'FAIL');
    
    console.log('🔍 DBR SCORING:');
    console.log('  • DBR Percentage:', dbrPercentage.toFixed(2) + '%');
    console.log('  • Score:', dbrScore + '/100');
    console.log('  • Risk Category:', riskCategory);
    
    console.log('📤 OUTPUTS:');
    console.log('  • Final Score:', dbrScore + '/100');
    console.log('  • DBR Percentage:', dbrPercentage.toFixed(2) + '%');
    console.log('  • Threshold:', threshold + '%');
    console.log('  • Within Threshold:', isWithinThreshold);
    console.log('  • Notes:', notes);
    console.log('='.repeat(80));

    return {
      score: dbrScore,
      raw: dbrScore,
      dbrPercentage,
      dbrThreshold: threshold,
      isWithinThreshold,
      netIncome,
      totalObligations,
      notes,
      flags: isWithinThreshold ? [] : ["DBR_EXCEED_THRESHOLD"],
      details: {
        calculationMethod,
        incomeSource,
        obligationsSource,
        thresholdType: calculationMethod === 'DATA_ENGINE' ? 'DYNAMIC' : 'CALCULATED',
        riskCategory,
        statusReason: isWithinThreshold ? 'WITHIN_THRESHOLD' : 'EXCEEDS_THRESHOLD',
        decisionBand
      }
    };
  }

  /**
   * Check if DBR result is a critical failure
   */
  public isCriticalFailure(result: DBRResult): boolean {
    return !result.isWithinThreshold;
  }

  /**
   * Get weight for this module in final calculation
   */
  public getWeight(): number {
    return 0.55; // 55% - Primary risk indicator
  }

  /**
   * Get module information
   */
  public getModuleInfo() {
    return {
      name: 'DBR (Debt-to-Income Ratio)',
      description: 'Handles debt-to-income ratio calculation with dynamic thresholds',
      weight: this.getWeight(),
      team: 'Credit Risk & Debt Analysis',
      criticalFailure: true
    };
  }

  /**
   * Validate DBR input data
   */
  public validateInput(input: DBRInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const netIncome = parseFloat(String(input.total_income || input.net_monthly_income || input.netMonthlyIncome || 0));
    
    if (netIncome <= 0 && !input.dbrData) {
      errors.push('Net income is required for DBR calculation');
    }

    if (!input.dbrData) {
      const loanAmount = parseFloat(String(input.proposed_loan_amount || input.amount_requested || input.loan_amount || input.amountRequested || 0));
      if (loanAmount < 0) {
        errors.push('Loan amount cannot be negative');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get DBR scoring bands
   */
  public getScoringBands(): Array<{range: string, score: number, description: string}> {
    return [
      { range: '0-10%', score: 100, description: 'Excellent - Very low debt burden' },
      { range: '10-20%', score: 75, description: 'Good - Manageable debt level' },
      { range: '20-30%', score: 50, description: 'Fair - Moderate debt burden' },
      { range: '30-40%', score: 25, description: 'Poor - High debt burden' },
      { range: '40%+', score: 0, description: 'Very Poor - Excessive debt burden' }
    ];
  }
}
