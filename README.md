# AquaPure - Water Testing Laboratory Management System (WTLMS)

A full-stack, enterprise-grade, responsive Laboratory Information Management System (LIMS) engineered to digitize water sample collection, custody tracking, physical/chemical/microbiological assay analysis, deterministic compliance interpretation, QA report approval workflows, and certified PDF report distribution.

---

## 1. System Architecture & Tech Stack

```
                     +---------------------------------------+
                     |     React 18 + Vite Web Client        |
                     |  (Tailwind/CSS3, Recharts, Lucide)    |
                     +---------------------------------------+
                                         |  JSON REST / Axios
                                         v  (Proxy port 5173 -> 8080)
                     +---------------------------------------+
                     |    Spring Boot 3.3.5 (Java 21/24)     |
                     |  - Spring Web REST Controllers        |
                     |  - Spring Security (Stateless JWT)    |
                     |  - Compliance Rule Engine             |
                     |  - OpenPDF Report Generator           |
                     |  - Spring Data MongoDB                |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |      MongoDB Database (Port 27017)    |
                     |   * Auto-fallback to Embedded In-Mem  |
                     |     MongoServer for Zero-Setup Dev    |
                     +---------------------------------------+
```

### Technology Highlights
- **Frontend**: React.js 18, Vite 5, React Router v6, Recharts for dynamic visual dashboards, Lucide React icons, Vanilla CSS custom property design system (Clean Blue/Light-Gray laboratory theme).
- **Backend**: Java 21/24, Spring Boot 3.3.5, Spring Security 6, Stateless JWT (`io.jsonwebtoken 0.12.6`), Bean Validation (`jakarta.validation`), OpenPDF (`com.github.librepdf:openpdf 1.3.40`) for server-side PDF document generation.
- **Database**: MongoDB 5/6/7 with Spring Data MongoDB. Includes an automatic self-starting embedded in-memory MongoDB driver (`mongo-java-server`) when a standalone local MongoDB daemon is not detected on port 27017.

---

## 2. User Roles & Permission Matrix

| Module / Operation | Admin (`ROLE_ADMIN`) | Laboratory Staff (`ROLE_LABORATORY_STAFF`) | Customer (`ROLE_CUSTOMER`) |
| :--- | :---: | :---: | :---: |
| **System Dashboard & Statistics** | Full Laboratory Metrics | Assigned Lab Tasks & Workload | Personal Sample Overview |
| **Water Sample Registration** | Register Any Sample | Register Any Sample | Submit New Testing Request |
| **Sample Lifecycle & Status Update** | Full Control | Status Transitions | View Progress Timeline |
| **Test Parameter Definitions** | Create, Edit, Configure Limits | View Applicable Standards | None |
| **Laboratory Results Entry Form** | Full Access | Record & Save Assay Values | None |
| **Draft Report Generation** | Generate Draft | Generate Draft | None |
| **Report Approval & Sign-Off** | Approve or Reject Reports | Submit for Review | None |
| **Certified PDF Report Download** | Download Any Report | Download Draft / Final | Download Own Approved PDF |
| **Customer Directory** | Manage Customers | View Customer Details | View Own Profile |
| **Staff Management** | Create / Manage Specialists | None | None |

---

## 3. Seeded Demo Accounts (One-Click Credentials)

The system automatically initializes 1 Admin, 3 Laboratory Specialists, 10 Customers, 17 Standard Water Quality Parameters, and 20 Realistic Samples across multiple lifecycle stages upon initial launch:

