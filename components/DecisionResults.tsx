import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Alert,
  Grid,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { APIFetchedData } from './APIFetchedData';
import { DetailedModuleBreakdown } from './DetailedModuleBreakdown';
import { CardEligibility } from './CardEligibility';
import { ApplicationData } from '../hooks/useDecisionEngine';

interface DecisionResultsProps {
  decision: string;
  decisionData?: any;
  finalScore: number;
  riskLevel: string;
  actionRequired: string;
  criticalChecksStatus: string;
  moduleScores: {
    age: number;
    dbr: number;
    spu: number;
    city: number;
    income: number;
    eamvu: number;
  };
  assignedCreditLimit?: number;
  cardType?: string;
  applicationData?: ApplicationData;
  dbrData?: any;
}

export const DecisionResults: React.FC<DecisionResultsProps> = ({
  decision,
  decisionData,
  finalScore,
  riskLevel,
  actionRequired,
  criticalChecksStatus,
  moduleScores,
  assignedCreditLimit,
  cardType,
  applicationData,
  dbrData,
}) => {
  // Ensure decision is always a string
  const decisionString = typeof decision === 'string' ? decision : String(decision || 'PENDING');
  
  const getDecisionColor = (decision: string) => {
    switch (decision?.toLowerCase()) {
      case 'pass': return 'success';
      case 'fail': return 'error';
      default: return 'warning';
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision?.toLowerCase()) {
      case 'pass': return <CheckCircleIcon />;
      case 'fail': return <ErrorIcon />;
      default: return <WarningIcon />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ maxHeight: '80vh', overflowY: 'auto', overflowX: 'hidden', paddingRight: '10px' }}>
      {/* Main Decision Card */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon />
              Decision Result
            </Typography>
            <Chip
              icon={getDecisionIcon(decisionString)}
              label={decisionString || 'PENDING'}
              color={getDecisionColor(decisionString) as any}
              size="medium"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          {/* Score Display */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 3 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: `conic-gradient(${
                    finalScore >= 80 ? '#4caf50' : finalScore >= 60 ? '#ff9800' : '#f44336'
                  } ${finalScore * 3.6}deg, #e0e0e0 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <Typography variant="h4" component="div" fontWeight={700}>
                    {finalScore.toFixed(0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    / 100
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                Risk Level: <Chip label={riskLevel} color={getScoreColor(finalScore) as any} size="small" />
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {actionRequired}
              </Typography>
            </Box>
          </Box>

          {/* Credit Assignment */}
          {(assignedCreditLimit || cardType) && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>Credit Assignment</Typography>
              <Grid container spacing={2}>
                {assignedCreditLimit && (
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2">
                      <strong>Assigned Limit:</strong> PKR {assignedCreditLimit.toLocaleString()}
                    </Typography>
                  </Grid>
                )}
                {cardType && (
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2">
                      <strong>Card Type:</strong> <Chip label={cardType} size="small" color="primary" />
                    </Typography>
                  </Grid>
                )}
              </Grid>
              
              {/* Card Eligibility Options */}
              <CardEligibility 
                assignedCreditLimit={assignedCreditLimit} 
                cardType={cardType} 
              />
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Module Scores */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Module Breakdown
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(moduleScores).map(([module, score]) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={module}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ textTransform: 'capitalize' }}>
                    {module}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={score}
                      color={getScoreColor(score) as any}
                      sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      {score}%
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Critical Checks Status */}
      <Alert severity={criticalChecksStatus === 'PASS' ? 'success' : 'error'} sx={{ mb: 2 }}>
        <Typography variant="h6">Critical Checks: {criticalChecksStatus}</Typography>
      </Alert>

      {/* API Fetched Data */}
      {applicationData && (
        <APIFetchedData 
          applicationData={applicationData} 
          dbrData={dbrData} 
        />
      )}

      {/* Detailed Module Breakdown */}
      {decisionData && (
        <DetailedModuleBreakdown decision={decisionData} />
      )}
    </Box>
  );
};
