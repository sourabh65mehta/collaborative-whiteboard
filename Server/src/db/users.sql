CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL UNIQUE,
  username varchar(50) NOT NULL UNIQUE,
  password_hash varchar(128) NOT NULL,
  salt varchar(64) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
