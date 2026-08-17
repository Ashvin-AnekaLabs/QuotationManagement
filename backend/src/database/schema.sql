-- Quotation Management System Database Schema (PostgreSQL)

-- 1. Clients Table
CREATE TABLE IF NOT EXISTS "tblClients" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    contact_person VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    company_name VARCHAR(255),
    address TEXT,
    pan_number VARCHAR(50),
    gst_number VARCHAR(50),
    website VARCHAR(255),
    currency VARCHAR(50) DEFAULT 'INR',
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Migrations for tblClients
ALTER TABLE "tblClients" ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE "tblClients" ADD COLUMN IF NOT EXISTS currency VARCHAR(50) DEFAULT 'INR';
ALTER TABLE "tblClients" ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE "tblClients" ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE "tblClients" ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE "tblClients" ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';

-- 2. Employees Table
CREATE TABLE IF NOT EXISTS "tblEmployees" (
    id SERIAL PRIMARY KEY,
    employee_code VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(100),
    designation VARCHAR(100),
    department VARCHAR(100),
    hourly_rate NUMERIC(10, 2) NOT NULL CHECK (hourly_rate >= 0),
    assigned_project VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Migrations for existing tblEmployees table
ALTER TABLE "tblEmployees" ADD COLUMN IF NOT EXISTS employee_code VARCHAR(50);
ALTER TABLE "tblEmployees" ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE "tblEmployees" ADD COLUMN IF NOT EXISTS role VARCHAR(100);
ALTER TABLE "tblEmployees" ADD COLUMN IF NOT EXISTS designation VARCHAR(100);
ALTER TABLE "tblEmployees" ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE "tblEmployees" ADD COLUMN IF NOT EXISTS assigned_project VARCHAR(255);


-- 3. Quotations Table
CREATE TABLE IF NOT EXISTS "tblQuotations" (
    id SERIAL PRIMARY KEY,
    quotation_number VARCHAR(50) UNIQUE NOT NULL,
    client_id INTEGER REFERENCES "tblClients"(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    logo TEXT,
    billing_address TEXT,
    shipping_address TEXT,
    pincode VARCHAR(20),
    wizard_step INTEGER DEFAULT 1,

    -- Proposal Details (Step 2)
    opportunity_name VARCHAR(255),
    proposal_date DATE,
    valid_till DATE,
    revision_version VARCHAR(50) DEFAULT '1.0',
    prepared_by_id INTEGER REFERENCES "tblEmployees"(id) ON DELETE SET NULL,
    prepared_by_designation VARCHAR(100),
    prepared_by_department VARCHAR(100),
    project_summary TEXT,
    engagement_type VARCHAR(100) DEFAULT 'Fixed Price',
    pricing_currency VARCHAR(50) DEFAULT 'INR',
    exchange_rate NUMERIC(10, 4) DEFAULT 1.0000,

    -- Estimation Summary (Step 4)
    total_effort_hours NUMERIC(10, 2) DEFAULT 0,
    productivity_basis NUMERIC(4, 2) DEFAULT 8.00,
    average_productivity NUMERIC(4, 2) DEFAULT 8.00,
    estimation_effort_cost NUMERIC(12, 2) DEFAULT 0.00,
    estimation_contingency_percentage NUMERIC(5, 2) DEFAULT 5.00,
    estimation_contingency_amount NUMERIC(12, 2) DEFAULT 0.00,
    estimation_subtotal NUMERIC(12, 2) DEFAULT 0.00,
    estimation_profit_margin_percentage NUMERIC(5, 2) DEFAULT 20.00,
    estimation_profit_margin_amount NUMERIC(12, 2) DEFAULT 0.00,
    estimated_project_cost NUMERIC(12, 2) DEFAULT 0.00,
    estimation_notes TEXT,

    -- Team Costing Summary (Step 5)
    total_labor_cost NUMERIC(12, 2) DEFAULT 0.00,
    travel_expenses NUMERIC(12, 2) DEFAULT 0.00,
    third_party_tools_cost NUMERIC(12, 2) DEFAULT 0.00,
    infrastructure_hosting_cost NUMERIC(12, 2) DEFAULT 0.00,
    team_subtotal NUMERIC(12, 2) DEFAULT 0.00,
    team_contingency_percentage NUMERIC(5, 2) DEFAULT 5.00,
    team_contingency_amount NUMERIC(12, 2) DEFAULT 0.00,
    team_subtotal_after_contingency NUMERIC(12, 2) DEFAULT 0.00,
    team_profit_margin_percentage NUMERIC(5, 2) DEFAULT 15.00,
    team_profit_margin_amount NUMERIC(12, 2) DEFAULT 0.00,
    team_total_project_cost NUMERIC(12, 2) DEFAULT 0.00,
    working_days_per_month INTEGER DEFAULT 22,
    working_hours_per_day INTEGER DEFAULT 8,
    total_working_hours_per_month INTEGER DEFAULT 176,

    -- Commercial Details (Step 6)
    total_outstanding_pricing_excl_gst NUMERIC(12, 2) DEFAULT 0.00,
    gst_percentage NUMERIC(5, 2) DEFAULT 18.00,
    gst_amount NUMERIC(12, 2) DEFAULT 0.00,
    discount_type VARCHAR(50) DEFAULT 'PERCENTAGE',
    discount_value NUMERIC(10, 2) DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    final_outstanding_amount NUMERIC(12, 2) DEFAULT 0.00,

    -- Timeline Details (Step 7)
    project_start_date DATE,
    project_end_date DATE,
    working_days INTEGER DEFAULT 0,
    total_timeline_days INTEGER DEFAULT 0 CHECK (total_timeline_days >= 0),

    -- Preview Important Notes (Step 8)
    important_notes TEXT,

    grand_total NUMERIC(12, 2) DEFAULT 0.00 CHECK (grand_total >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Migrations for tblQuotations
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS wizard_step INTEGER DEFAULT 1;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS opportunity_name VARCHAR(255);
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS proposal_date DATE;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS valid_till DATE;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS revision_version VARCHAR(50) DEFAULT '1.0';
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS prepared_by_id INTEGER REFERENCES "tblEmployees"(id) ON DELETE SET NULL;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS prepared_by_designation VARCHAR(100);
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS prepared_by_department VARCHAR(100);
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS project_summary TEXT;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS engagement_type VARCHAR(100) DEFAULT 'Fixed Price';
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS pricing_currency VARCHAR(50) DEFAULT 'INR';
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(10, 4) DEFAULT 1.0000;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS total_effort_hours NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS productivity_basis NUMERIC(4, 2) DEFAULT 8.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS average_productivity NUMERIC(4, 2) DEFAULT 8.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS estimation_effort_cost NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS estimation_contingency_percentage NUMERIC(5, 2) DEFAULT 5.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS estimation_contingency_amount NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS estimation_subtotal NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS estimation_profit_margin_percentage NUMERIC(5, 2) DEFAULT 20.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS estimation_profit_margin_amount NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS estimated_project_cost NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS estimation_notes TEXT;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS total_labor_cost NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS travel_expenses NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS third_party_tools_cost NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS infrastructure_hosting_cost NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS team_subtotal NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS team_contingency_percentage NUMERIC(5, 2) DEFAULT 5.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS team_contingency_amount NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS team_subtotal_after_contingency NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS team_profit_margin_percentage NUMERIC(5, 2) DEFAULT 15.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS team_profit_margin_amount NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS team_total_project_cost NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS working_days_per_month INTEGER DEFAULT 22;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS working_hours_per_day INTEGER DEFAULT 8;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS total_working_hours_per_month INTEGER DEFAULT 176;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS total_outstanding_pricing_excl_gst NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS gst_percentage NUMERIC(5, 2) DEFAULT 18.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS gst_amount NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS discount_type VARCHAR(50) DEFAULT 'PERCENTAGE';
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS discount_value NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS final_outstanding_amount NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS project_start_date DATE;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS project_end_date DATE;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS working_days INTEGER DEFAULT 0;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS important_notes TEXT;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE "tblQuotations" ALTER COLUMN logo TYPE TEXT;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS billing_address TEXT;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS pincode VARCHAR(20);
ALTER TABLE "tblQuotations" DROP COLUMN IF EXISTS status;

-- 4. Quotation Scopes Table
CREATE TABLE IF NOT EXISTS "tblQuotationScopes" (
    id SERIAL PRIMARY KEY,
    quotation_id INTEGER REFERENCES "tblQuotations"(id) ON DELETE CASCADE,
    module VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    subtext VARCHAR(255),
    module_subtext VARCHAR(255),
    description TEXT,
    category VARCHAR(100) DEFAULT 'Core',
    priority VARCHAR(50) DEFAULT 'Medium',
    est_hours NUMERIC(10, 2) DEFAULT 0,
    est_days NUMERIC(10, 2) DEFAULT 0,
    timeline_days INTEGER DEFAULT 0,
    rate_per_hour NUMERIC(10, 2) DEFAULT 0.00,
    effort_cost NUMERIC(12, 2) DEFAULT 0.00,
    complexity VARCHAR(50) DEFAULT 'Medium',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Migrations for tblQuotationScopes
ALTER TABLE "tblQuotationScopes" ADD COLUMN IF NOT EXISTS module VARCHAR(255);
ALTER TABLE "tblQuotationScopes" ADD COLUMN IF NOT EXISTS subtext VARCHAR(255);
ALTER TABLE "tblQuotationScopes" ADD COLUMN IF NOT EXISTS module_subtext VARCHAR(255);
ALTER TABLE "tblQuotationScopes" ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Core';
ALTER TABLE "tblQuotationScopes" ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'Medium';
ALTER TABLE "tblQuotationScopes" ADD COLUMN IF NOT EXISTS est_hours NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE "tblQuotationScopes" ADD COLUMN IF NOT EXISTS est_days NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE "tblQuotationScopes" ADD COLUMN IF NOT EXISTS timeline_days INTEGER DEFAULT 0;
ALTER TABLE "tblQuotationScopes" ADD COLUMN IF NOT EXISTS rate_per_hour NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotationScopes" ADD COLUMN IF NOT EXISTS effort_cost NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotationScopes" ADD COLUMN IF NOT EXISTS complexity VARCHAR(50) DEFAULT 'Medium';
ALTER TABLE "tblQuotationScopes" ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE "tblQuotationScopes" ALTER COLUMN rate_per_hour SET DEFAULT 0.00;

-- 5. Quotation Functionalities Table
CREATE TABLE IF NOT EXISTS "tblQuotationFunctionalities" (
    id SERIAL PRIMARY KEY,
    scope_id INTEGER REFERENCES "tblQuotationScopes"(id) ON DELETE CASCADE,
    module VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'Core',
    priority VARCHAR(50) DEFAULT 'Medium',
    est_hours NUMERIC(10, 2) DEFAULT 0,
    est_days NUMERIC(10, 2) DEFAULT 0,
    timeline_days INTEGER NOT NULL DEFAULT 0 CHECK (timeline_days >= 0),
    rate_per_hour NUMERIC(10, 2) DEFAULT 0.00,
    effort_cost NUMERIC(12, 2) DEFAULT 0.00,
    complexity VARCHAR(50) DEFAULT 'Medium',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Migrations for tblQuotationFunctionalities
ALTER TABLE "tblQuotationFunctionalities" ADD COLUMN IF NOT EXISTS module VARCHAR(255);
ALTER TABLE "tblQuotationFunctionalities" ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE "tblQuotationFunctionalities" ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Core';
ALTER TABLE "tblQuotationFunctionalities" ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'Medium';
ALTER TABLE "tblQuotationFunctionalities" ADD COLUMN IF NOT EXISTS est_hours NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE "tblQuotationFunctionalities" ADD COLUMN IF NOT EXISTS est_days NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE "tblQuotationFunctionalities" ADD COLUMN IF NOT EXISTS rate_per_hour NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotationFunctionalities" ALTER COLUMN rate_per_hour SET DEFAULT 0.00;
ALTER TABLE "tblQuotationFunctionalities" ADD COLUMN IF NOT EXISTS effort_cost NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE "tblQuotationFunctionalities" ADD COLUMN IF NOT EXISTS complexity VARCHAR(50) DEFAULT 'Medium';
ALTER TABLE "tblQuotationFunctionalities" ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 6. Quotation Team Table
CREATE TABLE IF NOT EXISTS "tblQuotationTeam" (
    id SERIAL PRIMARY KEY,
    quotation_id INTEGER REFERENCES "tblQuotations"(id) ON DELETE CASCADE,
    employee_id INTEGER REFERENCES "tblEmployees"(id) ON DELETE RESTRICT,
    role_designation VARCHAR(100),
    technology_skill VARCHAR(100),
    hours_per_day NUMERIC(4, 2) DEFAULT 8.00,
    hours NUMERIC(10, 2) DEFAULT 0,
    days NUMERIC(10, 2) DEFAULT 0,
    working_days INTEGER DEFAULT 0,
    hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (hourly_rate >= 0),
    total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_cost >= 0),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_quotation_employee UNIQUE (quotation_id, employee_id)
);

-- Migrations for tblQuotationTeam
ALTER TABLE "tblQuotationTeam" ADD COLUMN IF NOT EXISTS role_designation VARCHAR(100);
ALTER TABLE "tblQuotationTeam" ADD COLUMN IF NOT EXISTS technology_skill VARCHAR(100);
ALTER TABLE "tblQuotationTeam" ADD COLUMN IF NOT EXISTS hours NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE "tblQuotationTeam" ADD COLUMN IF NOT EXISTS days NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE "tblQuotationTeam" ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE "tblQuotationTeam" ALTER COLUMN hours_per_day DROP NOT NULL;
ALTER TABLE "tblQuotationTeam" ALTER COLUMN working_days DROP NOT NULL;
ALTER TABLE "tblQuotationTeam" DROP CONSTRAINT IF EXISTS "tblQuotationTeam_working_days_check";
ALTER TABLE "tblQuotationTeam" ADD CONSTRAINT "tblQuotationTeam_working_days_check" CHECK (working_days >= 0);

-- 7. Quotation Milestones Table (New Step 7 Timeline & Milestones)
CREATE TABLE IF NOT EXISTS "tblQuotationMilestones" (
    id SERIAL PRIMARY KEY,
    quotation_id INTEGER REFERENCES "tblQuotations"(id) ON DELETE CASCADE,
    milestone_name VARCHAR(255) NOT NULL,
    milestone_subtext VARCHAR(255),
    start_date DATE,
    end_date DATE,
    duration_days INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quotations_client_id ON "tblQuotations"(client_id);
CREATE INDEX IF NOT EXISTS idx_scopes_quotation_id ON "tblQuotationScopes"(quotation_id);
CREATE INDEX IF NOT EXISTS idx_functionalities_scope_id ON "tblQuotationFunctionalities"(scope_id);
CREATE INDEX IF NOT EXISTS idx_team_quotation_id ON "tblQuotationTeam"(quotation_id);
CREATE INDEX IF NOT EXISTS idx_team_employee_id ON "tblQuotationTeam"(employee_id);
CREATE INDEX IF NOT EXISTS idx_milestones_quotation_id ON "tblQuotationMilestones"(quotation_id);

-- 8. Roles Master Table
CREATE TABLE IF NOT EXISTS "tblRoles" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Seed Roles
INSERT INTO "tblRoles" (name) 
VALUES ('Admin'), ('Employee')
ON CONFLICT (name) DO NOTHING;

-- 9. Users Table
CREATE TABLE IF NOT EXISTS "tblUsers" (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES "tblEmployees"(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES "tblRoles"(id) ON DELETE RESTRICT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    must_change_password BOOLEAN DEFAULT FALSE NOT NULL,
    refresh_token TEXT,
    refresh_token_expires_at TIMESTAMPTZ,
    reset_token VARCHAR(255),
    reset_token_expires_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Migrations for tblUsers (token consolidation)
ALTER TABLE "tblUsers" ADD COLUMN IF NOT EXISTS refresh_token TEXT;
ALTER TABLE "tblUsers" ADD COLUMN IF NOT EXISTS refresh_token_expires_at TIMESTAMPTZ;
ALTER TABLE "tblUsers" ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
ALTER TABLE "tblUsers" ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMPTZ;

-- 10. Company Master Table
CREATE TABLE IF NOT EXISTS "tblCompanyMaster" (
    "companyId" SERIAL PRIMARY KEY,
    "companyName" VARCHAR(255) NOT NULL,
    "pan" VARCHAR(50),
    "gstin" VARCHAR(50),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "website" VARCHAR(255),
    "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. Branch Master Table
CREATE TABLE IF NOT EXISTS "tblBranchMaster" (
    "branchId" SERIAL PRIMARY KEY,
    "companyId" INTEGER REFERENCES "tblCompanyMaster"("companyId") ON DELETE CASCADE NOT NULL,
    "branchName" VARCHAR(255) NOT NULL,
    "addressLine1" VARCHAR(255),
    "addressLine2" VARCHAR(255),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "country" VARCHAR(100),
    "pincode" VARCHAR(50),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "isDefault" BOOLEAN DEFAULT FALSE NOT NULL,
    "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Migrations for tblQuotations to include company and branch
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS "companyId" INTEGER;
ALTER TABLE "tblQuotations" ADD COLUMN IF NOT EXISTS "branchId" INTEGER;
