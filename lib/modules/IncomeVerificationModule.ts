/**
 * Income Verification Module
 * Implements comprehensive income verification matrix for Employment Types A/B/C
 * 
 * Team: Credit Risk & Underwriting
 * Responsibility: Income verification, employment validation, documentation requirements
 */

export interface IncomeVerificationInput {
  // Basic application data
  cnic: string;
  full_name: string;
  date_of_birth: string;
  
  // Income data
  gross_monthly_income: number;
  net_monthly_income: number;
  total_income: number;
  
  // Employment data
  employment_type: string; // 'permanent', 'contractual', 'self_employed'
  employment_status: string; // 'Employed', 'Self-Employed', 'Business'
  length_of_employment: number; // in years
  business_nature: string;
  
  // Customer type
  is_ubl_customer: boolean;
  customerType: 'ETB' | 'NTB';
  
  // Salary transfer
  salary_transfer_flag: boolean;
  
  // Verification flags
  income_verified: boolean;
  bank_statement_verified: boolean;
  office_verification_done: boolean;
  residence_verification_done: boolean;
  
  // Company classification
  company_type: 'KNOWN' | 'UNKNOWN' | 'GOVT' | 'ARMED_FORCES' | 'EB';
  
  // Documentation
  salary_slip_provided: boolean;
  bank_statement_provided: boolean;
  employment_certificate_provided: boolean;
  hr_letter_provided: boolean;
  
  // Special segments
  is_pensioner: boolean;
  is_remittance_customer: boolean;
  is_cross_sell: boolean;
  is_mvc: boolean;
}

export interface IncomeVerificationResult {
  score: number;
  decision: 'APPROVE' | 'CONDITIONAL' | 'DECLINE';
  reason: string;
  notes: string[];
  verificationLevel: 'FULL' | 'PARTIAL' | 'MINIMAL' | 'NONE';
  requirements: {
    mandatory: string[];
    recommended: string[];
    waived: string[];
  };
  details: {
    employmentType: 'A' | 'B' | 'C';
    incomeThreshold: {
      expected: number;
      actual: number;
      met: boolean;
      points: number;
    };
    verificationStatus: {
      office: 'REQUIRED' | 'WAIVED' | 'DONE' | 'PENDING';
      residence: 'REQUIRED' | 'WAIVED' | 'DONE' | 'PENDING';
      bankStatement: 'REQUIRED' | 'WAIVED' | 'DONE' | 'PENDING';
      salarySlip: 'REQUIRED' | 'WAIVED' | 'DONE' | 'PENDING';
    };
    documentationStatus: {
      complete: boolean;
      missing: string[];
      provided: string[];
    };
    specialSegmentEligibility: {
      isPensioner: boolean;
      isRemittance: boolean;
      isCrossSell: boolean;
      isMVC: boolean;
    };
  };
}

export default class IncomeVerificationModule {
  // Employment Type A - Salary Transfer (including EB)
  private readonly TYPE_A_THRESHOLDS = {
    ETB: {
      PERMANENT: { KNOWN: 40000, UNKNOWN: 40000 },
      CONTRACTUAL: { KNOWN: 60000, UNKNOWN: 60000 }
    },
    NTB: {
      PERMANENT: { KNOWN: 45000, UNKNOWN: 50000 },
      CONTRACTUAL: { KNOWN: 65000, UNKNOWN: 70000 }
    },
    EB: {
      PERMANENT: 35000,
      CONTRACTUAL: 55000
    }
  };

  // Employment Type B - Non-Salary Transfer
  private readonly TYPE_B_THRESHOLDS = {
    ETB: {
      PERMANENT: { KNOWN: 45000, UNKNOWN: 50000 },
      CONTRACTUAL: { KNOWN: 65000, UNKNOWN: 70000 }
    },
    NTB: {
      PERMANENT: { KNOWN: 50000, UNKNOWN: 60000 },
      CONTRACTUAL: { KNOWN: 70000, UNKNOWN: 70000 }
    }
  };

  // Employment Type C - Self-Employed/Business
  private readonly TYPE_C_THRESHOLDS = {
    ETB: 100000,
    NTB: 120000
  };

