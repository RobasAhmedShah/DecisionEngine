/**
 * Special Segments Module
 * Implements cross-sell, pensioner, foreign remittance, and MVC policies
 * 
 * Team: Credit Risk & Product Management
 * Responsibility: Special segment policies, cross-sell rules, remittance handling
 */

export interface SpecialSegmentsInput {
  // Basic application data
  cnic: string;
  full_name: string;
  date_of_birth: string;
  
  // Customer type
  is_ubl_customer: boolean;
  customerType: 'ETB' | 'NTB';
  
  // Income data
  net_monthly_income: number;
  gross_monthly_income: number;
  
  // Special segment flags
  is_pensioner: boolean;
  is_remittance_customer: boolean;
  is_cross_sell: boolean;
  is_mvc: boolean; // Most Valued Customer
  
  // Cross-sell specific
  has_auto_loan: boolean;
  has_mortgage_loan: boolean;
  loan_disbursement_date: string; // YYYY-MM-DD format
  vehicle_tracker_status: 'ACTIVE' | 'INACTIVE' | 'NONE';
  late_payments_count: number;
  fresh_ecib_required: boolean;
  address_changed: boolean;
  is_deviation_account: boolean;
  is_islamic_poa: boolean;
  asset_in_use: boolean; // For mortgage cross-sell
  
  // Pensioner specific
  pension_income: number;
  pension_credits_count: number;
  credit_shield_insurance: boolean;
  pension_book_provided: boolean;
  
  // Remittance specific
  remittance_source: 'WESTERN_UNION' | 'ZARCO' | 'SAMBA' | 'OTHER';
  blood_relative_proof: boolean;
  remittance_amount_12m: number;
  remittance_entries_count: number;
  last_remittance_date: string; // YYYY-MM-DD format
  relationship_proof_provided: boolean;
  
  // MVC specific
  business_duration_months: number;
  average_balance: number;
  credits_last_6m: number;
  kyc_mismatch: boolean;
  branch_manager_endorsement: boolean;
}

export interface SpecialSegmentsResult {
  score: number;
  decision: 'APPROVE' | 'CONDITIONAL' | 'DECLINE';
  reason: string;
  notes: string[];
  segmentType: 'CROSS_SELL' | 'PENSIONER' | 'REMITTANCE' | 'MVC' | 'STANDARD';
  eligibility: {
    crossSell: boolean;
    pensioner: boolean;
    remittance: boolean;
    mvc: boolean;
  };
  benefits: {
    dbrCap: number | null;
    maxLimit: number | null;
    verificationWaivers: string[];
    documentationWaivers: string[];
  };
  details: {
    crossSellAnalysis: any;
    pensionerAnalysis: any;
    remittanceAnalysis: any;
    mvcAnalysis: any;
  };
}

export default class SpecialSegmentsModule {
  // Cross-sell eligibility criteria
  private readonly CROSS_SELL_CRITERIA = {
    MAX_LOAN_AGE_MONTHS: 6,
    MAX_LATE_PAYMENTS: 1,
    MIN_CREDITS_6M: 2
  };

  // Pensioner criteria
  private readonly PENSIONER_CRITERIA = {
    MIN_PENSION_INCOME: 40000, // Same as govt/armed forces
    MIN_PENSION_CREDITS: 6,
    REQUIRED_INSURANCE: true
  };

  // Remittance criteria
  private readonly REMITTANCE_CRITERIA = {
    MIN_MONTHLY_INCOME: 100000,
    MIN_ENTRIES_12M: 6,
    MAX_LIMIT_NTB: 250000,
    MAX_LIMIT_ETB_CLEAN: 500000
  };

  // MVC criteria
  private readonly MVC_CRITERIA = {
    MIN_BUSINESS_DURATION: 6,
    MIN_AVERAGE_BALANCE: 500000,
    MIN_CREDITS_6M: 2,
    DBR_CAP: 40,
    MAX_LIMIT_MULTIPLIER: 4.5
  };

