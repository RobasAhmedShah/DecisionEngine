/**
 * Data Service Module
 * Handles API calls and data fetching with comprehensive fallback data
 * 
 * Team: Data Integration & API Management
 * Responsibility: Application data fetching, DBR data integration, fallback data management
 */

export interface ApplicationData {
    // Basic Information
    id?: number;
    los_id?: number;
    full_name?: string;
    customerName?: string;
    first_name?: string;
    last_name?: string;
    cnic?: string;
    date_of_birth?: string;
    gender?: string;
    marital_status?: string;
    mobile?: string;
    
    // Employment & Income
    employment_status?: string;
    employment_type?: string;
    occupation?: string;
    company_name?: string;
    designation?: string;
    experience_years?: number;
    gross_monthly_income?: number;
    grossMonthlySalary?: number;
    total_income?: number;
    net_monthly_income?: number;
    netMonthlyIncome?: number;
    length_of_employment?: number;
    
    // Loan Details
    proposed_loan_amount?: number;
    amount_requested?: number;
    loan_amount?: number;
    amountRequested?: number;
    tenure_months?: number;
    loan_type?: string;
    
    // UBL Customer Status
    is_ubl_customer?: boolean;
    salary_transfer_flag?: boolean;
    
    // Address & Location
    curr_city?: string;
    current_address?: string;
    office_city?: string;
    office_address?: string;
    cluster?: string;
    
    // Verification & Checks
    eavmu_submitted?: boolean;
    spu_black_list_check?: boolean;
    spu_credit_card_30k_check?: boolean;
    spu_negative_list_check?: boolean;
    
    // Application Score Fields
    education_qualification?: string;
    nature_of_residence?: string;
    num_dependents?: number;
    business_nature?: string;
    
    // DBR Data
    dbrData?: {
        dbr?: number;
        dbr_details?: {
            net_income?: number;
            total_obligations?: number;
        };
        threshold?: number;
        status?: string;
    };
}

export interface CBSData {
    // Behavioral Score fields
    bad_counts_industry?: number;
    bad_counts_ubl?: number;
    dpd_30_plus?: number;
    dpd_60_plus?: number;
    defaults_12m?: number;
    late_payments?: number;
    average_deposit_balance?: number;
    partial_payments?: number;
    credit_utilization_ratio?: number;
    exposure_in_industry?: number;
    highest_dpd?: number;
}

export default class DataService {
    private apiBaseUrl: string;
    private dataEngineUrl: string;

    constructor() {
        this.apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000';
        this.dataEngineUrl = process.env.NEXT_PUBLIC_DATA_ENGINE_URL || 'http://127.0.0.1:5000';
    }

    /**
     * Generate comprehensive fallback application data
     * @param {number} applicationId - Application ID
     * @returns {ApplicationData} Complete fallback application data
     */
    private generateFallbackApplicationData(applicationId: number): ApplicationData {
        console.log(`🔄 DataService: Generating fallback application data for ID: ${applicationId}`);
        
        return {
            // Basic Information
            id: applicationId,
            los_id: applicationId,
            full_name: "John Doe (Fallback Data)",
            customerName: "John Doe (Fallback Data)",
            first_name: "John",
            last_name: "Doe",
            cnic: "3520112345678",
            date_of_birth: "1985-06-15T00:00:00.000Z",
            gender: "Male",
            marital_status: "Married",
            mobile: "03001234567",
            
            // Employment & Income
            employment_status: "Employed",
            employment_type: "permanent",
            occupation: "Software Engineer",
            company_name: "Tech Solutions Ltd",
            designation: "Senior Developer",
            experience_years: 5,
            gross_monthly_income: 1500000,
            grossMonthlySalary: 1500000,
            total_income: 150000,
            net_monthly_income: 1200000,
            netMonthlyIncome: 1200000,
            length_of_employment: 5,
            
            // Loan Details
            proposed_loan_amount: 50000,
            amount_requested: 50000,
            loan_amount: 50000,
            amountRequested: 50000,
            tenure_months: 24,
            loan_type: "credit_card",
            
            // UBL Customer Status
            is_ubl_customer: true,
            salary_transfer_flag: true,
            
            // Address & Location
            curr_city: "Karachi",
            current_address: "Block 6, PECHS, Karachi",
            office_city: "Karachi",
            office_address: "Clifton, Karachi",
            cluster: "SOUTH",
            
            // Verification & Checks
            eavmu_submitted: true,
            spu_black_list_check: false,
            spu_credit_card_30k_check: false,
            spu_negative_list_check: false,
            
            // Application Score Fields
            education_qualification: "Bachelor",
            nature_of_residence: "Owned",
            num_dependents: 2,
            business_nature: "Technology",
            
            // DBR Data - Default to good DBR
            dbrData: {
                dbr: 15, // 15% DBR - good ratio
                dbr_details: {
                    net_income: 120000,
                    total_obligations: 18000
                },
                threshold: 35,
                status: 'pass'
            }
        };
    }

