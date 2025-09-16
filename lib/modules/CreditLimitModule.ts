/**
 * Credit Limit Assignment Module
 * Handles credit limit assignment based on DBR, income, and SBP regulatory caps
 * 
 * Team: Credit Risk & Limit Management
 * Responsibility: Credit limit calculation, card type assignment, SBP compliance
 */

export interface CreditLimitInput {
  // Application data
  net_monthly_income: number;
  gross_monthly_income: number;
  proposed_loan_amount?: number;
  amount_requested?: number;
  
  // DBR data
  dbrPercentage: number;
  dbrScore: number;
  
  // Customer type
  is_ubl_customer: boolean;
  customerType: 'NTB' | 'ETB';
  
  // Employment data
  employment_type: string;
  salary_transfer_flag: boolean;
  
  // eCIB exposure data
  total_exposure?: number;
  unsecured_exposure?: number;
  credit_card_exposure?: number;
  personal_loan_exposure?: number;
  
  // Special segments
  is_pensioner?: boolean;
  is_remittance_customer?: boolean;
  is_cross_sell?: boolean;
  is_mvc?: boolean; // Most Valued Customer
  
  // Income verification
  income_verified?: boolean;
  bank_statement_verified?: boolean;
}

export interface CreditLimitResult {
  score: number;
  assignedLimit: number;
  cardType: 'SILVER' | 'GOLD' | 'PLATINUM';
  decision: 'APPROVE' | 'CAP' | 'DECLINE';
  reason: string;
  notes: string[];
  details: {
    incomeBasedLimit: number;
    dbrBasedLimit: number;
    regulatoryCap: number;
    finalLimit: number;
    cardTypeReason: string;
    sbpCompliance: {
      totalExposureWithinLimit: boolean;
      unsecuredExposureWithinLimit: boolean;
      cardTypeEligible: boolean;
    };
    specialSegmentEligibility: {
      isPensioner: boolean;
      isRemittance: boolean;
      isCrossSell: boolean;
      isMVC: boolean;
    };
  };
}

export default class CreditLimitModule {
  // Card type ranges as per framework
  private readonly CARD_TYPE_RANGES = {
    SILVER: { min: 25000, max: 125000 },
    GOLD: { min: 125001, max: 299999 },
    PLATINUM: { min: 300000, max: 7000000 }
  };

  // SBP regulatory caps
  private readonly SBP_CAPS = {
    TOTAL_EXPOSURE: 7000000,
    UNSECURED_EXPOSURE: 3000000,
    AGGREGATE_CC_PL_CL: 3000000
  };