  /**
   * Calculate special segment eligibility and benefits
   */
  public calculate(input: SpecialSegmentsInput): SpecialSegmentsResult {
    console.log('='.repeat(80));
    console.log('🌟 SPECIAL SEGMENTS CALCULATION');
    console.log('='.repeat(80));
    console.log('📥 INPUTS:');
    console.log('  • Customer Type:', input.customerType);
    console.log('  • Net Income:', input.net_monthly_income);
    console.log('  • Cross-sell:', input.is_cross_sell);
    console.log('  • Pensioner:', input.is_pensioner);
    console.log('  • Remittance:', input.is_remittance_customer);
    console.log('  • MVC:', input.is_mvc);

    const notes: string[] = [];
    let score = 0;
    let decision: 'APPROVE' | 'CONDITIONAL' | 'DECLINE' = 'APPROVE';
    let reason = '';
    let segmentType: 'CROSS_SELL' | 'PENSIONER' | 'REMITTANCE' | 'MVC' | 'STANDARD' = 'STANDARD';

    // Analyze each special segment
    const crossSellAnalysis = this.analyzeCrossSell(input);
    const pensionerAnalysis = this.analyzePensioner(input);
    const remittanceAnalysis = this.analyzeRemittance(input);
    const mvcAnalysis = this.analyzeMVC(input);

    // Determine primary segment
    if (crossSellAnalysis.eligible) {
      segmentType = 'CROSS_SELL';
      score += 20;
      notes.push('Cross-sell customer - bonus points applied');
    }
    if (pensionerAnalysis.eligible) {
      segmentType = 'PENSIONER';
      score += 15;
      notes.push('Pensioner customer - special benefits applied');
    }
    if (remittanceAnalysis.eligible) {
      segmentType = 'REMITTANCE';
      score += 15;
      notes.push('Remittance customer - special benefits applied');
    }
    if (mvcAnalysis.eligible) {
      segmentType = 'MVC';
      score += 25;
      notes.push('MVC customer - premium benefits applied');
    }

    // Calculate eligibility
    const eligibility = {
      crossSell: crossSellAnalysis.eligible,
      pensioner: pensionerAnalysis.eligible,
      remittance: remittanceAnalysis.eligible,
      mvc: mvcAnalysis.eligible
    };

    // Calculate benefits
    const benefits = this.calculateBenefits(eligibility, input);

    // Check for exclusions
    if (crossSellAnalysis.exclusions.length > 0) {
      decision = 'DECLINE';
      reason = `Cross-sell exclusions: ${crossSellAnalysis.exclusions.join(', ')}`;
      notes.push(`❌ Cross-sell declined: ${crossSellAnalysis.exclusions.join(', ')}`);
    }

    if (pensionerAnalysis.exclusions.length > 0) {
      decision = 'DECLINE';
      reason = `Pensioner exclusions: ${pensionerAnalysis.exclusions.join(', ')}`;
      notes.push(`❌ Pensioner declined: ${pensionerAnalysis.exclusions.join(', ')}`);
    }

    if (remittanceAnalysis.exclusions.length > 0) {
      decision = 'DECLINE';
      reason = `Remittance exclusions: ${remittanceAnalysis.exclusions.join(', ')}`;
      notes.push(`❌ Remittance declined: ${remittanceAnalysis.exclusions.join(', ')}`);
    }

    if (mvcAnalysis.exclusions.length > 0) {
      decision = 'CONDITIONAL';
      reason = `MVC exclusions: ${mvcAnalysis.exclusions.join(', ')}`;
      notes.push(`⚠️ MVC conditional: ${mvcAnalysis.exclusions.join(', ')}`);
    }

    // Final decision logic
    if (decision === 'APPROVE' && score >= 60) {
      decision = 'APPROVE';
      reason = 'Special segment benefits applied successfully';
    } else if (score >= 40) {
      decision = 'CONDITIONAL';
      reason = 'Partial special segment benefits - additional requirements';
    } else if (score < 40) {
      decision = 'DECLINE';
      reason = 'Does not qualify for special segment benefits';
    }

    console.log('📤 OUTPUTS:');
    console.log('  • Score:', score + '/100');
    console.log('  • Decision:', decision);
    console.log('  • Segment Type:', segmentType);
    console.log('='.repeat(80));

    return {
      score,
      decision,
      reason,
      notes,
      segmentType,
      eligibility,
      benefits,
      details: {
        crossSellAnalysis,
        pensionerAnalysis,
        remittanceAnalysis,
        mvcAnalysis
      }
    };
  }

