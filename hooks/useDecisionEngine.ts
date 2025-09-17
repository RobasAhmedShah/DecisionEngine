import { useState, useCallback } from 'react';
import { TestCase } from '../lib/testCases';

export interface ApplicationData {
  applicationId: number;
  customerName: string;
  cnic: string;
  dateOfBirth: string;
  age: number;
  grossMonthlySalary: number;
  netMonthlyIncome: number;
  currentCity: string;
  officeCity: string;
  cluster: string;
  ublCustomer: string;
  employmentStatus: string;
  employmentType?: string;
  experience: number;
  educationQualification?: string;
  maritalStatus: string;
  eamvuStatus: string;
  eavmu_submitted: boolean;
  salaryTransferFlag?: string;
  amountRequested: number;
  spuBlackList: string;
  spuCreditCard: string;
  spuNegativeList: string;
  existingDebt?: number;
  mobile?: string;
  gender?: string;
  currentAddress?: string;
  officeAddress?: string;
  occupation?: string;
  companyName?: string;
  designation?: string;
  loan_type?: string;
  tenure?: number;
}

export const useDecisionEngine = () => {
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [dbrData, setDbrData] = useState<any>(null);
  
  // Decision results
  const [decision, setDecision] = useState<string>('');
  const [decisionData, setDecisionData] = useState<any>(null);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [riskLevel, setRiskLevel] = useState<string>('');
  const [actionRequired, setActionRequired] = useState<string>('');
  const [criticalChecksStatus, setCriticalChecksStatus] = useState<string>('PENDING');
  const [assignedCreditLimit, setAssignedCreditLimit] = useState<number>(0);
  const [cardType, setCardType] = useState<string>('');
  
  // Module scores
  const [moduleScores, setModuleScores] = useState({
    age: 0,
    dbr: 0,
    spu: 0,
    city: 0,
    income: 0,
    eamvu: 0,
  });

  const loadTestCaseData = useCallback((testCase: TestCase | null) => {
    if (!testCase) {
      // Load default sample data
      setApplicationData({
        applicationId: 141,
        customerName: 'Sample Customer',
        cnic: '3520112345678',
        dateOfBirth: '1990-01-01',
        age: 34,
        grossMonthlySalary: 100000,
        netMonthlyIncome: 80000,
        currentCity: 'karachi',
        officeCity: 'karachi',
        cluster: 'PREMIUM',
        ublCustomer: 'Yes',
        employmentStatus: 'Employed',
        employmentType: 'permanent',
        experience: 5,
        educationQualification: 'Bachelors',
        maritalStatus: 'Married',
        eamvuStatus: 'Yes',
        eavmu_submitted: true,
        salaryTransferFlag: 'Yes',
        amountRequested: 150000,
        spuBlackList: 'No',
        spuCreditCard: 'No',
        spuNegativeList: 'No',
      });
      setSelectedTestCase(null);
      return;
    }

    // Map test case data to application data structure
    const mappedApplicationData: ApplicationData = {
      applicationId: testCase.applicationData.applicationId || 0,
      customerName: testCase.applicationData.full_name || '',
      cnic: testCase.applicationData.cnic || '',
      dateOfBirth: testCase.applicationData.date_of_birth || '',
      age: testCase.applicationData.date_of_birth ? 
        new Date().getFullYear() - new Date(testCase.applicationData.date_of_birth).getFullYear() : 0,
      grossMonthlySalary: testCase.applicationData.gross_monthly_income || 0,
      netMonthlyIncome: testCase.applicationData.net_monthly_income || 0,
      currentCity: testCase.applicationData.curr_city || '',
      officeCity: testCase.applicationData.office_city || '',
      cluster: testCase.applicationData.cluster || '',
      ublCustomer: testCase.applicationData.is_ubl_customer ? 'Yes' : 'No',
      employmentStatus: testCase.applicationData.employment_status || '',
      employmentType: testCase.applicationData.employment_type || '',
      experience: testCase.applicationData.length_of_employment || 0,
      educationQualification: testCase.applicationData.education_qualification || '',
      maritalStatus: testCase.applicationData.marital_status || '',
      eamvuStatus: testCase.applicationData.eavmu_submitted ? 'Yes' : 'No',
      eavmu_submitted: testCase.applicationData.eavmu_submitted,
      salaryTransferFlag: testCase.applicationData.salary_transfer_flag ? 'Yes' : 'No',
      amountRequested: testCase.applicationData.amount_requested || 0,
      spuBlackList: testCase.applicationData.spu_black_list_check ? 'Yes' : 'No',
      spuCreditCard: testCase.applicationData.spu_credit_card_30k_check ? 'Yes' : 'No',
      spuNegativeList: testCase.applicationData.spu_negative_list_check ? 'Yes' : 'No'
    };

    setApplicationData(mappedApplicationData);
    
    // Set DBR data if available
    if (testCase.dbrData) {
      setDbrData(testCase.dbrData);
      console.log('📊 DBR Data loaded from test case:', testCase.dbrData);
    } else {
      setDbrData(null);
      console.log('📊 No DBR data in test case');
    }

    setSelectedTestCase(testCase);
    console.log('✅ Test case loaded:', testCase.name);
  }, []);

  const calculateDecision = useCallback(async () => {
    if (!applicationData) {
      alert('Please load application data first');
      return;
    }

    setCalculating(true);
    setCriticalChecksStatus('PROCESSING');

    try {
      // Prepare the request data
      const requestData = {
        applicationData: {
          ...applicationData,
          date_of_birth: applicationData.dateOfBirth, // Fix the field mapping
          full_name: applicationData.customerName, // Map customerName to full_name
          curr_city: applicationData.currentCity, // Map currentCity to curr_city
          office_city: applicationData.officeCity, // Map officeCity to office_city
          gross_monthly_income: applicationData.grossMonthlySalary, // Map to snake_case
          net_monthly_income: applicationData.netMonthlyIncome, // Map to snake_case
          employment_type: applicationData.employmentType, // Map to snake_case
          employment_status: applicationData.employmentStatus, // Map to snake_case
          is_ubl_customer: applicationData.ublCustomer === 'Yes',
          salary_transfer_flag: applicationData.salaryTransferFlag === 'Yes',
          eavmu_submitted: applicationData.eavmu_submitted,
          spu_black_list_check: applicationData.spuBlackList === 'Yes',
          spu_credit_card_30k_check: applicationData.spuCreditCard === 'Yes',
          spu_negative_list_check: applicationData.spuNegativeList === 'Yes',
        },
        ilosData: {
          // Credit Card DBR Data
          existing_monthly_obligations: dbrData?.existing_monthly_obligations || 0,
          credit_card_limit: dbrData?.credit_card_limit || 0,
          overdraft_annual_interest: dbrData?.overdraft_annual_interest || 0,
          date_of_birth: applicationData.dateOfBirth,
          amount_requested: applicationData.amountRequested || 0, // Credit limit being requested
          ...dbrData,
        },
        systemChecksData: selectedTestCase?.systemChecksData || {},
        creditLimitData: selectedTestCase?.creditLimitData || {},
      };

      console.log('🔄 Sending request to decision API...', requestData);
      console.log('📊 Credit Card Debug - applicationData:', {
        amountRequested: applicationData.amountRequested
      });
      console.log('📊 Credit Card Debug - ilosData:', {
        amount_requested: requestData.ilosData.amount_requested,
        existing_monthly_obligations: requestData.ilosData.existing_monthly_obligations
      });

      const response = await fetch('/api/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Decision result:', result);
      console.log('🔍 Debug - Nested decision:', result.decision);

      // Extract decision data from nested structure
      const decisionResult = result.decision || result;
      
      // Update state with results
      setDecision(decisionResult.decision || 'UNKNOWN');
      setDecisionData(decisionResult); // Store the full decision object
      setFinalScore(decisionResult.finalScore || 0);
      setRiskLevel(decisionResult.riskLevel || 'UNKNOWN');
      setActionRequired(decisionResult.actionRequired || 'No action specified');
      setCriticalChecksStatus(decisionResult.decision === 'PASS' ? 'PASS' : 'FAIL');
      
      // Extract credit limit data from creditLimit module
      const creditLimitData = decisionResult.moduleScores?.creditLimit?.details;
      setAssignedCreditLimit(creditLimitData?.assignedLimit || 0);
      setCardType(creditLimitData?.cardType || '');

      // Update module scores
      if (decisionResult.moduleScores) {
        setModuleScores({
          age: decisionResult.moduleScores.age?.score || 0,
          dbr: decisionResult.moduleScores.dbr?.score || 0,
          spu: decisionResult.moduleScores.spu?.score || 0,
          city: decisionResult.moduleScores.city?.score || 0,
          income: decisionResult.moduleScores.income?.score || 0,
          eamvu: decisionResult.moduleScores.eamvu?.score || 0,
        });
      }

    } catch (error) {
      console.error('❌ Error calculating decision:', error);
      alert('Error calculating decision: ' + (error as Error).message);
      setCriticalChecksStatus('ERROR');
    } finally {
      setCalculating(false);
    }
  }, [applicationData, dbrData, selectedTestCase]);

  const resetForm = useCallback(() => {
    setApplicationData(null);
    setSelectedTestCase(null);
    setDecision('');
    setDecisionData(null);
    setFinalScore(0);
    setRiskLevel('');
    setActionRequired('');
    setCriticalChecksStatus('PENDING');
    setAssignedCreditLimit(0);
    setCardType('');
    setModuleScores({
      age: 0,
      dbr: 0,
      spu: 0,
      city: 0,
      income: 0,
      eamvu: 0,
    });
    setDbrData(null);
    console.log('🔄 Form reset');
  }, []);

  return {
    // State
    applicationData,
    selectedTestCase,
    calculating,
    decision: decision, // Pass the decision string
    decisionData, // Pass the full decision object separately
    finalScore,
    riskLevel,
    actionRequired,
    criticalChecksStatus,
    assignedCreditLimit,
    cardType,
    moduleScores,
    dbrData,
    
    // Actions
    loadTestCaseData,
    calculateDecision,
    resetForm,
  };
};
