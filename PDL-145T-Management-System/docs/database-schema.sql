-- PDL-145T Development Program Database Schema
-- PostgreSQL with PostGIS extension for geographic data

-- Enable PostGIS extension for geographic data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create enum types
CREATE TYPE infrastructure_type AS ENUM ('administrative', 'health_center', 'primary_school');
CREATE TYPE project_status AS ENUM ('planning', 'in_progress', 'completed', 'on_hold', 'cancelled');
CREATE TYPE phase_status AS ENUM ('not_started', 'in_progress', 'completed', 'on_hold');
CREATE TYPE delivery_status AS ENUM ('ordered', 'in_transit', 'delivered', 'used');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE validation_status AS ENUM ('pending', 'validated', 'disputed');
CREATE TYPE user_role AS ENUM ('project_supervisor', 'finance_agent', 'construction_agent', 'admin');

-- Territories table
CREATE TABLE territories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    coordinates GEOGRAPHY(POINT, 4326),
    administrative_contact JSONB,
    logistics_hub VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    territory_id UUID REFERENCES territories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Technical specifications table
CREATE TABLE technical_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    infrastructure_type infrastructure_type NOT NULL,
    specifications JSONB NOT NULL,
    version VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Infrastructures table
CREATE TABLE infrastructures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type infrastructure_type NOT NULL,
    territory_id UUID REFERENCES territories(id) NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    address TEXT,
    specifications_id UUID REFERENCES technical_specifications(id),
    status project_status DEFAULT 'planning',
    budget_allocated DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    infrastructure_id UUID REFERENCES infrastructures(id) NOT NULL,
    project_manager_id UUID REFERENCES users(id),
    start_date DATE,
    expected_end_date DATE,
    actual_end_date DATE,
    status project_status DEFAULT 'planning',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Construction phases table
CREATE TABLE construction_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status phase_status DEFAULT 'not_started',
    dependencies JSONB, -- Array of phase IDs
    assigned_team JSONB, -- Array of user IDs
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Budget table
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    infrastructure_id UUID REFERENCES infrastructures(id) NOT NULL,
    total_allocated DECIMAL(15, 2) NOT NULL,
    spent DECIMAL(15, 2) DEFAULT 0,
    remaining DECIMAL(15, 2) NOT NULL,
    category_materials DECIMAL(15, 2) DEFAULT 0,
    category_labor DECIMAL(15, 2) DEFAULT 0,
    category_equipment DECIMAL(15, 2) DEFAULT 0,
    category_transportation DECIMAL(15, 2) DEFAULT 0,
    category_contingency DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Materials table
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Material requirements table
CREATE TABLE material_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id UUID REFERENCES construction_phases(id) NOT NULL,
    material_id UUID REFERENCES materials(id) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(15, 2) NOT NULL,
    supplier_id UUID REFERENCES suppliers(id),
    delivery_status delivery_status DEFAULT 'ordered',
    delivery_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID REFERENCES budgets(id) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'expense', 'payment', 'refund'
    description TEXT,
    reference_number VARCHAR(100),
    transaction_date DATE NOT NULL,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Site inspections table
CREATE TABLE site_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    infrastructure_id UUID REFERENCES infrastructures(id) NOT NULL,
    inspector_id UUID REFERENCES users(id) NOT NULL,
    inspection_date DATE NOT NULL,
    phase_id UUID REFERENCES construction_phases(id),
    approval_status approval_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Measurements table
