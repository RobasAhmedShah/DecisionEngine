/**
 * Application Scorecard Module
 * Handles ILOS-based application scoring with comprehensive risk assessment
 * 
 * Team: Application Data & Scorecard Analysis
 * Responsibility: ILOS data processing, application risk scoring, demographic analysis
 */

export interface ApplicationScoreInput {
  // ILOS Data
  education_qualification?: string;
  marital_status?: string;
  employment_status?: string;
  net_monthly_income?: number;
  total_income?: number;
  nature_of_residence?: string;
  num_dependents?: number;
  length_of_employment?: number;
  business_nature?: string;
  occupation?: string;
  is_ubl_customer?: boolean | string;
  
  // CBS Data
  average_deposit_balance?: number;
  highest_dpd?: number;
  exposure_in_industry?: number;
  
  // Age and City data (from other modules)
  date_of_birth?: string;
  curr_city?: string;
  office_city?: string;
  cluster?: string;
  
  // DBR score from DBR module
  dbrScore?: number;
}

export interface ApplicationScoreResult {
  score: number;
  breakdown: {
    education: number;
    marital_status: number;
    employment_status: number;
    net_income: number;
    residence_ownership: number;
    dependents: number;
    length_of_employment: number;
    industry: number;
    portfolio_type: number;
    deposits: number;
    highest_dpd: number;
    industry_exposure: number;
    age: number;
    city: number;
    dbr_score: number;
  };
  notes: string[];
  details: {
    customerType: string;
    totalComponents: number;
    maxPossibleScore: number;
    scoringMethod: string;
  };
}

export default class ApplicationScoreModule {
  private weights = {
    education: 0.08,              // 8%
    marital_status: 0.08,         // 8%
    employment_status: 0.03,      // 3%
    net_income: 0.13,             // 13%
    residence_ownership: 0.02,    // 2%
    dependents: 0.02,             // 2%
    length_of_employment: 0.11,   // 11%
    industry: 0.03,               // 3%
    portfolio_type: 0.09,         // 9%
    deposits: 0.15,               // 15% (CBS)
    highest_dpd: 0.04,            // 4% (CBS)
    industry_exposure: 0.04,      // 4% (CBS)
    age: 0.07,                    // 7% (uses Age module logic)
    city: 0.05,                   // 5% (uses City module logic)
    dbr_score: 0.06               // 6% (uses DBR module score)
  };

  /**
   * Calculate education score
   */
  private calculateEducationScore(education: string): number {
    const eduLower = education.toLowerCase();
    if (eduLower.includes('phd') || eduLower.includes('doctorate')) return 100;
    if (eduLower.includes('masters') || eduLower.includes('mba')) return 85;
    if (eduLower.includes('bachelor') || eduLower.includes('graduation')) return 70;
    if (eduLower.includes('intermediate') || eduLower.includes('college')) return 55;
    if (eduLower.includes('matric') || eduLower.includes('secondary')) return 40;
    return 25; // Primary or below
  }

  /**
   * Calculate marital status score
   */
  private calculateMaritalStatusScore(maritalStatus: string): number {
    const statusLower = maritalStatus.toLowerCase();
    if (statusLower.includes('married')) return 75;
    if (statusLower.includes('single')) return 60;
    if (statusLower.includes('divorced') || statusLower.includes('separated')) return 45;
    if (statusLower.includes('widowed')) return 50;
    return 40; // Unknown
  }

  /**
   * Calculate employment status score
   */
  private calculateEmploymentStatusScore(employmentStatus: string): number {
    const statusLower = employmentStatus.toLowerCase();
    if (statusLower.includes('permanent') || statusLower.includes('employed')) return 100;
    if (statusLower.includes('contractual')) return 75;
    if (statusLower.includes('self-employed') || statusLower.includes('business')) return 65;
    if (statusLower.includes('probation')) return 50;
    if (statusLower.includes('retired')) return 40;
    return 20; // Unemployed or unknown
  }

  /**
   * Calculate net income score
   */
  private calculateNetIncomeScore(netIncome: number): number {
    if (netIncome >= 200000) return 100;
    if (netIncome >= 150000) return 90;
    if (netIncome >= 100000) return 80;
    if (netIncome >= 75000) return 70;
    if (netIncome >= 50000) return 60;
    if (netIncome >= 30000) return 45;
    if (netIncome >= 20000) return 30;
    return 15;
  }

  /**
   * Calculate residence ownership score
   */
  private calculateResidenceScore(residence: string): number {
    const residenceLower = residence.toLowerCase();
    if (residenceLower.includes('owned')) return 100;
    if (residenceLower.includes('family')) return 75;
    if (residenceLower.includes('rented')) return 50;
    if (residenceLower.includes('company')) return 60;
    return 40; // Other/Unknown
  }

  /**
   * Calculate dependents score
   */
  private calculateDependentsScore(dependents: number): number {
    if (dependents === 0) return 100;
    if (dependents <= 2) return 80;
    if (dependents <= 4) return 60;
    if (dependents <= 6) return 40;
    return 20; // More than 6
  }

