/*
  # Create greetings table

  1. New Tables
    - `greetings`
      - `id` (uuid, primary key) - unique identifier for each greeting
      - `message` (text) - the greeting message text
      - `created_at` (timestamptz) - timestamp when the greeting was added
  
  2. Security
    - Enable RLS on `greetings` table
    - Add policy for public read access since greetings are meant to be displayed to users
  
  3. Initial Data
    - Populate table with 10 fun greeting messages
*/

CREATE TABLE IF NOT EXISTS greetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE greetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read greetings"
  ON greetings
  FOR SELECT
  USING (true);

-- Insert 10 fun greetings
INSERT INTO greetings (message) VALUES
  ('Hey there, superstar! Ready to conquer the day?'),
  ('Greetings, earthling! Hope your day is out of this world!'),
  ('Howdy, partner! Time to wrangle some tasks!'),
  ('Bonjour! Let''s make today magnifique!'),
  ('Well hello there, you wonderful human!'),
  ('*Tips hat* Good to see you around these parts!'),
  ('Ahoy! All aboard the productivity ship!'),
  ('Hiya! Let''s turn that coffee into code!'),
  ('Salutations! Your presence has been detected and appreciated!'),
  ('What''s up, legend? Let''s make some magic happen!')
ON CONFLICT DO NOTHING;