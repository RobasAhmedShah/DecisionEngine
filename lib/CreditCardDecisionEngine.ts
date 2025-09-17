/**
 * Credit Card Decision Engine - Microservice Architecture
 * Uses separate modules for each functionality to enable team-based development
 * Compatible with Next.js API routes
 */

// Import all microservice modules
import SPUModule, { type SPUInput, type SPUResult } from './modules/SPUModule';
import EAMVUModule, { type EAMVUInput, type EAMVUResult } from './modules/EAMVUModule';
import CityModule, { type CityInput, type CityResult } from './modules/CityModule';
import AgeModule, { type AgeInput, type AgeResult } from './modules/AgeModule';
import IncomeModule, { type IncomeInput, type IncomeResult } from './modules/IncomeModule';
import DBRModule, { type DBRInput, type DBRResult } from './modules/DBRModule';
import ApplicationScoreModule, { type ApplicationScoreInput, type ApplicationScoreResult } from './modules/ApplicationScoreModule';
import BehavioralScoreModule, { type BehavioralScoreInput, type BehavioralScoreResult } from './modules/BehavioralScoreModule';
import SystemChecksModule, { type SystemChecksInput, type SystemChecksResult } from './modules/SystemChecksModule';
import CreditLimitModule, { type CreditLimitInput, type CreditLimitResult } from './modules/CreditLimitModule';
import IncomeVerificationModule, { type IncomeVerificationInput, type IncomeVerificationResult } from './modules/IncomeVerificationModule';
import VerificationFrameworkModule, { type VerificationFrameworkInput, type VerificationFrameworkResult } from './modules/VerificationFrameworkModule';
import SpecialSegmentsModule, { type SpecialSegmentsInput, type SpecialSegmentsResult } from './modules/SpecialSegmentsModule';
import DocumentationComplianceModule, { type DocumentationComplianceInput, type DocumentationComplianceResult } from './modules/DocumentationComplianceModule';

// Type definitions
interface ApplicationData {
  applicationId?: number;
  id?: number;
  los_id?: number;
  full_name?: string;
  customerName?: string;
  first_name?: string;
  last_name?: string;
  cnic?: string;
  date_of_birth?: string;
  occupation?: string;
  employment_status?: string;
  employment_type?: string;
  curr_city?: string;
  office_city?: string;
  cluster?: string;
  gross_monthly_income?: number;
  grossMonthlySalary?: number;
  total_income?: number;
  net_monthly_income?: number;
  netMonthlyIncome?: number;
  length_of_employment?: number;
  is_ubl_customer?: boolean | string;
  salary_transfer_flag?: boolean | string;
  spu_black_list_check?: boolean | string;
  spu_credit_card_30k_check?: boolean | string;
  spu_negative_list_check?: boolean | string;
  eavmu_submitted?: boolean | string;
  proposed_loan_amount?: number;
  amount_requested?: number;
  loan_amount?: number;
  amountRequested?: number;
  dbrData?: any;
}

interface DecisionResult {
  applicationId: string | number;
  customerName: string;
  cnic: string;
  finalScore: number;
  decision: string;
  actionRequired: string;
  riskLevel: string;
  dbrPercentage: number;
  assignedCreditLimit?: number;
  cardType?: string;
  moduleScores: {
    spu: { score: number; details: SPUResult };
    eamvu: { score: number; details: EAMVUResult };
    city: { score: number; details: CityResult };
    age: { score: number; details: AgeResult };
    income: { score: number; details: IncomeResult };
    dbr: { score: number; details: DBRResult };
    applicationScore: { score: number; details: ApplicationScoreResult };
    behavioralScore: { score: number; details: BehavioralScoreResult };
    systemChecks: { score: number; details: SystemChecksResult };
    creditLimit: { score: number; details: CreditLimitResult };
    incomeVerification: { score: number; details: IncomeVerificationResult };
    verificationFramework: { score: number; details: VerificationFrameworkResult };
    specialSegments: { score: number; details: SpecialSegmentsResult };
    documentationCompliance: { score: number; details: DocumentationComplianceResult };
  };
}

export default class CreditCardDecisionEngine {
  // Microservice modules
  private spuModule: SPUModule;
  private eamvuModule: EAMVUModule;
  private cityModule: CityModule;
  private ageModule: AgeModule;
  private incomeModule: IncomeModule;
  private dbrModule: DBRModule;
  private applicationScoreModule: ApplicationScoreModule;
  private behavioralScoreModule: BehavioralScoreModule;
  private systemChecksModule: SystemChecksModule;
  private creditLimitModule: CreditLimitModule;
  private incomeVerificationModule: IncomeVerificationModule;
  private verificationFrameworkModule: VerificationFrameworkModule;
  private specialSegmentsModule: SpecialSegmentsModule;
  private documentationComplianceModule: DocumentationComplianceModule;

