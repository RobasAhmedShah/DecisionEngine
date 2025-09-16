/**
 * Age Module
 * Handles demographic risk assessment based on age and employment type
 * 
 * Team: Demographics & Employment Analysis
 * Responsibility: Age validation, employment type scoring, demographic risk assessment
 */

export interface AgeInput {
  date_of_birth?: string;
  occupation?: string;
  employment_status?: string;
}

export interface AgeResult {
  score: number;
  age: number | null;
  band: string;
  hardStop: boolean;
  notes: string[];
  details: {
    calculatedAge: number | null;
    employmentType: string;
    ageRange: {
      min: number;
      max: number;
      allowedRange: string;
    };
    validationStatus: string;
    riskCategory: string;
  };
}

export default class AgeModule {
  private NOW: Date;

  constructor() {
    this.NOW = new Date();
  }

  /**
   * Calculate years between two dates
   */
  private yearsBetween(d1: Date | null, d2: Date): number | null {
    if (!(d1 instanceof Date) || isNaN(d1.getTime()) || !(d2 instanceof Date) || isNaN(d2.getTime())) return null;
    return Math.floor((d2.getTime() - d1.getTime()) / (365.25 * 24 * 3600 * 1000));
  }

  /**
   * Get age ranges for different employment types
   */
  private getAgeRanges(employmentType: string): { min: number; max: number; allowedRange: string } {
    if (employmentType.includes("self")) {
      return { min: 22, max: 65, allowedRange: "Self-Employed: 22-65 years" };
    }
    return { min: 21, max: 60, allowedRange: "Salaried: 21-60 years (20-61 with tolerance)" };
  }