  /**
   * Calculate income verification score and requirements
   */
  public calculate(input: IncomeVerificationInput): IncomeVerificationResult {
    console.log('='.repeat(80));
    console.log('💰 INCOME VERIFICATION CALCULATION');
    console.log('='.repeat(80));
    console.log('📥 INPUTS:');
    console.log('  • Net Monthly Income:', input.net_monthly_income);
    console.log('  • Employment Type:', input.employment_type);
    console.log('  • Customer Type:', input.customerType);
    console.log('  • Company Type:', input.company_type);
    console.log('  • Salary Transfer:', input.salary_transfer_flag);

    const notes: string[] = [];
    let score = 0;
    let decision: 'APPROVE' | 'CONDITIONAL' | 'DECLINE' = 'APPROVE';
    let reason = '';
    let verificationLevel: 'FULL' | 'PARTIAL' | 'MINIMAL' | 'NONE' = 'FULL';

    // Determine employment type (A, B, or C)
    const employmentType = this.determineEmploymentType(input);
    notes.push(`Employment Type: ${employmentType} (${this.getEmploymentTypeDescription(employmentType)})`);

    // Calculate income threshold
    const incomeThreshold = this.calculateIncomeThreshold(input, employmentType);
    const thresholdMet = input.net_monthly_income >= incomeThreshold.expected;
    
    if (thresholdMet) {
      score += 60;
      notes.push(`Income threshold met: PKR ${input.net_monthly_income.toLocaleString()} (Expected: PKR ${incomeThreshold.expected.toLocaleString()})`);
    } else {
      score += 0;
      notes.push(`Income threshold NOT met: PKR ${input.net_monthly_income.toLocaleString()} (Expected: PKR ${incomeThreshold.expected.toLocaleString()})`);
      decision = 'DECLINE';
      reason = 'Income below minimum threshold';
    }

    // Calculate verification requirements
    const verificationStatus = this.calculateVerificationRequirements(input, employmentType);
    const documentationStatus = this.calculateDocumentationStatus(input, employmentType);

    // Calculate verification score based on completeness
    const verificationScore = this.calculateVerificationScore(verificationStatus, documentationStatus);
    score += verificationScore;

    // Apply special segment benefits
    const specialSegmentEligibility = this.calculateSpecialSegmentEligibility(input);
    if (specialSegmentEligibility.isPensioner || specialSegmentEligibility.isRemittance || 
        specialSegmentEligibility.isCrossSell || specialSegmentEligibility.isMVC) {
      score += 10;
      notes.push('Special segment customer - bonus points applied');
    }

    // Determine verification level
    verificationLevel = this.determineVerificationLevel(verificationStatus, documentationStatus);

    // Final decision logic
    if (score >= 80) {
      decision = 'APPROVE';
      reason = 'All verification requirements met';
    } else if (score >= 60) {
      decision = 'CONDITIONAL';
      reason = 'Partial verification - additional documentation required';
    } else {
      decision = 'DECLINE';
      reason = 'Insufficient verification or income below threshold';
    }

    const requirements = this.generateRequirements(employmentType, input.customerType, input.company_type);

    console.log('📤 OUTPUTS:');
    console.log('  • Score:', score + '/100');
    console.log('  • Decision:', decision);
    console.log('  • Verification Level:', verificationLevel);
    console.log('  • Employment Type:', employmentType);
    console.log('='.repeat(80));

    return {
      score,
      decision,
      reason,
      notes,
      verificationLevel,
      requirements,
      details: {
        employmentType,
        incomeThreshold: {
          expected: incomeThreshold.expected,
          actual: input.net_monthly_income,
          met: thresholdMet,
          points: thresholdMet ? 60 : 0
        },
        verificationStatus,
        documentationStatus,
        specialSegmentEligibility
      }
    };
  }

  /**
   * Determine employment type (A, B, or C)
   */
  private determineEmploymentType(input: IncomeVerificationInput): 'A' | 'B' | 'C' {
    if (input.employment_status === 'Self-Employed' || input.employment_status === 'Business') {
      return 'C';
    }
    
    if (input.salary_transfer_flag || input.company_type === 'EB') {
      return 'A';
    }
    
    return 'B';
  }

