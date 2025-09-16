/**
 * System Checks Module
 * Handles all mandatory system checks as per Credit Card Issuance Decision Framework
 * 
 * Team: Security & Compliance
 * Responsibility: eCIB, VERISYS, AFD, PEP, World Check validation
 */

export interface SystemChecksInput {
  // Application data
  cnic: string;
  full_name: string;
  date_of_birth: string;
  
  // System check flags (from external systems)
  ecib_individual_check?: boolean;
  ecib_corporate_check?: boolean;
  verisys_cnic_check?: boolean;
  afd_delinquency_check?: boolean;
  afd_compliance_check?: boolean;
  world_check_result?: boolean;
  pep_check?: boolean;
  
  // eCIB specific data
  ecib_data?: {
    last_12m_delinquency?: number;
    last_6m_delinquency?: number;
    last_2m_delinquency?: number;
    dpd_30_count?: number;
    dpd_60_count?: number;
    dpd_90_count?: number;
    total_exposure?: number;
    unsecured_exposure?: number;
    credit_card_exposure?: number;
    personal_loan_exposure?: number;
  };
  
  // VERISYS specific data
  verisys_data?: {
    cnic_valid?: boolean;
    name_match?: boolean;
    dob_match?: boolean;
    address_match?: boolean;
    biometric_verified?: boolean;
  };
  
  // AFD specific data
  afd_data?: {
    cross_product_delinquency?: boolean;
    negative_database_hit?: boolean;
    compliance_issues?: boolean;
  };
  
  // PEP specific data
  pep_data?: {
    is_pep?: boolean;
    pep_category?: string;
    risk_level?: string;
  };
}

export interface SystemChecksResult {
  score: number;
  overallStatus: 'CLEAN' | 'HIT' | 'PENDING';
  decision: 'PROCEED' | 'DECLINE' | 'PENDING';
  criticalHits: string[];
  warnings: string[];
  notes: string[];
  details: {
    ecib: {
      status: 'CLEAN' | 'HIT' | 'PENDING';
      individualCheck: boolean;
      corporateCheck: boolean;
      delinquencyStatus: 'CLEAN' | 'WARNING' | 'HIT';
      exposureStatus: 'WITHIN_LIMITS' | 'EXCEEDED';
    };
    verisys: {
      status: 'CLEAN' | 'HIT' | 'PENDING';
      cnicValid: boolean;
      biometricVerified: boolean;
      dataMatch: boolean;
    };
    afd: {
      status: 'CLEAN' | 'HIT' | 'PENDING';
      delinquencyCheck: boolean;
      complianceCheck: boolean;
      negativeDatabaseCheck: boolean;
    };
    pep: {
      status: 'CLEAN' | 'HIT' | 'PENDING';
      isPep: boolean;
      riskLevel: string;
    };
    worldCheck: {
      status: 'CLEAN' | 'HIT' | 'PENDING';
      result: boolean;
    };
  };
}

export default class SystemChecksModule {
  /**
   * Robust boolean normalizer
   */
  private asBool(v: any): boolean {
    if (v === true || v === 1) return true;
    if (v === 'true' || v === '1') return true;
    if (v === false || v === 0) return false;
    if (v === 'false' || v === '0') return false;
    return false;
  }