  /**
   * Calculate length of employment score
   */
  private calculateEmploymentLengthScore(lengthYears: number): number {
    if (lengthYears >= 10) return 100;
    if (lengthYears >= 5) return 85;
    if (lengthYears >= 3) return 70;
    if (lengthYears >= 2) return 60;
    if (lengthYears >= 1) return 45;
    return 25; // Less than 1 year
  }

  /**
   * Calculate industry score
   */
  private calculateIndustryScore(businessNature: string, occupation: string): number {
    const combined = `${businessNature} ${occupation}`.toLowerCase();
    
    // High stability industries
    if (combined.includes('government') || combined.includes('banking') || 
        combined.includes('education') || combined.includes('healthcare')) return 100;
    
    // Medium-high stability
    if (combined.includes('it') || combined.includes('software') || 
        combined.includes('engineering') || combined.includes('finance')) return 85;
    
    // Medium stability
    if (combined.includes('manufacturing') || combined.includes('telecom') || 
        combined.includes('consulting')) return 70;
    
    // Medium-low stability
    if (combined.includes('retail') || combined.includes('sales') || 
        combined.includes('marketing')) return 55;
    
    // Lower stability
    if (combined.includes('construction') || combined.includes('real estate') || 
        combined.includes('hospitality')) return 40;
    
    return 50; // Default/Unknown
  }

  /**
   * Calculate portfolio type score (based on UBL customer status)
   */
  private calculatePortfolioScore(isUBLCustomer: boolean): number {
    return isUBLCustomer ? 85 : 60; // ETB vs NTB
  }

  /**
   * Calculate deposits score (CBS data)
   */
  private calculateDepositsScore(avgDepositBalance: number): number {
    if (avgDepositBalance >= 1000000) return 100;
    if (avgDepositBalance >= 500000) return 85;
    if (avgDepositBalance >= 250000) return 70;
    if (avgDepositBalance >= 100000) return 55;
    if (avgDepositBalance >= 50000) return 40;
    if (avgDepositBalance >= 10000) return 25;
    return 10;
  }

  /**
   * Calculate highest DPD score (CBS data)
   */
  private calculateDPDScore(highestDPD: number): number {
    if (highestDPD === 0) return 100;
    if (highestDPD <= 7) return 80;
    if (highestDPD <= 30) return 60;
    if (highestDPD <= 60) return 40;
    if (highestDPD <= 90) return 20;
    return 0; // More than 90 days
  }

  /**
   * Calculate industry exposure score (CBS data)
   */
  private calculateIndustryExposureScore(exposure: number): number {
    if (exposure === 0) return 100;
    if (exposure <= 50000) return 85;
    if (exposure <= 100000) return 70;
    if (exposure <= 250000) return 55;
    if (exposure <= 500000) return 40;
    return 20; // High exposure
  }

  /**
   * Calculate age score (simplified from Age module logic)
   */
  private calculateAgeScore(dateOfBirth: string): number {
    if (!dateOfBirth) return 50;
    
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    
    if (age >= 25 && age <= 45) return 100; // Prime age
    if (age >= 22 && age <= 55) return 85;  // Good age
    if (age >= 18 && age <= 65) return 70;  // Acceptable age
    return 30; // Outside optimal range
  }

  /**
   * Calculate city score (simplified from City module logic)
   */
  private calculateCityScore(currentCity: string, officeCity: string, cluster: string): number {
    const cities = `${currentCity} ${officeCity}`.toLowerCase();
    
    // Tier 1 cities
    if (cities.includes('karachi') || cities.includes('lahore') || 
        cities.includes('islamabad') || cities.includes('rawalpindi')) return 100;
    
    // Tier 2 cities
    if (cities.includes('faisalabad') || cities.includes('multan') || 
        cities.includes('hyderabad') || cities.includes('gujranwala')) return 80;
    
    // Cluster-based scoring
    const clusterUpper = cluster.toUpperCase();
    if (clusterUpper === 'FEDERAL') return Math.max(60, 90);
    if (clusterUpper === 'SOUTH') return Math.max(50, 75);
    if (clusterUpper === 'NORTHERN_PUNJAB') return Math.max(40, 65);
    
    return 50; // Default
  }

  /**
   * Calculate DBR score component
   */
  private calculateDBRScoreComponent(dbrScore: number): number {
    return Math.min(100, Math.max(0, dbrScore)); // Normalize to 0-100
  }