  constructor() {
    // Initialize all microservice modules
    this.spuModule = new SPUModule();
    this.eamvuModule = new EAMVUModule();
    this.cityModule = new CityModule();
    this.ageModule = new AgeModule();
    this.incomeModule = new IncomeModule();
    this.dbrModule = new DBRModule();
    this.applicationScoreModule = new ApplicationScoreModule();
    this.behavioralScoreModule = new BehavioralScoreModule();
    this.systemChecksModule = new SystemChecksModule();
    this.creditLimitModule = new CreditLimitModule();
    this.incomeVerificationModule = new IncomeVerificationModule();
    this.verificationFrameworkModule = new VerificationFrameworkModule();
    this.specialSegmentsModule = new SpecialSegmentsModule();
    this.documentationComplianceModule = new DocumentationComplianceModule();
    
    console.log('🏗️ Credit Card Decision Engine initialized with microservice modules:');
    console.log(`  • ${this.spuModule.getModuleInfo().name} (Team: ${this.spuModule.getModuleInfo().team})`);
    console.log(`  • ${this.eamvuModule.getModuleInfo().name} (Team: ${this.eamvuModule.getModuleInfo().team})`);
    console.log(`  • ${this.cityModule.getModuleInfo().name} (Team: ${this.cityModule.getModuleInfo().team})`);
    console.log(`  • ${this.ageModule.getModuleInfo().name} (Team: ${this.ageModule.getModuleInfo().team})`);
    console.log(`  • ${this.incomeModule.getModuleInfo().name} (Team: ${this.incomeModule.getModuleInfo().team})`);
    console.log(`  • ${this.dbrModule.getModuleInfo().name} (Team: ${this.dbrModule.getModuleInfo().team})`);
    console.log(`  • ${this.applicationScoreModule.getModuleInfo().name} (Team: ${this.applicationScoreModule.getModuleInfo().team})`);
    console.log(`  • ${this.behavioralScoreModule.getModuleInfo().name} (Team: ${this.behavioralScoreModule.getModuleInfo().team})`);
    console.log(`  • ${this.systemChecksModule.getModuleInfo().name} (Team: ${this.systemChecksModule.getModuleInfo().team})`);
    console.log(`  • ${this.creditLimitModule.getModuleInfo().name} (Team: ${this.creditLimitModule.getModuleInfo().team})`);
    console.log(`  • ${this.incomeVerificationModule.getModuleInfo().name} (Team: ${this.incomeVerificationModule.getModuleInfo().team})`);
    console.log(`  • ${this.verificationFrameworkModule.getModuleInfo().name} (Team: ${this.verificationFrameworkModule.getModuleInfo().team})`);
    console.log(`  • ${this.specialSegmentsModule.getModuleInfo().name} (Team: ${this.specialSegmentsModule.getModuleInfo().team})`);
    console.log(`  • ${this.documentationComplianceModule.getModuleInfo().name} (Team: ${this.documentationComplianceModule.getModuleInfo().team})`);
  }

  /**
   * Get all module information for documentation/debugging
   */
  public getModulesInfo() {
    return {
      spu: this.spuModule.getModuleInfo(),
      eamvu: this.eamvuModule.getModuleInfo(),
      city: this.cityModule.getModuleInfo(),
      age: this.ageModule.getModuleInfo(),
      income: this.incomeModule.getModuleInfo(),
      dbr: this.dbrModule.getModuleInfo(),
      applicationScore: this.applicationScoreModule.getModuleInfo(),
      behavioralScore: this.behavioralScoreModule.getModuleInfo()
    };
  }

  /**
   * SPU Module - Delegates to SPUModule microservice
   */
  public spu(app: ApplicationData): SPUResult {
    const input: SPUInput = {
      spu_black_list_check: app.spu_black_list_check,
      spu_credit_card_30k_check: app.spu_credit_card_30k_check,
      spu_negative_list_check: app.spu_negative_list_check
    };
    return this.spuModule.calculate(input);
  }

  /**
   * EAMVU Module - Delegates to EAMVUModule microservice
   */
  public eamvu(app: ApplicationData): EAMVUResult {
    const input: EAMVUInput = {
      eavmu_submitted: app.eavmu_submitted
    };
    return this.eamvuModule.calculate(input);
  }

  /**
   * City Module - Delegates to CityModule microservice
   */
  public city(app: ApplicationData): CityResult {
    const input: CityInput = {
      curr_city: app.curr_city,
      office_city: app.office_city,
      cluster: app.cluster
    };
    return this.cityModule.calculate(input);
  }

  /**
   * Age Module - Delegates to AgeModule microservice
   */
  public age(app: ApplicationData): AgeResult {
    const input: AgeInput = {
      date_of_birth: app.date_of_birth,
      occupation: app.occupation,
      employment_status: app.employment_status
    };
    return this.ageModule.calculate(input);
  }

  /**
   * Income Module - Delegates to IncomeModule microservice
   */
  public income(app: ApplicationData): IncomeResult {
    const input: IncomeInput = {
      gross_monthly_income: app.gross_monthly_income,
      grossMonthlySalary: app.grossMonthlySalary,
      total_income: app.total_income,
      net_monthly_income: app.net_monthly_income,
      netMonthlyIncome: app.netMonthlyIncome,
      length_of_employment: app.length_of_employment,
      is_ubl_customer: app.is_ubl_customer,
      employment_type: app.employment_type,
      salary_transfer_flag: app.salary_transfer_flag
    };
    return this.incomeModule.calculate(input);
  }

