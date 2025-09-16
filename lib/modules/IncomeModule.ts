/**
 * Income Module
 * Handles financial capacity and stability assessment
 * 
 * Team: Financial Analysis & Income Verification
 * Responsibility: Income threshold validation, stability analysis, employment tenure scoring
 */

export interface IncomeInput {
  gross_monthly_income?: number | string;
  grossMonthlySalary?: number | string;
  total_income?: number | string;
  net_monthly_income?: number | string;
  netMonthlyIncome?: number | string;
  length_of_employment?: number | string;
  is_ubl_customer?: boolean | string;
  employment_type?: string;
  salary_transfer_flag?: boolean | string;
}

export interface IncomeResult {
  score: number;
  grossIncome: number;
  netIncome: number;
  tenure: number;
  isETB: boolean;
  employmentType: string;
  salaryTransferFlag: string;
  thresholdMet: boolean;
  stabilityRatio: number;
  expectedThreshold: number;
  notes: string[];
  details: {
    thresholdAnalysis: {
      expected: number;
      actual: number;
      met: boolean;
      points: number;
    };
    stabilityAnalysis: {
      ratio: number;
      level: string;
      points: number;
    };
    tenureAnalysis: {
      years: number;
      level: string;
      points: number;
    };
    customerType: string;
    riskProfile: string;
  };
}

export default class IncomeModule {
  /**
   * Robust boolean normalizer
   */
  private asBool(v: any): boolean {
    if (v === true || v === 1) return true;
    if (typeof v === "string") {
      const s = v.trim().toLowerCase();
      return s === "true" || s === "1" || s === "yes" || s === "y";
    }
    return false;
  }

  /**
   * Get income thresholds based on employment type, salary transfer, and customer type
   */
  private getIncomeThreshold(employmentType: string, salaryTransferFlag: string, isETB: boolean): number {
    const empType = employmentType.toLowerCase();
    
    if (empType === "permanent" || empType === "employed") {
      if (salaryTransferFlag === "salary_transfer") {
        return isETB ? 40000 : 45000;
      } else {
        return isETB ? 45000 : 50000;
      }
    } else if (empType === "contractual") {
      if (salaryTransferFlag === "salary_transfer") {
        return isETB ? 60000 : 65000;
      } else {
        return isETB ? 65000 : 70000;
      }
    } else if (empType === "self-employed" || empType === "business") {
      return isETB ? 100000 : 120000;
    } else if (empType === "probation") {
      return 0; // No threshold for probation
    }
    
    return isETB ? 45000 : 50000; // Default
  }

  /**
   * Calculate stability level and points
   */
  private calculateStabilityScore(stabilityRatio: number): { level: string; points: number } {
    if (stabilityRatio >= 0.8) {
      return { level: 'High Stability', points: 25 };
    } else if (stabilityRatio >= 0.6) {
      return { level: 'Medium Stability', points: 20 };
    } else {
      return { level: 'Low Stability', points: 10 };
    }
  }

  /**
   * Calculate tenure level and points
   */
  private calculateTenureScore(tenure: number): { level: string; points: number } {
    if (tenure >= 5) {
      return { level: 'Excellent', points: 15 };
    } else if (tenure >= 3) {
      return { level: 'Good', points: 12 };
    } else if (tenure >= 1) {
      return { level: 'Acceptable', points: 8 };
    } else {
      return { level: 'Low', points: 0 };
    }
  }

