-- Create event messages table
CREATE TABLE event_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(30) DEFAULT 'organizer_message' CHECK (message_type IN ('organizer_message', 'event_update', 'system_message')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for efficient lookups
CREATE INDEX idx_event_messages_event_id ON event_messages(event_id);
CREATE INDEX idx_event_messages_sender_id ON event_messages(sender_id);
CREATE INDEX idx_event_messages_created_at ON event_messages(created_at);
CREATE INDEX idx_event_messages_message_type ON event_messages(message_type);

-- Create composite index for event messages ordered by time
CREATE INDEX idx_event_messages_event_time ON event_messages(event_id, created_at DESC);