  /**
   * DBR Module - Delegates to DBRModule microservice
   */
  public dbr(app: ApplicationData, dbrData: any = null): DBRResult {
    const input: DBRInput = {
      gross_monthly_income: app.gross_monthly_income,
      grossMonthlySalary: app.grossMonthlySalary,
      total_income: app.total_income,
      net_monthly_income: app.net_monthly_income,
      netMonthlyIncome: app.netMonthlyIncome,
      proposed_loan_amount: app.proposed_loan_amount,
      amount_requested: app.amount_requested,
      loan_amount: app.loan_amount,
      amountRequested: app.amountRequested,
      date_of_birth: app.date_of_birth,
      // SBP-aligned optional inputs (pass-through if provided)
      monthly_installment: (app as any).monthly_installment,
      proposed_principal: (app as any).proposed_principal,
      proposed_tenure_months: (app as any).proposed_tenure_months,
      proposed_annual_rate: (app as any).proposed_annual_rate,
      zero_interest: (app as any).zero_interest,
      existing_monthly_obligations: (app as any).existing_monthly_obligations,
      credit_card_limit: (app as any).credit_card_limit,
      overdraft_annual_interest: (app as any).overdraft_annual_interest,
      cnic: app.cnic,
      dbrData: dbrData || app.dbrData
    };
    return this.dbrModule.calculate(input);
  }

  /**
   * Application Score Module - Delegates to ApplicationScoreModule microservice
   */
  public applicationScore(app: ApplicationData, cbsData: any = null, dbrScore: number = 0): ApplicationScoreResult {
    const input: ApplicationScoreInput = {
      education_qualification: (app as any).education_qualification,
      marital_status: (app as any).marital_status,
      employment_status: app.employment_status,
      net_monthly_income: app.net_monthly_income,
      total_income: app.total_income,
      nature_of_residence: (app as any).nature_of_residence,
      num_dependents: (app as any).num_dependents,
      length_of_employment: app.length_of_employment,
      business_nature: (app as any).business_nature,
      occupation: app.occupation,
      is_ubl_customer: app.is_ubl_customer,
      average_deposit_balance: cbsData?.average_deposit_balance,
      highest_dpd: cbsData?.highest_dpd,
      exposure_in_industry: cbsData?.exposure_in_industry,
      date_of_birth: app.date_of_birth,
      curr_city: app.curr_city,
      office_city: app.office_city,
      cluster: app.cluster,
      dbrScore: dbrScore
    };
    return this.applicationScoreModule.calculate(input);
  }

  /**
   * Behavioral Score Module - Delegates to BehavioralScoreModule microservice
   */
  public behavioralScore(app: ApplicationData, cbsData: any = null): BehavioralScoreResult {
    const input: BehavioralScoreInput = {
      bad_counts_industry: cbsData?.bad_counts_industry,
      bad_counts_ubl: cbsData?.bad_counts_ubl,
      dpd_30_plus: cbsData?.dpd_30_plus,
      dpd_60_plus: cbsData?.dpd_60_plus,
      defaults_12m: cbsData?.defaults_12m,
      late_payments: cbsData?.late_payments,
      average_deposit_balance: cbsData?.average_deposit_balance,
      partial_payments: cbsData?.partial_payments,
      credit_utilization_ratio: cbsData?.credit_utilization_ratio,
      is_ubl_customer: app.is_ubl_customer
    };
    return this.behavioralScoreModule.calculate(input);
  }

  /**
   * System Checks Module - eCIB, VERISYS, AFD, PEP, World Check
   */
  public systemChecks(app: ApplicationData, systemChecksData: any = null): SystemChecksResult {
    const input: SystemChecksInput = {
      cnic: app.cnic || '',
      full_name: app.full_name || '',
      date_of_birth: app.date_of_birth || '',
      ecib_individual_check: systemChecksData?.ecib_individual_check,
      ecib_corporate_check: systemChecksData?.ecib_corporate_check,
      verisys_cnic_check: systemChecksData?.verisys_cnic_check,
      afd_delinquency_check: systemChecksData?.afd_delinquency_check,
      afd_compliance_check: systemChecksData?.afd_compliance_check,
      world_check_result: systemChecksData?.world_check_result,
      pep_check: systemChecksData?.pep_check,
      ecib_data: systemChecksData?.ecib_data,
      verisys_data: systemChecksData?.verisys_data,
      afd_data: systemChecksData?.afd_data,
      pep_data: systemChecksData?.pep_data
    };
    return this.systemChecksModule.calculate(input);
  }

  /**
   * Credit Limit Assignment Module
   */
  public creditLimit(app: ApplicationData, dbrResult: DBRResult, creditLimitData: any = null): CreditLimitResult {
    const input: CreditLimitInput = {
      net_monthly_income: app.net_monthly_income || app.netMonthlyIncome || 0,
      gross_monthly_income: app.gross_monthly_income || app.grossMonthlySalary || 0,
      proposed_loan_amount: app.proposed_loan_amount || app.amount_requested || app.amountRequested,
      dbrPercentage: dbrResult.dbrPercentage,
      dbrScore: dbrResult.score,
      is_ubl_customer: Boolean(app.is_ubl_customer),
      customerType: Boolean(app.is_ubl_customer) ? 'ETB' : 'NTB',
      employment_type: app.employment_type || '',
      salary_transfer_flag: Boolean(app.salary_transfer_flag),
      total_exposure: creditLimitData?.total_exposure,
      unsecured_exposure: creditLimitData?.unsecured_exposure,
      credit_card_exposure: creditLimitData?.credit_card_exposure,
      personal_loan_exposure: creditLimitData?.personal_loan_exposure,
      is_pensioner: (app as any).is_pensioner || false,
      is_remittance_customer: (app as any).is_remittance_customer || false,
      is_cross_sell: (app as any).is_cross_sell || false,
      is_mvc: (app as any).is_mvc || false,
      income_verified: creditLimitData?.income_verified,
      bank_statement_verified: creditLimitData?.bank_statement_verified
    };
    return this.creditLimitModule.calculate(input);
  }

