-- Create notifications log table
CREATE TABLE notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('reminder_24h', 'reminder_2h', 'event_update', 'organizer_message', 'phone_verification')),
  channel VARCHAR(20) NOT NULL DEFAULT 'sms' CHECK (channel IN ('sms', 'email')),
  message TEXT NOT NULL,
  twilio_sid TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'delivered', 'failed', 'undelivered')),
  error_message TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for efficient lookups
CREATE INDEX idx_notifications_log_user_id ON notifications_log(user_id);
CREATE INDEX idx_notifications_log_event_id ON notifications_log(event_id);
CREATE INDEX idx_notifications_log_type ON notifications_log(type);
CREATE INDEX idx_notifications_log_status ON notifications_log(status);
CREATE INDEX idx_notifications_log_scheduled_for ON notifications_log(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX idx_notifications_log_twilio_sid ON notifications_log(twilio_sid) WHERE twilio_sid IS NOT NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_notifications_log_updated_at
  BEFORE UPDATE ON notifications_log
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_log_updated_at();