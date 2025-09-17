import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  CreditCard as CreditCardIcon,
  Security as SecurityIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';
import { ApplicationData } from '../hooks/useDecisionEngine';

interface APIFetchedDataProps {
  applicationData: ApplicationData;
  dbrData?: any;
}

export const APIFetchedData: React.FC<APIFetchedDataProps> = ({
  applicationData,
  dbrData,
}) => {
  const [expanded, setExpanded] = useState(true);

  const DataRow: React.FC<{ label: string; value: string | number; color?: string }> = ({ 
    label, 
    value, 
    color 
  }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {label}:
      </Typography>
      <Typography 
        variant="body2" 
        fontWeight={600}
        sx={{ color: color || 'text.primary' }}
      >
        {value || '-'}
      </Typography>
    </Box>
  );

  const DataCard: React.FC<{ 
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode 
  }> = ({ title, icon, children }) => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon}
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Paper>
  );

  return (
    <Card elevation={3}>
      <CardHeader
        title="API Fetched Data"
        action={
          <IconButton
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="show more"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
        sx={{ pb: 1 }}
      />
      <Collapse in={expanded} timeout="auto">
        <CardContent>
          <Box sx={{ 
            maxHeight: '600px', 
            overflowY: 'auto', 
            paddingRight: '10px',
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
          }}>
            <Grid container spacing={2}>
              {/* Basic Information */}
              <Grid size={{ xs: 12, md: 6 }}>
                <DataCard
                  title="Basic Information"
                  icon={<PersonIcon color="primary" />}
                >
                  <DataRow label="Application ID" value={applicationData?.applicationId || '-'} />
                  <DataRow label="Full Name" value={applicationData?.customerName || '-'} />
                  <DataRow label="CNIC" value={applicationData?.cnic || '-'} />
                  <DataRow label="Date of Birth" value={applicationData?.dateOfBirth || '-'} />
                  <DataRow label="Age" value={applicationData?.age || '-'} />
                  <DataRow label="Gender" value={applicationData?.gender || '-'} />
                  <DataRow label="Marital Status" value={applicationData?.maritalStatus || '-'} />
                  <DataRow label="Mobile" value={applicationData?.mobile || '-'} />
                  <DataRow label="Education" value={applicationData?.educationQualification || '-'} />
                </DataCard>
              </Grid>

              {/* Employment & Income */}
              <Grid size={{ xs: 12, md: 6 }}>
                <DataCard
                  title="Employment & Income"
                  icon={<BusinessIcon color="primary" />}
                >
                  <DataRow label="Employment Status" value={applicationData?.employmentStatus || '-'} />
                  <DataRow label="Employment Type" value={applicationData?.employmentType || '-'} />
                  <DataRow label="Length of Employment" value={`${applicationData?.experience || 0} years`} />
                  <DataRow label="Company Name" value={applicationData?.companyName || '-'} />
                  <DataRow label="Designation" value={applicationData?.designation || '-'} />
                  <DataRow label="Occupation" value={applicationData?.occupation || '-'} />
                  <DataRow 
                    label="Gross Monthly Salary" 
                    value={`PKR ${applicationData?.grossMonthlySalary?.toLocaleString() || '-'}`} 
                  />
                  <DataRow 
                    label="Net Monthly Income" 
                    value={`PKR ${applicationData?.netMonthlyIncome?.toLocaleString() || '-'}`} 
                  />
                  <DataRow 
                    label="Salary Transfer Flag" 
                    value={applicationData?.salaryTransferFlag || '-'} 
                    color={applicationData?.salaryTransferFlag === 'Yes' ? '#4caf50' : '#f44336'}
                  />
                </DataCard>
              </Grid>

              {/* Location & Geography */}
              <Grid size={{ xs: 12, md: 6 }}>
                <DataCard
                  title="Location & Geography"
                  icon={<LocationIcon color="primary" />}
                >
                  <DataRow label="Current City" value={applicationData?.currentCity || '-'} />
                  <DataRow label="Office City" value={applicationData?.officeCity || '-'} />
                  <DataRow label="Current Address" value={applicationData?.currentAddress || '-'} />
                  <DataRow label="Office Address" value={applicationData?.officeAddress || '-'} />
                  <DataRow label="Cluster" value={applicationData?.cluster || '-'} />
                </DataCard>
              </Grid>

              {/* Application Details */}
              <Grid size={{ xs: 12, md: 6 }}>
                <DataCard
                  title="Application Details"
                  icon={<CreditCardIcon color="primary" />}
                >
                  <DataRow 
                    label="Amount Requested" 
                    value={`PKR ${applicationData?.amountRequested?.toLocaleString() || '-'}`} 
                  />
                  <DataRow label="Loan Type" value={applicationData?.loan_type || 'Credit Card'} />
                  <DataRow label="Tenure (Months)" value={applicationData?.tenure || '-'} />
                  <DataRow 
                    label="UBL Customer" 
                    value={applicationData?.ublCustomer || '-'} 
                    color={applicationData?.ublCustomer === 'Yes' ? '#4caf50' : '#f44336'}
                  />
                  <DataRow 
                    label="Existing Debt" 
                    value={`PKR ${applicationData?.existingDebt?.toLocaleString() || '0'}`} 
                  />
                </DataCard>
              </Grid>

              {/* Verification & Compliance */}
              <Grid size={{ xs: 12, md: 6 }}>
                <DataCard
                  title="Verification & Compliance"
                  icon={<SecurityIcon color="primary" />}
                >
                  <DataRow 
                    label="EAMVU Submitted" 
                    value={applicationData?.eavmu_submitted ? 'Yes' : 'No'} 
                    color={applicationData?.eavmu_submitted ? '#4caf50' : '#f44336'}
                  />
                  <DataRow 
                    label="SPU Black List" 
                    value={applicationData?.spuBlackList === 'Yes' ? 'HIT' : 'CLEAR'} 
                    color={applicationData?.spuBlackList === 'Yes' ? '#f44336' : '#4caf50'}
                  />
                  <DataRow 
                    label="SPU Credit Card Check" 
                    value={applicationData?.spuCreditCard === 'Yes' ? 'HIT' : 'CLEAR'} 
                    color={applicationData?.spuCreditCard === 'Yes' ? '#f44336' : '#4caf50'}
                  />
                  <DataRow 
                    label="SPU Negative List" 
                    value={applicationData?.spuNegativeList === 'Yes' ? 'HIT' : 'CLEAR'} 
                    color={applicationData?.spuNegativeList === 'Yes' ? '#f44336' : '#4caf50'}
                  />
                </DataCard>
              </Grid>

              {/* CBS Banking Data */}
              <Grid size={{ xs: 12, md: 6 }}>
                <DataCard
                  title="CBS Banking Data"
                  icon={<BankIcon color="primary" />}
                >
                  <DataRow 
                    label="Average Deposit Balance" 
                    value={`PKR ${(dbrData?.average_deposit_balance || 0).toLocaleString()}`} 
                  />
                  <DataRow 
                    label="Highest DPD" 
                    value={`${dbrData?.highest_dpd || '0'} days`} 
                    color={(dbrData?.highest_dpd || 0) > 0 ? '#f44336' : '#4caf50'}
                  />
                  <DataRow 
                    label="Industry Exposure" 
                    value={`PKR ${(dbrData?.exposure_in_industry || 0).toLocaleString()}`} 
                  />
                  <DataRow 
                    label="Bad Counts (Industry)" 
                    value={dbrData?.bad_counts_industry || '0'} 
                    color={(dbrData?.bad_counts_industry || 0) > 0 ? '#f44336' : '#4caf50'}
                  />
                  <DataRow 
                    label="Bad Counts (UBL)" 
                    value={dbrData?.bad_counts_ubl || '0'} 
                    color={(dbrData?.bad_counts_ubl || 0) > 0 ? '#f44336' : '#4caf50'}
                  />
                  <DataRow 
                    label="DPD 30+ Days" 
                    value={dbrData?.dpd_30_plus || '0'} 
                    color={(dbrData?.dpd_30_plus || 0) > 0 ? '#f44336' : '#4caf50'}
                  />
                  <DataRow 
                    label="DPD 60+ Days" 
                    value={dbrData?.dpd_60_plus || '0'} 
                    color={(dbrData?.dpd_60_plus || 0) > 0 ? '#f44336' : '#4caf50'}
                  />
                  <DataRow 
                    label="Defaults (12M)" 
                    value={dbrData?.defaults_12m || '0'} 
                    color={(dbrData?.defaults_12m || 0) > 0 ? '#f44336' : '#4caf50'}
                  />
                  <DataRow 
                    label="Late Payments" 
                    value={dbrData?.late_payments || '0'} 
                    color={(dbrData?.late_payments || 0) > 0 ? '#f44336' : '#4caf50'}
                  />
                  <DataRow 
                    label="Credit Utilization" 
                    value={`${(dbrData?.credit_utilization_ratio || 0) * 100}%`} 
                  />
                </DataCard>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
};
