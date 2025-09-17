'use client';

import React, { useState, useEffect, useRef } from 'react';
import { testCases, getTestCaseById } from '../lib/testCases';

// Material UI Imports
import {
  ThemeProvider,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Chip,
  IconButton,
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  Stack,
  Button,
  CircularProgress,
  Avatar,
  Divider,
  LinearProgress
} from '@mui/material';

// Material UI Icons
import {
  AccountBalance as BankIcon,
  CreditCard as CreditCardIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  AccountCircle as AccountCircleIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

// Custom UBL Theme
import { ublTheme } from '../lib/theme';

// Type definitions
interface ApplicationData {
  applicationId?: number;
  customerName?: string;
  cnic?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  maritalStatus?: string;
  educationQualification?: string;
  mobile?: string;
  employmentStatus?: string;
  employmentType?: string;
  occupation?: string;
  companyName?: string;
  designation?: string;
  experience?: number;
  grossMonthlySalary?: number;
  netMonthlyIncome?: number;
  amountRequested?: number;
  tenure?: number;
  ublCustomer?: string;
  salaryTransferFlag?: string;
  currentCity?: string;
  currentAddress?: string;
  officeCity?: string;
  officeAddress?: string;
  eamvuStatus?: string;
  eavmu_submitted?: boolean;
  spuBlackList?: string;
  spuCreditCard?: string;
  spuNegativeList?: string;
  existingDebt?: number;
  cluster?: string;
  loan_type?: string;
  dbrData?: any;
}

interface ModuleScore {
  title: string;
  weight: string;
  score: number;
  maxScore: number;
  notes: string;
}

interface ExpandedSections {
  applicationData: boolean;
  criticalChecks: boolean;
  moduleScoring: boolean;
  finalScore: boolean;
}

export default function CreditCardDecisionEngine() {
  // State management
  const [applicationId, setApplicationId] = useState(141);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [showApplicationData, setShowApplicationData] = useState(false);
  const [dbrData, setDbrData] = useState<any>(null);
  
  // Manual inputs
  const [cluster, setCluster] = useState('');
  const [employmentType, setEmploymentType] = useState('permanent');
  const [salaryTransferFlag, setSalaryTransferFlag] = useState('salary_transfer');
  const [totalIncome, setTotalIncome] = useState(50000);
  
  // CBS data inputs
  const [cbsDepositBalance, setCbsDepositBalance] = useState('500000');
  const [cbsHighestDPD, setCbsHighestDPD] = useState('0');
  const [cbsIndustryExposure, setCbsIndustryExposure] = useState('0');
  const [cbsBadCountsIndustry, setCbsBadCountsIndustry] = useState('0');
  const [cbsBadCountsUBL, setCbsBadCountsUBL] = useState('0');
  const [cbsDPD30Plus, setCbsDPD30Plus] = useState('0');
  const [cbsDPD60Plus, setCbsDPD60Plus] = useState('0');
  const [cbsDefaults12M, setCbsDefaults12M] = useState('0');
  const [cbsLatePayments, setCbsLatePayments] = useState('0');
  const [cbsPartialPayments, setCbsPartialPayments] = useState('0');
  const [cbsCreditUtilization, setCbsCreditUtilization] = useState('0.3');
  
  // Decision flow states
  const [criticalChecksStatus, setCriticalChecksStatus] = useState('Pending');
  const [moduleScoringStatus, setModuleScoringStatus] = useState('Pending');
  const [finalScoreStatus, setFinalScoreStatus] = useState('Pending');
  const [dbrLoading, setDbrLoading] = useState(false);
  const [calculationsRun, setCalculationsRun] = useState(false);
  
  // Calculation results
  const [ageCalculation, setAgeCalculation] = useState('Click "Calculate Decision" to start...');
  const [ageReasoning, setAgeReasoning] = useState('Age must be within acceptable limits based on employment type.');
  const [dbrCalculation, setDbrCalculation] = useState('Click "Calculate Decision" to start...');
  const [dbrWarning, setDbrWarning] = useState('');
  const [spuCalculation, setSpuCalculation] = useState('Click "Calculate Decision" to start...');
  const [cityCalculation, setCityCalculation] = useState('Click "Calculate Decision" to start...');
  const [incomeCalculation, setIncomeCalculation] = useState('Click "Calculate Decision" to start...');
  const [eamvuCalculation, setEamvuCalculation] = useState('Click "Calculate Decision" to start...');
  const [weightedCalculations, setWeightedCalculations] = useState('Click "Calculate Decision" to start...');
  
  // Actual scores for calculations
  const [cityScore, setCityScore] = useState(0);
  const [incomeScore, setIncomeScore] = useState(0);
  const [eamvuScore, setEamvuScore] = useState(0);
  const [ageScore, setAgeScore] = useState(0);
  const [dbrScore, setDbrScore] = useState(0);
  const [spuScore, setSpuScore] = useState(0);
  const [applicationScore, setApplicationScore] = useState(0);
  const [behavioralScore, setBehavioralScore] = useState(0);
  const [isETB, setIsETB] = useState(false);
  
  // Final decision states
  const [finalScore, setFinalScore] = useState(0);
  const [decision, setDecision] = useState('PENDING');
  const [riskLevel, setRiskLevel] = useState('N/A');
  const [actionRequired, setActionRequired] = useState('');
  const [showFinalDecision, setShowFinalDecision] = useState(false);
  const [moduleScores, setModuleScores] = useState<ModuleScore[]>([]);
  
  // New framework states
  const [assignedCreditLimit, setAssignedCreditLimit] = useState(0);
  const [cardType, setCardType] = useState('');
  
  // Progress bar refs
  const finalScoreProgressRef = useRef<HTMLDivElement>(null);
  const finalScoreLabelRef = useRef<HTMLSpanElement>(null);
  
  // Test case states
  const [selectedTestCase, setSelectedTestCase] = useState<string>('');
  const [showTestCaseDropdown, setShowTestCaseDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    applicationData: false,
    criticalChecks: true,
    moduleScoring: true,
    finalScore: true
  });

  // Toggle section expand/collapse
  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Fetch application data
  const fetchApplicationData = async () => {
    setLoading(true);
    try {
      // Use direct external API
      const response = await fetch(`/api/applications/${applicationId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Raw API data:', data);
      
      // Map API data to frontend expected format
      const mappedData = {
        applicationId: data.los_id || data.id,
        customerName: data.full_name,
        cnic: data.cnic,
        dateOfBirth: data.date_of_birth,
        age: data.date_of_birth ? new Date().getFullYear() - new Date(data.date_of_birth).getFullYear() : 0,
        gender: data.gender,
        maritalStatus: data.marital_status,
        mobile: data.curr_mobile,
        employmentStatus: data.employment_status,
        occupation: data.occupation,
        companyName: data.company_employer_name,
        designation: data.designation,
        experience: data.length_of_employment || 0,
        grossMonthlySalary: parseFloat(data.gross_monthly_income) || 0,
        netMonthlyIncome: parseFloat(data.total_income) || 0,
        amountRequested: parseFloat(data.collateral_lien_amount) || 0,
        tenure: 24, // Default tenure
        ublCustomer: data.is_ubl_customer === "true" ? "Yes" : "No",
        currentCity: data.curr_city,
        currentAddress: `${data.curr_house_apt || ''} ${data.curr_street || ''}`.trim(),
        officeCity: data.office_city,
        officeAddress: `${data.office_address || ''} ${data.office_street || ''}`.trim(),
        eamvuStatus: data.eavmu_submitted ? "Submitted" : "Not Submitted",
        eavmu_submitted: data.eavmu_submitted,
        spuBlackList: data.spu_black_list_check ? "Yes" : "No",
        spuCreditCard: data.spu_credit_card_30k_check ? "Yes" : "No",
        spuNegativeList: data.spu_negative_list_check ? "Yes" : "No",
        existingDebt: 0, // Default value
        cluster: "FEDERAL" // Default cluster
      };
      
      console.log('Mapped data:', mappedData);
      setApplicationData(mappedData);
      setShowApplicationData(true);
      
      // Auto-populate some fields if available
      if (mappedData.cluster) setCluster(mappedData.cluster);
      if (mappedData.employmentStatus) setEmploymentType(mappedData.employmentStatus.toLowerCase());
      if (mappedData.netMonthlyIncome) setTotalIncome(mappedData.netMonthlyIncome);
      
      // Auto-scroll to API data section
      setTimeout(() => {
        const apiDataSection = document.getElementById('applicationDataSection');
        if (apiDataSection) {
          apiDataSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
      
    } catch (error) {
      console.error('Error fetching application data:', error);
      alert('Failed to fetch application data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate decision using new integrated decision engine
  const calculateDecision = async () => {
    if (!applicationData) return;
    
    setCalculating(true);
    setCalculationsRun(true);
    
    try {
      console.log('🚀 Starting Decision Calculation...');
      
      // Reset all calculations
      setAgeCalculation('Calculating...');
      setDbrCalculation('Calculating...');
      setSpuCalculation('Calculating...');
      setCityCalculation('Calculating...');
      setIncomeCalculation('Calculating...');
      setEamvuCalculation('Calculating...');
      setWeightedCalculations('Calculating...');
      
      // Reset statuses
      setCriticalChecksStatus('Processing...');
      setModuleScoringStatus('Processing...');
      setFinalScoreStatus('Processing...');
      
      // Prepare CBS data for decision engine
      const cbsData = {
        average_deposit_balance: parseFloat(cbsDepositBalance) || 0,
        highest_dpd: parseInt(cbsHighestDPD) || 0,
        exposure_in_industry: parseFloat(cbsIndustryExposure) || 0,
        bad_counts_industry: parseInt(cbsBadCountsIndustry) || 0,
        bad_counts_ubl: parseInt(cbsBadCountsUBL) || 0,
        dpd_30_plus: parseInt(cbsDPD30Plus) || 0,
        dpd_60_plus: parseInt(cbsDPD60Plus) || 0,
        defaults_12m: parseInt(cbsDefaults12M) || 0,
        late_payments: parseInt(cbsLatePayments) || 0,
        partial_payments: parseInt(cbsPartialPayments) || 0,
        credit_utilization_ratio: parseFloat(cbsCreditUtilization) || 0
      };
      
      // Prepare ILOS data for decision engine
      const ilosData = {
        applicationId: applicationData.applicationId,
        cnic: applicationData.cnic,
        full_name: applicationData.customerName,
        date_of_birth: applicationData.dateOfBirth,
        curr_city: applicationData.currentCity,
        office_city: applicationData.officeCity,
        cluster: applicationData.cluster, // Add cluster field for city calculation
        education_qualification: 'Masters', // Default
        marital_status: applicationData.maritalStatus,
        employment_status: applicationData.employmentStatus,
        employment_type: employmentType,
        gross_monthly_income: applicationData.grossMonthlySalary,
        total_income: applicationData.netMonthlyIncome,
        net_monthly_income: applicationData.netMonthlyIncome,
        length_of_employment: applicationData.experience,
        nature_of_residence: 'owned', // Default
        num_dependents: 2, // Default
        business_nature: 'IT', // Default
        is_ubl_customer: applicationData.ublCustomer === 'Yes',
        salary_transfer_flag: salaryTransferFlag === 'salary_transfer',
        occupation: applicationData.occupation,
        spu_black_list_check: applicationData.spuBlackList === 'Yes',
        spu_credit_card_30k_check: applicationData.spuCreditCard === 'Yes',
        spu_negative_list_check: applicationData.spuNegativeList === 'Yes',
        spu_pep_list_check: false,
        spu_ctl_check: false,
        spu_frmu_check: false,
        spu_ecib_check: false,
        eavmu_submitted: applicationData.eavmu_submitted,
        amount_requested: applicationData.amountRequested
      };
      
      console.log('📥 ILOS Data:', ilosData);
      console.log('📥 CBS Data:', cbsData);
      
      // Call the direct external API
      const response = await fetch('/api/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationData: ilosData,
          cbsData: cbsData,
          systemChecksData: selectedTestCase ? testCases.find(tc => tc.id === selectedTestCase)?.systemChecksData : null,
          creditLimitData: selectedTestCase ? testCases.find(tc => tc.id === selectedTestCase)?.creditLimitData : null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const decisionResult = await response.json();
      console.log('🎯 Decision Result:', decisionResult);
      
      // Update UI with results
      updateUIWithDecisionResult(decisionResult.decision);
      
    } catch (error) {
      console.error('❌ Error in decision calculation:', error);
      alert('Error calculating decision: ' + (error as Error).message);
    } finally {
      setCalculating(false);
    }
  };
  
  // Update UI with decision result
  const updateUIWithDecisionResult = (decision: any) => {
    // Debug logging
    console.log('🔍 Frontend Debug - Decision Data:', decision);
    console.log('🔍 Frontend Debug - Application Score:', decision.moduleScores?.application_score);
    console.log('🔍 Frontend Debug - Application Score Breakdown:', decision.moduleScores?.application_score?.breakdown);
    console.log('🔍 Frontend Debug - City Score:', decision.moduleScores?.application_score?.breakdown?.city);
    
    // Update individual module scores with new structure
    setDbrScore(decision.moduleScores?.dbr?.score || 0);
    setAgeScore(decision.moduleScores?.age?.score || 0);
    setCityScore(decision.moduleScores?.city?.score || 0);
    setIncomeScore(decision.moduleScores?.income?.score || 0);
    setSpuScore(decision.moduleScores?.spu?.score || 0);
    setEamvuScore(decision.moduleScores?.eamvu?.score || 0);
    setApplicationScore(decision.moduleScores?.applicationScore?.score || 0);
    setBehavioralScore(decision.moduleScores?.behavioralScore?.score || 0);
    // Get ETB status from multiple sources
    const isETBFromBehavioral = decision.moduleScores?.behavioralScore?.details?.isETB;
    const isETBFromApp = decision.applicationData?.is_ubl_customer === true || decision.applicationData?.is_ubl_customer === 'true';
    const isETB = isETBFromBehavioral !== undefined ? isETBFromBehavioral : isETBFromApp;
    setIsETB(isETB);
    
    console.log('🔍 Frontend Debug - New Structure:');
    console.log('  • DBR Score:', decision.moduleScores?.dbr?.score);
    console.log('  • Age Score:', decision.moduleScores?.age?.score);
    console.log('  • City Score:', decision.moduleScores?.city?.score);
    console.log('  • Income Score:', decision.moduleScores?.income?.score);
    console.log('  • SPU Score:', decision.moduleScores?.spu?.score);
    console.log('  • EAMVU Score:', decision.moduleScores?.eamvu?.score);
    console.log('  • Application Score:', decision.moduleScores?.applicationScore?.score);
    console.log('  • Behavioral Score:', decision.moduleScores?.behavioralScore?.score);
    console.log('  • Behavioral Details:', decision.moduleScores?.behavioralScore?.details);
    console.log('  • Is ETB from details:', decision.moduleScores?.behavioralScore?.details?.isETB);
    console.log('  • Is ETB type:', typeof decision.moduleScores?.behavioralScore?.details?.isETB);
    console.log('  • Application Data is_ubl_customer:', decision.applicationData?.is_ubl_customer);
    console.log('  • Is ETB from app:', isETBFromApp);
    console.log('  • Final isETB:', isETB);
    
    // Enhanced DBR calculation display with detailed info
    const dbrDetails = decision.moduleScores?.dbr?.details || {};
    const dbrInfo = `DBR: ${decision.moduleScores?.dbr?.score || 0}/100 (${dbrDetails.dbrPercentage?.toFixed(2) || 0}%)`;
    
    // Enhanced SPU calculation display
    const spuDetails = decision.moduleScores?.spu?.details || {};
    const spuInfo = spuDetails.anyHit ? 
      `SPU: ${decision.moduleScores?.spu?.score || 0}/100 (Critical Hit)` :
      `SPU: ${decision.moduleScores?.spu?.score || 0}/100 (Clean)`;
    
    // Enhanced EAMVU calculation display
    const eamvuDetails = decision.moduleScores?.eamvu?.details || {};
    const eamvuInfo = eamvuDetails.submitted ? 
      `EAMVU: ${decision.moduleScores?.eamvu?.score || 0}/100 (Approved)` :
      `EAMVU: ${decision.moduleScores?.eamvu?.score || 0}/100 (Not Approved)`;
    
    // Enhanced Income calculation display
    const incomeDetails = decision.moduleScores?.income?.details || {};
    const incomeInfo = incomeDetails.thresholdMet ? 
      `Income: ${decision.moduleScores?.income?.score || 0}/100 (Threshold Met)` :
      `Income: ${decision.moduleScores?.income?.score || 0}/100 (Threshold Not Met)`;
    
    // Update calculations display with new structure
    setAgeCalculation(`Age: ${decision.moduleScores?.age?.score || 0}/100`);
    setDbrCalculation(dbrInfo);
    setSpuCalculation(spuInfo);
    setCityCalculation(`City: ${decision.moduleScores?.city?.score || 0}/100`);
    setIncomeCalculation(incomeInfo);
    setEamvuCalculation(eamvuInfo);
    
    // Update final score
    setFinalScore(decision.finalScore || 0);
    setDecision(decision.decision || 'UNKNOWN');
    setRiskLevel(decision.riskLevel || 'UNKNOWN');
    setActionRequired(decision.actionRequired || 'None');
    
    // Update new framework fields
    setAssignedCreditLimit(decision.assignedCreditLimit || 0);
    setCardType(decision.cardType || '');
    
    // Enhanced weighted calculations with new structure
    const customerType = isETB ? 'ETB' : 'NTB';
    const applicationWeight = isETB ? '10%' : '15%';
    const behavioralWeight = isETB ? '5%' : '0%';
    
    const weightedCalc = `
      DBR: ${((decision.moduleScores?.dbr?.score || 0) * 0.55).toFixed(2)} (${decision.moduleScores?.dbr?.score || 0} × 0.55)
        - Percentage: ${dbrDetails.dbrPercentage?.toFixed(2) || 0}%
        - Threshold: ${dbrDetails.dbrThreshold || 0}%
        - Net Income: PKR ${dbrDetails.netIncome?.toLocaleString() || 0}
        - Total Obligations: PKR ${dbrDetails.totalObligations?.toLocaleString() || 0}
        - Status: ${dbrDetails.decisionBand || 'UNKNOWN'}
      
      Age: ${((decision.moduleScores?.age?.score || 0) * 0.05).toFixed(2)} (${decision.moduleScores?.age?.score || 0} × 0.05)
        - Age: ${decision.moduleScores?.age?.details?.age || 0} years
        - Band: ${decision.moduleScores?.age?.details?.band || 'N/A'}
        - Hard Stop: ${decision.moduleScores?.age?.details?.hardStop ? 'YES' : 'NO'}
      
      City: ${((decision.moduleScores?.city?.score || 0) * 0.05).toFixed(2)} (${decision.moduleScores?.city?.score || 0} × 0.05)
        - Current City: ${decision.moduleScores?.city?.details?.currentCity || 'N/A'}
        - Office City: ${decision.moduleScores?.city?.details?.officeCity || 'N/A'}
        - Cluster: ${decision.moduleScores?.city?.details?.cluster || 'N/A'}
        - City Score: ${decision.moduleScores?.city?.details?.cityScore || 0}/100
      
      Income: ${((decision.moduleScores?.income?.score || 0) * 0.10).toFixed(2)} (${decision.moduleScores?.income?.score || 0} × 0.10)
        - Gross Income: PKR ${incomeDetails.grossIncome?.toLocaleString() || 0}
        - Net Income: PKR ${incomeDetails.netIncome?.toLocaleString() || 0}
        - Employment Type: ${incomeDetails.employmentType || 'N/A'}
        - Salary Transfer: ${incomeDetails.salaryTransferFlag ? 'YES' : 'NO'}
        - Tenure: ${incomeDetails.tenure || 0} years
        - ETB Customer: ${incomeDetails.isETB ? 'YES' : 'NO'}
        - Stability Ratio: ${((incomeDetails.stabilityRatio || 0) * 100).toFixed(1)}%
      
      SPU: ${((decision.moduleScores?.spu?.score || 0) * 0.05).toFixed(2)} (${decision.moduleScores?.spu?.score || 0} × 0.05)
        - Black List: ${spuDetails.blackListHit ? 'HIT' : 'CLEAN'}
        - Credit Card 30k: ${spuDetails.creditCard30kHit ? 'HIT' : 'CLEAN'}
        - Negative List: ${spuDetails.negativeListHit ? 'HIT' : 'CLEAN'}
        - Status: ${spuDetails.anyHit ? 'CRITICAL HIT' : 'CLEAN'}
      
      EAMVU: ${((decision.moduleScores?.eamvu?.score || 0) * 0.05).toFixed(2)} (${decision.moduleScores?.eamvu?.score || 0} × 0.05)
        - Submitted: ${eamvuDetails.submitted ? 'YES' : 'NO'}
        - Status: ${eamvuDetails.submitted ? 'APPROVED' : 'NOT APPROVED'}
      
      Application: ${((decision.moduleScores?.applicationScore?.score || 0) * parseFloat(applicationWeight) / 100).toFixed(2)} (${decision.moduleScores?.applicationScore?.score || 0} × ${applicationWeight})
        - Customer Type: ${customerType}
        - Education: ${decision.moduleScores?.applicationScore?.details?.breakdown?.education || 0}/100
        - Marital Status: ${decision.moduleScores?.applicationScore?.details?.breakdown?.marital_status || 0}/100
        - Employment: ${decision.moduleScores?.applicationScore?.details?.breakdown?.employment_status || 0}/100
        - Net Income: ${decision.moduleScores?.applicationScore?.details?.breakdown?.net_income || 0}/100
        - Employment Length: ${decision.moduleScores?.applicationScore?.details?.breakdown?.length_of_employment || 0}/100
        - Portfolio Type: ${decision.moduleScores?.applicationScore?.details?.breakdown?.portfolio_type || 0}/100
        - Deposits: ${decision.moduleScores?.applicationScore?.details?.breakdown?.deposits || 0}/100
      
      Behavioral: ${((decision.moduleScores?.behavioralScore?.score || 0) * parseFloat(behavioralWeight) / 100).toFixed(2)} (${decision.moduleScores?.behavioralScore?.score || 0} × ${behavioralWeight})
        - Customer Type: ${customerType}
        - Calculated: ${isETB ? 'YES' : 'NO'}
        ${isETB ? `
        - Bad Counts Industry: ${decision.moduleScores?.behavioralScore?.details?.breakdown?.bad_counts_industry || 0}/100
        - Bad Counts UBL: ${decision.moduleScores?.behavioralScore?.details?.breakdown?.bad_counts_ubl || 0}/100
        - DPD 30+: ${decision.moduleScores?.behavioralScore?.details?.breakdown?.dpd_30_plus || 0}/100
        - DPD 60+: ${decision.moduleScores?.behavioralScore?.details?.breakdown?.dpd_60_plus || 0}/100
        - Defaults 12M: ${decision.moduleScores?.behavioralScore?.details?.breakdown?.defaults_12m || 0}/100
        - Late Payments: ${decision.moduleScores?.behavioralScore?.details?.breakdown?.late_payments || 0}/100
        - Avg Deposit Balance: ${decision.moduleScores?.behavioralScore?.details?.breakdown?.avg_deposit_balance || 0}/100
        - Partial Payments: ${decision.moduleScores?.behavioralScore?.details?.breakdown?.partial_payments || 0}/100
        - Credit Utilization: ${decision.moduleScores?.behavioralScore?.details?.breakdown?.credit_utilization || 0}/100
        ` : `
        - Note: Not calculated for NTB customers
        `}
      
      System Checks: ${decision.moduleScores?.systemChecks?.score || 0}/100
        - Overall Status: ${decision.moduleScores?.systemChecks?.details?.overallStatus || 'UNKNOWN'}
        - Decision: ${decision.moduleScores?.systemChecks?.details?.decision || 'UNKNOWN'}
        - eCIB: ${decision.moduleScores?.systemChecks?.details?.details?.ecib?.status || 'UNKNOWN'}
        - VERISYS: ${decision.moduleScores?.systemChecks?.details?.details?.verisys?.status || 'UNKNOWN'}
        - AFD: ${decision.moduleScores?.systemChecks?.details?.details?.afd?.status || 'UNKNOWN'}
        - PEP: ${decision.moduleScores?.systemChecks?.details?.details?.pep?.status || 'UNKNOWN'}
        - World Check: ${decision.moduleScores?.systemChecks?.details?.details?.worldCheck?.status || 'UNKNOWN'}
      
      Credit Limit: ${decision.moduleScores?.creditLimit?.score || 0}/100
        - Assigned Limit: PKR ${decision.moduleScores?.creditLimit?.details?.assignedLimit?.toLocaleString() || 0}
        - Card Type: ${decision.moduleScores?.creditLimit?.details?.cardType || 'N/A'}
        - Decision: ${decision.moduleScores?.creditLimit?.details?.decision || 'UNKNOWN'}
        - Reason: ${decision.moduleScores?.creditLimit?.details?.reason || 'N/A'}
      
      Income Verification: ${decision.moduleScores?.incomeVerification?.score || 0}/100
        - Employment Type: ${decision.moduleScores?.incomeVerification?.details?.employmentType || 'N/A'}
        - Decision: ${decision.moduleScores?.incomeVerification?.details?.decision || 'UNKNOWN'}
        - Verification Level: ${decision.moduleScores?.incomeVerification?.details?.verificationLevel || 'N/A'}
        - Income Threshold Met: ${decision.moduleScores?.incomeVerification?.details?.incomeThreshold?.met ? 'YES' : 'NO'}
        - Expected: PKR ${decision.moduleScores?.incomeVerification?.details?.incomeThreshold?.expected?.toLocaleString() || 0}
        - Actual: PKR ${decision.moduleScores?.incomeVerification?.details?.incomeThreshold?.actual?.toLocaleString() || 0}
      
      Verification Framework: ${decision.moduleScores?.verificationFramework?.score || 0}/100
        - Decision: ${decision.moduleScores?.verificationFramework?.details?.decision || 'UNKNOWN'}
        - Verification Level: ${decision.moduleScores?.verificationFramework?.details?.verificationLevel || 'N/A'}
        - Office Verification: ${decision.moduleScores?.verificationFramework?.details?.requirements?.office || 'UNKNOWN'}
        - Residence Verification: ${decision.moduleScores?.verificationFramework?.details?.requirements?.residence || 'UNKNOWN'}
        - Telephonic Verification: ${decision.moduleScores?.verificationFramework?.details?.requirements?.telephonic || 'UNKNOWN'}
        - References: ${decision.moduleScores?.verificationFramework?.details?.requirements?.references || 'UNKNOWN'}
      
      Special Segments: ${decision.moduleScores?.specialSegments?.score || 0}/100
        - Segment Type: ${decision.moduleScores?.specialSegments?.details?.segmentType || 'STANDARD'}
        - Decision: ${decision.moduleScores?.specialSegments?.details?.decision || 'UNKNOWN'}
        - Cross-sell Eligible: ${decision.moduleScores?.specialSegments?.details?.eligibility?.crossSell ? 'YES' : 'NO'}
        - Pensioner Eligible: ${decision.moduleScores?.specialSegments?.details?.eligibility?.pensioner ? 'YES' : 'NO'}
        - Remittance Eligible: ${decision.moduleScores?.specialSegments?.details?.eligibility?.remittance ? 'YES' : 'NO'}
        - MVC Eligible: ${decision.moduleScores?.specialSegments?.details?.eligibility?.mvc ? 'YES' : 'NO'}
      
      Documentation & Compliance: ${decision.moduleScores?.documentationCompliance?.score || 0}/100
        - Decision: ${decision.moduleScores?.documentationCompliance?.details?.decision || 'UNKNOWN'}
        - Compliance Status: ${decision.moduleScores?.documentationCompliance?.details?.complianceStatus || 'UNKNOWN'}
        - CNIC Valid: ${decision.moduleScores?.documentationCompliance?.details?.cnicValidation?.valid ? 'YES' : 'NO'}
        - BVS Required: ${decision.moduleScores?.documentationCompliance?.details?.bvsStatus?.required ? 'YES' : 'NO'}
        - BVS Successful: ${decision.moduleScores?.documentationCompliance?.details?.bvsStatus?.successful ? 'YES' : 'NO'}
        - Verisys Required: ${decision.moduleScores?.documentationCompliance?.details?.verisysStatus?.required ? 'YES' : 'NO'}
        - Verisys Approved: ${decision.moduleScores?.documentationCompliance?.details?.verisysStatus?.approved ? 'YES' : 'NO'}
      
      Total: ${decision.finalScore || 0}/100
    `;
    setWeightedCalculations(weightedCalc);
    
    // Update statuses
    setCriticalChecksStatus(decision.decision === 'FAIL' ? 'FAIL' : 'PASS');
    setModuleScoringStatus('COMPLETE');
    setFinalScoreStatus('COMPLETE');
    
    console.log('✅ UI Updated with Enhanced Decision Result');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTestCaseDropdown(false);
      }
    };

    if (showTestCaseDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTestCaseDropdown]);

  // Load test case data
  const loadTestCaseData = (testCaseId: string) => {
    try {
      const testCase = getTestCaseById(testCaseId);
      if (!testCase) {
        throw new Error('Test case not found');
      }
      
      // Map test case data to applicationData structure
      const mappedApplicationData = {
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
        amountRequested: testCase.applicationData.proposed_loan_amount || 0,
        spuBlackList: testCase.applicationData.spu_black_list_check ? 'Yes' : 'No',
        spuCreditCard: testCase.applicationData.spu_credit_card_30k_check ? 'Yes' : 'No',
        spuNegativeList: testCase.applicationData.spu_negative_list_check ? 'Yes' : 'No'
      };
      
      // Set the application data
      setApplicationData(mappedApplicationData);
      setApplicationId(mappedApplicationData.applicationId.toString());
      
      // Set CBS data if available
      if (testCase.cbsData) {
        setDbrData(testCase.cbsData);
      }
      
      setSelectedTestCase(testCaseId);
      setShowTestCaseDropdown(false);
      
      console.log('✅ Test case loaded:', testCase.name);
    } catch (error) {
      console.error('❌ Error loading test case:', error);
      alert('Error loading test case: ' + (error as Error).message);
    }
  };

  // Load sample data
  const loadSampleData = () => {
    const realApiData = {
      applicationId: 104,
      customerName: "John Doe",
      cnic: "3520111112221",
      dateOfBirth: "1985-06-15",
      age: 38,
      gender: "Male",
      maritalStatus: "Married",
      mobile: "03001234567",
      employmentStatus: "employed",
      occupation: "Software Engineer",
      companyName: "Tech Corp",
      designation: "Senior Developer",
      experience: 5,
      grossMonthlySalary: 100000,
      netMonthlyIncome: 80000,
      amountRequested: 500000,
      tenure: 24,
      ublCustomer: "Yes",
      currentCity: "Karachi",
      currentAddress: "123 Main Street, Karachi",
      officeCity: "Karachi",
      officeAddress: "456 Business District, Karachi",
      eamvuStatus: "Submitted",
      eavmu_submitted: true,
      spuBlackList: "No",
      spuCreditCard: "No",
      spuNegativeList: "No",
      existingDebt: 15000,
      cluster: "FEDERAL"
    };
    
    setApplicationData(realApiData);
    setShowApplicationData(true);
    setApplicationId(104);
    setCluster("FEDERAL");
    setEmploymentType("permanent");
    setTotalIncome(70000);
    
    // Set sample CBS data
    setCbsDepositBalance('750000');
    setCbsHighestDPD('0');
    setCbsIndustryExposure('0');
    setCbsBadCountsIndustry('0');
    setCbsBadCountsUBL('0');
    setCbsDPD30Plus('0');
    setCbsDPD60Plus('0');
    setCbsDefaults12M('0');
    setCbsLatePayments('0');
    setCbsPartialPayments('0');
    setCbsCreditUtilization('0.25');
  };

  // Reset form
  const resetForm = () => {
    setApplicationId(141);
    setLoading(false);
    setCalculating(false);
    setApplicationData(null);
    setShowApplicationData(false);
    setCalculationsRun(false);
    setCluster('');
    setEmploymentType('permanent');
    setSalaryTransferFlag('salary_transfer');
    setTotalIncome(50000);
    
    // Reset CBS data
    setCbsDepositBalance('500000');
    setCbsHighestDPD('0');
    setCbsIndustryExposure('0');
    setCbsBadCountsIndustry('0');
    setCbsBadCountsUBL('0');
    setCbsDPD30Plus('0');
    setCbsDPD60Plus('0');
    setCbsDefaults12M('0');
    setCbsLatePayments('0');
    setCbsPartialPayments('0');
    setCbsCreditUtilization('0.3');
    
    // Reset calculation results
    setAgeCalculation('Click "Calculate Decision" to start...');
    setDbrCalculation('Click "Calculate Decision" to start...');
    setSpuCalculation('Click "Calculate Decision" to start...');
    setCityCalculation('Click "Calculate Decision" to start...');
    setIncomeCalculation('Click "Calculate Decision" to start...');
    setEamvuCalculation('Click "Calculate Decision" to start...');
    setWeightedCalculations('Click "Calculate Decision" to start...');
    setDbrWarning('');
    setDbrData(null);
    
    // Reset score state variables
    setCityScore(0);
    setIncomeScore(0);
    setEamvuScore(0);
    setAgeScore(0);
    setDbrScore(0);
    setSpuScore(0);
    
    // Reset statuses
    setCriticalChecksStatus('Pending');
    setModuleScoringStatus('Pending');
    setFinalScoreStatus('Pending');
    setDbrLoading(false);
    
    // Reset final decision
    setFinalScore(0);
    setDecision('PENDING');
    setRiskLevel('N/A');
    setActionRequired('');
    setShowFinalDecision(false);
    setModuleScores([]);
    
    // Reset progress bar
    if (finalScoreProgressRef.current && finalScoreLabelRef.current) {
      finalScoreProgressRef.current.style.width = '0%';
      finalScoreLabelRef.current.textContent = '0/100';
    }
  };
    
    return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px'
      }}>
        <header style={{
          textAlign: 'center',
          marginBottom: '40px',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            margin: '0 0 10px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            🏦 Credit Card Decision Engine
          </h1>
          <p style={{
            fontSize: '1.1rem',
            opacity: 0.9,
            margin: 0
          }}>
            Real-time, transparent credit decisioning with interactive scoring
          </p>
      </header>

        <div style={{ 
        display: 'flex', 
        flexDirection: showApplicationData ? 'row' : 'column',
          gap: '30px',
          minHeight: '80vh'
      }}>
        {/* Left Panel - Input Controls */}
          <div style={{ 
            width: showApplicationData ? '45%' : '100%',
            maxWidth: showApplicationData ? '500px' : 'none'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                margin: '0 0 20px 0',
                color: '#2d3748',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📋 Application Input
              </h2>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: '#4a5568',
                  marginBottom: '8px'
                }}>
                  Application ID:
                </label>
              <input 
                type="number" 
                value={applicationId} 
                onChange={(e) => setApplicationId(parseInt(e.target.value) || 0)}
                placeholder="Enter application ID"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            
            <button 
              onClick={fetchApplicationData}
              disabled={loading}
              style={{ 
                  backgroundColor: loading ? '#a0aec0' : '#667eea',
                color: 'white',
                border: 'none',
                  padding: '14px 24px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                fontWeight: '600',
                  width: '100%',
                  transition: 'all 0.2s',
                  boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }
              }}
            >
              <span>{loading ? '🔄 Fetching...' : '📥 Fetch API Data'}</span>
            </button>

            {loading && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  marginTop: '20px',
                  padding: '20px',
                  background: '#f7fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #667eea',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <p style={{ margin: 0, color: '#4a5568' }}>🔄 Fetching application data...</p>
              </div>
            )}
          </div>

            {/* Action Buttons */}
            <div className="section">
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Test Case Dropdown */}
              <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
                <button 
                  onClick={() => setShowTestCaseDropdown(!showTestCaseDropdown)}
                  style={{ 
                    backgroundColor: selectedTestCase ? '#17a2b8' : '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  📋 {selectedTestCase ? 
                    testCases.find(tc => tc.id === selectedTestCase)?.name || 'Test Case Loaded' : 
                    'Load Sample Data'
                  }
                  <span style={{ fontSize: '12px' }}>▼</span>
                </button>
                
                {showTestCaseDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    minWidth: '300px',
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}>
                    <div style={{
                      padding: '12px',
                      borderBottom: '1px solid #eee',
                      backgroundColor: '#f8f9fa',
                      fontWeight: '600',
                      color: '#495057'
                    }}>
                      Select Test Case:
                    </div>
                    
                    {/* Default Sample Data Option */}
                    <div
                      onClick={() => {
                        loadSampleData();
                        setShowTestCaseDropdown(false);
                        setSelectedTestCase('');
                      }}
                      style={{
                        padding: '12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                        backgroundColor: selectedTestCase === '' ? '#e3f2fd' : 'white',
                        color: '#1976d2',
                        fontWeight: '500'
                      }}
                    >
                      📄 Default Sample Data (John Doe)
                    </div>
                    
                    {/* Test Cases */}
                    {testCases.map((testCase) => (
                      <div
                        key={testCase.id}
                        onClick={() => loadTestCaseData(testCase.id)}
                        style={{
                          padding: '12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #eee',
                          backgroundColor: selectedTestCase === testCase.id ? '#e3f2fd' : 'white',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedTestCase !== testCase.id) {
                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedTestCase !== testCase.id) {
                            e.currentTarget.style.backgroundColor = 'white';
                          }
                        }}
                      >
                        <div style={{ fontWeight: '600', color: '#2d3748', marginBottom: '4px' }}>
                          {testCase.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '2px' }}>
                          {testCase.category.toUpperCase()} • Expected: {testCase.expectedDecision}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                          {testCase.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Test Case Info */}
              {selectedTestCase && (
                <div style={{
                  backgroundColor: '#e3f2fd',
                  border: '1px solid #bbdefb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#1976d2',
                  maxWidth: '300px'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                    {testCases.find(tc => tc.id === selectedTestCase)?.name}
                  </div>
                  <div>
                    Expected: {testCases.find(tc => tc.id === selectedTestCase)?.expectedDecision} • 
                    Score: {testCases.find(tc => tc.id === selectedTestCase)?.expectedScore}
                  </div>
                </div>
              )}
              
              <button 
                onClick={calculateDecision}
                disabled={calculating || !applicationData}
                style={{ 
                  backgroundColor: calculating ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: calculating || !applicationData ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <span>{calculating ? '🔄 Calculating...' : '🚀 Calculate Decision'}</span>
              </button>
              
              <button 
                onClick={resetForm}
                style={{ 
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                🔄 Reset Form
              </button>
                </div>
              </div>
   {/* Show API Data after fetching */}
   {showApplicationData && (
            <div className="section" id="applicationDataSection">
              <h2 
                className={`section-title collapsible ${expandedSections.applicationData ? 'active' : ''}`} 
                onClick={() => toggleSection('applicationData')}
              >
                📄 API Fetched Data <small>(Click to expand/collapse)</small>
              </h2>
              
              <div className={`collapsible-content ${expandedSections.applicationData ? 'expanded' : ''}`}>
                <div style={{
                  maxHeight: '600px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                  position: 'relative'
                }}>
                  <div className="data-grid" style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '20px',
                    padding: '20px'
                  }}>
                    
                    {/* Basic Information */}
                    <div className="data-card">
                      <h3>🆔 Basic Information</h3>
                      <div className="data-row">
                        <span className="data-label">Application ID:</span>
                        <span className="data-value">{applicationData?.applicationId || '-'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Full Name:</span>
                        <span className="data-value">{applicationData?.customerName || '-'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">CNIC:</span>
                        <span className="data-value">{applicationData?.cnic || '-'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Date of Birth:</span>
                        <span className="data-value">{applicationData?.dateOfBirth || '-'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Age:</span>
                        <span className="data-value">{applicationData?.age || '-'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Gender:</span>
                        <span className="data-value">{applicationData?.gender || 'Male'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Marital Status:</span>
                        <span className="data-value">{applicationData?.maritalStatus || '-'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Education:</span>
                        <span className="data-value">{applicationData?.educationQualification || '-'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Mobile:</span>
                        <span className="data-value">{applicationData?.mobile || 'N/A'}</span>
                      </div>
                    </div>
                    
                    {/* Employment & Income */}
                    <div className="data-card">
                      <h3>💼 Employment & Income</h3>
                      <div className="data-row">
                        <span className="data-label">Employment Status:</span>
                        <span className="data-value">{applicationData?.employmentStatus || '-'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Employment Type:</span>
                        <span className="data-value">{applicationData?.employmentType || '-'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Length of Employment:</span>
                        <span className="data-value">{applicationData?.experience || '-'} years</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Occupation:</span>
                        <span className="data-value">{applicationData?.occupation || 'Professional'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Company Name:</span>
                        <span className="data-value">{applicationData?.companyName || 'N/A'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Designation:</span>
                        <span className="data-value">{applicationData?.designation || 'N/A'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Gross Monthly Income:</span>
                        <span className="data-value">PKR {applicationData?.grossMonthlySalary?.toLocaleString() || '-'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Net Monthly Income:</span>
                        <span className="data-value">PKR {applicationData?.netMonthlyIncome?.toLocaleString() || '-'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Salary Transfer:</span>
                        <span className="data-value" style={{ color: applicationData?.salaryTransferFlag === 'Yes' ? '#28a745' : '#6c757d' }}>
                          {applicationData?.salaryTransferFlag || 'No'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Location & Geography */}
                    <div className="data-card">
                      <h3>📍 Location & Geography</h3>
                      <div className="data-row">
                        <span className="data-label">Current City:</span>
                        <span className="data-value">{applicationData?.currentCity || '-'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Office City:</span>
                        <span className="data-value">{applicationData?.officeCity || '-'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Cluster:</span>
                        <span className="data-value">{applicationData?.cluster || '-'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Current Address:</span>
                        <span className="data-value">{applicationData?.currentAddress || 'N/A'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Office Address:</span>
                        <span className="data-value">{applicationData?.officeAddress || 'N/A'}</span>
                      </div>
                    </div>
                    
                    {/* Application Details */}
                    <div className="data-card">
                      <h3>💳 Application Details</h3>
                      <div className="data-row">
                        <span className="data-label">Amount Requested:</span>
                        <span className="data-value">PKR {applicationData?.amountRequested?.toLocaleString() || '-'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Loan Type:</span>
                        <span className="data-value">{applicationData?.loan_type || 'Credit Card'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Tenure (Months):</span>
                        <span className="data-value">{applicationData?.tenure || 'N/A'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">UBL Customer:</span>
                        <span className="data-value" style={{ color: applicationData?.ublCustomer === 'Yes' ? '#28a745' : '#6c757d' }}>
                          {applicationData?.ublCustomer || 'No'}
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Existing Debt:</span>
                        <span className="data-value">PKR {applicationData?.existingDebt?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                    
                    {/* Verification & Compliance */}
                    <div className="data-card">
                      <h3>⚠️ Verification & Compliance</h3>
                      <div className="data-row">
                        <span className="data-label">EAMVU Submitted:</span>
                        <span className="data-value" style={{ color: applicationData?.eavmu_submitted ? '#28a745' : '#dc3545' }}>
                          {applicationData?.eavmu_submitted ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">SPU Black List:</span>
                        <span className="data-value" style={{ color: applicationData?.spuBlackList === 'Yes' ? '#dc3545' : '#28a745' }}>
                          {applicationData?.spuBlackList === 'Yes' ? 'HIT' : 'CLEAR'}
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">SPU Credit Card:</span>
                        <span className="data-value" style={{ color: applicationData?.spuCreditCard === 'Yes' ? '#dc3545' : '#28a745' }}>
                          {applicationData?.spuCreditCard === 'Yes' ? 'HIT' : 'CLEAR'}
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">SPU Negative List:</span>
                        <span className="data-value" style={{ color: applicationData?.spuNegativeList === 'Yes' ? '#dc3545' : '#28a745' }}>
                          {applicationData?.spuNegativeList === 'Yes' ? 'HIT' : 'CLEAR'}
                        </span>
                      </div>
                    </div>
                    
                    {/* CBS Banking Data */}
                    <div className="data-card">
                      <h3>🏦 CBS Banking Data</h3>
                      <div className="data-row">
                        <span className="data-label">Average Deposit Balance:</span>
                        <span className="data-value">PKR {(dbrData?.average_deposit_balance || 0).toLocaleString()}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Highest DPD:</span>
                        <span className="data-value" style={{ color: (dbrData?.highest_dpd || 0) > 0 ? '#dc3545' : '#28a745' }}>
                          {dbrData?.highest_dpd || '0'} days
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">DPD 30+ Count:</span>
                        <span className="data-value" style={{ color: (dbrData?.dpd_30_plus || 0) > 0 ? '#dc3545' : '#28a745' }}>
                          {dbrData?.dpd_30_plus || '0'}
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">DPD 60+ Count:</span>
                        <span className="data-value" style={{ color: (dbrData?.dpd_60_plus || 0) > 0 ? '#dc3545' : '#28a745' }}>
                          {dbrData?.dpd_60_plus || '0'}
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Defaults (12M):</span>
                        <span className="data-value" style={{ color: (dbrData?.defaults_12m || 0) > 0 ? '#dc3545' : '#28a745' }}>
                          {dbrData?.defaults_12m || '0'}
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Late Payments:</span>
                        <span className="data-value" style={{ color: (dbrData?.late_payments || 0) > 0 ? '#dc3545' : '#28a745' }}>
                          {dbrData?.late_payments || '0'}
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Partial Payments:</span>
                        <span className="data-value" style={{ color: (dbrData?.partial_payments || 0) > 0 ? '#dc3545' : '#28a745' }}>
                          {dbrData?.partial_payments || '0'}
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Credit Utilization:</span>
                        <span className="data-value" style={{ color: (dbrData?.credit_utilization_ratio || 0) > 0.8 ? '#dc3545' : '#28a745' }}>
                          {((dbrData?.credit_utilization_ratio || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Bad Counts (Industry):</span>
                        <span className="data-value">{dbrData?.bad_counts_industry || '0'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Bad Counts (UBL):</span>
                        <span className="data-value">{dbrData?.bad_counts_ubl || '0'}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Industry Exposure:</span>
                        <span className="data-value">PKR {(dbrData?.exposure_in_industry || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

         
        </div>

          {/* Right Panel - Results */}
          {showApplicationData && (
            <div style={{ 
              width: '55%',
              minWidth: '700px',
              maxHeight: '80vh',
              overflowY: 'auto',
              overflowX: 'hidden',
              paddingRight: '10px'
            }}>
              {/* Critical Checks Section */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                marginBottom: '20px'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  margin: '0 0 20px 0',
                  color: '#2d3748',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    ⚠️ Critical Checks
                  </span>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    backgroundColor: criticalChecksStatus === 'PASS' ? '#d4edda' : criticalChecksStatus === 'FAIL' ? '#f8d7da' : '#fff3cd',
                    color: criticalChecksStatus === 'PASS' ? '#155724' : criticalChecksStatus === 'FAIL' ? '#721c24' : '#856404'
                  }}>
                    {criticalChecksStatus}
                  </span>
                </h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px'
                }}>
                  <div style={{
                    padding: '20px',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    border: '2px solid #e9ecef'
                  }}>
                    <h4 style={{
                      margin: '0 0 10px 0',
                      color: '#495057',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>
                      Age Check
                    </h4>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: ageScore >= 80 ? '#28a745' : ageScore >= 60 ? '#ffc107' : '#dc3545',
                      marginBottom: '8px'
                    }}>
                      {ageCalculation}
                </div>
                    <p style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      color: '#6c757d',
                      lineHeight: '1.4'
                    }}>
                      {ageReasoning}
                    </p>
                  </div>

                  <div style={{
                    padding: '20px',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    border: '2px solid #e9ecef'
                  }}>
                    <h4 style={{
                      margin: '0 0 10px 0',
                      color: '#495057',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>
                      DBR Check
                    </h4>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: dbrScore >= 80 ? '#28a745' : dbrScore >= 60 ? '#ffc107' : '#dc3545',
                      marginBottom: '8px'
                    }}>
                      {dbrCalculation}
                         </div>
                    {dbrWarning && (
                      <p style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        color: '#dc3545',
                        fontWeight: '500'
                      }}>
                        {dbrWarning}
                      </p>
                       )}
                     </div>
                     
                  <div style={{
                    padding: '20px',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    border: '2px solid #e9ecef'
                  }}>
                    <h4 style={{
                      margin: '0 0 10px 0',
                      color: '#495057',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>
                      SPU Check
                    </h4>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: spuScore >= 80 ? '#28a745' : spuScore >= 60 ? '#ffc107' : '#dc3545',
                      marginBottom: '8px'
                    }}>
                      {spuCalculation}
                         </div>
                       </div>
                     </div>
                   </div>

              {/* Module Scoring Section */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                marginBottom: '20px'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  margin: '0 0 20px 0',
                  color: '#2d3748',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    📊 Module Scoring
                  </span>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    backgroundColor: moduleScoringStatus === 'COMPLETE' ? '#d4edda' : '#fff3cd',
                    color: moduleScoringStatus === 'COMPLETE' ? '#155724' : '#856404'
                  }}>
                    {moduleScoringStatus}
                  </span>
                </h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px'
                }}>
                  <div style={{
                    padding: '20px',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    border: '2px solid #e9ecef'
                  }}>
                    <h4 style={{
                      margin: '0 0 10px 0',
                      color: '#495057',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>
                      City Scoring
                    </h4>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: cityScore >= 80 ? '#28a745' : cityScore >= 60 ? '#ffc107' : '#dc3545',
                      marginBottom: '8px'
                    }}>
                      {cityCalculation}
                </div>
                  </div>
                  
                  <div style={{
                    padding: '20px',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    border: '2px solid #e9ecef'
                  }}>
                    <h4 style={{
                      margin: '0 0 10px 0',
                      color: '#495057',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>
                      Income Scoring
                    </h4>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: incomeScore >= 80 ? '#28a745' : incomeScore >= 60 ? '#ffc107' : '#dc3545',
                      marginBottom: '8px'
                    }}>
                      {incomeCalculation}
                     </div>
                   </div>
                  
                  <div style={{
                    padding: '20px',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    border: '2px solid #e9ecef'
                  }}>
                    <h4 style={{
                      margin: '0 0 10px 0',
                      color: '#495057',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>
                      EAMVU Scoring
                    </h4>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: eamvuScore >= 80 ? '#28a745' : eamvuScore >= 60 ? '#ffc107' : '#dc3545',
                      marginBottom: '8px'
                    }}>
                      {eamvuCalculation}
                     </div>
                   </div>
                </div>
              </div>
              
              {/* Final Score Section */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                marginBottom: '20px'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  margin: '0 0 20px 0',
                  color: '#2d3748',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    🎯 Final Score
                  </span>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    backgroundColor: finalScoreStatus === 'COMPLETE' ? '#d4edda' : '#fff3cd',
                    color: finalScoreStatus === 'COMPLETE' ? '#155724' : '#856404'
                  }}>
                    {finalScoreStatus}
                  </span>
                </h2>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '40px',
                  marginBottom: '30px'
                }}>
                  <div style={{
                    position: 'relative',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: `conic-gradient(${finalScore >= 80 ? '#28a745' : finalScore >= 60 ? '#ffc107' : '#dc3545'} ${finalScore * 3.6}deg, #e9ecef 0deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}>
                    <div style={{
                      position: 'absolute',
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column'
                    }}>
                      <div style={{
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: finalScore >= 80 ? '#28a745' : finalScore >= 60 ? '#ffc107' : '#dc3545'
                      }}>
                        {finalScore.toFixed(1)}
                </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#6c757d',
                        fontWeight: '500'
                      }}>
                        / 100
                  </div>
                  </div>
                </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: '0 0 15px 0',
                      fontSize: '1.5rem',
                      color: '#2d3748',
                      fontWeight: '700'
                    }}>
                      Decision: <span style={{
                        color: decision === 'PASS' ? '#28a745' : decision === 'FAIL' ? '#dc3545' : '#ffc107'
                      }}>
                        {decision}
                      </span>
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px'
                    }}>
                      <div>
                        <strong style={{ color: '#495057' }}>Risk Level:</strong>
                        <div style={{
                          marginTop: '5px',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          backgroundColor: riskLevel === 'VERY_LOW' ? '#d4edda' : 
                                         riskLevel === 'LOW' ? '#d1ecf1' :
                                         riskLevel === 'MEDIUM' ? '#fff3cd' :
                                         riskLevel === 'HIGH' ? '#f8d7da' : '#f5c6cb',
                          color: riskLevel === 'VERY_LOW' ? '#155724' :
                                riskLevel === 'LOW' ? '#0c5460' :
                                riskLevel === 'MEDIUM' ? '#856404' :
                                riskLevel === 'HIGH' ? '#721c24' : '#721c24',
                          display: 'inline-block'
                        }}>
                          {riskLevel}
              </div>
            </div>
                      <div>
                        <strong style={{ color: '#495057' }}>Action Required:</strong>
                        <p style={{
                          margin: '5px 0 0 0',
                          fontSize: '0.9rem',
                          color: '#6c757d',
                          lineHeight: '1.4'
                        }}>
                          {actionRequired}
                        </p>
                      </div>
                    </div>
                    
                    {/* Credit Limit and Card Type Display */}
                    {(assignedCreditLimit > 0 || cardType) && (
                      <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6'
                      }}>
                        <h4 style={{
                          margin: '0 0 10px 0',
                          fontSize: '1.1rem',
                          color: '#495057',
                          fontWeight: '600'
                        }}>
                          Credit Assignment
                        </h4>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '15px',
                          marginBottom: '20px'
                        }}>
                          {assignedCreditLimit > 0 && (
                            <div>
                              <strong style={{ color: '#495057' }}>Assigned Limit:</strong>
                              <div style={{
                                marginTop: '5px',
                                fontSize: '1.2rem',
                                fontWeight: '700',
                                color: '#28a745'
                              }}>
                                PKR {assignedCreditLimit.toLocaleString()}
                              </div>
                            </div>
                          )}
                          {cardType && (
                            <div>
                              <strong style={{ color: '#495057' }}>Selected Card Type:</strong>
                              <div style={{
                                marginTop: '5px',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                backgroundColor: cardType === 'PLATINUM' ? '#6f42c1' : 
                                               cardType === 'GOLD' ? '#ffc107' : '#6c757d',
                                color: cardType === 'PLATINUM' ? '#ffffff' : 
                                       cardType === 'GOLD' ? '#000000' : '#ffffff',
                                display: 'inline-block'
                              }}>
                                {cardType}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Card Eligibility Options */}
                        <div style={{ marginTop: '20px' }}>
                          <h5 style={{
                            margin: '0 0 15px 0',
                            color: '#495057',
                            fontSize: '1rem',
                            fontWeight: '600'
                          }}>
                            💳 Card Eligibility Options
                          </h5>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '15px'
                          }}>
                            {[
                              { 
                                type: 'SILVER', 
                                range: 'PKR 25,000 - 125,000',
                                color: '#6c757d',
                                textColor: '#ffffff'
                              },
                              { 
                                type: 'GOLD', 
                                range: 'PKR 125,001 - 299,999',
                                color: '#ffc107',
                                textColor: '#000000'
                              },
                              { 
                                type: 'PLATINUM', 
                                range: 'PKR 300,000 - 7,000,000',
                                color: '#6f42c1',
                                textColor: '#ffffff'
                              }
                            ].map((card) => {
                              const isEligible = assignedCreditLimit >= (card.type === 'SILVER' ? 25000 : 
                                                                        card.type === 'GOLD' ? 125001 : 300000);
                              const isSelected = cardType === card.type;
                              
                              return (
                                <div key={card.type} style={{
                                  padding: '15px',
                                  borderRadius: '12px',
                                  border: isSelected ? '3px solid #007bff' : 
                                         isEligible ? '2px solid #28a745' : '2px solid #dc3545',
                                  backgroundColor: isSelected ? '#e3f2fd' : 
                                                 isEligible ? '#f8fff8' : '#fff5f5',
                                  position: 'relative'
                                }}>
                                  {isSelected && (
                                    <div style={{
                                      position: 'absolute',
                                      top: '-8px',
                                      right: '-8px',
                                      backgroundColor: '#007bff',
                                      color: 'white',
                                      borderRadius: '50%',
                                      width: '24px',
                                      height: '24px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '12px',
                                      fontWeight: 'bold'
                                    }}>
                                      ✓
                                    </div>
                                  )}
                                  
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginBottom: '10px'
                                  }}>
                                    <div style={{
                                      padding: '6px 12px',
                                      borderRadius: '20px',
                                      fontSize: '0.8rem',
                                      fontWeight: '600',
                                      backgroundColor: card.color,
                                      color: card.textColor,
                                      display: 'inline-block'
                                    }}>
                                      {card.type}
                                    </div>
                                    <div style={{
                                      fontSize: '0.8rem',
                                      fontWeight: '600',
                                      color: isEligible ? '#28a745' : '#dc3545'
                                    }}>
                                      {isEligible ? '✓ ELIGIBLE' : '✗ NOT ELIGIBLE'}
                                    </div>
                                  </div>
                                  
                                  <div style={{
                                    fontSize: '0.9rem',
                                    color: '#495057',
                                    marginBottom: '8px'
                                  }}>
                                    <strong>Range:</strong> {card.range}
                                  </div>
                                  
                                  <div style={{
                                    fontSize: '0.8rem',
                                    color: isEligible ? '#28a745' : '#dc3545',
                                    fontWeight: '500'
                                  }}>
                                    {isEligible ? 
                                      `✓ Customer qualifies for ${card.type} card` : 
                                      `✗ Customer does not qualify for ${card.type} card`
                                    }
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
      </div>

                <div style={{
                  background: '#f8f9fa',
                  borderRadius: '12px',
          padding: '20px', 
                  border: '1px solid #e9ecef'
                }}>
                  <h4 style={{
                    margin: '0 0 15px 0',
                    color: '#495057',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}>
                    Detailed Module Breakdown
                  </h4>
                  <div style={{
                    fontFamily: 'Monaco, Consolas, monospace',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    color: '#495057',
                    whiteSpace: 'pre-line',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    padding: '10px',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                  }}>
                    {weightedCalculations}
                  </div>
                </div>
                
              </div>
        </div>
      )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        .pulse {
          animation: pulse 2s infinite;
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .main-layout {
          display: flex;
          gap: 30px;
          min-height: 80vh;
        }
        
        .left-panel, .right-panel {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .section {
          margin-bottom: 30px;
        }
        
        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 20px 0;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          font-size: 0.9rem;
          font-weight: 500;
          color: #4a5568;
          margin-bottom: 8px;
        }
        
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
          outline: none;
        }
        
        .form-group input:focus,
        .form-group select:focus {
          border-color: #667eea;
        }
        
        .data-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        
        .data-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e9ecef;
        }
        
        .data-card h3 {
          margin: 0 0 15px 0;
          color: #495057;
          font-size: 1.1rem;
          font-weight: 600;
        }
        
        .data-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 4px 0;
        }
        
        .data-label {
          font-weight: 500;
          color: #6c757d;
        }
        
        .data-value {
          font-weight: 600;
          color: #495057;
        }
        
        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .status-badge.pass {
          background-color: #d4edda;
          color: #155724;
        }
        
        .status-badge.fail {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .status-badge.pending {
          background-color: #fff3cd;
          color: #856404;
        }
        
        .status-badge.complete {
          background-color: #d4edda;
          color: #155724;
        }
        
        .calculation-item {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
          border: 2px solid #e9ecef;
          margin-bottom: 15px;
        }
        
        .calculation-item h4 {
          margin: 0 0 10px 0;
          color: #495057;
          font-size: 1rem;
          font-weight: 600;
        }
        
        .calculation-result {
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0 0 8px 0;
        }
        
        .calculation-reasoning {
          margin: 0;
          font-size: 0.9rem;
          color: #6c757d;
          line-height: 1.4;
        }
        
        .calculation-warning {
          margin: 0;
          font-size: 0.9rem;
          color: #dc3545;
          font-weight: 500;
        }
        
        .final-score-display {
          display: flex;
          align-items: center;
          gap: 40px;
          margin-bottom: 30px;
        }
        
        .score-circle {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
        
        .score-value {
          font-size: 1.8rem;
          font-weight: 700;
        }
        
        .score-label {
          font-size: 0.9rem;
          color: #6c757d;
          font-weight: 500;
        }
        
        .score-details h3 {
          margin: 0 0 15px 0;
          font-size: 1.5rem;
          color: #2d3748;
          font-weight: 700;
        }
        
        .weighted-calculations {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e9ecef;
        }
        
        .weighted-calculations h4 {
          margin: 0 0 15px 0;
          color: #495057;
          font-size: 1.1rem;
          font-weight: 600;
        }
        
        .calculation-breakdown {
          font-family: Monaco, Consolas, monospace;
          font-size: 0.9rem;
          line-height: 1.6;
          color: #495057;
          white-space: pre-line;
          margin: 0;
        }
        
        .collapsible {
          cursor: pointer;
          user-select: none;
        }
        
        .collapsible:hover {
          opacity: 0.8;
        }
        
        .collapsible.active {
          color: #667eea;
        }
        
        .collapsible-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-out;
        }
        
        .collapsible-content.expanded {
          max-height: 1000px;
        }
        
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
          padding: 20px;
          background: #f7fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #667eea;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @media (max-width: 1200px) {
          .main-layout {
            flex-direction: column;
          }
          
          .left-panel, .right-panel {
            width: 100%;
            max-width: none;
            min-width: auto;
          }
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 10px;
          }
          
          .left-panel, .right-panel {
            padding: 20px;
          }
          
          .data-grid {
            grid-template-columns: 1fr;
          }
          
          .final-score-display {
            flex-direction: column;
            text-align: center;
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
}
