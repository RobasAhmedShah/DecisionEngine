# 🏦 Credit Card Decision Engine

## 📋 **Overview**
A full-stack Next.js application with a modular credit card decision engine that evaluates loan applications using weighted scoring across multiple risk assessment modules. The system features both frontend and backend APIs with TypeScript modules and real-time decision processing.

## 🏗️ **Architecture**

### **Current Architecture (Next.js Full-Stack):**
```
DecisinEng/
├── app/                           # Next.js App Router
│   ├── api/                       # Backend API Routes
│   │   ├── applications/[id]/     # Fetch application data
│   │   ├── decision/              # Calculate decisions
│   │   └── process/               # Full processing pipeline
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Main frontend application
│   └── globals.css                # Global styles
├── lib/modules/                   # TypeScript Decision Modules (ACTIVE)
│   ├── SPU.ts                     # Special Purpose Unit
│   ├── EAMVU.ts                   # External Asset Management Unit
│   ├── City.ts                    # Geographic risk assessment
│   ├── Age.ts                     # Demographic risk assessment
│   ├── DBR.ts                     # Debt-to-Income Ratio calculation
│   ├── Income.ts                  # Financial capacity evaluation
│   ├── DecisionEngine.ts          # Main decision orchestrator
│   └── DataService.ts             # API and data handling
├── components/ui/                 # Reusable UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── select.tsx
└── package.json                   # Dependencies and scripts
```

### **Frontend-to-Backend Flow:**
1. **Frontend (React/Next.js)**: `app/page.tsx` - Interactive UI with real-time scoring
2. **API Layer**: Next.js API routes handle HTTP requests
3. **Business Logic**: TypeScript modules in `lib/modules/` process decisions
4. **External APIs**: Fetches data from external application APIs
5. **Response**: JSON decision results with detailed scoring breakdown

## 🎯 **Module Weights**
- **DBR (Debt-to-Income Ratio):** 55% - Primary risk indicator
- **SPU (Special Purpose Unit):** 10% - Blacklist/negative checks
- **EAMVU (External Asset Management Unit):** 10% - Asset verification
- **Income:** 15% - Financial capacity assessment
- **City:** 5% - Geographic risk assessment
- **Age:** 5% - Demographic risk factor

## 📊 **Module Details**

### **1. SPU Module (`modules/SPU.js`)**
- **Purpose:** Blacklist and negative list checks
- **Inputs:** `spu_black_list_check`, `spu_credit_card_30k_check`, `spu_negative_list_check`
- **Output:** 0 (any hit) or 100 (no hits)

### **2. EAMVU Module (`modules/EAMVU.js`)**
- **Purpose:** Asset verification status
- **Inputs:** `eavmu_submitted`
- **Output:** 100 (submitted) or 0 (not submitted)

### **3. City Module (`modules/City.js`)**
- **Purpose:** Geographic risk and coverage assessment
- **Inputs:** Address fields, `cluster` (manual)
- **Scoring:**
  - Annexure A areas: -30 points
  - Full Coverage cities: +40/+20/+0 points
  - Cluster scoring: +30 to +5 points

### **4. Age Module (`modules/Age.js`)**
- **Purpose:** Demographic risk based on age and employment
- **Inputs:** `date_of_birth`, `occupation`, `employment_status`
- **Rules:**
  - Self-Employed: 22-65 years
  - Salaried: 21-60 years (20/61 with penalty)

### **5. DBR Module (`modules/DBR.js`)**
- **Purpose:** Debt-to-Income ratio with dynamic thresholds
- **Inputs:** Income, obligations, loan details
- **Dynamic Thresholds:** 30-45% based on income/obligations scoring
- **Scoring:** 100/75/50/25/0 based on DBR percentage

### **6. Income Module (`modules/Income.js`)**
- **Purpose:** Financial capacity and stability
- **Inputs:** Income data, employment type, salary transfer flag
- **Scoring:**
  - Threshold check: 60 points
  - Stability ratio: 25 points
  - Employment tenure: 15 points

