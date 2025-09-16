/**
 * Behavioral Scorecard Module
 * Handles CBS-based behavioral scoring for ETB customers
 * 
 * Team: Behavioral Analytics & Credit History
 * Responsibility: CBS data analysis, behavioral patterns, credit history scoring (ETB only)
 */

export interface BehavioralScoreInput {
  // CBS/ECIB Data
  bad_counts_industry?: number;
  bad_counts_ubl?: number;
  dpd_30_plus?: number;
  dpd_60_plus?: number;
  defaults_12m?: number;
  late_payments?: number;
  average_deposit_balance?: number;
  partial_payments?: number;
  credit_utilization_ratio?: number;
  
  // Customer type
  is_ubl_customer?: boolean | string;
}

export interface BehavioralScoreResult {
  score: number;
  isETB: boolean;
  breakdown: {
    bad_counts_industry: number;
    bad_counts_ubl: number;
    dpd_30_plus: number;
    dpd_60_plus: number;
    defaults_12m: number;
    late_payments: number;
    avg_deposit_balance: number;
    partial_payments: number;
    credit_utilization: number;
  };
  notes: string[];
  details: {
    customerType: string;
    applicabilityReason: string;
    totalComponents: number;
    scoringMethod: string;
  };
}

export default class BehavioralScoreModule {
  private weights = {
    bad_counts_industry: 0.15,        // 15%
    bad_counts_ubl: 0.15,             // 15%
    dpd_30_plus: 0.12,                // 12%
    dpd_60_plus: 0.12,                // 12%
    defaults_12m: 0.10,               // 10%
    late_payments: 0.08,              // 8%
    avg_deposit_balance: 0.10,        // 10%
    partial_payments: 0.08,           // 8%
    credit_utilization: 0.10          // 10%
  };

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
   * Calculate bad counts industry score
   */
  private calculateBadCountsIndustryScore(badCounts: number): number {
    if (badCounts === 0) return 100;
    if (badCounts <= 1) return 80;
    if (badCounts <= 3) return 60;
    if (badCounts <= 5) return 40;
    if (badCounts <= 10) return 20;
    return 0; // More than 10
  }

  /**
   * Calculate bad counts UBL score
   */
  private calculateBadCountsUBLScore(badCounts: number): number {
    if (badCounts === 0) return 100;
    if (badCounts <= 1) return 75;
    if (badCounts <= 2) return 50;
    if (badCounts <= 4) return 25;
    return 0; // More than 4
  }

  /**
   * Calculate DPD 30+ score
   */
  private calculateDPD30Score(dpd30: number): number {
    if (dpd30 === 0) return 100;
    if (dpd30 <= 2) return 80;
    if (dpd30 <= 5) return 60;
    if (dpd30 <= 10) return 40;
    if (dpd30 <= 20) return 20;
    return 0; // More than 20
  }

  /**
   * Calculate DPD 60+ score
   */
  private calculateDPD60Score(dpd60: number): number {
    if (dpd60 === 0) return 100;
    if (dpd60 <= 1) return 70;
    if (dpd60 <= 3) return 50;
    if (dpd60 <= 6) return 30;
    if (dpd60 <= 12) return 10;
    return 0; // More than 12
  }

  /**
   * Calculate defaults 12M score
   */
  private calculateDefaults12MScore(defaults: number): number {
    if (defaults === 0) return 100;
    if (defaults <= 1) return 60;
    if (defaults <= 2) return 30;
    if (defaults <= 4) return 10;
    return 0; // More than 4
  }

  /**
   * Calculate late payments score
   */
  private calculateLatePaymentsScore(latePayments: number): number {
    if (latePayments === 0) return 100;
    if (latePayments <= 3) return 85;
    if (latePayments <= 6) return 70;
    if (latePayments <= 12) return 55;
    if (latePayments <= 24) return 40;
    if (latePayments <= 36) return 25;
    return 10; // More than 36
  }