| Role | Email | Password | Display Name | Wing / Organization |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@watertest.com` | `AdminPassword123!` | Dr. Elizabeth Shaw | Lab Director & QA Lead |
| **Chemist** | `chemist@watertest.com` | `StaffPassword123!` | Sarah Connor | Inorganic Chemistry Wing |
| **Microbiologist** | `microbiologist@watertest.com` | `StaffPassword123!` | David Miller | Pathogen & Microbiology Wing |
| **Quality Analyst** | `analyst@watertest.com` | `StaffPassword123!` | Priya Sharma | Physical & Instrumentation Wing |
| **Customer 1** | `customer1@gmail.com` | `CustomerPassword123!` | GreenValley Agriculture Farms | GreenValley Agro Pvt Ltd |
| **Customer 2** | `customer2@purebev.com` | `CustomerPassword123!` | PureBeverage Bottling Corp | PureBeverage Bottling Corp |
| **Customer 3** | `customer3@citywater.org` | `CustomerPassword123!` | Metro Municipal Water Board | Metro Municipal Council |

*(Quick-login buttons are also provided on the Login screen for instant testing without manual typing)*

---

## 4. Deterministic Compliance Rule Engine

Water quality parameters are compared against configured standards (e.g., **IS 10500:2012** Drinking Water Specifications). The engine evaluates parameters using dedicated deterministic rules:

1. **RANGE**: E.g., **pH** (Acceptable limit: 6.5 – 8.5).
   - If $6.5 \le \text{value} \le 8.5 \implies$ `COMPLIANT`.
   - If $\text{value} < 6.5$ or $\text{value} > 8.5 \implies$ `NON_COMPLIANT`.
2. **MAX_ONLY**: E.g., **Turbidity** ($\le 5\text{ NTU}$), **TDS** ($\le 500\text{ mg/L}$), **Fluoride** ($\le 1.0\text{ mg/L}$), **Nitrate** ($\le 45\text{ mg/L}$).
   - If $\text{value} \le \text{max} \implies$ `COMPLIANT`, else `NON_COMPLIANT`.
3. **MIN_ONLY**: Parameters with a minimum required concentration.
   - If $\text{value} \ge \text{min} \implies$ `COMPLIANT`, else `NON_COMPLIANT`.
4. **QUALITATIVE**: E.g., **Odour** (Permitted: "Agreeable" / "Unobjectionable").
   - Case-insensitive semantic evaluation that flags terms like "foul", "disagreeable", "chemical", or "turbid" as `NON_COMPLIANT`.
5. **MICROBIOLOGICAL (Zero-Tolerance)**: E.g., **Total Coliform**, **E. coli**, **Fecal Coliform**.
   - Zero-tolerance criteria: Value must be $\le 0$ or explicitly `"Absent"` / `"Nil"`. Any bacterial presence (e.g., $14\text{ CFU/100ml}$ or `"Detected"`) is flagged as a high-priority biological hazard (`NON_COMPLIANT`).

### Report Historical Snapshot Preservation
When a test report is compiled and approved, an immutable snapshot of all evaluated parameters, reference limits, testing methods, and applicable standard names is permanently persisted inside the `Report` document. Modifying parameter limits later in the admin settings will **never** alter existing accredited reports.

---

## 5. Sample Lifecycle Workflow

The sample tracking module enforces strict transition logic:

```
[REQUESTED] 
    |
    v
[REGISTERED] 
    |
    v
[SAMPLE_RECEIVED] (Verified condition, temperature, seals)
    |
    v
[TESTING_IN_PROGRESS] (Parameters assigned to laboratory wing)
    |
    v
[TESTING_COMPLETED] (Chemist/Microbiologist saves all measured values)
    |
    v
[REPORT_PENDING_APPROVAL] (Draft report submitted for QA verification)
    |
    +---> [APPROVED] (Signed by Lab Director; published for Customer PDF download)
    |
    +---> [REJECTED] (Returned to testing staff with reviewer comments for re-assay)