## 🔄 **Data Flow**

### **1. Data Service (`modules/DataService.js`)**
- Fetches application data from API
- Retrieves DBR data from data engine
- Normalizes data for processing

### **2. Decision Engine (`modules/DecisionEngine.js`)**
- Orchestrates all modules
- Calculates weighted final score
- Determines pass/fail/conditional decision

### **3. Main Interface (`CreditCardDecisionEngine.js`)**
- Public API for the decision engine
- Handles application processing
- Provides module access

## 🎯 **Decision Logic**

### **Automatic Failures:**
1. Age outside acceptable range
2. DBR exceeds dynamic threshold
3. SPU critical hits
4. City Annexure A areas

### **Score-Based Decisions:**
- **≥90 points:** PASS (Very Low Risk)
- **80-89 points:** PASS (Low Risk)
- **70-79 points:** CONDITIONAL PASS (Medium Risk)
- **60-69 points:** CONDITIONAL PASS (High Risk)
- **<60 points:** FAIL (Very High Risk)

## 🚀 **Usage**

### **Development:**
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### **Frontend Interface:**
- Navigate to `http://localhost:3000`
- Enter Application ID to fetch data from external API
- Configure manual inputs (cluster, employment type, etc.)
- Click "Calculate Decision" for real-time processing
- View detailed scoring breakdown and final decision

### **API Endpoints:**
```javascript
// Fetch application data
GET /api/applications/[id]

// Calculate decision with custom data
POST /api/decision
{
  "applicationData": { ... }
}

// Full processing pipeline
POST /api/process
{
  "applicationId": 141
}
```

## 🔧 **Configuration**

### **API Endpoints:**
- Application API: `http://localhost:5000/api/applications/{id}`
- Data Engine: `http://localhost:3002/dbr`

### **Manual Inputs:**
- **Cluster:** FEDERAL, SOUTH, NORTHERN_PUNJAB, NORTH, SOUTHERN_PUNJAB, KP
- **Employment Type:** permanent, contractual, self-employed, business, probation
- **Salary Transfer:** salary_transfer, non_salary_transfer
- **Total Income:** Net income amount (default: 50,000 PKR)

## 📝 **Output Format**

```javascript
{
  applicationId: "141",
  customerName: "John Doe",
  cnic: "12345-1234567-1",
  finalScore: 85,
  decision: "PASS",
  actionRequired: "Basic conditions",
  riskLevel: "LOW",
  dbrPercentage: 25.5,
  moduleScores: {
    dbr: { score: 75, weight: 0.55, weightedScore: 41.25, notes: [...] },
    spu: { score: 100, weight: 0.10, weightedScore: 10.0, notes: [...] },
    // ... other modules
  }
}
```

## ⚠️ **Important Notes**

- **Modular Design:** Each module is independent and can be modified without affecting others
- **Data Integrity:** All modules maintain the same input/output interface
- **Error Handling:** Graceful fallbacks for missing data
- **Extensibility:** Easy to add new modules or modify existing ones
- **Testing:** Each module can be tested independently

## 📁 **File Organization Analysis**

### **✅ Current Active Files (Microservice Architecture):**
- `app/page.tsx` - Main frontend application (2,188 lines) ✅ **ACTIVE**
- `app/api/*/route.ts` - API endpoints (3 routes) ✅ **ACTIVE**
  - `/api/applications/[id]` - Fetch application data
  - `/api/decision` - Calculate decisions (orchestrates microservices)
  - `/api/process` - Full processing pipeline
- `lib/CreditCardDecisionEngine.ts` - **NEW**: Microservice orchestrator ✅ **ACTIVE**
- `lib/modules/` - **NEW**: Individual microservice modules ✅ **ACTIVE**
  - `SPUModule.ts` - Security & Risk Assessment (Team 1)
  - `EAMVUModule.ts` - Asset Verification & Documentation (Team 2)
  - `CityModule.ts` - Geographic Risk & Coverage Analysis (Team 3)
  - `AgeModule.ts` - Demographics & Employment Analysis (Team 4)
  - `IncomeModule.ts` - Financial Analysis & Income Verification (Team 5)
  - `DBRModule.ts` - Credit Risk & Debt Analysis (Team 6)