  /**
   * Calculate average deposit balance score
   */
  private calculateAvgDepositBalanceScore(avgBalance: number): number {
    if (avgBalance >= 2000000) return 100;
    if (avgBalance >= 1000000) return 90;
    if (avgBalance >= 500000) return 80;
    if (avgBalance >= 250000) return 70;
    if (avgBalance >= 100000) return 60;
    if (avgBalance >= 50000) return 50;
    if (avgBalance >= 25000) return 40;
    if (avgBalance >= 10000) return 30;
    if (avgBalance >= 5000) return 20;
    return 10; // Less than 5000
  }

  /**
   * Calculate partial payments score
   */
  private calculatePartialPaymentsScore(partialPayments: number): number {
    if (partialPayments === 0) return 100;
    if (partialPayments <= 2) return 80;
    if (partialPayments <= 5) return 60;
    if (partialPayments <= 10) return 40;
    if (partialPayments <= 20) return 20;
    return 0; // More than 20
  }

  /**
   * Calculate credit utilization score
   */
  private calculateCreditUtilizationScore(utilization: number): number {
    if (utilization <= 0.1) return 100;  // 10% or less
    if (utilization <= 0.2) return 90;   // 20% or less
    if (utilization <= 0.3) return 80;   // 30% or less
    if (utilization <= 0.4) return 70;   // 40% or less
    if (utilization <= 0.5) return 60;   // 50% or less
    if (utilization <= 0.6) return 50;   // 60% or less
    if (utilization <= 0.7) return 40;   // 70% or less
    if (utilization <= 0.8) return 30;   // 80% or less
    if (utilization <= 0.9) return 20;   // 90% or less
    if (utilization <= 1.0) return 10;   // 100% or less
    return 0; // Over 100%
  }

  /**
   * Calculate Behavioral Score based on CBS data (ETB customers only)
   * EXACT logic from original BehavioralScore.js
   */
  public calculate(input: BehavioralScoreInput): BehavioralScoreResult {
    console.log('='.repeat(80));
    console.log('📊 BEHAVIORAL SCORECARD CALCULATION');
    console.log('='.repeat(80));
    console.log('📥 INPUTS:');
    console.log('  • CBS Data Available:', Object.keys(input).length, 'fields');
    console.log('  • Is UBL Customer:', input.is_ubl_customer);

    const isETB = this.asBool(input.is_ubl_customer);

    console.log('🔍 PROCESSING:');
    console.log('  • Customer Type:', isETB ? 'ETB (Existing-to-Bank)' : 'NTB (New-to-Bank)');

    // Return 0 score for NTB customers
    if (!isETB) {
      console.log('📤 OUTPUTS:');
      console.log('  • Final Score: 0/100 (NTB Customer)');
      console.log('  • Notes: ["Behavioral scoring only for ETB customers"]');
      console.log('='.repeat(80));
      
      return {
        score: 0,
        isETB: false,
        breakdown: {
          bad_counts_industry: 0,
          bad_counts_ubl: 0,
          dpd_30_plus: 0,
          dpd_60_plus: 0,
          defaults_12m: 0,
          late_payments: 0,
          avg_deposit_balance: 0,
          partial_payments: 0,
          credit_utilization: 0
        },
        notes: ['Behavioral scoring only for ETB customers'],
        details: {
          customerType: 'NTB',
          applicabilityReason: 'Behavioral scoring not applicable for New-to-Bank customers',
          totalComponents: 0,
          scoringMethod: 'NOT_APPLICABLE'
        }
      };
    }

    // Calculate individual component scores for ETB customers
    const breakdown = {
      bad_counts_industry: this.calculateBadCountsIndustryScore(input.bad_counts_industry || 0),
      bad_counts_ubl: this.calculateBadCountsUBLScore(input.bad_counts_ubl || 0),
      dpd_30_plus: this.calculateDPD30Score(input.dpd_30_plus || 0),
      dpd_60_plus: this.calculateDPD60Score(input.dpd_60_plus || 0),
      defaults_12m: this.calculateDefaults12MScore(input.defaults_12m || 0),
      late_payments: this.calculateLatePaymentsScore(input.late_payments || 0),
      avg_deposit_balance: this.calculateAvgDepositBalanceScore(input.average_deposit_balance || 0),
      partial_payments: this.calculatePartialPaymentsScore(input.partial_payments || 0),
      credit_utilization: this.calculateCreditUtilizationScore(input.credit_utilization_ratio || 0)
    };

    // Calculate weighted final score
    let totalScore = 0;
    const notes: string[] = [];

    console.log('📊 COMPONENT SCORING:');
    for (const [component, score] of Object.entries(breakdown)) {
      const weight = this.weights[component as keyof typeof this.weights];
      const weightedScore = score * weight;
      totalScore += weightedScore;
      
      console.log(`  • ${component}: ${score}/100 × ${(weight * 100).toFixed(1)}% = ${weightedScore.toFixed(2)}`);
      notes.push(`${component}: ${score}/100 (weight: ${(weight * 100).toFixed(1)}%)`);
    }

    const finalScore = Math.round(totalScore);

    console.log('📊 WEIGHTED CALCULATION:');
    console.log(`  • Total Score: ${finalScore}/100`);
    console.log(`  • Customer Type: ETB`);
    console.log('📤 OUTPUTS:');
    console.log(`  • Final Score: ${finalScore}/100`);
    console.log('='.repeat(80));

    return {
      score: finalScore,
      isETB: true,
      breakdown,
      notes,
      details: {
        customerType: 'ETB',
        applicabilityReason: 'Full behavioral scoring applied for Existing-to-Bank customers',
        totalComponents: Object.keys(breakdown).length,
        scoringMethod: 'WEIGHTED_CBS_COMPONENTS'
      }
    };
  }

