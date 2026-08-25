-- Create platform_policies table
CREATE TABLE platform_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL UNIQUE, -- 'operator_agreement', 'global_terms', 'privacy_policy'
    version INTEGER NOT NULL DEFAULT 1,
    content TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create cancellation_tiers table
CREATE TABLE cancellation_tiers (
    id TEXT PRIMARY KEY, -- 'FLEXIBLE', 'MODERATE', 'STRICT', 'NON_REFUNDABLE'
    name TEXT NOT NULL,
    cutoff_hours INTEGER NOT NULL,
    refund_percentage INTEGER NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default cancellation tiers
INSERT INTO cancellation_tiers (id, name, cutoff_hours, refund_percentage) VALUES
('FLEXIBLE', 'Flexible', 24, 100),
('MODERATE', 'Moderate', 168, 100), -- 7 days * 24 hours
('STRICT', 'Strict', 336, 100), -- 14 days * 24 hours
('NON_REFUNDABLE', 'Non-Refundable', 0, 0);

-- Add agreed_policy_version to hosts
ALTER TABLE hosts ADD COLUMN agreed_policy_version INTEGER DEFAULT 0;

-- Insert default policies
INSERT INTO platform_policies (type, version, content) VALUES
('operator_agreement', 1, 'Default Operator Agreement Content'),
('global_terms', 1, 'Default Global Terms Content'),
('privacy_policy', 1, 'Default Privacy Policy Content');