CREATE TABLE measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_inspection_id UUID REFERENCES site_inspections(id) NOT NULL,
    measurement_type VARCHAR(100) NOT NULL,
    expected_value DECIMAL(10, 2),
    actual_value DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    tolerance DECIMAL(5, 2),
    is_within_tolerance BOOLEAN,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Photos table
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_inspection_id UUID REFERENCES site_inspections(id) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    description TEXT,
    gps_coordinates GEOGRAPHY(POINT, 4326),
    taken_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Issues table
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_inspection_id UUID REFERENCES site_inspections(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    assigned_to UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Billing reports table
CREATE TABLE billing_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_inspection_id UUID REFERENCES site_inspections(id) NOT NULL,
    report_date DATE NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    validation_status validation_status DEFAULT 'pending',
    finance_agent_review TEXT,
    validated_by UUID REFERENCES users(id),
    validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Work items table
CREATE TABLE work_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    billing_report_id UUID REFERENCES billing_reports(id) NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_rate DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Material usage table
CREATE TABLE material_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    billing_report_id UUID REFERENCES billing_reports(id) NOT NULL,
    material_id UUID REFERENCES materials(id) NOT NULL,
    quantity_used DECIMAL(10, 2) NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Labor records table
CREATE TABLE labor_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    billing_report_id UUID REFERENCES billing_reports(id) NOT NULL,
    worker_category VARCHAR(100) NOT NULL,
    hours_worked DECIMAL(5, 2) NOT NULL,
    hourly_rate DECIMAL(8, 2) NOT NULL,
    total_cost DECIMAL(12, 2) NOT NULL,
    work_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Risks table
CREATE TABLE risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    probability INTEGER CHECK (probability >= 1 AND probability <= 5),
    impact INTEGER CHECK (impact >= 1 AND impact <= 5),
    risk_score INTEGER GENERATED ALWAYS AS (probability * impact) STORED,
    mitigation_strategy TEXT,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'mitigated', 'closed'
    owner_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Resources table
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) NOT NULL,
    resource_type VARCHAR(100) NOT NULL, -- 'human', 'equipment', 'material'
    resource_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    cost_per_unit DECIMAL(10, 2),
    total_cost DECIMAL(15, 2),
    allocated_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'info', 'warning', 'error', 'success'
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(100),
    related_entity_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_infrastructures_territory ON infrastructures(territory_id);
CREATE INDEX idx_infrastructures_type ON infrastructures(type);
CREATE INDEX idx_projects_infrastructure ON projects(infrastructure_id);
CREATE INDEX idx_construction_phases_project ON construction_phases(project_id);
CREATE INDEX idx_material_requirements_phase ON material_requirements(phase_id);
CREATE INDEX idx_site_inspections_infrastructure ON site_inspections(infrastructure_id);
CREATE INDEX idx_site_inspections_inspector ON site_inspections(inspector_id);
CREATE INDEX idx_billing_reports_inspection ON billing_reports(site_inspection_id);
CREATE INDEX idx_transactions_budget ON transactions(budget_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name, record_id);

-- Create spatial indexes for geographic queries
CREATE INDEX idx_territories_coordinates ON territories USING GIST(coordinates);
CREATE INDEX idx_infrastructures_location ON infrastructures USING GIST(location);
CREATE INDEX idx_photos_coordinates ON photos USING GIST(gps_coordinates);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_territories_updated_at BEFORE UPDATE ON territories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_infrastructures_updated_at BEFORE UPDATE ON infrastructures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_construction_phases_updated_at BEFORE UPDATE ON construction_phases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_material_requirements_updated_at BEFORE UPDATE ON material_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_inspections_updated_at BEFORE UPDATE ON site_inspections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_reports_updated_at BEFORE UPDATE ON billing_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON risks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data for territories
INSERT INTO territories (name, coordinates, administrative_contact, logistics_hub) VALUES
('Inongo', ST_GeogFromText('POINT(18.2876 -2.0867)'), '{"name": "Administrator Inongo", "phone": "+243900000001", "email": "admin.inongo@maiNdombe.gov.cd"}', 'Inongo Central Hub'),
('Kutu', ST_GeogFromText('POINT(18.1896 -1.1853)'), '{"name": "Administrator Kutu", "phone": "+243900000002", "email": "admin.kutu@maiNdombe.gov.cd"}', 'Kutu Central Hub'),
('Mushie', ST_GeogFromText('POINT(16.9230 -3.0167)'), '{"name": "Administrator Mushie", "phone": "+243900000003", "email": "admin.mushie@maiNdombe.gov.cd"}', 'Mushie Central Hub'),
('Yumbi', ST_GeogFromText('POINT(16.4370 -2.7300)'), '{"name": "Administrator Yumbi", "phone": "+243900000004", "email": "admin.yumbi@maiNdombe.gov.cd"}', 'Yumbi Central Hub');