  /**
   * Income Verification Module - Employment Types A/B/C
   */
  public incomeVerification(app: ApplicationData): IncomeVerificationResult {
    const input: IncomeVerificationInput = {
      cnic: app.cnic || '',
      full_name: app.full_name || app.customerName || '',
      date_of_birth: app.date_of_birth || '',
      gross_monthly_income: app.gross_monthly_income || app.grossMonthlySalary || 0,
      net_monthly_income: app.net_monthly_income || app.netMonthlyIncome || 0,
      total_income: app.total_income || 0,
      employment_type: app.employment_type || '',
      employment_status: app.employment_status || '',
      length_of_employment: app.length_of_employment || 0,
      business_nature: (app as any).business_nature || '',
      is_ubl_customer: Boolean(app.is_ubl_customer),
      customerType: Boolean(app.is_ubl_customer) ? 'ETB' : 'NTB',
      salary_transfer_flag: Boolean(app.salary_transfer_flag),
      income_verified: (app as any).income_verified || false,
      bank_statement_verified: (app as any).bank_statement_verified || false,
      office_verification_done: (app as any).office_verification_done || false,
      residence_verification_done: (app as any).residence_verification_done || false,
      company_type: (app as any).company_type || 'UNKNOWN',
      salary_slip_provided: (app as any).salary_slip_provided || false,
      bank_statement_provided: (app as any).bank_statement_provided || false,
      employment_certificate_provided: (app as any).employment_certificate_provided || false,
      hr_letter_provided: (app as any).hr_letter_provided || false,
      is_pensioner: (app as any).is_pensioner || false,
      is_remittance_customer: (app as any).is_remittance_customer || false,
      is_cross_sell: (app as any).is_cross_sell || false,
      is_mvc: (app as any).is_mvc || false
    };
    return this.incomeVerificationModule.calculate(input);
  }

  /**
   * Verification Framework Module - Telephonic, Office/Residence, Waivers
   */
  public verificationFramework(app: ApplicationData): VerificationFrameworkResult {
    const input: VerificationFrameworkInput = {
      cnic: app.cnic || '',
      full_name: app.full_name || app.customerName || '',
      date_of_birth: app.date_of_birth || '',
      curr_city: app.curr_city || '',
      office_city: app.office_city || '',
      is_ubl_customer: Boolean(app.is_ubl_customer),
      customerType: Boolean(app.is_ubl_customer) ? 'ETB' : 'NTB',
      employment_type: app.employment_type || '',
      employment_status: app.employment_status || '',
      company_type: (app as any).company_type || 'UNKNOWN',
      office_verification_done: (app as any).office_verification_done || false,
      residence_verification_done: (app as any).residence_verification_done || false,
      telephonic_verification_done: (app as any).telephonic_verification_done || false,
      clean_eCIB_12m: (app as any).clean_eCIB_12m || false,
      never_30_dpd: (app as any).never_30_dpd || false,
      address_match: (app as any).address_match || false,
      utility_bill_provided: (app as any).utility_bill_provided || false,
      utility_bill_type: (app as any).utility_bill_type || 'NONE',
      salary_in_statement: (app as any).salary_in_statement || false,
      limit_under_500k: (app as any).limit_under_500k || false,
      is_high_risk_city: (app as any).is_high_risk_city || false,
      is_restricted_entity: (app as any).is_restricted_entity || false,
      is_preferred_mailing_address: (app as any).is_preferred_mailing_address || false,
      is_tax_return_doc: (app as any).is_tax_return_doc || false,
      references_provided: (app as any).references_provided || 0,
      positive_references: (app as any).positive_references || 0,
      negative_references: (app as any).negative_references || 0,
      no_response_references: (app as any).no_response_references || 0
    };
    return this.verificationFrameworkModule.calculate(input);
  }