  /**
   * Calculate Age score based on employment type and age
   * EXACT logic from original Deceng.js
   */
  public calculate(input: AgeInput): AgeResult {
    console.log('='.repeat(80));
    console.log('👤 AGE MODULE CALCULATION');
    console.log('='.repeat(80));
    console.log('📥 INPUTS:');
    console.log('  • Occupation:', input.occupation || 'N/A');
    console.log('  • Employment Status:', input.employment_status || 'N/A');
    console.log('  • Date of Birth:', input.date_of_birth || 'N/A');

    const occ = String(input.occupation || "").toLowerCase();
    const status = String(input.employment_status || "").toLowerCase();
    const dob = input.date_of_birth ? new Date(input.date_of_birth) : null;

    const age = this.yearsBetween(dob, this.NOW);

    console.log('🔍 PROCESSING:');
    console.log('  • Calculated Age:', age);
    console.log('  • Occupation (processed):', occ);
    console.log('  • Status (processed):', status);

    // Guard: DOB must be valid and not future-dated
    if (age == null || age < 0) {
      console.log('❌ VALIDATION FAILED:');
      console.log('  • Reason: Invalid DOB or future-dated');
      console.log('  • Hard Stop: TRUE');
      console.log('📤 OUTPUTS:');
      console.log('  • Score: 0/100 (Hard Stop)');
      console.log('='.repeat(80));
      
      return {
        score: 0,
        age: null,
        band: 'Invalid',
        hardStop: true,
        notes: ['Invalid DOB or future-dated - Hard Stop'],
        details: {
          calculatedAge: null,
          employmentType: 'UNKNOWN',
          ageRange: { min: 0, max: 0, allowedRange: 'Invalid' },
          validationStatus: 'INVALID_DOB',
          riskCategory: 'CRITICAL'
        }
      };
    }

    // Self-Employed rule
    if (occ.includes("self")) {
      console.log('🔍 SELF-EMPLOYED CHECK:');
      console.log('  • Age Range: 22-65');
      console.log('  • Actual Age:', age);
      
      const ageRange = this.getAgeRanges('self-employed');
      
      if (age >= 22 && age <= 65) {
        console.log('  • Result: PASS');
        console.log('📤 OUTPUTS:');
        console.log('  • Final Score: 100/100');
        console.log('='.repeat(80));
        
        return {
          score: 100,
          age,
          band: 'Self-Employed 22-65',
          hardStop: false,
          notes: [`Age ${age} within 22-65 (Self-Employed) - Full score`],
          details: {
            calculatedAge: age,
            employmentType: 'SELF_EMPLOYED',
            ageRange,
            validationStatus: 'VALID',
            riskCategory: 'LOW'
          }
        };
      }
      
      console.log('  • Result: FAIL (Hard Stop)');
      console.log('📤 OUTPUTS:');
      console.log('  • Score: 0/100 (Hard Stop)');
      console.log('='.repeat(80));
      
      return {
        score: 0,
        age,
        band: 'Self-Employed 22-65',
        hardStop: true,
        notes: [`Age ${age} outside 22-65 (Self-Employed) - Hard Stop`],
        details: {
          calculatedAge: age,
          employmentType: 'SELF_EMPLOYED',
          ageRange,
          validationStatus: 'OUT_OF_RANGE',
          riskCategory: 'CRITICAL'
        }
      };
    }

    // Default to Salaried
    console.log('🔍 SALARIED CHECK:');
    const retired = status === "retired";
    console.log('  • Employment Type: Salaried');
    console.log('  • Retired Status:', retired);
    console.log('  • Age Range: 21-60 (normal), 20-61 (with tolerance)');

    const ageRange = this.getAgeRanges('salaried');

    if (retired) {
      console.log('  • Special Case: Retired');
      // Penalized but allowed around retirement age
      if (age < 20 || age > 61) {
        console.log('  • Result: FAIL (Hard Stop)');
        console.log('📤 OUTPUTS:');
        console.log('  • Score: 0/100 (Hard Stop)');
        console.log('='.repeat(80));
        
        return {
          score: 0,
          age,
          band: 'Salaried (Retired)',
          hardStop: true,
          notes: [`Age ${age} not acceptable for Salaried (Retired) - Hard Stop`],
          details: {
            calculatedAge: age,
            employmentType: 'SALARIED_RETIRED',
            ageRange: { min: 20, max: 61, allowedRange: "Retired: 20-61 years" },
            validationStatus: 'OUT_OF_RANGE',
            riskCategory: 'CRITICAL'
          }
        };
      }
      
      console.log('  • Result: PASS (Penalized)');
      console.log('📤 OUTPUTS:');
      console.log('  • Final Score: 75/100');
      console.log('='.repeat(80));
      
      return {
        score: 75,
        age,
        band: 'Salaried (Retired)',
        hardStop: false,
        notes: [`Retired at age ${age} - Penalized score`],
        details: {
          calculatedAge: age,
          employmentType: 'SALARIED_RETIRED',
          ageRange: { min: 20, max: 61, allowedRange: "Retired: 20-61 years" },
          validationStatus: 'VALID_PENALIZED',
          riskCategory: 'MEDIUM'
        }
      };
    }

    // Salaried (not retired)
    if (age >= 21 && age <= 60) {
      console.log('  • Result: PASS');
      console.log('📤 OUTPUTS:');
      console.log('  • Final Score: 100/100');
      console.log('='.repeat(80));
      
      return {
        score: 100,
        age,
        band: 'Salaried 21-60',
        hardStop: false,
        notes: [`Age ${age} within 21-60 (Salaried) - Full score`],
        details: {
          calculatedAge: age,
          employmentType: 'SALARIED',
          ageRange,
          validationStatus: 'VALID',
          riskCategory: 'LOW'
        }
      };
    }

    // Edge tolerance 20 or 61 → lesser score
    if (age === 20 || age === 61) {
      console.log('  • Result: PASS (Edge Tolerance)');
      console.log('📤 OUTPUTS:');
      console.log('  • Final Score: 80/100');
      console.log('='.repeat(80));
      
      return {
        score: 80,
        age,
        band: 'Salaried (Edge)',
        hardStop: false,
        notes: [`Age ${age} edge tolerance - Reduced score`],
        details: {
          calculatedAge: age,
          employmentType: 'SALARIED',
          ageRange,
          validationStatus: 'VALID_EDGE',
          riskCategory: 'MEDIUM'
        }
      };
    }

    console.log('  • Result: FAIL (Hard Stop)');
    console.log('📤 OUTPUTS:');
    console.log('  • Score: 0/100 (Hard Stop)');
    console.log('='.repeat(80));
    
    return {
      score: 0,
      age,
      band: 'Salaried (Out of Range)',
      hardStop: true,
      notes: [`Age ${age} outside 20-61 (Salaried) - Hard Stop`],
      details: {
        calculatedAge: age,
        employmentType: 'SALARIED',
        ageRange,
        validationStatus: 'OUT_OF_RANGE',
        riskCategory: 'CRITICAL'
      }
    };
  }

  /**
   * Check if age result is a critical failure (hard stop)
   */
  public isCriticalFailure(result: AgeResult): boolean {
    return result.hardStop;
  }

  /**
   * Get weight for this module in final calculation
   */
  public getWeight(): number {
    return 0.05; // 5%
  }

  /**
   * Get module information
   */
  public getModuleInfo() {
    return {
      name: 'Age Module',
      description: 'Handles demographic risk assessment based on age and employment type',
      weight: this.getWeight(),
      team: 'Demographics & Employment Analysis',
      criticalFailure: true
    };
  }

  /**
   * Validate age input data
   */
  public validateInput(input: AgeInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!input.date_of_birth) {
      errors.push('Date of birth is required');
    } else {
      const dob = new Date(input.date_of_birth);
      if (isNaN(dob.getTime())) {
        errors.push('Invalid date of birth format');
      } else if (dob > new Date()) {
        errors.push('Date of birth cannot be in the future');
      }
    }

    if (!input.occupation) {
      errors.push('Occupation is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get supported employment types and their age ranges
   */
  public getSupportedEmploymentTypes(): Array<{type: string, ageRange: string, description: string}> {
    return [
      {
        type: 'Self-Employed',
        ageRange: '22-65 years',
        description: 'Business owners, freelancers, consultants'
      },
      {
        type: 'Salaried',
        ageRange: '21-60 years (20-61 with tolerance)',
        description: 'Regular employees with fixed salary'
      },
      {
        type: 'Retired',
        ageRange: '20-61 years (penalized scoring)',
        description: 'Retired individuals with pension/benefits'
      }
    ];
  }
}