-- Insert technical specifications for different infrastructure types
INSERT INTO technical_specifications (infrastructure_type, specifications, version) VALUES
('administrative', '{
    "area": "400-600 sq meters",
    "floors": 2,
    "rooms": ["reception", "offices", "meeting_rooms", "archive", "toilets"],
    "utilities": ["electricity", "water", "internet"],
    "security": ["security_system", "gates", "lighting"],
    "accessibility": true
}', '1.0'),
('health_center', '{
    "area": "200-300 sq meters",
    "floors": 1,
    "rooms": ["reception", "consultation_rooms", "pharmacy", "maternity", "laboratory", "toilets"],
    "utilities": ["electricity", "water", "solar_backup"],
    "medical_equipment": ["basic_medical_equipment", "refrigeration"],
    "accessibility": true
}', '1.0'),
('primary_school', '{
    "area": "300-500 sq meters",
    "floors": 1,
    "rooms": ["classrooms", "office", "library", "toilets"],
    "capacity": "100-150 students",
    "utilities": ["electricity", "water"],
    "playground": true,
    "accessibility": true
}', '1.0');

-- Insert sample materials
INSERT INTO materials (name, category, unit, description) VALUES
('Cement', 'Construction', 'bag', 'Portland cement 50kg bags'),
('Steel Bars', 'Construction', 'ton', 'Reinforcement steel bars'),
('Bricks', 'Construction', 'piece', 'Clay bricks for construction'),
('Roofing Sheets', 'Construction', 'sheet', 'Corrugated iron sheets'),
('Paint', 'Finishing', 'liter', 'Exterior and interior paint'),
('Tiles', 'Finishing', 'sq meter', 'Floor and wall tiles'),
('Doors', 'Finishing', 'piece', 'Wooden doors with frames'),
('Windows', 'Finishing', 'piece', 'Glass windows with frames'),
('Electrical Cables', 'Electrical', 'meter', 'Electrical wiring cables'),
('Plumbing Pipes', 'Plumbing', 'meter', 'PVC pipes for plumbing');

-- Create function to calculate budget remaining
CREATE OR REPLACE FUNCTION update_budget_remaining()
RETURNS TRIGGER AS $$
BEGIN
    NEW.remaining = NEW.total_allocated - NEW.spent;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for budget calculations
CREATE TRIGGER update_budget_remaining_trigger BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_budget_remaining();

-- Create function to check measurement tolerance
CREATE OR REPLACE FUNCTION check_measurement_tolerance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expected_value IS NOT NULL AND NEW.tolerance IS NOT NULL THEN
        NEW.is_within_tolerance = ABS(NEW.actual_value - NEW.expected_value) <= NEW.tolerance;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for measurement tolerance checking
CREATE TRIGGER check_measurement_tolerance_trigger BEFORE INSERT OR UPDATE ON measurements
    FOR EACH ROW EXECUTE FUNCTION check_measurement_tolerance();

-- Create views for common queries
CREATE VIEW project_summary AS
SELECT 
    p.id,
    i.name as infrastructure_name,
    i.type as infrastructure_type,
    t.name as territory_name,
    p.status,
    p.start_date,
    p.expected_end_date,
    p.actual_end_date,
    b.total_allocated,
    b.spent,
    b.remaining,
    ROUND((b.spent / b.total_allocated * 100), 2) as budget_utilization_percent
FROM projects p
JOIN infrastructures i ON p.infrastructure_id = i.id
JOIN territories t ON i.territory_id = t.id
JOIN budgets b ON b.infrastructure_id = i.id;