```

Direct jumps (such as jumping from `REQUESTED` directly to `APPROVED`) are strictly blocked by the backend service with HTTP 400 Bad Request.

---

## 6. Directory Structure

```
fsd mern  water testing/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/wtlms/
│   │   │   │   ├── config/             # MongoConfig (embedded fallback), SecurityConfig, CORS
│   │   │   │   ├── controller/         # Auth, Customer, Dashboard, Notification, Report, Sample, Test
│   │   │   │   ├── dto/                # Request/response DTOs with Bean Validation
│   │   │   │   ├── exception/          # GlobalExceptionHandler, ResourceNotFoundException
│   │   │   │   ├── model/              # MongoDB Documents: Sample, Report, TestResult, User, etc.
│   │   │   │   ├── repository/         # Spring Data MongoDB Repositories
│   │   │   │   ├── security/           # JWT Provider, CustomUserDetailsService, AuthFilter
│   │   │   │   └── service/            # ComplianceEngine, PdfReportService, SampleService, DataSeeder
│   │   │   └── resources/
│   │   │       └── application.properties # App port, JWT secret, Mongo URI
│   │   └── test/
│   │       └── java/com/wtlms/
│   │           ├── ComplianceEngineTest.java           # Unit tests for parameter rule evaluation
│   │           ├── PdfReportTest.java                  # Validates OpenPDF generation and magic bytes
│   │           ├── ReportApprovalAndSecurityTest.java  # Customer data isolation and report approval
│   │           └── SampleWorkflowTest.java             # State machine validation and illegal skips
│   ├── mvnw & mvnw.cmd                 # Maven wrapper scripts
│   └── pom.xml                         # Spring Boot 3.3.5 Maven configuration
│
├── frontend/
│   ├── src/
│   │   ├── components/common/          # Navbar, Sidebar, StatusBadge, ComplianceBadge, Loader
│   │   ├── context/                    # AuthContext (JWT session), NotificationContext (polling)
│   │   ├── layouts/                    # AppLayout (Responsive sidebar shell)
│   │   ├── pages/
│   │   │   ├── auth/                   # Login, Register
│   │   │   ├── dashboard/              # Dynamic charts (Recharts) & real database statistics
│   │   │   ├── samples/                # SampleRegistration, SampleTracking
│   │   │   ├── parameters/             # TestParameters (Standard limits configuration)
│   │   │   ├── technician/             # LabWorkspace (Assay entry form)
│   │   │   ├── reports/                # ReportGeneration, ReportApproval, ReportDetail, ReportList
│   │   │   ├── customers/              # CustomerList
│   │   │   ├── users/                  # StaffManagement
│   │   │   └── profile/                # Settings & Audit configuration
│   │   ├── services/                   # Axios instance with JWT interceptors
│   │   ├── styles/                     # index.css (Professional clean laboratory theme)
│   │   ├── App.jsx                     # Route hierarchy with ProtectedRoute guards
│   │   └── main.jsx                    # React 18 bootstrap
│   ├── .env.example & .env             # VITE_API_BASE_URL configuration
│   ├── package.json
│   └── vite.config.js                  # Proxies /api -> http://localhost:8080
│
└── README.md
```

---

## 7. Setup & Execution Instructions

### Prerequisites
- **Java**: JDK 21 or JDK 24 (Verified with `java version "24.0.2"`)
- **Maven**: Version 3.8+ (Or use the included `./mvnw` / `mvnw.cmd` wrapper)
- **Node.js**: Version 18+ (Verified with Node v24 and npm 11)
- **MongoDB**: Standalone MongoDB 5/6/7 (Optional; if not running, the application will automatically launch its embedded in-memory MongoDB server on port 27017).

---

### Step 1: Start the Backend (Spring Boot)

Open a terminal in the `backend` folder:

```powershell
cd backend
# Using Maven Wrapper:
.\mvnw.cmd spring-boot:run

# Or with global Maven:
mvn spring-boot:run
```

The Spring Boot backend will:
1. Verify if MongoDB is reachable at `mongodb://127.0.0.1:27017`.
2. Start the embedded in-memory MongoDB instance automatically if port 27017 is free.
3. Automatically seed all demo users, parameters, 20 realistic samples, test results, reports, and notifications.
4. Listen on `http://localhost:8080`.

---

### Step 2: Start the Frontend (React + Vite)

Open a second terminal in the `frontend` folder:

```powershell
cd frontend
npm install
npm run dev
```

The Vite dev server will start at:
`http://localhost:5173`

Open your browser and navigate to `http://localhost:5173`.

