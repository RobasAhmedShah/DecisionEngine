/**
 * City Module
 * Handles geographic risk assessment and coverage evaluation
 * 
 * Team: Geographic Risk & Coverage Analysis
 * Responsibility: City coverage scoring, cluster analysis, Annexure A validation
 */

export interface CityInput {
  curr_city?: string;
  office_city?: string;
  cluster?: string;
}

export interface CityResult {
  score: number;
  annexureAHit: boolean;
  currentCity: string;
  officeCity: string;
  cluster: string;
  cityScore?: number;
  clusterScore?: number;
  foundCity?: string | null;
  notes: string[];
  details: {
    currentCityStatus: string;
    officeCityStatus: string;
    clusterInfo: {
      name: string;
      points: number;
      tier: string;
    };
    coverageLevel: string;
    riskLevel: string;
  };
}

export default class CityModule {
  // Annexure A cities (automatic fail)
  private readonly ANNEXURE_A_CITIES = [
    'quetta', 'peshawar', 'd.i.khan', 'bannu', 'kohat', 'mardan', 
    'mingora', 'swat', 'abbottabad', 'mansehra', 'gilgit', 'skardu',
    'muzaffarabad', 'mirpur', 'rawalakot', 'kotli', 'bhimber',
    'parachinar', 'kuram', 'waziristan', 'mohmand', 'bajour',
    'dir', 'chitral', 'kurram', 'orakzai', 'khyber'
  ];

  // Full Coverage Cities with points
  private readonly FULL_COVERAGE_CITIES: { [key: string]: number } = {
    'karachi': 40, 'lahore': 40, 'islamabad': 40, 'rawalpindi': 40,
    'faisalabad': 20, 'multan': 20, 'gujranwala': 20, 'sialkot': 20,
    'hyderabad': 20, 'sukkur': 20, 'larkana': 20,
    'bahawalpur': 0, 'sargodha': 0, 'sheikhupura': 0, 'jhang': 0,
    'kasur': 0, 'okara': 0, 'sahiwal': 0, 'gujrat': 0, 'jhelum': 0,
    'attock': 0, 'chakwal': 0, 'mianwali': 0, 'khushab': 0
  };

  // Cluster scoring
  private readonly CLUSTER_SCORES: { [key: string]: number } = {
    'FEDERAL': 30,
    'SOUTH': 25,
    'NORTHERN_PUNJAB': 20,
    'NORTH': 15,
    'SOUTHERN_PUNJAB': 10,
    'KP': 5
  };