  /**
   * Calculate credit limit based on framework rules
   */
  public calculate(input: CreditLimitInput): CreditLimitResult {
    console.log('='.repeat(80));
    console.log('💳 CREDIT LIMIT ASSIGNMENT CALCULATION');
    console.log('='.repeat(80));
    console.log('📥 INPUTS:');
    console.log('  • Net Monthly Income:', input.net_monthly_income);
    console.log('  • DBR Percentage:', input.dbrPercentage);
    console.log('  • Customer Type:', input.customerType);
    console.log('  • Employment Type:', input.employment_type);

    const notes: string[] = [];
    let decision: 'APPROVE' | 'CAP' | 'DECLINE' = 'APPROVE';
    let reason = '';

    // 1. Calculate income-based limit
    const incomeBasedLimit = this.calculateIncomeBasedLimit(input);
    notes.push(`Income-based limit: PKR ${incomeBasedLimit.toLocaleString()}`);

    // 2. Calculate DBR-based limit
    const dbrBasedLimit = this.calculateDBRBasedLimit(input);
    notes.push(`DBR-based limit: PKR ${dbrBasedLimit.toLocaleString()}`);

    // 3. Apply regulatory caps
    const regulatoryCap = this.calculateRegulatoryCap(input);
    notes.push(`Regulatory cap: PKR ${regulatoryCap.toLocaleString()}`);

    // 4. Determine final limit (minimum of all constraints)
    const finalLimit = Math.min(incomeBasedLimit, dbrBasedLimit, regulatoryCap);
    notes.push(`Final calculated limit: PKR ${finalLimit.toLocaleString()}`);

    // 5. Determine card type
    const cardType = this.determineCardType(finalLimit);
    const cardTypeReason = this.getCardTypeReason(cardType, finalLimit);
    notes.push(`Card type: ${cardType} (${cardTypeReason})`);

    // 6. Check SBP compliance
    const sbbCompliance = this.checkSBPCompliance(input, finalLimit);
    if (!sbbCompliance.totalExposureWithinLimit) {
      decision = 'CAP';
      reason = 'Total exposure exceeds SBP limit';
      notes.push('⚠️ CAP: Total exposure exceeds PKR 7M limit');
    } else if (!sbbCompliance.unsecuredExposureWithinLimit) {
      decision = 'CAP';
      reason = 'Unsecured exposure exceeds SBP limit';
      notes.push('⚠️ CAP: Unsecured exposure exceeds PKR 3M limit');
    } else if (!sbbCompliance.cardTypeEligible) {
      decision = 'CAP';
      reason = 'Card type not eligible for customer profile';
      notes.push('⚠️ CAP: Card type not eligible');
    }

    // 7. Check special segment eligibility
    const specialSegmentEligibility = this.checkSpecialSegmentEligibility(input);
    if (specialSegmentEligibility.isPensioner) {
      notes.push('Special segment: Pensioner customer');
    }
    if (specialSegmentEligibility.isRemittance) {
      notes.push('Special segment: Foreign remittance customer');
    }
    if (specialSegmentEligibility.isCrossSell) {
      notes.push('Special segment: Cross-sell customer');
    }
    if (specialSegmentEligibility.isMVC) {
      notes.push('Special segment: Most Valued Customer');
    }

    // 8. Calculate score based on limit assignment
    const score = this.calculateScore(finalLimit, cardType, decision);

    console.log('📊 CALCULATION:');
    console.log('  • Income-based Limit:', incomeBasedLimit);
    console.log('  • DBR-based Limit:', dbrBasedLimit);
    console.log('  • Regulatory Cap:', regulatoryCap);
    console.log('  • Final Limit:', finalLimit);
    console.log('  • Card Type:', cardType);
    console.log('  • Decision:', decision);
    console.log('  • Score:', score, '/100');

    console.log('📤 OUTPUTS:');
    console.log('  • Assigned Limit: PKR', finalLimit.toLocaleString());
    console.log('  • Card Type:', cardType);
    console.log('  • Decision:', decision);
    console.log('='.repeat(80));

    return {
      score,
      assignedLimit: finalLimit,
      cardType,
      decision,
      reason,
      notes,
      details: {
        incomeBasedLimit,
        dbrBasedLimit,
        regulatoryCap,
        finalLimit,
        cardTypeReason,
        sbpCompliance: sbbCompliance,
        specialSegmentEligibility
      }
    };
  }

  /**
   * Calculate income-based limit using framework multiples
   */
  private calculateIncomeBasedLimit(input: CreditLimitInput): number {
    const netIncome = input.net_monthly_income;
    const isETB = input.customerType === 'ETB';
    const employmentType = input.employment_type;
    const salaryTransferFlag = input.salary_transfer_flag;

    // Framework multiples based on income brackets
    let multiple = 0;

    if (netIncome < 20000) {
      multiple = isETB ? 2.5 : 2.0;
    } else if (netIncome < 50000) {
      multiple = isETB ? 3.0 : 2.5;
    } else if (netIncome < 100000) {
      multiple = isETB ? 3.5 : 2.75;
    } else if (netIncome < 150000) {
      multiple = isETB ? 4.0 : 3.25;
    } else {
      multiple = isETB ? 5.0 : 3.75;
    }

    // Adjust for employment type and salary transfer
    if (employmentType === 'self_employed') {
      multiple = isETB ? 2.75 : 2.5;
    } else if (employmentType === 'contractual') {
      multiple *= 0.9; // 10% reduction for contractual
    }

    if (salaryTransferFlag) {
      multiple *= 1.1; // 10% increase for salary transfer
    }

    // Special segment adjustments
    if (input.is_pensioner) {
      multiple = 2.0; // Conservative for pensioners
    } else if (input.is_remittance_customer) {
      multiple = isETB ? 1.0 : 0.8; // Lower for remittance customers
    } else if (input.is_mvc) {
      multiple = Math.min(multiple * 1.2, 4.5); // MVC gets up to 4.5x
    }

    return Math.round(netIncome * multiple);
  }