    /**
     * Generate fallback CBS data
     * @param {number} applicationId - Application ID
     * @returns {CBSData} Complete fallback CBS data
     */
    private generateFallbackCBSData(applicationId: number): CBSData {
        console.log(`🔄 DataService: Generating fallback CBS data for ID: ${applicationId}`);
        
        return {
            bad_counts_industry: 0,
            bad_counts_ubl: 0,
            dpd_30_plus: 0,
            dpd_60_plus: 0,
            defaults_12m: 0,
            late_payments: 0,
            average_deposit_balance: 500000,
            partial_payments: 0,
            credit_utilization_ratio: 0.3,
            exposure_in_industry: 0,
            highest_dpd: 0
        };
    }

    /**
     * Generate fallback DBR data
     * @param {number} applicationId - Application ID
     * @param {string} loanType - Loan type
     * @returns {Object} Fallback DBR data
     */
    private generateFallbackDBRData(applicationId: number, loanType: string = "credit_card"): any {
        console.log(`🔄 DataService: Generating fallback DBR data for ID: ${applicationId}, Type: ${loanType}`);
        
        return {
            dbr: 15, // 15% DBR - good ratio
            dbr_details: {
                net_income: 120000,
                total_obligations: 18000
            },
            threshold: 35,
            status: 'pass',
            calculation_method: 'fallback',
            risk_category: 'LOW'
        };
    }

    /**
     * Normalize null values to false
     * @param {any} data - Data to normalize
     * @returns {any} Normalized data
     */
    normalizeApiData(data: any): any {
        if (typeof data !== 'object' || data === null) {
            return data;
        }
        
        const normalized: any = {};
        for (const [key, value] of Object.entries(data)) {
            if (value === null) {
                normalized[key] = false;
            } else if (typeof value === 'object' && value !== null) {
                normalized[key] = this.normalizeApiData(value);
            } else {
                normalized[key] = value;
            }
        }
        return normalized;
    }

