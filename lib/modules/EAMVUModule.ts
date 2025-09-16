/**
 * EAMVU (External Asset Management & Verification Unit) Module
 * Handles asset verification status
 * 
 * Team: Asset Verification & Documentation
 * Responsibility: EAMVU submission validation and scoring
 */

export interface EAMVUInput {
  eavmu_submitted?: boolean | string;
}

export interface EAMVUResult {
  score: number;
  submitted: boolean;
  notes: string[];
  details: {
    submissionStatus: string;
    verificationLevel: string;
    complianceStatus: string;
  };
}

export default class EAMVUModule {
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
   * Calculate EAMVU score based on submission status
   * EXACT logic from original Deceng.js
   */
  public calculate(input: EAMVUInput): EAMVUResult {
    console.log('='.repeat(80));
    console.log('📋 EAMVU MODULE CALCULATION');
    console.log('='.repeat(80));
    console.log('📥 INPUTS:');
    console.log('  • EAMVU Submitted:', input.eavmu_submitted, '(type:', typeof input.eavmu_submitted, ')');

    const submitted = this.asBool(input.eavmu_submitted);

    console.log('🔍 PROCESSING:');
    console.log('  • EAMVU Submitted (boolean):', submitted);

    const score = submitted ? 100 : 0;

    console.log('📊 CALCULATION:');
    console.log('  • Score Logic: submitted ? 100 : 0');

    console.log('📤 OUTPUTS:');
    console.log('  • Final Score:', score, '/100');
    console.log('  • Status:', submitted ? 'SUBMITTED' : 'NOT SUBMITTED');
    console.log('='.repeat(80));

    return {
      score,
      submitted,
      notes: submitted 
        ? ['EAMVU Submitted - Full score'] 
        : ['EAMVU Not Submitted - Zero score'],
      details: {
        submissionStatus: submitted ? 'SUBMITTED' : 'NOT_SUBMITTED',
        verificationLevel: submitted ? 'VERIFIED' : 'UNVERIFIED',
        complianceStatus: submitted ? 'COMPLIANT' : 'NON_COMPLIANT'
      }
    };
  }

  /**
   * Check if EAMVU submission is required
   */
  public isSubmissionRequired(): boolean {
    return true; // EAMVU submission is always required for full score
  }

  /**
   * Get weight for this module in final calculation
   */
  public getWeight(): number {
    return 0.05; // 5%
  }

  /**
   * Get module information
   */
  public getModuleInfo() {
    return {
      name: 'EAMVU (External Asset Management & Verification Unit)',
      description: 'Handles asset verification status',
      weight: this.getWeight(),
      team: 'Asset Verification & Documentation',
      criticalFailure: false
    };
  }

  /**
   * Validate EAMVU input data
   */
  public validateInput(input: EAMVUInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (input.eavmu_submitted === undefined || input.eavmu_submitted === null) {
      errors.push('EAMVU submission status is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
