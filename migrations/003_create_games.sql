CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  home_team_id INT REFERENCES teams(id),
  away_team_id INT REFERENCES teams(id),
  scheduled_at TIMESTAMP,
  is_simulated BOOLEAN DEFAULT false,
  home_score INT,
  away_score INT,
  result_json JSONB
);