  /**
   * Check if behavioral scoring applies to this customer
   */
  public isApplicable(isETB: boolean): boolean {
    return isETB;
  }

  /**
   * Get weight for this module in final calculation
   */
  public getWeight(): number {
    return 0.05; // 5% (only for ETB customers)
  }

  /**
   * Get module information
   */
  public getModuleInfo() {
    return {
      name: 'Behavioral Scorecard Module',
      description: 'Handles CBS-based behavioral scoring for ETB customers',
      weight: '5% (ETB only)',
      team: 'Behavioral Analytics & Credit History',
      criticalFailure: false
    };
  }

  /**
   * Validate behavioral score input data
   */
  public validateInput(input: BehavioralScoreInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const isETB = this.asBool(input.is_ubl_customer);
    
    if (isETB) {
      // For ETB customers, CBS data is expected
      if (input.average_deposit_balance === undefined) {
        errors.push('Average deposit balance is required for ETB customers');
      }
      
      if (input.credit_utilization_ratio !== undefined && 
          (input.credit_utilization_ratio < 0 || input.credit_utilization_ratio > 2)) {
        errors.push('Credit utilization ratio should be between 0 and 2 (0-200%)');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get scoring components information
   */
  public getScoringComponents(): Array<{component: string, weight: number, description: string}> {
    return Object.entries(this.weights).map(([component, weight]) => ({
      component,
      weight: weight * 100,
      description: this.getComponentDescription(component)
    }));
  }

  private getComponentDescription(component: string): string {
    const descriptions: {[key: string]: string} = {
      bad_counts_industry: 'Bad accounts count in industry',
      bad_counts_ubl: 'Bad accounts count with UBL',
      dpd_30_plus: 'Days past due 30+ occurrences',
      dpd_60_plus: 'Days past due 60+ occurrences',
      defaults_12m: 'Defaults in last 12 months',
      late_payments: 'Total late payment instances',
      avg_deposit_balance: 'Average deposit balance maintained',
      partial_payments: 'Partial payment instances',
      credit_utilization: 'Credit utilization ratio'
    };
    return descriptions[component] || 'Unknown component';
  }

  /**
   * Get behavioral risk assessment
   */
  public getRiskAssessment(result: BehavioralScoreResult): string {
    if (!result.isETB) return 'N/A (NTB Customer)';
    
    if (result.score >= 90) return 'EXCELLENT';
    if (result.score >= 80) return 'VERY_GOOD';
    if (result.score >= 70) return 'GOOD';
    if (result.score >= 60) return 'FAIR';
    if (result.score >= 50) return 'POOR';
    return 'VERY_POOR';
  }
}