- `lib/modules/DataService.ts` - Data fetching service ✅ **ACTIVE**
- `components/ui/*.tsx` - Reusable UI components (4 components) ✅ **ACTIVE**
- `TEAM_STRUCTURE.md` - **NEW**: Team distribution and development guide ✅ **ACTIVE**
- `package.json` - Dependencies and build configuration ✅ **ACTIVE**

### **❌ Redundant/Legacy Files (Can be safely deleted):**
- `modules/*.js` - **DUPLICATE**: JavaScript versions (replaced by TypeScript)
- `lib/modules/*.ts` - **INCOMPLETE**: Partial TypeScript modules (replaced by complete engine)
- `Deceng.js` - **LEGACY**: Original monolithic implementation (logic moved to TypeScript)
- `app/page_old.tsx` - **BACKUP**: Previous version
- `app/page_clean.tsx` - **BACKUP**: Alternative version
- `CreditCardDecisionEngine.js` - **LEGACY**: JavaScript version (replaced by TypeScript)

### **🔧 Recommendations:**
1. **✅ COMPLETED**: Created microservice architecture with separate modules
2. **✅ COMPLETED**: Team-based development structure implemented
3. **✅ COMPLETED**: All calculations preserved from original `Deceng.js` logic
4. **✅ COMPLETED**: TypeScript interfaces and error handling added
5. **✅ COMPLETED**: Independent module testing capabilities
6. **NEXT**: Assign teams to specific modules using `TEAM_STRUCTURE.md`
7. **OPTIONAL**: Clean up redundant files to reduce clutter

## 🔄 **Architecture Evolution**

### **Migration Path:**
1. **Original**: Monolithic `Deceng.js` (1,302 lines)
2. **Modular**: Split into JavaScript modules in `modules/`
3. **TypeScript**: Converted to TypeScript modules in `lib/modules/` (incomplete)
4. **Full-Stack**: Added Next.js frontend and API routes
5. **ISSUE**: Calculations stopped working when `Deceng.js` was deleted
6. **✅ SOLUTION 1**: Created `lib/CreditCardDecisionEngine.ts` with complete logic
7. **✅ SOLUTION 2**: Refactored into microservice architecture for team distribution
8. **Current**: Microservice-based architecture with 6 independent modules

### **Technical Stack:**
- **Frontend**: React, Next.js 14, TypeScript
- **Backend**: Next.js API Routes, TypeScript
- **Architecture**: Microservices with 6 independent modules
- **Decision Engine**: Orchestrator pattern with module delegation
- **Team Distribution**: 6 teams, each owning a specific module
- **UI**: Custom components with modern styling
- **Build**: Next.js build system with TypeScript compilation

## 🛠️ **Problem & Solution**

### **The Issue:**
When `Deceng.js` was deleted, the calculation system stopped working because:
- The frontend calls API routes (`/api/decision`)
- API routes were using incomplete TypeScript modules in `lib/modules/`
- These modules had basic implementations but missing the complete logic from `Deceng.js`

### **The Solution:**
1. **Created `lib/CreditCardDecisionEngine.ts`** - Complete TypeScript decision engine
2. **Preserved ALL calculation logic** - Exact functions from `Deceng.js` (SPU, EAMVU, City, Age, Income, DBR)
3. **Updated API routes** - Now use the complete TypeScript engine
4. **Maintained Next.js compatibility** - Proper TypeScript imports and error handling
5. **Kept original behavior** - All console logging and calculation steps preserved

### **Result:**
✅ Calculations now work exactly as before
✅ TypeScript compatible with proper type definitions
✅ Next.js API routes function correctly
✅ Frontend receives complete decision results
✅ All original calculation logic preserved
