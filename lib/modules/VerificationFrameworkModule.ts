/**
 * Verification Framework Module
 * Implements telephonic, office/residence verification and waiver rules
 * 
 * Team: Credit Risk & Underwriting
 * Responsibility: Verification processes, waiver rules, compliance
 */

export interface VerificationFrameworkInput {
  // Basic application data
  cnic: string;
  full_name: string;
  date_of_birth: string;
  curr_city: string;
  office_city: string;
  
  // Customer type
  is_ubl_customer: boolean;
  customerType: 'ETB' | 'NTB';
  
  // Employment data
  employment_type: string;
  employment_status: string;
  company_type: 'KNOWN' | 'UNKNOWN' | 'GOVT' | 'ARMED_FORCES' | 'EB';
  
  // Verification history
  office_verification_done: boolean;
  residence_verification_done: boolean;
  telephonic_verification_done: boolean;
  
  // eCIB history
  clean_eCIB_12m: boolean;
  never_30_dpd: boolean;
  address_match: boolean;
  
  // Documentation
  utility_bill_provided: boolean;
  utility_bill_type: 'ELECTRICITY' | 'GAS' | 'PTCL' | 'WATER' | 'NONE';
  salary_in_statement: boolean;
  limit_under_500k: boolean;
  
  // Special cases
  is_high_risk_city: boolean;
  is_restricted_entity: boolean;
  is_preferred_mailing_address: boolean;
  is_tax_return_doc: boolean;
  
  // References
  references_provided: number;
  positive_references: number;
  negative_references: number;
  no_response_references: number;
}

export interface VerificationFrameworkResult {
  score: number;
  decision: 'APPROVE' | 'CONDITIONAL' | 'DECLINE';
  reason: string;
  notes: string[];
  verificationLevel: 'FULL' | 'PARTIAL' | 'MINIMAL' | 'WAIVED';
  requirements: {
    office: 'REQUIRED' | 'WAIVED' | 'DONE';
    residence: 'REQUIRED' | 'WAIVED' | 'DONE';
    telephonic: 'REQUIRED' | 'WAIVED' | 'DONE';
    references: 'REQUIRED' | 'WAIVED' | 'DONE';
  };
  waivers: {
    office: boolean;
    residence: boolean;
    telephonic: boolean;
    references: boolean;
  };
  details: {
    verificationStatus: {
      office: any;
      residence: any;
      telephonic: any;
      references: any;
    };
    waiverEligibility: {
      officeWaiver: boolean;
      residenceWaiver: boolean;
      telephonicWaiver: boolean;
      referenceWaiver: boolean;
    };
    complianceStatus: {
      cnicValidation: boolean;
      addressVerification: boolean;
      employmentVerification: boolean;
      referenceCheck: boolean;
    };
  };
}

export default class VerificationFrameworkModule {
  // Restricted entities (office verification waived)
  private readonly RESTRICTED_ENTITIES = [
    'KANUPP', 'Cantonment boards', 'CM House', 'Dockyard', 'Atco Labs', 'COD',
    'City School', 'FBR', 'Bin Qasim', 'Security Printing', 'CAA', 'KE/KESC',
    'Lotte', 'Diplomatic Enclave', 'Accountant General', 'Airport Security',
    'Atomic NDC', 'PTCL Head Office'
  ];

  // High-risk cities requiring 24m eCIB history
  private readonly HIGH_RISK_CITIES = [
    'karachi', 'lahore', 'islamabad', 'rawalpindi', 'peshawar'
  ];

