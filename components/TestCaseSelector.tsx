import React, { useState, useRef, useEffect } from 'react';
import {
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
  Typography,
  Chip,
  Box,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Assessment as AssessmentIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { testCases, TestCase } from '../lib/testCases';

interface TestCaseSelectorProps {
  selectedTestCase: TestCase | null;
  onTestCaseSelect: (testCase: TestCase | null) => void;
  onCalculateDecision: () => Promise<void>;
  onResetForm: () => void;
  calculating: boolean;
  applicationData: any;
}

export const TestCaseSelector: React.FC<TestCaseSelectorProps> = ({
  selectedTestCase,
  onTestCaseSelect,
  onCalculateDecision,
  onResetForm,
  calculating,
  applicationData,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleTestCaseChange = (testCaseId: string) => {
    if (testCaseId === '') {
      onTestCaseSelect(null);
    } else {
      const testCase = testCases.find(tc => tc.id === testCaseId);
      if (testCase) {
        onTestCaseSelect(testCase);
      }
    }
  };

  return (
    <Card elevation={3}>
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><CreditCardIcon /></Avatar>}
        title="Test Case Selection"
        subheader="Choose a test scenario to evaluate"
      />
      <CardContent>
        {/* Test Case Selector */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(0, 107, 63, 0.02)', border: 1, borderColor: 'rgba(0, 107, 63, 0.1)' }}>
          <Typography variant="h6" gutterBottom color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon fontSize="small" />
            Load Sample Data
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }} ref={dropdownRef}>
            <InputLabel id="test-case-select-label">Select Test Case</InputLabel>
            <Select
              labelId="test-case-select-label"
              value={selectedTestCase?.id || ''}
              label="Select Test Case"
              open={showDropdown}
              onOpen={() => setShowDropdown(true)}
              onClose={() => setShowDropdown(false)}
              onChange={(e) => handleTestCaseChange(e.target.value)}
            >
              <MenuItem value="">
                <em>Default Sample Data</em>
              </MenuItem>
              {testCases.map((testCase) => (
                <MenuItem key={testCase.id} value={testCase.id}>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {testCase.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {testCase.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {selectedTestCase && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <AlertTitle>Current Test Case</AlertTitle>
              <Typography variant="body2"><strong>Name:</strong> {selectedTestCase.name}</Typography>
              <Typography variant="body2">
                <strong>Expected:</strong> {selectedTestCase.expectedDecision} 
                <Chip 
                  label={`${selectedTestCase.expectedScore}/100`} 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1 }}
                />
              </Typography>
            </Alert>
          )}
        </Paper>

        {/* Action Buttons */}
        <Paper sx={{ p: 2, bgcolor: 'rgba(255, 215, 0, 0.02)', border: 1, borderColor: 'rgba(255, 215, 0, 0.1)' }}>
          <Typography variant="h6" gutterBottom color="secondary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlayIcon fontSize="small" />
            Action Buttons
          </Typography>
          
          <Stack spacing={2}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={calculating ? <CircularProgress size={20} color="inherit" /> : <PlayIcon />}
              onClick={onCalculateDecision}
              disabled={calculating}
              fullWidth
            >
              {calculating ? 'Processing...' : 'Calculate Decision'}
            </Button>
            
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={onResetForm}
              disabled={!applicationData}
              fullWidth
              sx={{
                ...(applicationData && {
                  backgroundColor: '#1976D2',
                  color: 'white',
                  borderColor: '#1976D2',
                  '&:hover': {
                    backgroundColor: '#1565C0',
                    borderColor: '#1565C0',
                    color: 'white',
                  },
                }),
                ...(!applicationData && {
                  color: '#9E9E9E',
                  borderColor: '#E0E0E0',
                  '&:disabled': {
                    color: '#9E9E9E',
                    borderColor: '#E0E0E0',
                  },
                }),
              }}
            >
              Reset Form
            </Button>
          </Stack>
        </Paper>
      </CardContent>
    </Card>
  );
};
