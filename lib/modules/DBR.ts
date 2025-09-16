/**
 * DBR (Debt-to-Income Ratio) Module
 * Handles dynamic threshold calculation and DBR scoring
 */

export default class DBRModule {
    /**
     * Calculate DBR score using dynamic threshold and scoring from data engine
     * @param {Object} app - Application data
     * @param {Object} dbrData - DBR data from data engine
     * @returns {Object} DBR result with score, percentage, threshold, and notes
     */
    calculate(app: any, dbrData: any = null): {
        raw: number;
        dbrPercentage: number;
        dbrThreshold: number;
        isWithinThreshold: boolean;
        netIncome: number;
        totalObligations: number;
        notes: string[];
        flags: string[];
    } {
        let dbrPercentage = 0;
        const notes: string[] = [];
        let netIncome = 0;
        let totalObligations = 0;
        let threshold = 40; // Default threshold
        let isWithinThreshold = false;

        // Get DBR from data engine
        if (dbrData && dbrData.dbr) {
            dbrPercentage = dbrData.dbr;
            netIncome = dbrData.dbr_details?.net_income || 0;
            totalObligations = dbrData.dbr_details?.total_obligations || 0;
            threshold = dbrData.threshold || 40; // Use dynamic threshold from data engine
            isWithinThreshold = dbrData.status === 'pass'; // Use status from data engine
            
            notes.push(`DBR from data engine: ${dbrPercentage.toFixed(2)}%`);
            notes.push(`Net Income: PKR ${netIncome.toLocaleString()}`);
            notes.push(`Total Obligations: PKR ${totalObligations.toLocaleString()}`);
            notes.push(`DBR Threshold: ${threshold}% (Dynamic)`);
            notes.push(`Status: ${dbrData.status.toUpperCase()}`);
            
            // If status is fail, return 0 score
            if (dbrData.status === 'fail') {
                notes.push(`DBR status is FAIL - Score 0`);
                return {
                    raw: 0,
                    dbrPercentage,
                    dbrThreshold: threshold,
                    isWithinThreshold: false,
                    netIncome,
                    totalObligations,
                    notes,
                    flags: ["DBR_FAIL"]
                };
            }
            
            // If status is pass, calculate score based on DBR percentage
            let dbrScore = 0;
            if (dbrPercentage <= 10) {
                dbrScore = 100;
                notes.push(`DBR ${dbrPercentage.toFixed(2)}% (1-10%) → Score 100/100`);
            } else if (dbrPercentage <= 20) {
                dbrScore = 75;
                notes.push(`DBR ${dbrPercentage.toFixed(2)}% (10-20%) → Score 75/100`);
            } else if (dbrPercentage <= 30) {
                dbrScore = 50;
                notes.push(`DBR ${dbrPercentage.toFixed(2)}% (20-30%) → Score 50/100`);
            } else if (dbrPercentage <= 40) {
                dbrScore = 25;
                notes.push(`DBR ${dbrPercentage.toFixed(2)}% (30-40%) → Score 25/100`);
            } else {
                dbrScore = 0;
                notes.push(`DBR ${dbrPercentage.toFixed(2)}% (>40%) → Score 0/100`);
            }
            
            return {
                raw: dbrScore,
                dbrPercentage,
                dbrThreshold: threshold,
                isWithinThreshold: true,
                netIncome,
                totalObligations,
                notes,
                flags: []
            };
        }
        
        // Fallback if no DBR data available
        notes.push("No DBR data available from data engine");
        return {
            raw: 0,
            dbrPercentage: 0,
            dbrThreshold: threshold,
            isWithinThreshold: false,
            netIncome: 0,
            totalObligations: 0,
            notes,
            flags: ["NO_DBR_DATA"]
        };
    }
}





