CREATE TABLE IF NOT EXISTS notes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  content varchar(500) NOT NULL CHECK (length(trim(content)) > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
