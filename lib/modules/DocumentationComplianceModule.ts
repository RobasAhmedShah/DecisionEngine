/**
 * Documentation & Compliance Module
 * Implements NADRA BVS, CNIC validation, and compliance requirements
 * 
 * Team: Credit Risk & Compliance
 * Responsibility: Documentation validation, regulatory compliance, identity verification
 */

export interface DocumentationComplianceInput {
  // Basic application data
  cnic: string;
  full_name: string;
  date_of_birth: string;
  place_of_birth: string;
  permanent_address: string;
  current_address: string;
  
  // CNIC data
  cnic_expiry_date: string; // YYYY-MM-DD format
  cnic_issue_date: string; // YYYY-MM-DD format
  cnic_valid: boolean;
  
  // NADRA BVS data
  bvs_performed: boolean;
  bvs_successful: boolean;
  bvs_not_possible_reason: 'SYSTEM_DOWN' | 'NO_BIOMETRIC' | 'NON_BIOMETRIC_ID' | 'DISABILITY' | 'TEMPORARY_ISSUE' | 'NONE';
  bvs_deferral_date: string; // YYYY-MM-DD format
  bvs_deferral_reason: string;
  
  // Verisys data
  verisys_performed: boolean;
  verisys_approved: boolean;
  verisys_authority: 'HOCL_HOCR' | 'NONE';
  
  // Documentation
  cnic_copy_provided: boolean;
  cnic_copies_count: number;
  address_verification_done: boolean;
  signature_verification_done: boolean;
  
  // Compliance flags
  is_new_applicant: boolean;
  is_active_customer: boolean;
  cnic_expiry_notice_sent: boolean;
  cnic_update_within_30_days: boolean;
  
  // AFD clearance
  afd_clearance_required: boolean;
  afd_clearance_obtained: boolean;
  afd_mismatch_details: string;
}

export interface DocumentationComplianceResult {
  score: number;
  decision: 'APPROVE' | 'CONDITIONAL' | 'DECLINE' | 'PEND';
  reason: string;
  notes: string[];
  complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
  requirements: {
    mandatory: string[];
    recommended: string[];
    waived: string[];
  };
  details: {
    cnicValidation: {
      valid: boolean;
      expiryStatus: 'VALID' | 'EXPIRED' | 'EXPIRING_SOON';
      daysToExpiry: number;
      actionRequired: string;
    };
    bvsStatus: {
      required: boolean;
      performed: boolean;
      successful: boolean;
      notPossibleReason: string;
      deferralStatus: 'NONE' | 'ACTIVE' | 'EXPIRED';
      daysRemaining: number;
    };
    verisysStatus: {
      required: boolean;
      performed: boolean;
      approved: boolean;
      authority: string;
    };
    documentationStatus: {
      cnicCopies: boolean;
      addressVerification: boolean;
      signatureVerification: boolean;
      complete: boolean;
    };
    complianceStatus: {
      cnicCompliance: boolean;
      bvsCompliance: boolean;
      verisysCompliance: boolean;
      afdCompliance: boolean;
    };
  };
}

export default class DocumentationComplianceModule {
  // CNIC expiry thresholds
  private readonly CNIC_EXPIRY_WARNING_DAYS = 30;
  private readonly CNIC_UPDATE_GRACE_DAYS = 30;

  // BVS deferral limits
  private readonly BVS_DEFERRAL_MAX_DAYS = 10;

