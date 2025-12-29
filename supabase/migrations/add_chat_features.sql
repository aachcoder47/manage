-- Chat Messages Table
CREATE TABLE chat_message (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    sender_id UUID REFERENCES "user"(id) NOT NULL, -- auth.uid() usually
    receiver_id UUID REFERENCES "user"(id) NOT NULL,
    work_trial_id TEXT REFERENCES work_trial(id), -- Optional context
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE chat_message ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own messages" ON chat_message
FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
);

CREATE POLICY "Users can send messages" ON chat_message
FOR INSERT WITH CHECK (
    auth.uid() = sender_id
);
