/**
 * SPU (Special Purpose Unit) Module
 * Handles blacklist and negative list checks
 * 
 * Team: Security & Risk Assessment
 * Responsibility: Blacklist validation, negative list checks, credit card 30k checks
 */

export interface SPUInput {
  spu_black_list_check?: boolean | string;
  spu_credit_card_30k_check?: boolean | string;
  spu_negative_list_check?: boolean | string;
}

export interface SPUResult {
  score: number;
  anyHit: boolean;
  blackListHit: boolean;
  cc30kHit: boolean;
  negativeHit: boolean;
  notes: string[];
  details: {
    blackListStatus: string;
    creditCard30kStatus: string;
    negativeListStatus: string;
    overallStatus: string;
  };
}

export default class SPUModule {
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
   * Calculate SPU score based on blacklist checks
   * EXACT logic from original Deceng.js
   */
  public calculate(input: SPUInput): SPUResult {
    console.log('='.repeat(80));
    console.log('🚨 SPU MODULE CALCULATION');
    console.log('='.repeat(80));
    console.log('📥 INPUTS:');
    console.log('  • SPU Black List Check:', input.spu_black_list_check, '(type:', typeof input.spu_black_list_check, ')');
    console.log('  • SPU Credit Card 30k Check:', input.spu_credit_card_30k_check, '(type:', typeof input.spu_credit_card_30k_check, ')');
    console.log('  • SPU Negative List Check:', input.spu_negative_list_check, '(type:', typeof input.spu_negative_list_check, ')');

    const blackListHit = this.asBool(input.spu_black_list_check);
    const cc30kHit = this.asBool(input.spu_credit_card_30k_check);
    const negativeHit = this.asBool(input.spu_negative_list_check);

    console.log('🔍 PROCESSING:');
    console.log('  • Black List Hit:', blackListHit);
    console.log('  • Credit Card 30k Hit:', cc30kHit);
    console.log('  • Negative List Hit:', negativeHit);

    const anyHit = blackListHit || cc30kHit || negativeHit;

    console.log('📊 CALCULATION:');
    console.log('  • Any Hit:', anyHit);

    const score = anyHit ? 0 : 100;

    console.log('📤 OUTPUTS:');
    console.log('  • Final Score:', score, '/100');
    if (anyHit) {
      console.log('  • Status: CRITICAL HIT - AUTOMATIC FAIL');
    } else {
      console.log('  • Status: CLEAN');
    }
    console.log('='.repeat(80));

    return {
      score,
      anyHit,
      blackListHit,
      cc30kHit,
      negativeHit,
      notes: anyHit 
        ? [`SPU Critical Hit: ${[blackListHit && 'BlackList', cc30kHit && 'CreditCard30k', negativeHit && 'NegativeList'].filter(Boolean).join(', ')}`]
        : ['SPU Clean - No hits detected'],
      details: {
        blackListStatus: blackListHit ? 'HIT' : 'CLEAN',
        creditCard30kStatus: cc30kHit ? 'HIT' : 'CLEAN',
        negativeListStatus: negativeHit ? 'HIT' : 'CLEAN',
        overallStatus: anyHit ? 'CRITICAL_HIT' : 'CLEAN'
      }
    };
  }

  /**
   * Check if SPU result is a critical failure
   */
  public isCriticalFailure(result: SPUResult): boolean {
    return result.anyHit;
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
      name: 'SPU (Special Purpose Unit)',
      description: 'Handles blacklist and negative list checks',
      weight: this.getWeight(),
      team: 'Security & Risk Assessment',
      criticalFailure: true
    };
  }
}
