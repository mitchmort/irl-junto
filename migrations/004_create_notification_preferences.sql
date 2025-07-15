-- Create notification preferences table
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sms_reminders BOOLEAN DEFAULT true,
  sms_event_updates BOOLEAN DEFAULT true,
  sms_organizer_messages BOOLEAN DEFAULT true,
  reminder_24h BOOLEAN DEFAULT true,
  reminder_2h BOOLEAN DEFAULT true,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create indexes for efficient lookups
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Create function to automatically create notification preferences for new users
CREATE OR REPLACE FUNCTION create_notification_preferences_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create notification preferences
CREATE TRIGGER trigger_create_notification_preferences
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_preferences_for_user();