    /**
     * Fetch application data from API with fallback
     * @param {number} applicationId - Application ID
     * @returns {Promise<ApplicationData>} Application data
     */
    async fetchApplicationData(applicationId: number): Promise<ApplicationData> {
        console.log(`📥 DataService: Fetching application data for ID: ${applicationId}`);
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/applications/${applicationId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'NextJS-DataService/1.0',
                },
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });
            
            console.log(`📡 DataService: Response status: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.log(`❌ DataService: Error response body:`, errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }
            
            let applicationData = await response.json();
            console.log(`✅ DataService: Successfully fetched application data for ID: ${applicationId}`);
            
            // Normalize null values to false
            applicationData = this.normalizeApiData(applicationData);
            
            return applicationData;
        } catch (error) {
            console.error(`❌ DataService: Error fetching application data for ID: ${applicationId}`, error);
            console.log(`🔄 DataService: Using fallback application data for ID: ${applicationId}`);
            
            // Return fallback data instead of throwing error
            return this.generateFallbackApplicationData(applicationId);
        }
    }

    /**
     * Fetch DBR data from data engine with fallback
     * @param {number} losId - LOS ID
     * @param {string} loanType - Loan type
     * @returns {Promise<Object>} DBR data (always returns data, fallback if API fails)
     */
    async fetchDBRFromDataEngine(losId: number, loanType: string): Promise<any> {
        console.log(`📥 DataService: Fetching DBR data for LOS ID: ${losId}, Type: ${loanType}`);
        
        try {
            const response = await fetch(`${this.dataEngineUrl}/api/dbr`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'NextJS-DataService/1.0',
                },
                body: JSON.stringify({
                    losId: losId,
                    loan_type: loanType
                }),
                signal: AbortSignal.timeout(8000) // 8 second timeout
            });
            
            console.log(`📡 DataService: DBR Response status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const dbrData = await response.json();
                console.log(`✅ DataService: Successfully fetched DBR data for LOS ID: ${losId}`);
                return dbrData;
            } else {
                const errorText = await response.text();
                console.log(`❌ DataService: DBR Error response body:`, errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }
        } catch (error) {
            console.error(`❌ DataService: Error fetching DBR data for LOS ID: ${losId}`, error);
            console.log(`🔄 DataService: Using fallback DBR data for LOS ID: ${losId}`);
            
            // Return fallback DBR data instead of null
            return this.generateFallbackDBRData(losId, loanType);
        }
    }

    /**
     * Process application with full data pipeline and comprehensive fallback
     * @param {number} applicationId - Application ID
     * @returns {Promise<ApplicationData>} Complete application data with DBR
     */
    async processApplication(applicationId: number): Promise<ApplicationData> {
        console.log(`🚀 DataService: Processing application ID: ${applicationId}`);
        
        try {
            // Fetch application data (with fallback)
            const applicationData = await this.fetchApplicationData(applicationId);
            
            // Fetch DBR from data engine (with fallback)
            const dbrData = await this.fetchDBRFromDataEngine(
                applicationData.los_id || applicationData.id || applicationId, 
                applicationData.loan_type || 'credit_card'
            );
            
            // Add DBR data to application data
            applicationData.dbrData = dbrData;
            
            console.log(`✅ DataService: Successfully processed application ID: ${applicationId}`);
            console.log(`📋 DataService: Application data summary:`, {
                id: applicationData.id,
                name: applicationData.full_name,
                income: applicationData.net_monthly_income,
                dbr: dbrData.dbr,
                dbrStatus: dbrData.status
            });
            
            return applicationData;
        } catch (error) {
            console.error(`❌ DataService: Error processing application ID: ${applicationId}`, error);
            console.log(`🔄 DataService: Using complete fallback data for application ID: ${applicationId}`);
            
            // Return complete fallback data
            const fallbackData = this.generateFallbackApplicationData(applicationId);
            fallbackData.dbrData = this.generateFallbackDBRData(applicationId, 'credit_card');
            
            return fallbackData;
        }
    }

    /**
     * Fetch CBS data with fallback
     * @param {number} applicationId - Application ID
     * @returns {Promise<CBSData>} CBS data (always returns data, fallback if API fails)
     */
    async fetchCBSData(applicationId: number): Promise<CBSData> {
        console.log(`📥 DataService: Fetching CBS data for ID: ${applicationId}`);
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/cbs/${applicationId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'NextJS-DataService/1.0',
                },
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            
            if (response.ok) {
                const cbsData = await response.json();
                console.log(`✅ DataService: Successfully fetched CBS data for ID: ${applicationId}`);
                return cbsData;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error(`❌ DataService: Error fetching CBS data for ID: ${applicationId}`, error);
            console.log(`🔄 DataService: Using fallback CBS data for ID: ${applicationId}`);
            
            // Return fallback CBS data
            return this.generateFallbackCBSData(applicationId);
        }
    }
}




