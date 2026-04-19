CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  team_id INT REFERENCES teams(id),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  position VARCHAR(2),
  shooting INT,
  finishing INT,
  defense INT,
  passing INT,
  rebounding INT,
  stamina INT,
  speed INT,
  dribbling INT,
  overall INT
);