  /**
   * Calculate verification requirements and waivers
   */
  public calculate(input: VerificationFrameworkInput): VerificationFrameworkResult {
    console.log('='.repeat(80));
    console.log('📞 VERIFICATION FRAMEWORK CALCULATION');
    console.log('='.repeat(80));
    console.log('📥 INPUTS:');
    console.log('  • Customer Type:', input.customerType);
    console.log('  • Company Type:', input.company_type);
    console.log('  • Current City:', input.curr_city);
    console.log('  • Office City:', input.office_city);

    const notes: string[] = [];
    let score = 0;
    let decision: 'APPROVE' | 'CONDITIONAL' | 'DECLINE' = 'APPROVE';
    let reason = '';

    // Calculate verification requirements
    const requirements = this.calculateVerificationRequirements(input);
    const waivers = this.calculateWaivers(input);
    const verificationStatus = this.calculateVerificationStatus(input, requirements, waivers);

    // Calculate scores based on verification completeness
    score += this.calculateVerificationScore(verificationStatus, waivers);

    // Check compliance requirements
    const complianceStatus = this.checkComplianceRequirements(input);

    // Apply waiver benefits
    if (waivers.office) {
      score += 10;
      notes.push('Office verification waived - bonus points');
    }
    if (waivers.residence) {
      score += 10;
      notes.push('Residence verification waived - bonus points');
    }
    if (waivers.telephonic) {
      score += 5;
      notes.push('Telephonic verification waived - bonus points');
    }
    if (waivers.references) {
      score += 5;
      notes.push('Reference verification waived - bonus points');
    }

    // Check for critical failures
    if (verificationStatus.references.negativeReferences > 0) {
      decision = 'DECLINE';
      reason = 'Negative reference check - automatic decline';
      notes.push('❌ CRITICAL: Negative reference detected');
    }

    if (verificationStatus.references.noResponseReferences > 0 && verificationStatus.references.positiveReferences === 0) {
      decision = 'CONDITIONAL';
      reason = 'No response from references - retry required';
      notes.push('⚠️ WARNING: No response from references');
    }

    // Determine verification level
    const verificationLevel = this.determineVerificationLevel(verificationStatus, waivers);

    // Final decision logic
    if (score >= 80 && complianceStatus.cnicValidation && complianceStatus.addressVerification) {
      decision = 'APPROVE';
      reason = 'All verification requirements met';
    } else if (score >= 60) {
      decision = 'CONDITIONAL';
      reason = 'Partial verification - additional requirements needed';
    } else {
      decision = 'DECLINE';
      reason = 'Insufficient verification or compliance failures';
    }

    console.log('📤 OUTPUTS:');
    console.log('  • Score:', score + '/100');
    console.log('  • Decision:', decision);
    console.log('  • Verification Level:', verificationLevel);
    console.log('='.repeat(80));

    return {
      score,
      decision,
      reason,
      notes,
      verificationLevel,
      requirements,
      waivers,
      details: {
        verificationStatus,
        waiverEligibility: this.calculateWaiverEligibility(input),
        complianceStatus
      }
    };
  }

  /**
   * Calculate verification requirements
   */
  private calculateVerificationRequirements(input: VerificationFrameworkInput): any {
    const requirements = {
      office: 'REQUIRED' as 'REQUIRED' | 'WAIVED' | 'DONE',
      residence: 'REQUIRED' as 'REQUIRED' | 'WAIVED' | 'DONE',
      telephonic: 'REQUIRED' as 'REQUIRED' | 'WAIVED' | 'DONE',
      references: 'REQUIRED' as 'REQUIRED' | 'WAIVED' | 'DONE'
    };

    // Office verification
    if (this.isRestrictedEntity(input.company_type)) {
      requirements.office = 'WAIVED';
    } else if (input.office_verification_done) {
      requirements.office = 'DONE';
    } else {
      requirements.office = 'REQUIRED';
    }

    // Residence verification
    if (input.residence_verification_done) {
      requirements.residence = 'DONE';
    } else if (this.isEligibleForResidenceWaiver(input)) {
      requirements.residence = 'WAIVED';
    } else {
      requirements.residence = 'REQUIRED';
    }

    // Telephonic verification
    if (input.telephonic_verification_done) {
      requirements.telephonic = 'DONE';
    } else if (this.isEligibleForTelephonicWaiver(input)) {
      requirements.telephonic = 'WAIVED';
    } else {
      requirements.telephonic = 'REQUIRED';
    }

    // References
    if (input.references_provided >= 2 && input.positive_references >= 1) {
      requirements.references = 'DONE';
    } else if (this.isEligibleForReferenceWaiver(input)) {
      requirements.references = 'WAIVED';
    } else {
      requirements.references = 'REQUIRED';
    }

    return requirements;
  }

  /**
   * Calculate waivers
   */
  private calculateWaivers(input: VerificationFrameworkInput): any {
    return {
      office: this.isRestrictedEntity(input.company_type),
      residence: this.isEligibleForResidenceWaiver(input),
      telephonic: this.isEligibleForTelephonicWaiver(input),
      references: this.isEligibleForReferenceWaiver(input)
    };
  }

  /**
   * Calculate verification status
   */
  private calculateVerificationStatus(input: VerificationFrameworkInput, requirements: any, waivers: any): any {
    return {
      office: {
        required: requirements.office === 'REQUIRED',
        waived: waivers.office,
        done: input.office_verification_done,
        status: requirements.office
      },
      residence: {
        required: requirements.residence === 'REQUIRED',
        waived: waivers.residence,
        done: input.residence_verification_done,
        status: requirements.residence
      },
      telephonic: {
        required: requirements.telephonic === 'REQUIRED',
        waived: waivers.telephonic,
        done: input.telephonic_verification_done,
        status: requirements.telephonic
      },
      references: {
        required: requirements.references === 'REQUIRED',
        waived: waivers.references,
        provided: input.references_provided,
        positiveReferences: input.positive_references,
        negativeReferences: input.negative_references,
        noResponseReferences: input.no_response_references,
        status: requirements.references
      }
    };
  }