  /**
   * Calculate Application Score based on ILOS and CBS data
   * EXACT logic from original ApplicationScore.js
   */
  public calculate(input: ApplicationScoreInput): ApplicationScoreResult {
    console.log('='.repeat(80));
    console.log('📊 APPLICATION SCORECARD CALCULATION');
    console.log('='.repeat(80));
    console.log('📥 INPUTS:');
    console.log('  • Education:', input.education_qualification || 'N/A');
    console.log('  • Marital Status:', input.marital_status || 'N/A');
    console.log('  • Employment:', input.employment_status || 'N/A');
    console.log('  • Net Income:', input.net_monthly_income || input.total_income || 0);
    console.log('  • UBL Customer:', input.is_ubl_customer || false);

    const isUBLCustomer = input.is_ubl_customer === true || input.is_ubl_customer === "true";
    const netIncome = input.net_monthly_income || input.total_income || 0;

    // Calculate individual component scores
    const breakdown = {
      education: this.calculateEducationScore(input.education_qualification || ''),
      marital_status: this.calculateMaritalStatusScore(input.marital_status || ''),
      employment_status: this.calculateEmploymentStatusScore(input.employment_status || ''),
      net_income: this.calculateNetIncomeScore(netIncome),
      residence_ownership: this.calculateResidenceScore(input.nature_of_residence || ''),
      dependents: this.calculateDependentsScore(input.num_dependents || 0),
      length_of_employment: this.calculateEmploymentLengthScore(input.length_of_employment || 0),
      industry: this.calculateIndustryScore(input.business_nature || '', input.occupation || ''),
      portfolio_type: this.calculatePortfolioScore(isUBLCustomer),
      deposits: this.calculateDepositsScore(input.average_deposit_balance || 0),
      highest_dpd: this.calculateDPDScore(input.highest_dpd || 0),
      industry_exposure: this.calculateIndustryExposureScore(input.exposure_in_industry || 0),
      age: this.calculateAgeScore(input.date_of_birth || ''),
      city: this.calculateCityScore(input.curr_city || '', input.office_city || '', input.cluster || ''),
      dbr_score: this.calculateDBRScoreComponent(input.dbrScore || 0)
    };

    // Calculate weighted final score
    let totalScore = 0;
    const notes: string[] = [];

    for (const [component, score] of Object.entries(breakdown)) {
      const weight = this.weights[component as keyof typeof this.weights];
      const weightedScore = score * weight;
      totalScore += weightedScore;
      
      console.log(`  • ${component}: ${score}/100 × ${(weight * 100).toFixed(1)}% = ${weightedScore.toFixed(2)}`);
      notes.push(`${component}: ${score}/100 (weight: ${(weight * 100).toFixed(1)}%)`);
    }

    const finalScore = Math.round(totalScore);

    console.log('📊 WEIGHTED CALCULATION:');
    console.log(`  • Total Score: ${finalScore}/100`);
    console.log(`  • Customer Type: ${isUBLCustomer ? 'ETB' : 'NTB'}`);
    console.log('📤 OUTPUTS:');
    console.log(`  • Final Score: ${finalScore}/100`);
    console.log('='.repeat(80));

    return {
      score: finalScore,
      breakdown,
      notes,
      details: {
        customerType: isUBLCustomer ? 'ETB' : 'NTB',
        totalComponents: Object.keys(breakdown).length,
        maxPossibleScore: 100,
        scoringMethod: 'WEIGHTED_COMPONENTS'
      }
    };
  }

  /**
   * Get weight for this module in final calculation
   */
  public getWeight(isETB: boolean = false): number {
    return isETB ? 0.10 : 0.15; // 10% for ETB, 15% for NTB
  }

  /**
   * Get module information
   */
  public getModuleInfo() {
    return {
      name: 'Application Scorecard Module',
      description: 'Handles ILOS-based application scoring with comprehensive risk assessment',
      weight: 'Variable: 15% (NTB) / 10% (ETB)',
      team: 'Application Data & Scorecard Analysis',
      criticalFailure: false
    };
  }

  /**
   * Validate application score input data
   */
  public validateInput(input: ApplicationScoreInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!input.education_qualification) {
      errors.push('Education qualification is required');
    }

    if (!input.employment_status) {
      errors.push('Employment status is required');
    }

    const netIncome = input.net_monthly_income || input.total_income || 0;
    if (netIncome <= 0) {
      errors.push('Net monthly income must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get scoring components information
   */
  public getScoringComponents(): Array<{component: string, weight: number, description: string}> {
    return Object.entries(this.weights).map(([component, weight]) => ({
      component,
      weight: weight * 100,
      description: this.getComponentDescription(component)
    }));
  }

  private getComponentDescription(component: string): string {
    const descriptions: {[key: string]: string} = {
      education: 'Educational qualification level',
      marital_status: 'Marital status stability factor',
      employment_status: 'Employment type and stability',
      net_income: 'Monthly net income level',
      residence_ownership: 'Home ownership status',
      dependents: 'Number of dependents',
      length_of_employment: 'Years of employment experience',
      industry: 'Industry and occupation risk',
      portfolio_type: 'Customer relationship (ETB/NTB)',
      deposits: 'Average deposit balance (CBS)',
      highest_dpd: 'Highest days past due (CBS)',
      industry_exposure: 'Industry exposure amount (CBS)',
      age: 'Age-based demographic risk',
      city: 'Geographic location risk',
      dbr_score: 'Debt-to-income ratio score'
    };
    return descriptions[component] || 'Unknown component';
  }
}