  /**
   * Calculate documentation and compliance status
   */
  public calculate(input: DocumentationComplianceInput): DocumentationComplianceResult {
    console.log('='.repeat(80));
    console.log('📋 DOCUMENTATION & COMPLIANCE CALCULATION');
    console.log('='.repeat(80));
    console.log('📥 INPUTS:');
    console.log('  • CNIC:', input.cnic);
    console.log('  • BVS Performed:', input.bvs_performed);
    console.log('  • BVS Successful:', input.bvs_successful);
    console.log('  • Verisys Performed:', input.verisys_performed);
    console.log('  • CNIC Valid:', input.cnic_valid);

    const notes: string[] = [];
    let score = 0;
    let decision: 'APPROVE' | 'CONDITIONAL' | 'DECLINE' | 'PEND' = 'APPROVE';
    let reason = '';
    let complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING' = 'COMPLIANT';

    // Validate CNIC
    const cnicValidation = this.validateCNIC(input);
    if (!cnicValidation.valid) {
      decision = 'DECLINE';
      reason = 'CNIC validation failed';
      notes.push('❌ CNIC validation failed');
    } else {
      score += 25;
      notes.push('✅ CNIC validation passed');
    }

    // Check BVS status
    const bvsStatus = this.checkBVSStatus(input);
    if (bvsStatus.deferralStatus === 'ACTIVE') {
      decision = 'PEND';
      reason = 'BVS deferral active - waiting for biometric verification';
      notes.push(`⏳ BVS deferral active (${bvsStatus.daysRemaining} days remaining)`);
    } else if (bvsStatus.required && !bvsStatus.successful && !bvsStatus.notPossibleReason) {
      decision = 'DECLINE';
      reason = 'BVS required but not performed or failed';
      notes.push('❌ BVS required but not performed or failed');
    } else if (bvsStatus.successful) {
      score += 30;
      notes.push('✅ BVS successful');
    } else if (bvsStatus.notPossibleReason) {
      score += 20;
      notes.push(`⚠️ BVS not possible: ${bvsStatus.notPossibleReason}`);
    }

    // Check Verisys status
    const verisysStatus = this.checkVerisysStatus(input, bvsStatus);
    if (verisysStatus.required && !verisysStatus.approved) {
      decision = 'DECLINE';
      reason = 'Verisys required but not approved';
      notes.push('❌ Verisys required but not approved');
    } else if (verisysStatus.approved) {
      score += 25;
      notes.push('✅ Verisys approved');
    }

    // Check documentation completeness
    const documentationStatus = this.checkDocumentationStatus(input);
    if (!documentationStatus.complete) {
      decision = 'CONDITIONAL';
      reason = 'Incomplete documentation';
      notes.push('⚠️ Incomplete documentation');
    } else {
      score += 20;
      notes.push('✅ Documentation complete');
    }

    // Check compliance status
    const compliance = this.checkComplianceStatus(input, cnicValidation, bvsStatus, verisysStatus, documentationStatus);
    if (!compliance.cnicCompliance || !compliance.bvsCompliance || !compliance.verisysCompliance) {
      complianceStatus = 'NON_COMPLIANT';
    } else if (bvsStatus.deferralStatus === 'ACTIVE') {
      complianceStatus = 'PENDING';
    }

    // Generate requirements
    const requirements = this.generateRequirements(input, bvsStatus, verisysStatus);

    // Final decision logic
    if (decision === 'APPROVE' && score >= 80) {
      decision = 'APPROVE';
      reason = 'All documentation and compliance requirements met';
    } else if (score >= 60) {
      decision = 'CONDITIONAL';
      reason = 'Partial compliance - additional documentation required';
    } else if (score < 60) {
      decision = 'DECLINE';
      reason = 'Insufficient documentation or compliance failures';
    }

    console.log('📤 OUTPUTS:');
    console.log('  • Score:', score + '/100');
    console.log('  • Decision:', decision);
    console.log('  • Compliance Status:', complianceStatus);
    console.log('='.repeat(80));

    return {
      score,
      decision,
      reason,
      notes,
      complianceStatus,
      requirements,
      details: {
        cnicValidation,
        bvsStatus,
        verisysStatus,
        documentationStatus,
        complianceStatus: compliance
      }
    };
  }

  /**
   * Validate CNIC
   */
  private validateCNIC(input: DocumentationComplianceInput): any {
    const now = new Date();
    const expiryDate = new Date(input.cnic_expiry_date);
    const daysToExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let expiryStatus: 'VALID' | 'EXPIRED' | 'EXPIRING_SOON' = 'VALID';
    let actionRequired = '';

    if (daysToExpiry < 0) {
      expiryStatus = 'EXPIRED';
      actionRequired = input.is_new_applicant ? 'DECLINE - Expired CNIC' : 'TEMP_BLOCK - Update CNIC within 30 days';
    } else if (daysToExpiry <= this.CNIC_EXPIRY_WARNING_DAYS) {
      expiryStatus = 'EXPIRING_SOON';
      actionRequired = 'Send expiry notice to customer';
    }

    const valid = input.cnic_valid && expiryStatus !== 'EXPIRED';

    return {
      valid,
      expiryStatus,
      daysToExpiry,
      actionRequired
    };
  }