  /**
   * Analyze cross-sell eligibility
   */
  private analyzeCrossSell(input: SpecialSegmentsInput): any {
    const analysis = {
      eligible: false,
      exclusions: [] as string[],
      benefits: [] as string[],
      requirements: [] as string[]
    };

    if (!input.is_cross_sell) {
      return analysis;
    }

    // Check if customer has existing loans
    if (!input.has_auto_loan && !input.has_mortgage_loan) {
      analysis.exclusions.push('No existing auto or mortgage loan');
      return analysis;
    }

    // Check loan age
    if (input.loan_disbursement_date) {
      const loanAge = this.calculateMonthsDifference(input.loan_disbursement_date);
      if (loanAge > this.CROSS_SELL_CRITERIA.MAX_LOAN_AGE_MONTHS) {
        analysis.exclusions.push('Loan disbursement older than 6 months');
        return analysis;
      }
    }

    // Check vehicle tracker status (for auto loans)
    if (input.has_auto_loan && input.vehicle_tracker_status !== 'ACTIVE') {
      analysis.exclusions.push('Vehicle tracker not active');
      return analysis;
    }

    // Check late payments
    if (input.late_payments_count > this.CROSS_SELL_CRITERIA.MAX_LATE_PAYMENTS) {
      analysis.exclusions.push('Too many late payments');
      return analysis;
    }

    // Check deviation account
    if (input.is_deviation_account) {
      analysis.exclusions.push('Deviation account not eligible');
      return analysis;
    }

    // Check Islamic POA
    if (input.is_islamic_poa) {
      analysis.exclusions.push('Islamic POA cases excluded');
      return analysis;
    }

    // Check asset in use (for mortgage)
    if (input.has_mortgage_loan && !input.asset_in_use) {
      analysis.exclusions.push('Mortgage asset not in use');
      return analysis;
    }

    // Check fresh eCIB requirement
    if (input.fresh_ecib_required) {
      analysis.requirements.push('Fresh eCIB report required');
    }

    // Check address change
    if (input.address_changed) {
      analysis.requirements.push('Address re-verification required');
    }

    analysis.eligible = true;
    analysis.benefits.push('Reuse previous income documents', 'Reuse previous verifications');
    analysis.requirements.push('Positive Collections recommendation', 'Fresh eCIB report', 'Negative database check');

    return analysis;
  }

  /**
   * Analyze pensioner eligibility
   */
  private analyzePensioner(input: SpecialSegmentsInput): any {
    const analysis = {
      eligible: false,
      exclusions: [] as string[],
      benefits: [] as string[],
      requirements: [] as string[]
    };

    if (!input.is_pensioner) {
      return analysis;
    }

    // Check pension income
    if (input.pension_income < this.PENSIONER_CRITERIA.MIN_PENSION_INCOME) {
      analysis.exclusions.push(`Pension income below minimum (PKR ${this.PENSIONER_CRITERIA.MIN_PENSION_INCOME.toLocaleString()})`);
      return analysis;
    }

    // Check pension credits
    if (input.pension_credits_count < this.PENSIONER_CRITERIA.MIN_PENSION_CREDITS) {
      analysis.exclusions.push(`Insufficient pension credits (${input.pension_credits_count}/6)`);
      return analysis;
    }

    // Check credit shield insurance
    if (!input.credit_shield_insurance) {
      analysis.exclusions.push('Credit Shield insurance mandatory for pensioners');
      return analysis;
    }

    analysis.eligible = true;
    analysis.benefits.push('Office verification waived', 'Same thresholds as govt/armed forces');
    analysis.requirements.push('Pension book/receipt/slip', 'Bank statement with pension credits', 'Credit Shield insurance');

    return analysis;
  }