  /**
   * Calculate DBR-based limit
   */
  private calculateDBRBasedLimit(input: CreditLimitInput): number {
    const netIncome = input.net_monthly_income;
    const dbrPercentage = input.dbrPercentage;

    // Calculate residual income after DBR
    const maxDBR = 0.40; // 40% maximum DBR
    const availableIncome = netIncome * (1 - maxDBR);
    
    // Calculate limit based on available income (assuming 5% of limit as monthly obligation)
    const limitFromAvailableIncome = availableIncome / 0.05;
    
    return Math.round(limitFromAvailableIncome);
  }

  /**
   * Calculate regulatory cap based on SBP limits
   */
  private calculateRegulatoryCap(input: CreditLimitInput): number {
    const totalExposure = input.total_exposure || 0;
    const unsecuredExposure = input.unsecured_exposure || 0;
    const creditCardExposure = input.credit_card_exposure || 0;
    const personalLoanExposure = input.personal_loan_exposure || 0;

    // Calculate remaining capacity
    const remainingTotalCapacity = this.SBP_CAPS.TOTAL_EXPOSURE - totalExposure;
    const remainingUnsecuredCapacity = this.SBP_CAPS.UNSECURED_EXPOSURE - unsecuredExposure;
    const remainingCCPLCapacity = this.SBP_CAPS.AGGREGATE_CC_PL_CL - (creditCardExposure + personalLoanExposure);

    // Return the most restrictive cap
    return Math.min(remainingTotalCapacity, remainingUnsecuredCapacity, remainingCCPLCapacity);
  }

  /**
   * Determine card type based on limit
   */
  private determineCardType(limit: number): 'SILVER' | 'GOLD' | 'PLATINUM' {
    if (limit >= this.CARD_TYPE_RANGES.PLATINUM.min) {
      return 'PLATINUM';
    } else if (limit >= this.CARD_TYPE_RANGES.GOLD.min) {
      return 'GOLD';
    } else {
      return 'SILVER';
    }
  }

  /**
   * Get card type reason
   */
  private getCardTypeReason(cardType: string, limit: number): string {
    const range = this.CARD_TYPE_RANGES[cardType as keyof typeof this.CARD_TYPE_RANGES];
    return `PKR ${range.min.toLocaleString()} - ${range.max.toLocaleString()}`;
  }

  /**
   * Check SBP compliance
   */
  private checkSBPCompliance(input: CreditLimitInput, proposedLimit: number): any {
    const totalExposure = (input.total_exposure || 0) + proposedLimit;
    const unsecuredExposure = (input.unsecured_exposure || 0) + proposedLimit;
    const creditCardExposure = (input.credit_card_exposure || 0) + proposedLimit;

    return {
      totalExposureWithinLimit: totalExposure <= this.SBP_CAPS.TOTAL_EXPOSURE,
      unsecuredExposureWithinLimit: unsecuredExposure <= this.SBP_CAPS.UNSECURED_EXPOSURE,
      cardTypeEligible: this.isCardTypeEligible(input, proposedLimit)
    };
  }

  /**
   * Check if card type is eligible for customer profile
   */
  private isCardTypeEligible(input: CreditLimitInput, limit: number): boolean {
    // Platinum cards only for new acquisitions or special segments
    if (limit >= this.CARD_TYPE_RANGES.PLATINUM.min) {
      return input.customerType === 'NTB' || 
             input.is_cross_sell || 
             input.is_mvc || 
             input.is_remittance_customer;
    }
    return true;
  }

  /**
   * Check special segment eligibility
   */
  private checkSpecialSegmentEligibility(input: CreditLimitInput): any {
    return {
      isPensioner: input.is_pensioner || false,
      isRemittance: input.is_remittance_customer || false,
      isCrossSell: input.is_cross_sell || false,
      isMVC: input.is_mvc || false
    };
  }

  /**
   * Calculate score based on limit assignment
   */
  private calculateScore(limit: number, cardType: string, decision: string): number {
    if (decision === 'DECLINE') return 0;
    if (decision === 'CAP') return 50;
    
    // Score based on card type and limit
    const baseScore = cardType === 'PLATINUM' ? 100 : cardType === 'GOLD' ? 80 : 60;
    
    // Adjust based on limit within range
    const range = this.CARD_TYPE_RANGES[cardType as keyof typeof this.CARD_TYPE_RANGES];
    const limitRatio = (limit - range.min) / (range.max - range.min);
    const adjustedScore = baseScore + (limitRatio * 20);
    
    return Math.round(Math.min(adjustedScore, 100));
  }
}