  /**
   * Calculate income threshold based on employment type
   */
  private calculateIncomeThreshold(input: IncomeVerificationInput, employmentType: 'A' | 'B' | 'C'): { expected: number; type: string } {
    const isETB = input.customerType === 'ETB';
    const isPermanent = input.employment_type === 'permanent';
    const isKnown = input.company_type === 'KNOWN' || input.company_type === 'GOVT' || input.company_type === 'ARMED_FORCES';

    if (employmentType === 'A') {
      if (input.company_type === 'EB') {
        const threshold = isPermanent ? this.TYPE_A_THRESHOLDS.EB.PERMANENT : this.TYPE_A_THRESHOLDS.EB.CONTRACTUAL;
        return { expected: threshold, type: 'EB Salary Transfer' };
      }
      
      const thresholds = isETB ? this.TYPE_A_THRESHOLDS.ETB : this.TYPE_A_THRESHOLDS.NTB;
      const empType = isPermanent ? 'PERMANENT' : 'CONTRACTUAL';
      const compType = isKnown ? 'KNOWN' : 'UNKNOWN';
      const threshold = thresholds[empType][compType];
      return { expected: threshold, type: 'Salary Transfer' };
    }
    
    if (employmentType === 'B') {
      const thresholds = isETB ? this.TYPE_B_THRESHOLDS.ETB : this.TYPE_B_THRESHOLDS.NTB;
      const empType = isPermanent ? 'PERMANENT' : 'CONTRACTUAL';
      const compType = isKnown ? 'KNOWN' : 'UNKNOWN';
      const threshold = thresholds[empType][compType];
      return { expected: threshold, type: 'Non-Salary Transfer' };
    }
    
    // Type C - Self-Employed
    const threshold = isETB ? this.TYPE_C_THRESHOLDS.ETB : this.TYPE_C_THRESHOLDS.NTB;
    return { expected: threshold, type: 'Self-Employed' };
  }

  /**
   * Calculate verification requirements
   */
  private calculateVerificationRequirements(input: IncomeVerificationInput, employmentType: 'A' | 'B' | 'C'): any {
    const requirements = {
      office: 'PENDING' as 'REQUIRED' | 'WAIVED' | 'DONE' | 'PENDING',
      residence: 'PENDING' as 'REQUIRED' | 'WAIVED' | 'DONE' | 'PENDING',
      bankStatement: 'PENDING' as 'REQUIRED' | 'WAIVED' | 'DONE' | 'PENDING',
      salarySlip: 'PENDING' as 'REQUIRED' | 'WAIVED' | 'DONE' | 'PENDING'
    };

    // Office verification
    if (employmentType === 'C') {
      requirements.office = 'REQUIRED'; // Self-employed always need office verification
    } else if (this.isRestrictedEntity(input.company_type)) {
      requirements.office = 'WAIVED';
    } else if (input.office_verification_done) {
      requirements.office = 'DONE';
    } else {
      requirements.office = 'REQUIRED';
    }

    // Residence verification
    if (input.residence_verification_done) {
      requirements.residence = 'DONE';
    } else {
      requirements.residence = 'REQUIRED';
    }

    // Bank statement verification
    if (employmentType === 'A' && input.salary_transfer_flag) {
      requirements.bankStatement = 'REQUIRED';
    } else if (employmentType === 'B') {
      requirements.bankStatement = 'REQUIRED';
    } else if (employmentType === 'C') {
      requirements.bankStatement = 'REQUIRED';
    } else {
      requirements.bankStatement = 'WAIVED';
    }

    // Salary slip verification
    if (employmentType === 'A' || employmentType === 'B') {
      requirements.salarySlip = 'REQUIRED';
    } else {
      requirements.salarySlip = 'WAIVED';
    }

    return requirements;
  }

