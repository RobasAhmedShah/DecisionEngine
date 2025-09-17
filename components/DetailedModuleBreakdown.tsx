import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

interface DetailedModuleBreakdownProps {
  decision: any;
}

export const DetailedModuleBreakdown: React.FC<DetailedModuleBreakdownProps> = ({
  decision,
}) => {
  const generateWeightedCalculations = (decision: any): string => {
    if (!decision || !decision.moduleScores) {
      return 'Click "Calculate Decision" to start...';
    }

    const modules = decision.moduleScores;
    
    return `
📊 DECISION ENGINE - WEIGHTED MODULE BREAKDOWN
===============================================

🔍 SPU MODULE (Weight: 15.0%)
  ├─ Score: ${modules.spu?.score || 0}/100
  ├─ Weighted: ${((modules.spu?.score || 0) * 0.15).toFixed(1)}
  └─ Details: ${modules.spu?.details?.notes?.join(', ') || 'No details available'}

🏛️ EAMVU MODULE (Weight: 10.0%)
  ├─ Score: ${modules.eamvu?.score || 0}/100
  ├─ Weighted: ${((modules.eamvu?.score || 0) * 0.10).toFixed(1)}
  └─ Details: ${modules.eamvu?.details?.notes?.join(', ') || 'No details available'}

🏙️ CITY MODULE (Weight: 5.0%)
  ├─ Score: ${modules.city?.score || 0}/100
  ├─ Weighted: ${((modules.city?.score || 0) * 0.05).toFixed(1)}
  └─ Details: ${modules.city?.details?.notes?.join(', ') || 'No details available'}

👤 AGE MODULE (Weight: 5.0%)
  ├─ Score: ${modules.age?.score || 0}/100
  ├─ Weighted: ${((modules.age?.score || 0) * 0.05).toFixed(1)}
  └─ Details: ${modules.age?.details?.notes?.join(', ') || 'No details available'}

💰 INCOME MODULE (Weight: 10.0%)
  ├─ Score: ${modules.income?.score || 0}/100
  ├─ Weighted: ${((modules.income?.score || 0) * 0.10).toFixed(1)}
  └─ Details: ${modules.income?.details?.notes?.join(', ') || 'No details available'}

📈 DBR MODULE (Weight: 15.0%)
  ├─ Score: ${modules.dbr?.score || 0}/100
  ├─ Weighted: ${((modules.dbr?.score || 0) * 0.15).toFixed(1)}
  ├─ DBR Percentage: ${modules.dbr?.details?.dbrPercentage?.toFixed(2) || '0'}%
  ├─ Threshold: ${modules.dbr?.details?.dbrThreshold || '60'}%
  ├─ Status: ${modules.dbr?.details?.isWithinThreshold ? 'PASS' : 'FAIL'}
  └─ Details: ${modules.dbr?.details?.notes?.join(', ') || 'No details available'}

📋 APPLICATION SCORE MODULE (Weight: 20.0%)
  ├─ Score: ${modules.applicationScore?.score || 0}/100
  ├─ Weighted: ${((modules.applicationScore?.score || 0) * 0.20).toFixed(1)}
  └─ Details: ${modules.applicationScore?.details?.notes?.join(', ') || 'No details available'}

🎯 BEHAVIORAL SCORE MODULE (Weight: 20.0%)
  ├─ Score: ${modules.behavioralScore?.score || 0}/100
  ├─ Weighted: ${((modules.behavioralScore?.score || 0) * 0.20).toFixed(1)}
  └─ Details: ${modules.behavioralScore?.details?.notes?.join(', ') || 'No details available'}

🔐 SYSTEM CHECKS MODULE (Critical Check)
  ├─ Score: ${modules.systemChecks?.score || 0}/100
  ├─ Status: ${modules.systemChecks?.details?.overallStatus || 'UNKNOWN'}
  ├─ Decision: ${modules.systemChecks?.details?.decision || 'UNKNOWN'}
  └─ Details: ${modules.systemChecks?.details?.notes?.join(', ') || 'No details available'}

💳 CREDIT LIMIT MODULE
  ├─ Score: ${modules.creditLimit?.score || 0}/100
  ├─ Assigned Limit: PKR ${(modules.creditLimit?.details?.assignedLimit || 0).toLocaleString()}
  ├─ Card Type: ${modules.creditLimit?.details?.cardType || 'UNKNOWN'}
  └─ Details: ${modules.creditLimit?.details?.notes?.join(', ') || 'No details available'}

📄 INCOME VERIFICATION MODULE
  ├─ Score: ${modules.incomeVerification?.score || 0}/100
  └─ Details: ${modules.incomeVerification?.details?.notes?.join(', ') || 'Module not implemented'}

✅ VERIFICATION FRAMEWORK MODULE
  ├─ Score: ${modules.verificationFramework?.score || 0}/100
  └─ Details: ${modules.verificationFramework?.details?.notes?.join(', ') || 'Module not implemented'}

🎁 SPECIAL SEGMENTS MODULE
  ├─ Score: ${modules.specialSegments?.score || 0}/100
  └─ Details: ${modules.specialSegments?.details?.notes?.join(', ') || 'Module not implemented'}

📋 DOCUMENTATION & COMPLIANCE MODULE
  ├─ Score: ${modules.documentationCompliance?.score || 0}/100
  └─ Details: ${modules.documentationCompliance?.details?.notes?.join(', ') || 'Module not implemented'}

===============================================
🎯 FINAL CALCULATION
  └─ Total Weighted Score: ${decision.finalScore || 0}/100
  └─ Decision: ${decision.decision || 'PENDING'}
  └─ Risk Level: ${decision.riskLevel || 'UNKNOWN'}
  └─ Action Required: ${decision.actionRequired || 'No action specified'}
===============================================
    `.trim();
  };

  const weightedCalculations = generateWeightedCalculations(decision);

  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardHeader
        avatar={<AssessmentIcon color="primary" />}
        title="Detailed Module Breakdown"
        subheader="Complete scoring breakdown with module weights and details"
      />
      <CardContent>
        <Box
          sx={{
            fontFamily: 'Monaco, Consolas, monospace',
            fontSize: '0.85rem',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            maxHeight: '500px',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c1c1c1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#a8a8a8',
            },
          }}
        >
          {weightedCalculations}
        </Box>
      </CardContent>
    </Card>
  );
};