  /**
   * Calculate verification score
   */
  private calculateVerificationScore(verificationStatus: any, waivers: any): number {
    let score = 0;

    // Office verification (25 points)
    if (verificationStatus.office.done || waivers.office) {
      score += 25;
    } else if (verificationStatus.office.required) {
      score += 0; // Required but not done
    }

    // Residence verification (25 points)
    if (verificationStatus.residence.done || waivers.residence) {
      score += 25;
    } else if (verificationStatus.residence.required) {
      score += 0; // Required but not done
    }

    // Telephonic verification (25 points)
    if (verificationStatus.telephonic.done || waivers.telephonic) {
      score += 25;
    } else if (verificationStatus.telephonic.required) {
      score += 0; // Required but not done
    }

    // References (25 points)
    if (verificationStatus.references.done || waivers.references) {
      score += 25;
    } else if (verificationStatus.references.required) {
      score += 0; // Required but not done
    }

    return score;
  }

  /**
   * Check compliance requirements
   */
  private checkComplianceRequirements(input: VerificationFrameworkInput): any {
    return {
      cnicValidation: this.validateCNIC(input.cnic),
      addressVerification: this.validateAddress(input.curr_city, input.office_city),
      employmentVerification: this.validateEmployment(input.employment_status, input.company_type),
      referenceCheck: this.validateReferences(input.positive_references, input.negative_references)
    };
  }

  /**
   * Calculate waiver eligibility
   */
  private calculateWaiverEligibility(input: VerificationFrameworkInput): any {
    return {
      officeWaiver: this.isRestrictedEntity(input.company_type),
      residenceWaiver: this.isEligibleForResidenceWaiver(input),
      telephonicWaiver: this.isEligibleForTelephonicWaiver(input),
      referenceWaiver: this.isEligibleForReferenceWaiver(input)
    };
  }

  /**
   * Check if eligible for residence waiver
   */
  private isEligibleForResidenceWaiver(input: VerificationFrameworkInput): boolean {
    // ETB with clean history and utility bill
    return input.customerType === 'ETB' &&
           input.clean_eCIB_12m &&
           input.never_30_dpd &&
           input.address_match &&
           input.salary_in_statement &&
           input.limit_under_500k &&
           input.utility_bill_provided &&
           ['ELECTRICITY', 'GAS', 'PTCL', 'WATER'].includes(input.utility_bill_type);
  }

  /**
   * Check if eligible for telephonic waiver
   */
  private isEligibleForTelephonicWaiver(input: VerificationFrameworkInput): boolean {
    // ETB with excellent profile
    return input.customerType === 'ETB' &&
           input.clean_eCIB_12m &&
           input.never_30_dpd &&
           input.address_match &&
           input.salary_in_statement &&
           input.limit_under_500k;
  }

  /**
   * Check if eligible for reference waiver
   */
  private isEligibleForReferenceWaiver(input: VerificationFrameworkInput): boolean {
    // Secured products or special cases
    return input.is_restricted_entity || 
           (input.customerType === 'ETB' && input.clean_eCIB_12m);
  }

  /**
   * Check if company is restricted entity
   */
  private isRestrictedEntity(companyType: string): boolean {
    return this.RESTRICTED_ENTITIES.some(entity => 
      companyType.toLowerCase().includes(entity.toLowerCase())
    );
  }

  /**
   * Validate CNIC
   */
  private validateCNIC(cnic: string): boolean {
    // Basic CNIC validation (13 digits)
    return /^\d{13}$/.test(cnic);
  }
  /**
   * Validate address
   */
  private validateAddress(currCity: string, officeCity: string): boolean {
    // Both cities should be provided and valid
    return !!(currCity && officeCity && 
           currCity.length > 0 && officeCity.length > 0);
  }

  /**
   * Validate employment
   */
  private validateEmployment(employmentStatus: string, companyType: string): boolean {
    return employmentStatus === 'Employed' && 
           ['KNOWN', 'UNKNOWN', 'GOVT', 'ARMED_FORCES', 'EB'].includes(companyType);
  }

  /**
   * Validate references
   */
  private validateReferences(positiveRefs: number, negativeRefs: number): boolean {
    return positiveRefs >= 1 && negativeRefs === 0;
  }

  /**
   * Determine verification level
   */
  private determineVerificationLevel(verificationStatus: any, waivers: any): 'FULL' | 'PARTIAL' | 'MINIMAL' | 'WAIVED' {
    const completedCount = Object.values(verificationStatus).filter((status: any) => 
      status.done || status.waived
    ).length;

    const waivedCount = Object.values(waivers).filter(Boolean).length;

    if (waivedCount >= 3) return 'WAIVED';
    if (completedCount >= 4) return 'FULL';
    if (completedCount >= 3) return 'PARTIAL';
    return 'MINIMAL';
  }

  /**
   * Get module information
   */
  public getModuleInfo() {
    return {
      name: 'Verification Framework Module',
      team: 'Credit Risk & Underwriting',
      responsibility: 'Verification processes, waiver rules, compliance'
    };
  }
}