  /**
   * Special Segments Module - Cross-sell, Pensioner, Remittance, MVC
   */
  public specialSegments(app: ApplicationData): SpecialSegmentsResult {
    const input: SpecialSegmentsInput = {
      cnic: app.cnic || '',
      full_name: app.full_name || app.customerName || '',
      date_of_birth: app.date_of_birth || '',
      is_ubl_customer: Boolean(app.is_ubl_customer),
      customerType: Boolean(app.is_ubl_customer) ? 'ETB' : 'NTB',
      net_monthly_income: app.net_monthly_income || app.netMonthlyIncome || 0,
      gross_monthly_income: app.gross_monthly_income || app.grossMonthlySalary || 0,
      is_pensioner: (app as any).is_pensioner || false,
      is_remittance_customer: (app as any).is_remittance_customer || false,
      is_cross_sell: (app as any).is_cross_sell || false,
      is_mvc: (app as any).is_mvc || false,
      has_auto_loan: (app as any).has_auto_loan || false,
      has_mortgage_loan: (app as any).has_mortgage_loan || false,
      loan_disbursement_date: (app as any).loan_disbursement_date || '',
      vehicle_tracker_status: (app as any).vehicle_tracker_status || 'NONE',
      late_payments_count: (app as any).late_payments_count || 0,
      fresh_ecib_required: (app as any).fresh_ecib_required || false,
      address_changed: (app as any).address_changed || false,
      is_deviation_account: (app as any).is_deviation_account || false,
      is_islamic_poa: (app as any).is_islamic_poa || false,
      asset_in_use: (app as any).asset_in_use || false,
      pension_income: (app as any).pension_income || 0,
      pension_credits_count: (app as any).pension_credits_count || 0,
      credit_shield_insurance: (app as any).credit_shield_insurance || false,
      pension_book_provided: (app as any).pension_book_provided || false,
      remittance_source: (app as any).remittance_source || 'OTHER',
      blood_relative_proof: (app as any).blood_relative_proof || false,
      remittance_amount_12m: (app as any).remittance_amount_12m || 0,
      remittance_entries_count: (app as any).remittance_entries_count || 0,
      last_remittance_date: (app as any).last_remittance_date || '',
      relationship_proof_provided: (app as any).relationship_proof_provided || false,
      business_duration_months: (app as any).business_duration_months || 0,
      average_balance: (app as any).average_balance || 0,
      credits_last_6m: (app as any).credits_last_6m || 0,
      kyc_mismatch: (app as any).kyc_mismatch || false,
      branch_manager_endorsement: (app as any).branch_manager_endorsement || false
    };
    return this.specialSegmentsModule.calculate(input);
  }

  /**
   * Documentation & Compliance Module - NADRA BVS, CNIC validation
   */
  public documentationCompliance(app: ApplicationData): DocumentationComplianceResult {
    const input: DocumentationComplianceInput = {
      cnic: app.cnic || '',
      full_name: app.full_name || app.customerName || '',
      date_of_birth: app.date_of_birth || '',
      place_of_birth: (app as any).place_of_birth || '',
      permanent_address: (app as any).permanent_address || '',
      current_address: (app as any).current_address || '',
      cnic_expiry_date: (app as any).cnic_expiry_date || '',
      cnic_issue_date: (app as any).cnic_issue_date || '',
      cnic_valid: (app as any).cnic_valid || false,
      bvs_performed: (app as any).bvs_performed || false,
      bvs_successful: (app as any).bvs_successful || false,
      bvs_not_possible_reason: (app as any).bvs_not_possible_reason || 'NONE',
      bvs_deferral_date: (app as any).bvs_deferral_date || '',
      bvs_deferral_reason: (app as any).bvs_deferral_reason || '',
      verisys_performed: (app as any).verisys_performed || false,
      verisys_approved: (app as any).verisys_approved || false,
      verisys_authority: (app as any).verisys_authority || 'NONE',
      cnic_copy_provided: (app as any).cnic_copy_provided || false,
      cnic_copies_count: (app as any).cnic_copies_count || 0,
      address_verification_done: (app as any).address_verification_done || false,
      signature_verification_done: (app as any).signature_verification_done || false,
      is_new_applicant: (app as any).is_new_applicant || true,
      is_active_customer: (app as any).is_active_customer || false,
      cnic_expiry_notice_sent: (app as any).cnic_expiry_notice_sent || false,
      cnic_update_within_30_days: (app as any).cnic_update_within_30_days || false,
      afd_clearance_required: (app as any).afd_clearance_required || false,
      afd_clearance_obtained: (app as any).afd_clearance_obtained || false,
      afd_mismatch_details: (app as any).afd_mismatch_details || ''
    };
    return this.documentationComplianceModule.calculate(input);
  }

