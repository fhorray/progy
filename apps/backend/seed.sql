INSERT OR REPLACE INTO user (id, name, email, email_verified, created_at, updated_at)
VALUES ('user_123', 'Test User', 'test@example.com', 1, 1700000000000, 1700000000000);

INSERT OR REPLACE INTO session (id, token, user_id, expires_at, created_at, updated_at)
VALUES ('session_123', 'test-token-123', 'user_123', 2000000000000, 1700000000000, 1700000000000);