  /**
   * Calculate Income score based on financial capacity and stability
   * EXACT logic from original Deceng.js
   */
  public calculate(input: IncomeInput): IncomeResult {
    console.log('='.repeat(80));
    console.log('💰 INCOME MODULE CALCULATION');
    console.log('='.repeat(80));
    console.log('📥 INPUTS:');
    console.log('  • Gross Monthly Income:', input.gross_monthly_income, '(type:', typeof input.gross_monthly_income, ')');
    console.log('  • Total Income (Net):', input.total_income, '(type:', typeof input.total_income, ')');
    console.log('  • Length of Employment:', input.length_of_employment, '(type:', typeof input.length_of_employment, ')');
    console.log('  • UBL Customer:', input.is_ubl_customer, '(type:', typeof input.is_ubl_customer, ')');
    console.log('  • Employment Type:', input.employment_type, '(type:', typeof input.employment_type, ')');
    console.log('  • Salary Transfer Flag:', input.salary_transfer_flag, '(type:', typeof input.salary_transfer_flag, ')');

    const grossIncome = parseFloat(String(input.gross_monthly_income || input.grossMonthlySalary || 0));
    const netIncome = parseFloat(String(input.total_income || input.net_monthly_income || input.netMonthlyIncome || 0));
    const tenure = parseFloat(String(input.length_of_employment || 0));
    const isETB = input.is_ubl_customer === true || input.is_ubl_customer === "true";

    // manual inputs
    const employmentType = (input.employment_type || "permanent").toLowerCase();
    const salaryTransferFlag = (this.asBool(input.salary_transfer_flag)) ? "salary_transfer" : "non_salary_transfer";
    
    console.log('🔍 PROCESSING:');
    console.log('  • Gross Income (parsed):', grossIncome);
    console.log('  • Net Income (parsed):', netIncome);
    console.log('  • Tenure (parsed):', tenure, 'years');
    console.log('  • UBL Customer (processed):', isETB);
    console.log('  • Employment Type (processed):', employmentType);
    console.log('  • Salary Transfer Flag (processed):', salaryTransferFlag);
    
    let raw = 0;
    const notes: string[] = [];

    // --- 1. Income Threshold Check (60 pts) ---
    console.log('🔍 THRESHOLD CHECK:');
    const expectedThreshold = this.getIncomeThreshold(employmentType, salaryTransferFlag, isETB);
    let thresholdMet = false;

    if (employmentType === "probation") {
      notes.push("Probation case → Score based on DBR, no threshold credit");
      console.log('  • Special Case: Probation (no threshold)');
    } else {
      thresholdMet = netIncome >= expectedThreshold;
    }

    console.log('  • Expected Threshold:', expectedThreshold);
    console.log('  • Actual Income:', netIncome);
    console.log('  • Threshold Met:', thresholdMet);
    console.log('  • Points Awarded:', thresholdMet ? 60 : 0);

    const thresholdPoints = thresholdMet ? 60 : 0;
    if (thresholdMet) {
      raw += 60;
      notes.push(`Income threshold met: PKR ${netIncome.toLocaleString()}`);
    } else {
      if (employmentType !== "probation") {
        notes.push(`Income threshold NOT met: PKR ${netIncome.toLocaleString()}`);
      }
    }

    // --- 2. Income Stability (25 pts) ---
    console.log('🔍 STABILITY CHECK:');
    let stabilityRatio = 0;
    let stabilityScore = { level: 'Not Measurable', points: 0 };
    
    if (grossIncome > 0 && netIncome > 0) {
      stabilityRatio = netIncome / grossIncome;
      stabilityScore = this.calculateStabilityScore(stabilityRatio);
      
      console.log('  • Stability Ratio:', (stabilityRatio * 100).toFixed(1) + '%');
      console.log('  • Level:', stabilityScore.level);
      console.log('  • Points Awarded:', stabilityScore.points);
      
      raw += stabilityScore.points;
      notes.push(`${stabilityScore.level}: ${(stabilityRatio * 100).toFixed(1)}% → +${stabilityScore.points}`);
    } else {
      notes.push("Stability not measurable (missing gross/net income)");
      console.log('  • Level: Not Measurable');
      console.log('  • Points Awarded: 0');
    }

    // --- 3. Employment Tenure (15 pts) ---
    console.log('🔍 TENURE CHECK:');
    console.log('  • Years of Experience:', tenure);
    
    const tenureScore = this.calculateTenureScore(tenure);
    console.log('  • Level:', tenureScore.level);
    console.log('  • Points Awarded:', tenureScore.points);
    
    raw += tenureScore.points;
    notes.push(`${tenureScore.level} tenure: ${tenure} years → +${tenureScore.points}`);

    const finalScore = Math.min(raw, 100);
    
    console.log('📤 OUTPUTS:');
    console.log('  • Final Score:', finalScore + '/100');
    console.log('  • Breakdown:');
    console.log('    - Threshold:', thresholdPoints, 'points');
    console.log('    - Stability:', stabilityScore.points, 'points');
    console.log('    - Tenure:', tenureScore.points, 'points');
    console.log('  • Notes:', notes);
    console.log('='.repeat(80));

    return {
      score: finalScore,
      grossIncome,
      netIncome,
      tenure,
      isETB,
      employmentType,
      salaryTransferFlag,
      thresholdMet,
      stabilityRatio,
      expectedThreshold,
      notes,
      details: {
        thresholdAnalysis: {
          expected: expectedThreshold,
          actual: netIncome,
          met: thresholdMet,
          points: thresholdPoints
        },
        stabilityAnalysis: {
          ratio: stabilityRatio,
          level: stabilityScore.level,
          points: stabilityScore.points
        },
        tenureAnalysis: {
          years: tenure,
          level: tenureScore.level,
          points: tenureScore.points
        },
        customerType: isETB ? 'ETB' : 'NTB',
        riskProfile: this.getRiskProfile(finalScore)
      }
    };
  }

