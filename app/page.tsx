'use client';

import React from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Container,
  Grid,
} from '@mui/material';

// Custom components
import { UBLAppBar } from '../components/UBLAppBar';
import { TestCaseSelector } from '../components/TestCaseSelector';
import { DecisionResults } from '../components/DecisionResults';

// Custom theme and hooks
import { ublTheme } from '../lib/theme';
import { useDecisionEngine } from '../hooks/useDecisionEngine';

export default function CreditCardDecisionEngine() {
  const {
    // State
    applicationData,
    selectedTestCase,
    calculating,
    decision,
    decisionData,
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
  } = useDecisionEngine();
    
    return (
    <ThemeProvider theme={ublTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* App Bar */}
        <UBLAppBar />

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Grid container spacing={3}>
            
            {/* Left Panel - Test Case Selection */}
            <Grid size={{ xs: 12, md: 5, lg: 4 }}>
              <TestCaseSelector
                selectedTestCase={selectedTestCase}
                onTestCaseSelect={loadTestCaseData}
                onCalculateDecision={calculateDecision}
                onResetForm={resetForm}
                calculating={calculating}
                applicationData={applicationData}
              />
            </Grid>

            {/* Right Panel - Results */}
            {applicationData && (
              <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                <DecisionResults
                  decision={decision}
                  decisionData={decisionData}
                  finalScore={finalScore}
                  riskLevel={riskLevel}
                  actionRequired={actionRequired}
                  criticalChecksStatus={criticalChecksStatus}
                  moduleScores={moduleScores}
                  assignedCreditLimit={assignedCreditLimit}
                  cardType={cardType}
                  applicationData={applicationData}
                  dbrData={dbrData}
                />
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
