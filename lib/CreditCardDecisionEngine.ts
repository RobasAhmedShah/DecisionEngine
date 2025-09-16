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
    
    console.log('🏗️ Credit Card Decision Engine initialized with microservice modules:');
    console.log(`  • ${this.spuModule.getModuleInfo().name} (Team: ${this.spuModule.getModuleInfo().team})`);
    console.log(`  • ${this.eamvuModule.getModuleInfo().name} (Team: ${this.eamvuModule.getModuleInfo().team})`);
    console.log(`  • ${this.cityModule.getModuleInfo().name} (Team: ${this.cityModule.getModuleInfo().team})`);
    console.log(`  • ${this.ageModule.getModuleInfo().name} (Team: ${this.ageModule.getModuleInfo().team})`);
    console.log(`  • ${this.incomeModule.getModuleInfo().name} (Team: ${this.incomeModule.getModuleInfo().team})`);
    console.log(`  • ${this.dbrModule.getModuleInfo().name} (Team: ${this.dbrModule.getModuleInfo().team})`);
    console.log(`  • ${this.applicationScoreModule.getModuleInfo().name} (Team: ${this.applicationScoreModule.getModuleInfo().team})`);
    console.log(`  • ${this.behavioralScoreModule.getModuleInfo().name} (Team: ${this.behavioralScoreModule.getModuleInfo().team})`);
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
      is_ubl_customer: app.is_ubl_customer || false,
      customerType: app.is_ubl_customer ? 'ETB' : 'NTB',
      employment_type: app.employment_type || '',
      salary_transfer_flag: app.salary_transfer_flag || false,
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

    // Determine customer type for weight calculation
    const isETB = applicationData.is_ubl_customer === true || applicationData.is_ubl_customer === "true";

    // Check for critical failures (hard stops) first
    if (this.ageModule.isCriticalFailure(ageResult)) {
      return this.buildFailureResult(applicationData, 'Age validation failed', ageResult.notes[0] || 'Age validation failed', dbrResult, {
        spu: spuResult, eamvu: eamvuResult, city: cityResult, age: ageResult, income: incomeResult, dbr: dbrResult, applicationScore: applicationScoreResult, behavioralScore: behavioralScoreResult
      });
    }

    if (this.spuModule.isCriticalFailure(spuResult)) {
      return this.buildFailureResult(applicationData, 'SPU Critical Hit - Automatic Fail', 'SPU Critical Hit - Automatic Fail', dbrResult, {
        spu: spuResult, eamvu: eamvuResult, city: cityResult, age: ageResult, income: incomeResult, dbr: dbrResult, applicationScore: applicationScoreResult, behavioralScore: behavioralScoreResult
      });
    }

    if (this.cityModule.isCriticalFailure(cityResult)) {
      return this.buildFailureResult(applicationData, 'Annexure A Area - Automatic Fail', 'Annexure A Area - Automatic Fail', dbrResult, {
        spu: spuResult, eamvu: eamvuResult, city: cityResult, age: ageResult, income: incomeResult, dbr: dbrResult, applicationScore: applicationScoreResult, behavioralScore: behavioralScoreResult
      });
    }

    if (this.dbrModule.isCriticalFailure(dbrResult)) {
      return this.buildFailureResult(applicationData, `DBR ${dbrResult.dbrPercentage.toFixed(2)}% exceeds threshold ${dbrResult.dbrThreshold}%`, `DBR ${dbrResult.dbrPercentage.toFixed(2)}% exceeds threshold ${dbrResult.dbrThreshold}%`, dbrResult, {
        spu: spuResult, eamvu: eamvuResult, city: cityResult, age: ageResult, income: incomeResult, dbr: dbrResult, applicationScore: applicationScoreResult, behavioralScore: behavioralScoreResult, systemChecks: systemChecksResult, creditLimit: creditLimitResult
      });
    }

    // Check system checks critical failures
    if (systemChecksResult.decision === 'DECLINE') {
      return this.buildFailureResult(applicationData, 'System Checks Critical Hit - Automatic Fail', 'System Checks Critical Hit - Automatic Fail', dbrResult, {
        spu: spuResult, eamvu: eamvuResult, city: cityResult, age: ageResult, income: incomeResult, dbr: dbrResult, applicationScore: applicationScoreResult, behavioralScore: behavioralScoreResult, systemChecks: systemChecksResult, creditLimit: creditLimitResult
      });
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
      (behavioralScoreResult.score * behavioralScoreWeight)
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
        creditLimit: { score: creditLimitResult.score, details: creditLimitResult }
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
    }
  ): DecisionResult {
    return {
      applicationId: applicationData.applicationId || applicationData.id || applicationData.los_id || 0,
      customerName: applicationData.full_name || applicationData.customerName || `${applicationData.first_name || ''} ${applicationData.last_name || ''}`.trim() || 'Unknown',
      cnic: applicationData.cnic || '',
      finalScore: 0,
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
        creditLimit: { score: (moduleResults as any).creditLimit?.score || 0, details: (moduleResults as any).creditLimit || {} }
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