  /**
   * Calculate system checks score based on all mandatory checks
   */
  public calculate(input: SystemChecksInput): SystemChecksResult {
    console.log('='.repeat(80));
    console.log('🔍 SYSTEM CHECKS MODULE CALCULATION');
    console.log('='.repeat(80));
    console.log('📥 INPUTS:');
    console.log('  • CNIC:', input.cnic);
    console.log('  • Full Name:', input.full_name);
    console.log('  • Date of Birth:', input.date_of_birth);

    const criticalHits: string[] = [];
    const warnings: string[] = [];
    const notes: string[] = [];

    // 1. eCIB Checks
    console.log('🔍 eCIB CHECKS:');
    const ecibResult = this.performECIBChecks(input);
    if (ecibResult.status === 'HIT') {
      criticalHits.push('eCIB Critical Hit');
    }
    if (ecibResult.warnings.length > 0) {
      warnings.push(...ecibResult.warnings);
    }
    notes.push(...ecibResult.notes);

    // 2. VERISYS Checks
    console.log('🔍 VERISYS CHECKS:');
    const verisysResult = this.performVerisysChecks(input);
    if (verisysResult.status === 'HIT') {
      criticalHits.push('VERISYS Critical Hit');
    }
    if (verisysResult.warnings.length > 0) {
      warnings.push(...verisysResult.warnings);
    }
    notes.push(...verisysResult.notes);

    // 3. AFD Checks
    console.log('🔍 AFD CHECKS:');
    const afdResult = this.performAFDChecks(input);
    if (afdResult.status === 'HIT') {
      criticalHits.push('AFD Critical Hit');
    }
    if (afdResult.warnings.length > 0) {
      warnings.push(...afdResult.warnings);
    }
    notes.push(...afdResult.notes);

    // 4. PEP Checks
    console.log('🔍 PEP CHECKS:');
    const pepResult = this.performPEPChecks(input);
    if (pepResult.status === 'HIT') {
      criticalHits.push('PEP Critical Hit');
    }
    if (pepResult.warnings.length > 0) {
      warnings.push(...pepResult.warnings);
    }
    notes.push(...pepResult.notes);

    // 5. World Check
    console.log('🔍 WORLD CHECK:');
    const worldCheckResult = this.performWorldCheck(input);
    if (worldCheckResult.status === 'HIT') {
      criticalHits.push('World Check Critical Hit');
    }
    if (worldCheckResult.warnings.length > 0) {
      warnings.push(...worldCheckResult.warnings);
    }
    notes.push(...worldCheckResult.notes);

    // Determine overall status
    const overallStatus = criticalHits.length > 0 ? 'HIT' : 'CLEAN';
    const decision = criticalHits.length > 0 ? 'DECLINE' : 'PROCEED';
    const score = criticalHits.length > 0 ? 0 : 100;

    console.log('📊 CALCULATION:');
    console.log('  • Critical Hits:', criticalHits.length);
    console.log('  • Warnings:', warnings.length);
    console.log('  • Overall Status:', overallStatus);
    console.log('  • Decision:', decision);
    console.log('  • Score:', score, '/100');

    console.log('📤 OUTPUTS:');
    console.log('  • Final Score:', score, '/100');
    console.log('  • Status:', overallStatus);
    console.log('  • Decision:', decision);
    console.log('='.repeat(80));

    return {
      score,
      overallStatus,
      decision,
      criticalHits,
      warnings,
      notes,
      details: {
        ecib: ecibResult,
        verisys: verisysResult,
        afd: afdResult,
        pep: pepResult,
        worldCheck: worldCheckResult
      }
    };
  }