  /**
   * Calculate documentation status
   */
  private calculateDocumentationStatus(input: IncomeVerificationInput, employmentType: 'A' | 'B' | 'C'): any {
    const provided: string[] = [];
    const missing: string[] = [];

    if (input.salary_slip_provided) provided.push('Salary Slip');
    else if (employmentType === 'A' || employmentType === 'B') missing.push('Salary Slip');

    if (input.bank_statement_provided) provided.push('Bank Statement');
    else if (employmentType !== 'A' || !input.salary_transfer_flag) missing.push('Bank Statement');

    if (input.employment_certificate_provided) provided.push('Employment Certificate');
    else if (employmentType === 'A' || employmentType === 'B') missing.push('Employment Certificate');

    if (input.hr_letter_provided) provided.push('HR Letter');
    else if (employmentType === 'A' || employmentType === 'B') missing.push('HR Letter');

    return {
      complete: missing.length === 0,
      missing,
      provided
    };
  }

  /**
   * Calculate verification score
   */
  private calculateVerificationScore(verificationStatus: any, documentationStatus: any): number {
    let score = 0;

    // Verification status scoring
    if (verificationStatus.office === 'DONE' || verificationStatus.office === 'WAIVED') score += 10;
    if (verificationStatus.residence === 'DONE' || verificationStatus.residence === 'WAIVED') score += 10;
    if (verificationStatus.bankStatement === 'DONE' || verificationStatus.bankStatement === 'WAIVED') score += 10;
    if (verificationStatus.salarySlip === 'DONE' || verificationStatus.salarySlip === 'WAIVED') score += 10;

    // Documentation completeness
    if (documentationStatus.complete) score += 10;
    else score += Math.max(0, 10 - (documentationStatus.missing.length * 2));

    return score;
  }

  /**
   * Calculate special segment eligibility
   */
  private calculateSpecialSegmentEligibility(input: IncomeVerificationInput): any {
    return {
      isPensioner: input.is_pensioner || false,
      isRemittance: input.is_remittance_customer || false,
      isCrossSell: input.is_cross_sell || false,
      isMVC: input.is_mvc || false
    };
  }

  /**
   * Determine verification level
   */
  private determineVerificationLevel(verificationStatus: any, documentationStatus: any): 'FULL' | 'PARTIAL' | 'MINIMAL' | 'NONE' {
    const completedVerifications = Object.values(verificationStatus).filter(status => 
      status === 'DONE' || status === 'WAIVED'
    ).length;

    if (completedVerifications >= 4 && documentationStatus.complete) return 'FULL';
    if (completedVerifications >= 3) return 'PARTIAL';
    if (completedVerifications >= 2) return 'MINIMAL';
    return 'NONE';
  }

  /**
   * Generate requirements based on employment type
   */
  private generateRequirements(employmentType: 'A' | 'B' | 'C', customerType: 'ETB' | 'NTB', companyType: string): any {
    const mandatory: string[] = [];
    const recommended: string[] = [];
    const waived: string[] = [];

    if (employmentType === 'A') {
      mandatory.push('Salary Slip', 'Bank Statement');
      if (customerType === 'NTB') {
        mandatory.push('Employment Certificate');
      }
      if (companyType === 'UNKNOWN') {
        mandatory.push('Office Verification', 'Residence Verification');
      } else {
        waived.push('Office Verification');
      }
    } else if (employmentType === 'B') {
      mandatory.push('Salary Slip', 'Bank Statement', 'Office Verification', 'Residence Verification');
      if (customerType === 'NTB') {
        mandatory.push('Employment Certificate');
      }
    } else {
      // Type C - Self-Employed
      mandatory.push('Bank Statement', 'Office Verification', 'Residence Verification');
      recommended.push('Business Registration', 'Financial Statements');
    }

    return { mandatory, recommended, waived };
  }

  /**
   * Check if company is in restricted entities list
   */
  private isRestrictedEntity(companyType: string): boolean {
    const restrictedEntities = ['GOVT', 'ARMED_FORCES'];
    return restrictedEntities.includes(companyType);
  }

  /**
   * Get employment type description
   */
  private getEmploymentTypeDescription(type: 'A' | 'B' | 'C'): string {
    const descriptions = {
      'A': 'Salary Transfer (including EB)',
      'B': 'Non-Salary Transfer',
      'C': 'Self-Employed/Business'
    };
    return descriptions[type];
  }

  /**
   * Get module information
   */
  public getModuleInfo() {
    return {
      name: 'Income Verification Module',
      team: 'Credit Risk & Underwriting',
      responsibility: 'Income verification, employment validation, documentation requirements'
    };
  }
}
