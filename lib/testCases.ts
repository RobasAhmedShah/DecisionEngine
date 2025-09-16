/**
 * Test Cases for Credit Card Decision Engine
 * Comprehensive test scenarios covering various decision outcomes
 */

export interface TestCase {
  id: string;
  name: string;
  description: string;
  category: 'ideal' | 'good' | 'borderline' | 'failure' | 'edge';
  expectedScore: string;
  expectedDecision: string;
  expectedAction: string;
  applicationData: any;
  cbsData?: any;
  systemChecksData?: any;
  creditLimitData?: any;
  userStory: string;
}

export const testCases: TestCase[] = [
  {
    id: 'case-1',
    name: 'Perfect ETB Customer',
    description: 'Existing customer with excellent profile - should easily pass',
    category: 'ideal',
    expectedScore: '85-95',
    expectedDecision: 'PASS',
    expectedAction: 'None',
    userStory: 'As a bank, I want to approve applications from existing customers with excellent profiles so that we can retain and grow our customer base.',
    applicationData: {
      applicationId: 1001,
      full_name: 'Ahmed Ali Khan',
      cnic: '3520112345678',
      date_of_birth: '1985-06-15',
      gross_monthly_income: 150000,
      net_monthly_income: 120000,
      curr_city: 'karachi',
      office_city: 'karachi',
      cluster: 'PREMIUM',
      is_ubl_customer: true,
      employment_status: 'Employed',
      employment_type: 'permanent',
      length_of_employment: 8,
      education_qualification: 'Masters',
      marital_status: 'Married',
      eavmu_submitted: true,
      salary_transfer_flag: true,
      proposed_loan_amount: 0,
      amount_requested: 200000,
      spu_black_list_check: false,
      spu_credit_card_30k_check: false,
      spu_negative_list_check: false
    },
    cbsData: {
      average_deposit_balance: 500000,
      highest_dpd: 0,
      exposure_in_industry: 0,
      bad_counts_industry: 0,
      bad_counts_ubl: 0,
      dpd_30_plus: 0,
      dpd_60_plus: 0,
      defaults_12m: 0,
      late_payments: 0,
      partial_payments: 0,
      credit_utilization_ratio: 0.2
    },
    systemChecksData: {
      ecib_individual_check: true,
      ecib_corporate_check: true,
      verisys_cnic_check: true,
      afd_delinquency_check: true,
      afd_compliance_check: true,
      pep_check: true,
      world_check_result: false,
      ecib_data: {
        last_12m_delinquency: 0,
        last_6m_delinquency: 0,
        last_2m_delinquency: 0,
        dpd_30_count: 0,
        dpd_60_count: 0,
        dpd_90_count: 0,
        total_exposure: 0,
        unsecured_exposure: 0,
        credit_card_exposure: 0,
        personal_loan_exposure: 0
      },
      verisys_data: {
        cnic_valid: true,
        name_match: true,
        dob_match: true,
        address_match: true,
        biometric_verified: true
      },
      afd_data: {
        cross_product_delinquency: false,
        negative_database_hit: false,
        compliance_issues: false
      },
      pep_data: {
        is_pep: false,
        pep_category: 'NONE',
        risk_level: 'LOW'
      }
    },
    creditLimitData: {
      total_exposure: 0,
      unsecured_exposure: 0,
      credit_card_exposure: 0,
      personal_loan_exposure: 0,
      income_verified: true,
      bank_statement_verified: true
    }
  },
  {
    id: 'case-2',
    name: 'Good NTB Customer',
    description: 'New customer with good profile - should get conditional pass',
    category: 'good',
    expectedScore: '70-80',
    expectedDecision: 'CONDITIONAL PASS',
    expectedAction: 'Basic conditions',
    userStory: 'As a bank, I want to approve applications from new customers with good profiles so that we can expand our customer base.',
    applicationData: {
      applicationId: 1002,
      full_name: 'Sara Ahmed',
      cnic: '3520198765432',
      date_of_birth: '1990-03-22',
      gross_monthly_income: 80000,
      net_monthly_income: 65000,
      curr_city: 'lahore',
      office_city: 'lahore',
      cluster: 'STANDARD',
      is_ubl_customer: false,
      employment_status: 'Employed',
      employment_type: 'permanent',
      length_of_employment: 3,
      education_qualification: 'Bachelors',
      marital_status: 'Single',
      eavmu_submitted: true,
      salary_transfer_flag: false,
      proposed_loan_amount: 0,
      amount_requested: 100000,
      spu_black_list_check: false,
      spu_credit_card_30k_check: false,
      spu_negative_list_check: false
    },
    systemChecksData: {
      ecib_individual_check: true,
      ecib_corporate_check: true,
      verisys_cnic_check: true,
      afd_delinquency_check: true,
      afd_compliance_check: true,
      pep_check: true,
      world_check_result: false,
      ecib_data: {
        last_12m_delinquency: 0,
        last_6m_delinquency: 0,
        last_2m_delinquency: 0,
        dpd_30_count: 0,
        dpd_60_count: 0,
        dpd_90_count: 0,
        total_exposure: 0,
        unsecured_exposure: 0,
        credit_card_exposure: 0,
        personal_loan_exposure: 0
      },
      verisys_data: {
        cnic_valid: true,
        name_match: true,
        dob_match: true,
        address_match: true,
        biometric_verified: true
      },
      afd_data: {
        cross_product_delinquency: false,
        negative_database_hit: false,
        compliance_issues: false
      },
      pep_data: {
        is_pep: false,
        pep_category: 'NONE',
        risk_level: 'LOW'
      }
    },
    creditLimitData: {
      total_exposure: 0,
      unsecured_exposure: 0,
      credit_card_exposure: 0,
      personal_loan_exposure: 0,
      income_verified: true,
      bank_statement_verified: true
    }
  },
  {
    id: 'case-3',
    name: 'High DBR Failure',
    description: 'Application with excessive debt-to-income ratio - should fail',
    category: 'failure',
    expectedScore: '0',
    expectedDecision: 'FAIL',
    expectedAction: 'DBR exceeds threshold',
    userStory: 'As a bank, I want to automatically decline applications with excessive debt-to-income ratios to minimize credit risk.',
    applicationData: {
      applicationId: 1003,
      full_name: 'Muhammad Hassan',
      cnic: '3520155566677',
      date_of_birth: '1988-12-10',
      gross_monthly_income: 40000,
      net_monthly_income: 35000,
      curr_city: 'islamabad',
      is_ubl_customer: true,
      employment_status: 'Employed',
      employment_type: 'permanent',
      length_of_employment: 2,
      education_qualification: 'Bachelors',
      marital_status: 'Married',
      eavmu_submitted: true,
      salary_transfer_flag: false,
      proposed_loan_amount: 40000,
      spu_black_list_check: false,
      spu_credit_card_30k_check: false,
      spu_negative_list_check: false
    }
  },
  {
    id: 'case-4',
    name: 'Age Limit Failure',
    description: 'Applicant outside acceptable age range - should fail',
    category: 'failure',
    expectedScore: '0',
    expectedDecision: 'FAIL',
    expectedAction: 'Age validation failed',
    userStory: 'As a bank, I want to automatically decline applications from applicants outside the acceptable age range to comply with risk policies.',
    applicationData: {
      applicationId: 1004,
      full_name: 'Fatima Khan',
      cnic: '3520111122233',
      date_of_birth: '1960-05-15',
      gross_monthly_income: 100000,
      net_monthly_income: 80000,
      curr_city: 'karachi',
      is_ubl_customer: true,
      employment_status: 'Employed',
      employment_type: 'permanent',
      length_of_employment: 15,
      education_qualification: 'Masters',
      marital_status: 'Married',
      eavmu_submitted: true,
      salary_transfer_flag: true,
      proposed_loan_amount: 25000,
      spu_black_list_check: false,
      spu_credit_card_30k_check: false,
      spu_negative_list_check: false
    },
    systemChecksData: {
      ecib_individual_check: true,
      ecib_corporate_check: true,
      verisys_cnic_check: true,
      afd_delinquency_check: true,
      afd_compliance_check: true,
      pep_check: true,
      world_check_result: false,
      ecib_data: {
        last_12m_delinquency: 0,
        last_6m_delinquency: 0,
        last_2m_delinquency: 0,
        dpd_30_count: 0,
        dpd_60_count: 0,
        dpd_90_count: 0,
        total_exposure: 0,
        unsecured_exposure: 0,
        credit_card_exposure: 0,
        personal_loan_exposure: 0
      },
      verisys_data: {
        cnic_valid: true,
        name_match: true,
        dob_match: true,
        address_match: true,
        biometric_verified: true
      },
      afd_data: {
        cross_product_delinquency: false,
        negative_database_hit: false,
        compliance_issues: false
      },
      pep_data: {
        is_pep: false,
        pep_category: 'NONE',
        risk_level: 'LOW'
      }
    },
    creditLimitData: {
      total_exposure: 0,
      unsecured_exposure: 0,
      credit_card_exposure: 0,
      personal_loan_exposure: 0,
      income_verified: true,
      bank_statement_verified: true
    }
  },
  {
    id: 'case-5',
    name: 'SPU Blacklist Hit',
    description: 'Applicant on blacklist - should fail',
    category: 'failure',
    expectedScore: '0',
    expectedDecision: 'FAIL',
    expectedAction: 'SPU Critical Hit - Automatic Fail',
    userStory: 'As a bank, I want to automatically decline applications from individuals on blacklists to prevent fraud and comply with regulatory requirements.',
    applicationData: {
      applicationId: 1005,
      full_name: 'Ali Raza',
      cnic: '3520144455566',
      date_of_birth: '1985-08-20',
      gross_monthly_income: 120000,
      net_monthly_income: 100000,
      curr_city: 'karachi',
      is_ubl_customer: false,
      employment_status: 'Employed',
      employment_type: 'permanent',
      length_of_employment: 5,
      education_qualification: 'Bachelors',
      marital_status: 'Single',
      eavmu_submitted: true,
      salary_transfer_flag: false,
      proposed_loan_amount: 35000,
      spu_black_list_check: true,
      spu_credit_card_30k_check: false,
      spu_negative_list_check: false
    }
  },
  {
    id: 'case-6',
    name: 'Annexure A Area Failure',
    description: 'Applicant from high-risk geographical area - should fail',
    category: 'failure',
    expectedScore: '0',
    expectedDecision: 'FAIL',
    expectedAction: 'Annexure A Area - Automatic Fail',
    userStory: 'As a bank, I want to automatically decline applications from high-risk geographical areas to minimize exposure to problematic regions.',
    applicationData: {
      applicationId: 1006,
      full_name: 'Hassan Shah',
      cnic: '3520177788899',
      date_of_birth: '1992-11-05',
      gross_monthly_income: 90000,
      net_monthly_income: 75000,
      curr_city: 'quetta',
      is_ubl_customer: true,
      employment_status: 'Employed',
      employment_type: 'permanent',
      length_of_employment: 4,
      education_qualification: 'Bachelors',
      marital_status: 'Married',
      eavmu_submitted: true,
      salary_transfer_flag: false,
      proposed_loan_amount: 30000,
      spu_black_list_check: false,
      spu_credit_card_30k_check: false,
      spu_negative_list_check: false
    }
  },
  {
    id: 'case-7',
    name: 'EAMVU Not Submitted',
    description: 'Application without EAMVU submission - should get conditional pass',
    category: 'borderline',
    expectedScore: '60-70',
    expectedDecision: 'CONDITIONAL PASS',
    expectedAction: 'Manual review',
    userStory: 'As a bank, I want to handle applications where EAMVU is not submitted, which should result in lower scores but not automatic failure.',
    applicationData: {
      applicationId: 1007,
      full_name: 'Ayesha Malik',
      cnic: '3520133344455',
      date_of_birth: '1987-09-18',
      gross_monthly_income: 120000,
      net_monthly_income: 160000,
      curr_city: 'lahore',
      is_ubl_customer: true,
      employment_status: 'Employed',
      employment_type: 'permanent',
      length_of_employment: 6,
      education_qualification: 'Masters',
      marital_status: 'Married',
      eavmu_submitted: false,
      salary_transfer_flag: true,
      proposed_loan_amount: 0,
      spu_black_list_check: false,
      spu_credit_card_30k_check: false,
      spu_negative_list_check: false
    }
  },
  {
    id: 'case-8',
    name: 'Low Income Threshold',
    description: 'Income just above minimum threshold - should get conditional pass',
    category: 'borderline',
    expectedScore: '65-75',
    expectedDecision: 'CONDITIONAL PASS',
    expectedAction: 'Additional conditions',
    userStory: 'As a bank, I want to handle applications with income just above the minimum threshold to test the income scoring logic.',
    applicationData: {
      applicationId: 1008,
      full_name: 'Omar Sheikh',
      cnic: '3520166677788',
      date_of_birth: '1991-04-12',
      gross_monthly_income: 50000,
      net_monthly_income: 45000,
      curr_city: 'islamabad',
      is_ubl_customer: false,
      employment_status: 'Employed',
      employment_type: 'permanent',
      length_of_employment: 1,
      education_qualification: 'Bachelors',
      marital_status: 'Single',
      eavmu_submitted: true,
      salary_transfer_flag: false,
      proposed_loan_amount: 20000,
      spu_black_list_check: false,
      spu_credit_card_30k_check: false,
      spu_negative_list_check: false
    }
  },
  {
    id: 'case-9',
    name: 'High-Risk Behavioral Profile',
    description: 'Existing customer with concerning behavioral patterns - should get conditional pass',
    category: 'borderline',
    expectedScore: '55-65',
    expectedDecision: 'CONDITIONAL PASS',
    expectedAction: 'Manual review',
    userStory: 'As a bank, I want to handle existing customers with concerning behavioral patterns to ensure proper risk assessment.',
    applicationData: {
      applicationId: 1009,
      full_name: 'Zainab Ali',
      cnic: '3520199900011',
      date_of_birth: '1989-07-25',
      gross_monthly_income: 85000,
      net_monthly_income: 70000,
      curr_city: 'karachi',
      is_ubl_customer: true,
      employment_status: 'Employed',
      employment_type: 'permanent',
      length_of_employment: 7,
      education_qualification: 'Masters',
      marital_status: 'Married',
      eavmu_submitted: true,
      salary_transfer_flag: true,
      proposed_loan_amount: 40000,
      spu_black_list_check: false,
      spu_credit_card_30k_check: false,
      spu_negative_list_check: false
    },
    cbsData: {
      average_deposit_balance: 10000,
      highest_dpd: 45,
      exposure_in_industry: 2,
      bad_counts_industry: 1,
      bad_counts_ubl: 0,
      dpd_30_plus: 2,
      dpd_60_plus: 1,
      defaults_12m: 0,
      late_payments: 3,
      partial_payments: 1,
      credit_utilization_ratio: 0.85
    }
  },
  {
    id: 'case-10',
    name: 'Edge Case - Minimum Age',
    description: 'Applicant at minimum age boundary - should get conditional pass',
    category: 'edge',
    expectedScore: '70-80',
    expectedDecision: 'CONDITIONAL PASS',
    expectedAction: 'Basic conditions',
    userStory: 'As a bank, I want to test the minimum age boundary to ensure the system correctly handles applicants at the edge of the acceptable age range.',
    applicationData: {
      applicationId: 1010,
      full_name: 'Ahmad Raza',
      cnic: '3520122233344',
      date_of_birth: '2003-01-01',
      gross_monthly_income: 60000,
      net_monthly_income: 50000,
      curr_city: 'lahore',
      is_ubl_customer: false,
      employment_status: 'Employed',
      employment_type: 'permanent',
      length_of_employment: 1,
      education_qualification: 'Bachelors',
      marital_status: 'Single',
      eavmu_submitted: true,
      salary_transfer_flag: false,
      proposed_loan_amount: 25000,
      spu_black_list_check: false,
      spu_credit_card_30k_check: false,
      spu_negative_list_check: false
    }
  },
  {
    id: 'case-11',
    name: 'System Check Failure - eCIB Hit',
    description: 'Application with eCIB delinquency hit - should fail',
    category: 'failure',
    expectedScore: '0',
    expectedDecision: 'FAIL',
    expectedAction: 'eCIB Critical Hit - Automatic Fail',
    userStory: 'As a bank, I want to automatically decline applications with eCIB delinquency hits to minimize credit risk.',
    applicationData: {
      applicationId: 1011,
      full_name: 'Test eCIB Hit',
      cnic: '3520111111111',
      date_of_birth: '1985-01-01',
      gross_monthly_income: 100000,
      net_monthly_income: 80000,
      curr_city: 'karachi',
      is_ubl_customer: false,
      employment_status: 'Employed',
      employment_type: 'permanent',
      length_of_employment: 5,
      education_qualification: 'Masters',
      marital_status: 'Married',
      eavmu_submitted: true,
      salary_transfer_flag: false,
      proposed_loan_amount: 50000,
      spu_black_list_check: false,
      spu_credit_card_30k_check: false,
      spu_negative_list_check: false
    },
    systemChecksData: {
      ecib_individual_check: true,
      ecib_corporate_check: true,
      verisys_cnic_check: true,
      afd_delinquency_check: true,
      afd_compliance_check: true,
      pep_check: true,
      world_check_result: false,
      ecib_data: {
        last_12m_delinquency: 3,
        last_6m_delinquency: 2,
        last_2m_delinquency: 1,
        dpd_30_count: 2,
        dpd_60_count: 1,
        dpd_90_count: 0,
        total_exposure: 0,
        unsecured_exposure: 0,
        credit_card_exposure: 0,
        personal_loan_exposure: 0
      },
      verisys_data: {
        cnic_valid: true,
        name_match: true,
        dob_match: true,
        address_match: true,
        biometric_verified: true
      },
      afd_data: {
        cross_product_delinquency: false,
        negative_database_hit: false,
        compliance_issues: false
      },
      pep_data: {
        is_pep: false,
        pep_category: 'NONE',
        risk_level: 'LOW'
      }
    },
    creditLimitData: {
      total_exposure: 0,
      unsecured_exposure: 0,
      credit_card_exposure: 0,
      personal_loan_exposure: 0,
      income_verified: true,
      bank_statement_verified: true
    }
  },
  {
    id: 'case-12',
    name: 'Credit Limit Assignment - Gold Card',
    description: 'High income customer eligible for Gold card - should get appropriate limit',
    category: 'ideal',
    expectedScore: '85-95',
    expectedDecision: 'PASS',
    expectedAction: 'Gold Card Assignment',
    userStory: 'As a bank, I want to assign appropriate credit limits based on customer income and risk profile.',
    applicationData: {
      applicationId: 1012,
      full_name: 'Gold Card Customer',
      cnic: '3520222222222',
      date_of_birth: '1980-01-01',
      gross_monthly_income: 70000,
      net_monthly_income: 60000,
      curr_city: 'karachi',
      is_ubl_customer: true,
      employment_status: 'Employed',
      employment_type: 'permanent',
      length_of_employment: 10,
      education_qualification: 'Masters',
      marital_status: 'Married',
      eavmu_submitted: true,
      salary_transfer_flag: true,
      proposed_loan_amount: 25000,
      spu_black_list_check: false,
      spu_credit_card_30k_check: false,
      spu_negative_list_check: false
    },
    cbsData: {
      average_deposit_balance: 1000000,
      highest_dpd: 0,
      exposure_in_industry: 0,
      bad_counts_industry: 0,
      bad_counts_ubl: 0,
      dpd_30_plus: 0,
      dpd_60_plus: 0,
      defaults_12m: 0,
      late_payments: 0,
      partial_payments: 0,
      credit_utilization_ratio: 0.1
    },
    systemChecksData: {
      ecib_individual_check: true,
      ecib_corporate_check: true,
      verisys_cnic_check: true,
      afd_delinquency_check: true,
      afd_compliance_check: true,
      pep_check: true,
      world_check_result: false,
      ecib_data: {
        last_12m_delinquency: 0,
        last_6m_delinquency: 0,
        last_2m_delinquency: 0,
        dpd_30_count: 0,
        dpd_60_count: 0,
        dpd_90_count: 0,
        total_exposure: 0,
        unsecured_exposure: 0,
        credit_card_exposure: 0,
        personal_loan_exposure: 0
      },
      verisys_data: {
        cnic_valid: true,
        name_match: true,
        dob_match: true,
        address_match: true,
        biometric_verified: true
      },
      afd_data: {
        cross_product_delinquency: false,
        negative_database_hit: false,
        compliance_issues: false
      },
      pep_data: {
        is_pep: false,
        pep_category: 'NONE',
        risk_level: 'LOW'
      }
    },
    creditLimitData: {
      total_exposure: 0,
      unsecured_exposure: 0,
      credit_card_exposure: 0,
      personal_loan_exposure: 0,
      income_verified: true,
      bank_statement_verified: true
    }
  }
];

export const getTestCaseById = (id: string): TestCase | undefined => {
  return testCases.find(case_ => case_.id === id);
};

export const getTestCasesByCategory = (category: string): TestCase[] => {
  return testCases.filter(case_ => case_.category === category);
};

export const getTestCaseCategories = (): string[] => {
  return Array.from(new Set(testCases.map(case_ => case_.category)));
};