  /**
   * Check BVS status
   */
  private checkBVSStatus(input: DocumentationComplianceInput): any {
    const required = input.is_new_applicant;
    const performed = input.bvs_performed;
    const successful = input.bvs_successful;
    const notPossibleReason = input.bvs_not_possible_reason;

    let deferralStatus: 'NONE' | 'ACTIVE' | 'EXPIRED' = 'NONE';
    let daysRemaining = 0;

    if (input.bvs_deferral_date) {
      const deferralDate = new Date(input.bvs_deferral_date);
      const now = new Date();
      const daysSinceDeferral = Math.ceil((now.getTime() - deferralDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceDeferral <= this.BVS_DEFERRAL_MAX_DAYS) {
        deferralStatus = 'ACTIVE';
        daysRemaining = this.BVS_DEFERRAL_MAX_DAYS - daysSinceDeferral;
      } else {
        deferralStatus = 'EXPIRED';
      }
    }

    return {
      required,
      performed,
      successful,
      notPossibleReason,
      deferralStatus,
      daysRemaining
    };
  }

  /**
   * Check Verisys status
   */
  private checkVerisysStatus(input: DocumentationComplianceInput, bvsStatus: any): any {
    const required = bvsStatus.required && !bvsStatus.successful && bvsStatus.notPossibleReason;
    const performed = input.verisys_performed;
    const approved = input.verisys_approved;
    const authority = input.verisys_authority;

    return {
      required,
      performed,
      approved,
      authority
    };
  }

  /**
   * Check documentation status
   */
  private checkDocumentationStatus(input: DocumentationComplianceInput): any {
    const cnicCopies = input.cnic_copy_provided && input.cnic_copies_count >= 2;
    const addressVerification = input.address_verification_done;
    const signatureVerification = input.signature_verification_done;
    const complete = cnicCopies && addressVerification && signatureVerification;

    return {
      cnicCopies,
      addressVerification,
      signatureVerification,
      complete
    };
  }

  /**
   * Check compliance status
   */
  private checkComplianceStatus(input: DocumentationComplianceInput, cnicValidation: any, bvsStatus: any, verisysStatus: any, documentationStatus: any): any {
    const cnicCompliance = cnicValidation.valid;
    const bvsCompliance = !bvsStatus.required || bvsStatus.successful || bvsStatus.notPossibleReason || verisysStatus.approved;
    const verisysCompliance = !verisysStatus.required || verisysStatus.approved;
    const afdCompliance = !input.afd_clearance_required || input.afd_clearance_obtained;

    return {
      cnicCompliance,
      bvsCompliance,
      verisysCompliance,
      afdCompliance
    };
  }

  /**
   * Generate requirements
   */
  private generateRequirements(input: DocumentationComplianceInput, bvsStatus: any, verisysStatus: any): any {
    const mandatory: string[] = [];
    const recommended: string[] = [];
    const waived: string[] = [];

    // CNIC requirements
    mandatory.push('Valid CNIC', '2 CNIC copies');
    if (input.cnic_expiry_date) {
      const expiryDate = new Date(input.cnic_expiry_date);
      const now = new Date();
      const daysToExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysToExpiry <= this.CNIC_EXPIRY_WARNING_DAYS) {
        mandatory.push('CNIC renewal');
      }
    }

    // BVS requirements
    if (bvsStatus.required) {
      if (bvsStatus.successful) {
        mandatory.push('BVS successful');
      } else if (bvsStatus.notPossibleReason) {
        mandatory.push('Verisys with authority approval');
        waived.push('BVS (not possible)');
      } else {
        mandatory.push('BVS required');
      }
    } else {
      waived.push('BVS (not required)');
    }

    // Verisys requirements
    if (verisysStatus.required) {
      mandatory.push('Verisys approval');
    } else {
      waived.push('Verisys (not required)');
    }

    // Documentation requirements
    mandatory.push('Address verification', 'Signature verification');
    
    if (input.afd_clearance_required) {
      mandatory.push('AFD clearance');
    }

    return { mandatory, recommended, waived };
  }

  /**
   * Get module information
   */
  public getModuleInfo() {
    return {
      name: 'Documentation & Compliance Module',
      team: 'Credit Risk & Compliance',
      responsibility: 'Documentation validation, regulatory compliance, identity verification'
    };
  }
}