  /**
   * Main calculation method that orchestrates all microservices
   */
  public calculateDecision(applicationData: ApplicationData, cbsData: any = null, systemChecksData: any = null, creditLimitData: any = null): DecisionResult {
    console.log('🚀 Starting Decision Calculation with Complete Microservice Architecture');
    console.log('🎯 All 10 modules are handled by separate teams:');
    
    // Calculate all modules using microservices
    const spuResult = this.spu(applicationData);
    const eamvuResult = this.eamvu(applicationData);
    const cityResult = this.city(applicationData);
    const ageResult = this.age(applicationData);
    const incomeResult = this.income(applicationData);
    const dbrResult = this.dbr(applicationData, cbsData);
    
    // Calculate Application and Behavioral scores
    const applicationScoreResult = this.applicationScore(applicationData, cbsData, dbrResult.score);
    const behavioralScoreResult = this.behavioralScore(applicationData, cbsData);
    
    // Calculate System Checks and Credit Limit
    const systemChecksResult = this.systemChecks(applicationData, systemChecksData);
    const creditLimitResult = this.creditLimit(applicationData, dbrResult, creditLimitData);
    
    // Calculate new framework modules
    const incomeVerificationResult = this.incomeVerification(applicationData);
    const verificationFrameworkResult = this.verificationFramework(applicationData);
    const specialSegmentsResult = this.specialSegments(applicationData);
    const documentationComplianceResult = this.documentationCompliance(applicationData);

    // Determine customer type for weight calculation
    const isETB = applicationData.is_ubl_customer === true || applicationData.is_ubl_customer === "true";

    // Check for critical failures (hard stops) first
    if (this.ageModule.isCriticalFailure(ageResult)) {
      return this.buildFailureResult(applicationData, 'Age validation failed', ageResult.notes[0] || 'Age validation failed', dbrResult, {
        spu: spuResult, eamvu: eamvuResult, city: cityResult, age: ageResult, income: incomeResult, dbr: dbrResult, applicationScore: applicationScoreResult, behavioralScore: behavioralScoreResult, systemChecks: systemChecksResult, creditLimit: creditLimitResult, incomeVerification: incomeVerificationResult, verificationFramework: verificationFrameworkResult, specialSegments: specialSegmentsResult, documentationCompliance: documentationComplianceResult
      }, true);
    }

    if (this.spuModule.isCriticalFailure(spuResult)) {
      return this.buildFailureResult(applicationData, 'SPU Critical Hit - Automatic Fail', 'SPU Critical Hit - Automatic Fail', dbrResult, {
        spu: spuResult, eamvu: eamvuResult, city: cityResult, age: ageResult, income: incomeResult, dbr: dbrResult, applicationScore: applicationScoreResult, behavioralScore: behavioralScoreResult,         systemChecks: systemChecksResult, creditLimit: creditLimitResult, incomeVerification: incomeVerificationResult, verificationFramework: verificationFrameworkResult, specialSegments: specialSegmentsResult, documentationCompliance: documentationComplianceResult
      }, true);
    }

    if (this.cityModule.isCriticalFailure(cityResult)) {
      return this.buildFailureResult(applicationData, 'Annexure A Area - Automatic Fail', 'Annexure A Area - Automatic Fail', dbrResult, {
        spu: spuResult, eamvu: eamvuResult, city: cityResult, age: ageResult, income: incomeResult, dbr: dbrResult, applicationScore: applicationScoreResult, behavioralScore: behavioralScoreResult,         systemChecks: systemChecksResult, creditLimit: creditLimitResult, incomeVerification: incomeVerificationResult, verificationFramework: verificationFrameworkResult, specialSegments: specialSegmentsResult, documentationCompliance: documentationComplianceResult
      }, true);
    }

    if (this.dbrModule.isCriticalFailure(dbrResult)) {
      return this.buildFailureResult(applicationData, `DBR ${dbrResult.dbrPercentage.toFixed(2)}% exceeds threshold ${dbrResult.dbrThreshold}%`, `DBR ${dbrResult.dbrPercentage.toFixed(2)}% exceeds threshold ${dbrResult.dbrThreshold}%`, dbrResult, {
        spu: spuResult, eamvu: eamvuResult, city: cityResult, age: ageResult, income: incomeResult, dbr: dbrResult, applicationScore: applicationScoreResult, behavioralScore: behavioralScoreResult,         systemChecks: systemChecksResult, creditLimit: creditLimitResult, incomeVerification: incomeVerificationResult, verificationFramework: verificationFrameworkResult, specialSegments: specialSegmentsResult, documentationCompliance: documentationComplianceResult
      }, true);
    }

    // Check system checks critical failures
    if (systemChecksResult.decision === 'DECLINE') {
      return this.buildFailureResult(applicationData, 'System Checks Critical Hit - Automatic Fail', 'System Checks Critical Hit - Automatic Fail', dbrResult, {
        spu: spuResult, eamvu: eamvuResult, city: cityResult, age: ageResult, income: incomeResult, dbr: dbrResult, applicationScore: applicationScoreResult, behavioralScore: behavioralScoreResult,         systemChecks: systemChecksResult, creditLimit: creditLimitResult, incomeVerification: incomeVerificationResult, verificationFramework: verificationFrameworkResult, specialSegments: specialSegmentsResult, documentationCompliance: documentationComplianceResult
      }, true);
    }

    // Calculate weighted final score using dynamic weights based on customer type
    const applicationScoreWeight = this.applicationScoreModule.getWeight(isETB);
    const behavioralScoreWeight = isETB ? this.behavioralScoreModule.getWeight() : 0;

    const finalScore = Math.round(
      (dbrResult.score * this.dbrModule.getWeight()) +
      (spuResult.score * this.spuModule.getWeight()) +
      (eamvuResult.score * this.eamvuModule.getWeight()) +
      (ageResult.score * this.ageModule.getWeight()) +
      (cityResult.score * this.cityModule.getWeight()) +
      (incomeResult.score * this.incomeModule.getWeight()) +
      (applicationScoreResult.score * applicationScoreWeight) +
      (behavioralScoreResult.score * behavioralScoreWeight) +
      // Framework modules (lower weights for compliance/verification)
      (incomeVerificationResult.score * 0.03) +  // 3% weight
      (verificationFrameworkResult.score * 0.02) + // 2% weight
      (specialSegmentsResult.score * 0.02) +     // 2% weight
      (documentationComplianceResult.score * 0.03) // 3% weight
    );

    console.log('📊 WEIGHTED CALCULATION:');
    console.log(`  • DBR: ${dbrResult.score} × ${this.dbrModule.getWeight()} = ${(dbrResult.score * this.dbrModule.getWeight()).toFixed(2)}`);
    console.log(`  • Application Score: ${applicationScoreResult.score} × ${applicationScoreWeight} = ${(applicationScoreResult.score * applicationScoreWeight).toFixed(2)}`);
    console.log(`  • Income: ${incomeResult.score} × ${this.incomeModule.getWeight()} = ${(incomeResult.score * this.incomeModule.getWeight()).toFixed(2)}`);
    console.log(`  • SPU: ${spuResult.score} × ${this.spuModule.getWeight()} = ${(spuResult.score * this.spuModule.getWeight()).toFixed(2)}`);
    console.log(`  • EAMVU: ${eamvuResult.score} × ${this.eamvuModule.getWeight()} = ${(eamvuResult.score * this.eamvuModule.getWeight()).toFixed(2)}`);
    console.log(`  • Age: ${ageResult.score} × ${this.ageModule.getWeight()} = ${(ageResult.score * this.ageModule.getWeight()).toFixed(2)}`);
    console.log(`  • City: ${cityResult.score} × ${this.cityModule.getWeight()} = ${(cityResult.score * this.cityModule.getWeight()).toFixed(2)}`);
    if (isETB) {
      console.log(`  • Behavioral Score: ${behavioralScoreResult.score} × ${behavioralScoreWeight} = ${(behavioralScoreResult.score * behavioralScoreWeight).toFixed(2)}`);
    }
    console.log(`  • Customer Type: ${isETB ? 'ETB' : 'NTB'}`);
    console.log(`  • Total: ${finalScore}/100`);

    // Determine decision based on score
    let decision: string, actionRequired: string, riskLevel: string;
    if (finalScore >= 90) {
      decision = 'PASS';
      actionRequired = 'None';
      riskLevel = 'VERY_LOW';
    } else if (finalScore >= 80) {
      decision = 'PASS';
      actionRequired = 'Basic conditions';
      riskLevel = 'LOW';
    } else if (finalScore >= 70) {
      decision = 'CONDITIONAL PASS';
      actionRequired = 'Additional conditions';
      riskLevel = 'MEDIUM';
    } else if (finalScore >= 60) {
      decision = 'CONDITIONAL PASS';
      actionRequired = 'Manual review';
      riskLevel = 'HIGH';
    } else {
      decision = 'FAIL';
      actionRequired = 'Low score - Decline application';
      riskLevel = 'VERY_HIGH';
    }

    console.log('🎯 FINAL DECISION:');
    console.log(`  • Score: ${finalScore}/100`);
    console.log(`  • Decision: ${decision}`);
    console.log(`  • Risk Level: ${riskLevel}`);
    console.log(`  • Action Required: ${actionRequired}`);

    return {
      applicationId: applicationData.applicationId || applicationData.id || applicationData.los_id || 0,
      customerName: applicationData.full_name || applicationData.customerName || `${applicationData.first_name || ''} ${applicationData.last_name || ''}`.trim() || 'Unknown',
      cnic: applicationData.cnic || '',
      finalScore,
      decision,
      actionRequired,
      riskLevel,
      dbrPercentage: dbrResult.dbrPercentage,
      assignedCreditLimit: creditLimitResult.assignedLimit,
      cardType: creditLimitResult.cardType,
      moduleScores: {
        spu: { score: spuResult.score, details: spuResult },
        eamvu: { score: eamvuResult.score, details: eamvuResult },
        city: { score: cityResult.score, details: cityResult },
        age: { score: ageResult.score, details: ageResult },
        income: { score: incomeResult.score, details: incomeResult },
        dbr: { score: dbrResult.score, details: dbrResult },
        applicationScore: { score: applicationScoreResult.score, details: applicationScoreResult },
        behavioralScore: { score: behavioralScoreResult.score, details: behavioralScoreResult },
        systemChecks: { score: systemChecksResult.score, details: systemChecksResult },
        creditLimit: { score: creditLimitResult.score, details: creditLimitResult },
        incomeVerification: { score: incomeVerificationResult.score, details: incomeVerificationResult },
        verificationFramework: { score: verificationFrameworkResult.score, details: verificationFrameworkResult },
        specialSegments: { score: specialSegmentsResult.score, details: specialSegmentsResult },
        documentationCompliance: { score: documentationComplianceResult.score, details: documentationComplianceResult }
      }
    };
  }

