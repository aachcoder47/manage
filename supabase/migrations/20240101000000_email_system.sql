-- Email preferences table
CREATE TABLE email_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
    organization_id TEXT REFERENCES organization(id) ON DELETE CASCADE,
    product_updates BOOLEAN DEFAULT true,
    hiring_updates BOOLEAN DEFAULT true,
    marketing BOOLEAN DEFAULT false,
    transactional BOOLEAN DEFAULT true, -- account signup, password reset, etc.
    weekly_summary BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, organization_id)
);

-- Email log table
CREATE TABLE email_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES "user"(id),
    organization_id TEXT REFERENCES organization(id),
    email_type TEXT NOT NULL, -- 'welcome', 'application_received', 'interview_invite', etc.
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL, -- 'sent', 'failed', 'bounced'
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Email types enum
CREATE TYPE email_type AS ENUM (
    'welcome',
    'password_reset',
    'application_received',
    'interview_invite',
    'interview_completed',
    'screening_completed',
    'trial_assigned',
    'trial_result',
    'contract_sent',
    'weekly_summary',
    'product_update',
    'marketing'
);

-- Update email_log to use enum
ALTER TABLE email_log ALTER COLUMN email_type TYPE email_type USING email_type::email_type;

-- Indexes for better performance
CREATE INDEX idx_email_preferences_user_id ON email_preferences(user_id);
CREATE INDEX idx_email_preferences_org_id ON email_preferences(organization_id);
CREATE INDEX idx_email_log_user_id ON email_log(user_id);
CREATE INDEX idx_email_log_org_id ON email_log(organization_id);
CREATE INDEX idx_email_log_email_type ON email_log(email_type);
CREATE INDEX idx_email_log_created_at ON email_log(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_email_preferences_updated_at 
    BEFORE UPDATE ON email_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Default email preferences for new users
CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO email_preferences (user_id, organization_id)
    VALUES (NEW.id, NEW.organization_id)
    ON CONFLICT (user_id, organization_id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create default preferences when user is created
CREATE TRIGGER create_user_email_preferences
    AFTER INSERT ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION create_default_email_preferences();