  /**
   * Calculate City score based on geographic risk and coverage
   * EXACT logic from original Deceng.js
   */
  public calculate(input: CityInput): CityResult {
    console.log('='.repeat(80));
    console.log('🏙️ CITY MODULE CALCULATION');
    console.log('='.repeat(80));
    console.log('📥 INPUTS:');
    console.log('  • Current City:', input.curr_city || 'N/A');
    console.log('  • Office City:', input.office_city || 'N/A');
    console.log('  • Cluster (manual):', input.cluster || 'N/A');

    const currentCity = String(input.curr_city || "").toLowerCase().trim();
    const officeCity = String(input.office_city || "").toLowerCase().trim();
    const cluster = String(input.cluster || "").toUpperCase().trim();

    console.log('🔍 PROCESSING:');
    console.log('  • Current City (processed):', currentCity);
    console.log('  • Office City (processed):', officeCity);
    console.log('  • Cluster (processed):', cluster);

    // Check Annexure A cities first (automatic fail)
    console.log('🔍 ANNEXURE A CHECK:');
    const currentInAnnexureA = this.ANNEXURE_A_CITIES.some(city => currentCity.includes(city));
    const officeInAnnexureA = this.ANNEXURE_A_CITIES.some(city => officeCity.includes(city));

    console.log('  • Current City in Annexure A:', currentInAnnexureA);
    console.log('  • Office City in Annexure A:', officeInAnnexureA);

    if (currentInAnnexureA || officeInAnnexureA) {
      console.log('❌ ANNEXURE A HIT - AUTOMATIC FAIL');
      console.log('📤 OUTPUTS:');
      console.log('  • Final Score: 0/100');
      console.log('  • Status: ANNEXURE A AREA - AUTOMATIC FAIL');
      console.log('='.repeat(80));
      
      return {
        score: 0,
        annexureAHit: true,
        currentCity,
        officeCity,
        cluster,
        notes: [`Annexure A area detected (${currentInAnnexureA ? 'Current' : 'Office'} City) - Automatic Fail`],
        details: {
          currentCityStatus: currentInAnnexureA ? 'ANNEXURE_A' : 'SAFE',
          officeCityStatus: officeInAnnexureA ? 'ANNEXURE_A' : 'SAFE',
          clusterInfo: {
            name: cluster || 'UNKNOWN',
            points: 0,
            tier: 'RESTRICTED'
          },
          coverageLevel: 'RESTRICTED',
          riskLevel: 'VERY_HIGH'
        }
      };
    }

    // Full Coverage Cities Check
    console.log('🔍 FULL COVERAGE CHECK:');
    let cityScore = 0;
    let foundCity: string | null = null;

    for (const [city, points] of Object.entries(this.FULL_COVERAGE_CITIES)) {
      if (currentCity.includes(city) || officeCity.includes(city)) {
        cityScore = points;
        foundCity = city;
        console.log(`  • Found city: ${city} → ${points} points`);
        break;
      }
    }

    if (!foundCity) {
      console.log('  • No full coverage city found');
    }

    // Cluster scoring
    console.log('🔍 CLUSTER SCORING:');
    const clusterScore = this.CLUSTER_SCORES[cluster] || 0;
    console.log(`  • Cluster: ${cluster} → ${clusterScore} points`);

    const totalScore = Math.min(100, cityScore + clusterScore);

    console.log('📊 CALCULATION:');
    console.log(`  • City Score: ${cityScore}`);
    console.log(`  • Cluster Score: ${clusterScore}`);
    console.log(`  • Total Score: ${totalScore} (max 100)`);

    console.log('📤 OUTPUTS:');
    console.log('  • Final Score:', totalScore, '/100');
    console.log('  • Status: APPROVED');
    console.log('='.repeat(80));

    return {
      score: totalScore,
      annexureAHit: false,
      currentCity,
      officeCity,
      cluster,
      cityScore,
      clusterScore,
      foundCity,
      notes: [
        `City: ${foundCity || 'Not in full coverage'} (${cityScore} points)`,
        `Cluster: ${cluster} (${clusterScore} points)`,
        `Total: ${totalScore}/100`
      ],
      details: {
        currentCityStatus: foundCity ? 'COVERED' : 'LIMITED_COVERAGE',
        officeCityStatus: foundCity ? 'COVERED' : 'LIMITED_COVERAGE',
        clusterInfo: {
          name: cluster,
          points: clusterScore,
          tier: this.getClusterTier(clusterScore)
        },
        coverageLevel: this.getCoverageLevel(cityScore),
        riskLevel: this.getRiskLevel(totalScore)
      }
    };
  }

  /**
   * Get cluster tier based on score
   */
  private getClusterTier(score: number): string {
    if (score >= 25) return 'PREMIUM';
    if (score >= 15) return 'STANDARD';
    if (score >= 5) return 'BASIC';
    return 'LIMITED';
  }

  /**
   * Get coverage level based on city score
   */
  private getCoverageLevel(cityScore: number): string {
    if (cityScore >= 40) return 'FULL_PREMIUM';
    if (cityScore >= 20) return 'FULL_STANDARD';
    if (cityScore === 0) return 'BASIC';
    return 'LIMITED';
  }

  /**
   * Get risk level based on total score
   */
  private getRiskLevel(totalScore: number): string {
    if (totalScore >= 80) return 'LOW';
    if (totalScore >= 60) return 'MEDIUM';
    if (totalScore >= 40) return 'HIGH';
    return 'VERY_HIGH';
  }

  /**
   * Check if city result is a critical failure
   */
  public isCriticalFailure(result: CityResult): boolean {
    return result.annexureAHit;
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
      name: 'City Module',
      description: 'Handles geographic risk assessment and coverage evaluation',
      weight: this.getWeight(),
      team: 'Geographic Risk & Coverage Analysis',
      criticalFailure: true
    };
  }

  /**
   * Validate city input data
   */
  public validateInput(input: CityInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!input.curr_city && !input.office_city) {
      errors.push('At least one city (current or office) is required');
    }

    if (!input.cluster) {
      errors.push('Cluster information is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get available clusters
   */
  public getAvailableClusters(): Array<{name: string, points: number, tier: string}> {
    return Object.entries(this.CLUSTER_SCORES).map(([name, points]) => ({
      name,
      points,
      tier: this.getClusterTier(points)
    }));
  }
}