  /**
   * Helper method to build failure result
   */
  private buildFailureResult(
    applicationData: ApplicationData, 
    reason: string, 
    actionRequired: string, 
    dbrResult: DBRResult,
    moduleResults: {
      spu: SPUResult;
      eamvu: EAMVUResult;
      city: CityResult;
      age: AgeResult;
      income: IncomeResult;
      dbr: DBRResult;
      applicationScore: ApplicationScoreResult;
      behavioralScore: BehavioralScoreResult;
      systemChecks?: SystemChecksResult;
      creditLimit?: CreditLimitResult;
      incomeVerification?: IncomeVerificationResult;
      verificationFramework?: VerificationFrameworkResult;
      specialSegments?: SpecialSegmentsResult;
      documentationCompliance?: DocumentationComplianceResult;
    },
    isHardStop: boolean = false
  ): DecisionResult {
    // For hard stops, force final score to 0. Otherwise, calculate actual weighted score (for transparency)
    let calculatedScore = 0;
    
    if (isHardStop) {
      console.log('🚨 HARD STOP DETECTED - Final Score forced to 0');
      calculatedScore = 0;
    } else {
      const isETB = applicationData.is_ubl_customer === true || applicationData.is_ubl_customer === "true";
      const applicationScoreWeight = this.applicationScoreModule.getWeight(isETB);
      const behavioralScoreWeight = isETB ? this.behavioralScoreModule.getWeight() : 0;

      calculatedScore = Math.round(
        (moduleResults.dbr.score * this.dbrModule.getWeight()) +
        (moduleResults.spu.score * this.spuModule.getWeight()) +
        (moduleResults.eamvu.score * this.eamvuModule.getWeight()) +
        (moduleResults.age.score * this.ageModule.getWeight()) +
        (moduleResults.city.score * this.cityModule.getWeight()) +
        (moduleResults.income.score * this.incomeModule.getWeight()) +
        (moduleResults.applicationScore.score * applicationScoreWeight) +
        (moduleResults.behavioralScore.score * behavioralScoreWeight) +
        // Framework modules (with null safety)
        (((moduleResults as any).incomeVerification?.score || 0) * 0.03) +
        (((moduleResults as any).verificationFramework?.score || 0) * 0.02) +
        (((moduleResults as any).specialSegments?.score || 0) * 0.02) +
        (((moduleResults as any).documentationCompliance?.score || 0) * 0.03)
      );
    }

    return {
      applicationId: applicationData.applicationId || applicationData.id || applicationData.los_id || 0,
      customerName: applicationData.full_name || applicationData.customerName || `${applicationData.first_name || ''} ${applicationData.last_name || ''}`.trim() || 'Unknown',
      cnic: applicationData.cnic || '',
      finalScore: calculatedScore,
      decision: 'FAIL',
      actionRequired,
      riskLevel: 'VERY_HIGH',
      dbrPercentage: dbrResult.dbrPercentage,
      moduleScores: {
        spu: { score: moduleResults.spu.score, details: moduleResults.spu },
        eamvu: { score: moduleResults.eamvu.score, details: moduleResults.eamvu },
        city: { score: moduleResults.city.score, details: moduleResults.city },
        age: { score: moduleResults.age.score, details: moduleResults.age },
        income: { score: moduleResults.income.score, details: moduleResults.income },
        dbr: { score: moduleResults.dbr.score, details: moduleResults.dbr },
        applicationScore: { score: moduleResults.applicationScore.score, details: moduleResults.applicationScore },
        behavioralScore: { score: moduleResults.behavioralScore.score, details: moduleResults.behavioralScore },
        systemChecks: { score: (moduleResults as any).systemChecks?.score || 0, details: (moduleResults as any).systemChecks || {} },
        creditLimit: { score: (moduleResults as any).creditLimit?.score || 0, details: (moduleResults as any).creditLimit || {} },
        incomeVerification: { score: (moduleResults as any).incomeVerification?.score || 0, details: (moduleResults as any).incomeVerification || {} },
        verificationFramework: { score: (moduleResults as any).verificationFramework?.score || 0, details: (moduleResults as any).verificationFramework || {} },
        specialSegments: { score: (moduleResults as any).specialSegments?.score || 0, details: (moduleResults as any).specialSegments || {} },
        documentationCompliance: { score: (moduleResults as any).documentationCompliance?.score || 0, details: (moduleResults as any).documentationCompliance || {} }
      }
    };
  }