  /**
   * Analyze remittance eligibility
   */
  private analyzeRemittance(input: SpecialSegmentsInput): any {
    const analysis = {
      eligible: false,
      exclusions: [] as string[],
      benefits: [] as string[],
      requirements: [] as string[]
    };

    if (!input.is_remittance_customer) {
      return analysis;
    }

    // Check blood relative proof
    if (!input.blood_relative_proof) {
      analysis.exclusions.push('Blood relative proof required');
      return analysis;
    }

    // Check remittance amount
    const monthlyRemittance = input.remittance_amount_12m / 12;
    if (monthlyRemittance < this.REMITTANCE_CRITERIA.MIN_MONTHLY_INCOME) {
      analysis.exclusions.push(`Monthly remittance below minimum (PKR ${this.REMITTANCE_CRITERIA.MIN_MONTHLY_INCOME.toLocaleString()})`);
      return analysis;
    }

    // Check remittance entries
    if (input.remittance_entries_count < this.REMITTANCE_CRITERIA.MIN_ENTRIES_12M) {
      analysis.exclusions.push(`Insufficient remittance entries (${input.remittance_entries_count}/6)`);
      return analysis;
    }

    // Check relationship proof
    if (!input.relationship_proof_provided) {
      analysis.exclusions.push('Relationship proof required');
      return analysis;
    }

    analysis.eligible = true;
    analysis.benefits.push('Special income calculation', 'Flexible documentation requirements');
    analysis.requirements.push('12-month bank statement', 'Relationship proof', 'Authorized remitter proof');

    return analysis;
  }

  /**
   * Analyze MVC eligibility
   */
  private analyzeMVC(input: SpecialSegmentsInput): any {
    const analysis = {
      eligible: false,
      exclusions: [] as string[],
      benefits: [] as string[],
      requirements: [] as string[]
    };

    if (!input.is_mvc) {
      return analysis;
    }

    // Check business duration
    if (input.business_duration_months < this.MVC_CRITERIA.MIN_BUSINESS_DURATION) {
      analysis.exclusions.push(`Business duration insufficient (${input.business_duration_months}/6 months)`);
      return analysis;
    }

    // Check average balance
    if (input.average_balance < this.MVC_CRITERIA.MIN_AVERAGE_BALANCE) {
      analysis.exclusions.push(`Average balance below minimum (PKR ${input.average_balance.toLocaleString()}/PKR ${this.MVC_CRITERIA.MIN_AVERAGE_BALANCE.toLocaleString()})`);
      return analysis;
    }

    // Check credits
    if (input.credits_last_6m < this.MVC_CRITERIA.MIN_CREDITS_6M) {
      analysis.exclusions.push(`Insufficient credits (${input.credits_last_6m}/2)`);
      return analysis;
    }

    // Check KYC mismatch
    if (input.kyc_mismatch && !input.branch_manager_endorsement) {
      analysis.exclusions.push('KYC mismatch requires Branch Manager endorsement');
      return analysis;
    }

    analysis.eligible = true;
    analysis.benefits.push('DBR capped at 40%', 'Max limit 4.5x income', 'Premium customer benefits');
    analysis.requirements.push('Branch Manager endorsement for KYC mismatch');

    return analysis;
  }

  /**
   * Calculate benefits based on eligibility
   */
  private calculateBenefits(eligibility: any, input: SpecialSegmentsInput): any {
    const benefits = {
      dbrCap: null as number | null,
      maxLimit: null as number | null,
      verificationWaivers: [] as string[],
      documentationWaivers: [] as string[]
    };

    if (eligibility.crossSell) {
      benefits.verificationWaivers.push('Office verification', 'Residence verification');
      benefits.documentationWaivers.push('Income documents', 'Employment verification');
    }

    if (eligibility.pensioner) {
      benefits.verificationWaivers.push('Office verification');
      benefits.dbrCap = 40; // Same as MVC
    }

    if (eligibility.remittance) {
      benefits.maxLimit = input.customerType === 'NTB' ? 
        Math.min(input.net_monthly_income, this.REMITTANCE_CRITERIA.MAX_LIMIT_NTB) :
        this.REMITTANCE_CRITERIA.MAX_LIMIT_ETB_CLEAN;
    }

    if (eligibility.mvc) {
      benefits.dbrCap = this.MVC_CRITERIA.DBR_CAP;
      benefits.maxLimit = input.net_monthly_income * this.MVC_CRITERIA.MAX_LIMIT_MULTIPLIER;
    }

    return benefits;
  }

  /**
   * Calculate months difference between dates
   */
  private calculateMonthsDifference(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 30);
  }

  /**
   * Get module information
   */
  public getModuleInfo() {
    return {
      name: 'Special Segments Module',
      team: 'Credit Risk & Product Management',
      responsibility: 'Special segment policies, cross-sell rules, remittance handling'
    };
  }
}