  /**
   * Perform eCIB checks
   */
  private performECIBChecks(input: SystemChecksInput): any {
    const individualCheck = this.asBool(input.ecib_individual_check);
    const corporateCheck = this.asBool(input.ecib_corporate_check);
    const ecibData = input.ecib_data || {};
    
    const notes: string[] = [];
    const warnings: string[] = [];
    
    // Check if eCIB checks were performed
    if (!individualCheck && !corporateCheck) {
      notes.push('eCIB checks not performed - PENDING');
      return {
        status: 'PENDING',
        individualCheck: false,
        corporateCheck: false,
        delinquencyStatus: 'CLEAN',
        exposureStatus: 'WITHIN_LIMITS',
        warnings,
        notes
      };
    }

    // Check delinquency status
    const last12mDelinquency = ecibData.last_12m_delinquency || 0;
    const last6mDelinquency = ecibData.last_6m_delinquency || 0;
    const last2mDelinquency = ecibData.last_2m_delinquency || 0;
    const dpd30Count = ecibData.dpd_30_count || 0;
    const dpd60Count = ecibData.dpd_60_count || 0;
    const dpd90Count = ecibData.dpd_90_count || 0;

    let delinquencyStatus = 'CLEAN';
    
    // Framework rules: Last 6m → Max 1×30DPD, none at 60/90
    if (last2mDelinquency > 0 || dpd90Count > 0) {
      delinquencyStatus = 'HIT';
      notes.push('eCIB HIT: Delinquency in last 2 months or 90+ DPD');
    } else if (last6mDelinquency > 1 || dpd60Count > 1) {
      delinquencyStatus = 'HIT';
      notes.push('eCIB HIT: More than 1 delinquency in last 6 months or 60+ DPD');
    } else if (last12mDelinquency > 2 || dpd30Count > 2) {
      delinquencyStatus = 'WARNING';
      warnings.push('eCIB WARNING: High delinquency in last 12 months');
    }

    // Check exposure limits
    const totalExposure = ecibData.total_exposure || 0;
    const unsecuredExposure = ecibData.unsecured_exposure || 0;
    const creditCardExposure = ecibData.credit_card_exposure || 0;
    const personalLoanExposure = ecibData.personal_loan_exposure || 0;

    let exposureStatus = 'WITHIN_LIMITS';
    
    // Framework rules: Max unsecured = Rs. 3m, Aggregate CC+PL+CL ≤ Rs. 3m
    if (unsecuredExposure > 3000000) {
      exposureStatus = 'EXCEEDED';
      notes.push('eCIB HIT: Unsecured exposure exceeds PKR 3M limit');
    } else if (totalExposure > 7000000) {
      exposureStatus = 'EXCEEDED';
      notes.push('eCIB HIT: Total exposure exceeds PKR 7M limit');
    }

    const status = (delinquencyStatus === 'HIT' || exposureStatus === 'EXCEEDED') ? 'HIT' : 'CLEAN';

    notes.push(`eCIB Individual Check: ${individualCheck ? 'PASS' : 'FAIL'}`);
    notes.push(`eCIB Corporate Check: ${corporateCheck ? 'PASS' : 'FAIL'}`);
    notes.push(`Delinquency Status: ${delinquencyStatus}`);
    notes.push(`Exposure Status: ${exposureStatus}`);

    return {
      status,
      individualCheck,
      corporateCheck,
      delinquencyStatus,
      exposureStatus,
      warnings,
      notes
    };
  }

  /**
   * Perform VERISYS checks
   */
  private performVerisysChecks(input: SystemChecksInput): any {
    const verisysCheck = this.asBool(input.verisys_cnic_check);
    const verisysData = input.verisys_data || {};
    
    const notes: string[] = [];
    const warnings: string[] = [];
    
    if (!verisysCheck) {
      notes.push('VERISYS check not performed - PENDING');
      return {
        status: 'PENDING',
        cnicValid: false,
        biometricVerified: false,
        dataMatch: false,
        warnings,
        notes
      };
    }

    const cnicValid = verisysData.cnic_valid !== false;
    const biometricVerified = verisysData.biometric_verified !== false;
    const dataMatch = verisysData.name_match !== false && 
                     verisysData.dob_match !== false && 
                     verisysData.address_match !== false;

    const status = (cnicValid && biometricVerified && dataMatch) ? 'CLEAN' : 'HIT';

    if (!cnicValid) {
      notes.push('VERISYS HIT: Invalid CNIC');
    }
    if (!biometricVerified) {
      notes.push('VERISYS HIT: Biometric verification failed');
    }
    if (!dataMatch) {
      notes.push('VERISYS HIT: Data mismatch detected');
    }

    notes.push(`VERISYS CNIC Check: ${verisysCheck ? 'PASS' : 'FAIL'}`);
    notes.push(`CNIC Valid: ${cnicValid ? 'YES' : 'NO'}`);
    notes.push(`Biometric Verified: ${biometricVerified ? 'YES' : 'NO'}`);
    notes.push(`Data Match: ${dataMatch ? 'YES' : 'NO'}`);

    return {
      status,
      cnicValid,
      biometricVerified,
      dataMatch,
      warnings,
      notes
    };
  }