  /**
   * Validate application data across all modules
   */
  public validateApplicationData(applicationData: ApplicationData): { isValid: boolean; errors: string[] } {
    const allErrors: string[] = [];
    
    // Validate each module's input
    const ageValidation = this.ageModule.validateInput({
      date_of_birth: applicationData.date_of_birth,
      occupation: applicationData.occupation,
      employment_status: applicationData.employment_status
    });
    if (!ageValidation.isValid) allErrors.push(...ageValidation.errors.map((e: string) => `Age: ${e}`));

    const cityValidation = this.cityModule.validateInput({
      curr_city: applicationData.curr_city,
      office_city: applicationData.office_city,
      cluster: applicationData.cluster
    });
    if (!cityValidation.isValid) allErrors.push(...cityValidation.errors.map((e: string) => `City: ${e}`));

    const incomeValidation = this.incomeModule.validateInput({
      gross_monthly_income: applicationData.gross_monthly_income,
      total_income: applicationData.total_income,
      employment_type: applicationData.employment_type
    });
    if (!incomeValidation.isValid) allErrors.push(...incomeValidation.errors.map((e: string) => `Income: ${e}`));

    const eamvuValidation = this.eamvuModule.validateInput({
      eavmu_submitted: applicationData.eavmu_submitted
    });
    if (!eamvuValidation.isValid) allErrors.push(...eamvuValidation.errors.map((e: string) => `EAMVU: ${e}`));

    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }

  /**
   * Get system information for monitoring/debugging
   */
  public getSystemInfo() {
    return {
      version: '2.0.0',
      architecture: 'Complete Microservices',
      modules: this.getModulesInfo(),
      totalModules: 8,
      teams: [
        'Security & Risk Assessment',
        'Asset Verification & Documentation',
        'Geographic Risk & Coverage Analysis',
        'Demographics & Employment Analysis',
        'Financial Analysis & Income Verification',
        'Credit Risk & Debt Analysis',
        'Application Data & Scorecard Analysis',
        'Behavioral Analytics & Credit History'
      ]
    };
  }
}