  /**
   * Get risk profile based on score
   */
  private getRiskProfile(score: number): string {
    if (score >= 80) return 'LOW_RISK';
    if (score >= 60) return 'MEDIUM_RISK';
    if (score >= 40) return 'HIGH_RISK';
    return 'VERY_HIGH_RISK';
  }

  /**
   * Get weight for this module in final calculation
   */
  public getWeight(): number {
    return 0.10; // 10%
  }

  /**
   * Get module information
   */
  public getModuleInfo() {
    return {
      name: 'Income Module',
      description: 'Handles financial capacity and stability assessment',
      weight: this.getWeight(),
      team: 'Financial Analysis & Income Verification',
      criticalFailure: false
    };
  }

  /**
   * Validate income input data
   */
  public validateInput(input: IncomeInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const netIncome = parseFloat(String(input.total_income || input.net_monthly_income || input.netMonthlyIncome || 0));
    const grossIncome = parseFloat(String(input.gross_monthly_income || input.grossMonthlySalary || 0));
    
    if (netIncome <= 0) {
      errors.push('Net monthly income must be greater than 0');
    }

    if (grossIncome > 0 && netIncome > grossIncome) {
      errors.push('Net income cannot be greater than gross income');
    }

    if (!input.employment_type) {
      errors.push('Employment type is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get supported employment types and their thresholds
   */
  public getSupportedEmploymentTypes(): Array<{
    type: string;
    etbThreshold: { salaryTransfer: number; nonSalaryTransfer: number };
    ntbThreshold: { salaryTransfer: number; nonSalaryTransfer: number };
    description: string;
  }> {
    return [
      {
        type: 'Permanent/Employed',
        etbThreshold: { salaryTransfer: 40000, nonSalaryTransfer: 45000 },
        ntbThreshold: { salaryTransfer: 45000, nonSalaryTransfer: 50000 },
        description: 'Regular permanent employees'
      },
      {
        type: 'Contractual',
        etbThreshold: { salaryTransfer: 60000, nonSalaryTransfer: 65000 },
        ntbThreshold: { salaryTransfer: 65000, nonSalaryTransfer: 70000 },
        description: 'Contract-based employees'
      },
      {
        type: 'Self-Employed/Business',
        etbThreshold: { salaryTransfer: 100000, nonSalaryTransfer: 100000 },
        ntbThreshold: { salaryTransfer: 120000, nonSalaryTransfer: 120000 },
        description: 'Business owners and self-employed individuals'
      },
      {
        type: 'Probation',
        etbThreshold: { salaryTransfer: 0, nonSalaryTransfer: 0 },
        ntbThreshold: { salaryTransfer: 0, nonSalaryTransfer: 0 },
        description: 'Employees on probation period'
      }
    ];
  }
}
