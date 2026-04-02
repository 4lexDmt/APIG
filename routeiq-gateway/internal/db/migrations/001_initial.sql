CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  plan_tier   TEXT NOT NULL DEFAULT 'free',
  monthly_budget_usd NUMERIC(10,4),
  wallet_address TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE teams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  budget_pool_usd NUMERIC(10,4),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE agents (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id               UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  api_key_hash          TEXT NOT NULL UNIQUE,
  api_key_prefix        TEXT NOT NULL,
  daily_budget_usd      NUMERIC(10,4),
  circuit_breaker_config JSONB NOT NULL DEFAULT '{"max_requests": 100, "window_seconds": 60}',
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE api_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id        UUID NOT NULL REFERENCES agents(id),
  provider        TEXT NOT NULL,
  model           TEXT NOT NULL,
  input_tokens    INTEGER,
  output_tokens   INTEGER,
  cost_usd        NUMERIC(10,6),
  latency_ms      INTEGER,
  cached          BOOLEAN NOT NULL DEFAULT FALSE,
  stream          BOOLEAN NOT NULL DEFAULT FALSE,
  status_code     INTEGER NOT NULL,
  error_code      TEXT,
  trace_id        TEXT,
  routed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cost_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    UUID NOT NULL REFERENCES agents(id),
  request_id  UUID NOT NULL REFERENCES api_requests(id),
  amount_usd  NUMERIC(10,6) NOT NULL,
  provider    TEXT NOT NULL,
  logged_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_requests_agent_id_routed_at ON api_requests(agent_id, routed_at DESC);
CREATE INDEX idx_api_requests_routed_at ON api_requests(routed_at DESC);
CREATE INDEX idx_cost_logs_agent_id ON cost_logs(agent_id);