---

### Step 3: Run Automated Backend Tests

To execute the unit and integration test suite:

```powershell
cd backend
.\mvnw.cmd test
```

**Results:**
- `ComplianceEngineTest`: 4 tests passed (pH ranges, TDS maximums, qualitative Odour checks, microbiological zero-tolerance criteria).
- `PdfReportTest`: 1 test passed (Verifies OpenPDF binary generation and `%PDF-1.5` magic header bytes).
- `ReportApprovalAndSecurityTest`: 3 tests passed (Customer data isolation, reviewer sign-off transitions, immutable report parameter snapshots).
- `SampleWorkflowTest`: 2 tests passed (Legitimate lifecycle transitions with audit logs, illegal status skip rejection).
- **Total: 10 tests, 0 failures, 0 errors, 100% passed.**

---

### Step 4: Build for Production

To create an optimized production build of the frontend:

```powershell
cd frontend
npm run build
```

This compiles optimized bundles to `frontend/dist/`.

---

## 8. REST API Endpoints Overview

### Authentication
- `POST /api/auth/login` - Authenticate with email/password; returns JWT token and user profile.
- `POST /api/auth/register` - Register a new customer user account and profile.
- `GET /api/auth/me` - Fetch authenticated user context.

### Samples Management
- `POST /api/samples` - Register a new water sample (Staff/Admin) or submit testing request (Customer).
- `GET /api/samples` - Retrieve samples with filtering by search, waterSource, and status.
- `GET /api/samples/{id}` - Retrieve sample details and audit timeline.
- `PUT /api/samples/{id}` - Update sample details.
- `PATCH /api/samples/{id}/status` - Advance lifecycle status with audit comments.
- `DELETE /api/samples/{id}` - Delete sample (Admin only).

### Test Parameters & References
- `GET /api/tests` - List all active test parameter definitions.
- `POST /api/tests` - Create new parameter standard limit (Admin).
- `PUT /api/tests/{id}` - Update parameter standard limits (Admin).

### Test Results (Lab Workspace)
- `GET /api/results/sample/{sampleId}` - Fetch all recorded test results for a sample.
- `POST /api/results` - Enter or update measured values with real-time compliance evaluation.
- `POST /api/results/batch` - Save batch test results for a sample.

### Report Review & Approval
- `POST /api/reports/generate/{sampleId}` - Generate draft report with current compliance evaluation.
- `GET /api/reports` - Retrieve reports (customers only see their own approved reports).
- `GET /api/reports/{id}` - Retrieve detailed report document.
- `GET /api/reports/{id}/pdf` - Stream certified PDF water quality test report.
- `POST /api/reports/{id}/submit` - Submit draft report for QA approval.
- `POST /api/reports/{id}/review` - QA decision (APPROVE or REJECT with comments).
- `POST /api/reports/{id}/approve` - Direct approve endpoint.
- `POST /api/reports/{id}/reject` - Direct reject endpoint.

### Dashboard & Analytics
- `GET /api/dashboard/statistics` - Real-time statistics, monthly registrations, compliance breakdown, and recent tasks.

### Notifications
- `GET /api/notifications` - Retrieve alerts (non-compliant flags, approvals, reports).
- `PUT /api/notifications/{id}/read` - Mark notification as read.
- `PUT /api/notifications/read-all` - Mark all notifications as read.

---

## 9. Quality Assurance & Security Validation

1. **Authentication Security**: Password hashing with BCrypt (10 rounds). Stateless JWT authentication with signed HMAC-SHA256 tokens and expiration.
2. **Customer Isolation**: Customer users can **never** view or download other customers' samples or draft test reports. Data filtering is strictly enforced at the service layer on every query.
3. **Workflow Integrity**: Status transitions follow a strict linear progression. Skipping steps or unapproved edits to published reports are blocked.
4. **Accreditation Disclaimer**: The report clearly displays tested parameters, limits of detection, applicable standard references (IS 10500:2012 / IS 3025), and explicit disclaimers without fabricating unauthorized certifications.
