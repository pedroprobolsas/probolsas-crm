/*
  # Client Tracking System Implementation

  1. New Tables
    - client_metrics (base table for storing metrics)
    - client_notifications (for tracking notification status)

  2. Views
    - client_interaction_metrics (aggregated view of client interactions)
    - pending_client_notifications (filtered view for pending notifications)

  3. Functions and Triggers
    - Automatic calculation of days without interaction
    - Alert level updates
    - Notification status management
*/

-- Create enums for alert levels and notification status
CREATE TYPE alert_level_type AS ENUM ('normal', 'medium', 'high', 'critical');
CREATE TYPE notification_status_type AS ENUM ('pending', 'sent', 'read');

-- Create base metrics table
CREATE TABLE IF NOT EXISTS client_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  last_interaction_date TIMESTAMPTZ,
  days_without_interaction INTEGER,
  alert_level alert_level_type DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS client_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  alert_level alert_level_type NOT NULL,
  notification_status notification_status_type DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_client_metrics_client_id 
ON client_metrics(client_id);

CREATE INDEX IF NOT EXISTS idx_client_metrics_alert_level 
ON client_metrics(alert_level);

CREATE INDEX IF NOT EXISTS idx_client_metrics_last_interaction 
ON client_metrics(last_interaction_date);

CREATE INDEX IF NOT EXISTS idx_client_notifications_status 
ON client_notifications(notification_status);

CREATE INDEX IF NOT EXISTS idx_client_notifications_client_id 
ON client_notifications(client_id);

-- Function to calculate days without interaction
CREATE OR REPLACE FUNCTION calculate_days_without_interaction(last_date TIMESTAMPTZ)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(DAY FROM NOW() - last_date)::INTEGER;
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
  NEW.days_without_interaction := calculate_days_without_interaction(NEW.last_interaction_date);
  
  -- Determine alert level
  NEW.alert_level := determine_alert_level(NEW.days_without_interaction);
  
  -- Create notification if alert level changed to higher severity
  IF NEW.alert_level != OLD.alert_level AND 
     NEW.alert_level IN ('medium', 'high', 'critical') THEN
    INSERT INTO client_notifications (
      client_id,
      alert_level,
      message
    ) VALUES (
      NEW.client_id,
      NEW.alert_level,
      CASE NEW.alert_level
        WHEN 'critical' THEN 'Cliente sin interacción por más de 90 días'
        WHEN 'high' THEN 'Cliente sin interacción por más de 60 días'
        WHEN 'medium' THEN 'Cliente sin interacción por más de 30 días'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updates
DROP TRIGGER IF EXISTS update_client_metrics_trigger ON client_metrics;
CREATE TRIGGER update_client_metrics_trigger
  BEFORE UPDATE ON client_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_client_metrics();

-- Create view for client interaction metrics
CREATE OR REPLACE VIEW client_interaction_metrics AS
SELECT 
  m.*,
  c.name as client_name,
  c.company as client_company,
  c.assigned_agent_id,
  a.name as agent_name,
  a.email as agent_email
FROM client_metrics m
JOIN clients c ON m.client_id = c.id
LEFT JOIN agents a ON c.assigned_agent_id = a.id;

-- Create view for pending notifications
CREATE OR REPLACE VIEW pending_client_notifications AS
SELECT 
  n.*,
  c.name as client_name,
  c.company as client_company,
  c.assigned_agent_id,
  a.name as agent_name,
  a.email as agent_email,
  m.days_without_interaction
FROM client_notifications n
JOIN clients c ON n.client_id = c.id
LEFT JOIN agents a ON c.assigned_agent_id = a.id
LEFT JOIN client_metrics m ON n.client_id = m.client_id
WHERE 
  n.notification_status = 'pending'
ORDER BY 
  CASE n.alert_level
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    ELSE 4
  END;

-- Function to update all client metrics
CREATE OR REPLACE FUNCTION update_all_client_metrics()
RETURNS void AS $$
BEGIN
  UPDATE client_metrics
  SET last_interaction_date = last_interaction_date
  WHERE last_interaction_date IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE client_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can read metrics"
  ON client_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read notifications"
  ON client_notifications FOR SELECT
  TO authenticated
  USING (true);

-- Grant permissions
GRANT SELECT ON client_interaction_metrics TO authenticated;
GRANT SELECT ON pending_client_notifications TO authenticated;