  /**
   * Perform AFD checks
   */
  private performAFDChecks(input: SystemChecksInput): any {
    const afdDelinquencyCheck = this.asBool(input.afd_delinquency_check);
    const afdComplianceCheck = this.asBool(input.afd_compliance_check);
    const afdData = input.afd_data || {};
    
    const notes: string[] = [];
    const warnings: string[] = [];
    
    if (!afdDelinquencyCheck && !afdComplianceCheck) {
      notes.push('AFD checks not performed - PENDING');
      return {
        status: 'PENDING',
        delinquencyCheck: false,
        complianceCheck: false,
        negativeDatabaseCheck: false,
        warnings,
        notes
      };
    }

    const crossProductDelinquency = afdData.cross_product_delinquency || false;
    const negativeDatabaseHit = afdData.negative_database_hit || false;
    const complianceIssues = afdData.compliance_issues || false;

    const status = (crossProductDelinquency || negativeDatabaseHit || complianceIssues) ? 'HIT' : 'CLEAN';

    if (crossProductDelinquency) {
      notes.push('AFD HIT: Cross-product delinquency detected');
    }
    if (negativeDatabaseHit) {
      notes.push('AFD HIT: Negative database hit');
    }
    if (complianceIssues) {
      notes.push('AFD HIT: Compliance issues detected');
    }

    notes.push(`AFD Delinquency Check: ${afdDelinquencyCheck ? 'PASS' : 'FAIL'}`);
    notes.push(`AFD Compliance Check: ${afdComplianceCheck ? 'PASS' : 'FAIL'}`);
    notes.push(`Cross-Product Delinquency: ${crossProductDelinquency ? 'YES' : 'NO'}`);
    notes.push(`Negative Database Hit: ${negativeDatabaseHit ? 'YES' : 'NO'}`);

    return {
      status,
      delinquencyCheck: afdDelinquencyCheck,
      complianceCheck: afdComplianceCheck,
      negativeDatabaseCheck: negativeDatabaseHit,
      warnings,
      notes
    };
  }

  /**
   * Perform PEP checks
   */
  private performPEPChecks(input: SystemChecksInput): any {
    const pepCheck = this.asBool(input.pep_check);
    const pepData = input.pep_data || {};
    
    const notes: string[] = [];
    const warnings: string[] = [];
    
    if (!pepCheck) {
      notes.push('PEP check not performed - PENDING');
      return {
        status: 'PENDING',
        isPep: false,
        riskLevel: 'UNKNOWN',
        warnings,
        notes
      };
    }

    const isPep = pepData.is_pep || false;
    const riskLevel = pepData.risk_level || 'UNKNOWN';

    const status = isPep ? 'HIT' : 'CLEAN';

    if (isPep) {
      notes.push(`PEP HIT: Politically Exposed Person - ${riskLevel} risk`);
    }

    notes.push(`PEP Check: ${pepCheck ? 'PASS' : 'FAIL'}`);
    notes.push(`Is PEP: ${isPep ? 'YES' : 'NO'}`);
    notes.push(`Risk Level: ${riskLevel}`);

    return {
      status,
      isPep,
      riskLevel,
      warnings,
      notes
    };
  }

  /**
   * Perform World Check
   */
  private performWorldCheck(input: SystemChecksInput): any {
    const worldCheckResult = this.asBool(input.world_check_result);
    
    const notes: string[] = [];
    const warnings: string[] = [];
    
    if (worldCheckResult === undefined) {
      notes.push('World Check not performed - PENDING');
      return {
        status: 'PENDING',
        result: false,
        warnings,
        notes
      };
    }

    const status = worldCheckResult ? 'HIT' : 'CLEAN';

    if (worldCheckResult) {
      notes.push('World Check HIT: Sanctions/negative screening hit');
    }

    notes.push(`World Check: ${worldCheckResult ? 'HIT' : 'CLEAN'}`);

    return {
      status,
      result: worldCheckResult,
      warnings,
      notes
    };
  }
}
