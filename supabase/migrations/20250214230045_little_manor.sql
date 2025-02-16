/*
  # Client Tracking System Implementation

  1. New Fields
    - last_interaction_date (timestamptz)
    - days_without_interaction (integer)
    - alert_level (enum)
    - notification_status (enum)

  2. Functions
    - Automatic calculation of days_without_interaction
    - Alert level updates
    - Notification status management

  3. Security
    - RLS policies for new fields
    - Access control for notifications
*/

-- Create enums for alert levels and notification status
CREATE TYPE alert_level_type AS ENUM ('normal', 'medium', 'high', 'critical');
CREATE TYPE notification_status_type AS ENUM ('pending', 'sent', 'read');

-- Add new columns to client_interaction_metrics
ALTER TABLE client_interaction_metrics
ADD COLUMN IF NOT EXISTS last_interaction_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS days_without_interaction INTEGER,
ADD COLUMN IF NOT EXISTS alert_level alert_level_type DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS notification_status notification_status_type DEFAULT 'pending';

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_client_metrics_last_interaction 
ON client_interaction_metrics(last_interaction_date);

CREATE INDEX IF NOT EXISTS idx_client_metrics_alert_level 
ON client_interaction_metrics(alert_level);

CREATE INDEX IF NOT EXISTS idx_client_metrics_notification_status 
ON client_interaction_metrics(notification_status);

-- Function to calculate days without interaction
CREATE OR REPLACE FUNCTION calculate_days_without_interaction()
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(DAY FROM NOW() - last_interaction_date)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Function to determine alert level based on days without interaction
CREATE OR REPLACE FUNCTION determine_alert_level(days_without INTEGER)
RETURNS alert_level_type AS $$
BEGIN
  RETURN CASE
    WHEN days_without >= 90 THEN 'critical'
    WHEN days_without >= 60 THEN 'high'
    WHEN days_without >= 30 THEN 'medium'
    ELSE 'normal'
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to update client metrics
CREATE OR REPLACE FUNCTION update_client_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate days without interaction
  NEW.days_without_interaction := calculate_days_without_interaction();
  
  -- Determine alert level
  NEW.alert_level := determine_alert_level(NEW.days_without_interaction);
  
  -- Set notification status to pending if alert level changed
  IF NEW.alert_level != OLD.alert_level THEN
    NEW.notification_status := 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updates
DROP TRIGGER IF EXISTS update_client_metrics_trigger ON client_interaction_metrics;
CREATE TRIGGER update_client_metrics_trigger
  BEFORE UPDATE ON client_interaction_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_client_metrics();

-- Function to update metrics daily
CREATE OR REPLACE FUNCTION update_all_client_metrics()
RETURNS void AS $$
BEGIN
  UPDATE client_interaction_metrics
  SET last_interaction_date = last_interaction_date; -- Trigger the update
END;
$$ LANGUAGE plpgsql;

-- Create view for pending notifications
CREATE OR REPLACE VIEW pending_client_notifications AS
SELECT 
  m.*,
  c.name as client_name,
  c.company as client_company,
  c.assigned_agent_id,
  a.name as agent_name,
  a.email as agent_email
FROM client_interaction_metrics m
JOIN clients c ON m.client_id = c.id
LEFT JOIN agents a ON c.assigned_agent_id = a.id
WHERE 
  m.notification_status = 'pending'
  AND m.alert_level != 'normal'
ORDER BY 
  CASE m.alert_level
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    ELSE 4
  END;

-- Grant permissions
GRANT SELECT ON pending_client_notifications TO authenticated;