-- Club schema.
--
-- There is no migration runner in this repo. Apply this file once against your
-- database, then re-apply it any time you want the IF NOT EXISTS guards to be
-- a no-op:
--
--    psql "$CONNECTION_STRING" -f backend/sql/schema.sql
--
-- PostgreSQL 13+ exposes gen_random_uuid() as a built-in function. If an older
-- server is used, enable pgcrypto before applying this schema.

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
   user_id    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
   email      VARCHAR(254) NOT NULL UNIQUE,
   username   VARCHAR(32)  NOT NULL UNIQUE,
   password   VARCHAR(255) NOT NULL,
   avatar_url TEXT,
   is_member  BOOLEAN      NOT NULL DEFAULT FALSE,
   is_admin   BOOLEAN      NOT NULL DEFAULT FALSE
);

-- ---------------------------------------------------------------------------
-- Membership + admin flags
-- ---------------------------------------------------------------------------
-- Guarded: on a database where these columns already exist this is a no-op.
-- Without this, req.user.is_admin resolves to `undefined`, every guard in
-- messageMiddleware.ts passes, and the access control silently disappears.

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_member BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin  BOOLEAN NOT NULL DEFAULT FALSE;

-- ---------------------------------------------------------------------------
-- Messages
-- ---------------------------------------------------------------------------
-- user_id is nullable: a message can outlive its author, and an admin can delete
-- messages from an account that was removed. ON DELETE SET NULL keeps the post
-- readable (as an anonymous orphan) instead of cascading it away.

CREATE TABLE IF NOT EXISTS messages (
   message_id   BIGSERIAL   PRIMARY KEY,
   user_id      UUID        REFERENCES users (user_id) ON DELETE SET NULL,
   title        VARCHAR(120) NOT NULL,
   message      TEXT        NOT NULL,
   is_anonymous BOOLEAN     NOT NULL DEFAULT FALSE,
   created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Older development databases used unseparated column names and called the
-- body `content`. CREATE TABLE IF NOT EXISTS does not update an existing table,
-- so migrate those columns in place without discarding any posts.
DO $$
BEGIN
   IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = 'messages' AND column_name = 'messageid'
   ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = 'messages' AND column_name = 'message_id'
   ) THEN
      ALTER TABLE messages RENAME COLUMN messageid TO message_id;
   END IF;

   IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = 'messages' AND column_name = 'userid'
   ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = 'messages' AND column_name = 'user_id'
   ) THEN
      ALTER TABLE messages RENAME COLUMN userid TO user_id;
   END IF;

   IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = 'messages' AND column_name = 'content'
   ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = 'messages' AND column_name = 'message'
   ) THEN
      ALTER TABLE messages RENAME COLUMN content TO message;
   END IF;

   IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = 'messages' AND column_name = 'createdat'
   ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = 'messages' AND column_name = 'created_at'
   ) THEN
      ALTER TABLE messages RENAME COLUMN createdat TO created_at;
   END IF;
END
$$;

ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT FALSE;

-- Bring legacy constraints in line with the current model. Anonymous orphaned
-- posts remain readable after a user is deleted, hence ON DELETE SET NULL.
ALTER TABLE messages DROP CONSTRAINT IF EXISTS fk_messages_user;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_user_id_fkey;
ALTER TABLE messages ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE messages
   ADD CONSTRAINT messages_user_id_fkey
   FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL;

UPDATE messages SET message = '' WHERE message IS NULL;
ALTER TABLE messages ALTER COLUMN message TYPE TEXT;
ALTER TABLE messages ALTER COLUMN message SET NOT NULL;
ALTER TABLE messages ALTER COLUMN created_at SET DEFAULT NOW();

-- The feed is always ordered by recency, so index the sort key. message_id is
-- the tie-breaker: without it, rows sharing a created_at can shuffle between
-- pages and show up twice.
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages (created_at DESC, message_id DESC);

-- ---------------------------------------------------------------------------
-- Sessions (connect-pg-simple)
-- ---------------------------------------------------------------------------
-- Column names and types are dictated by connect-pg-simple. `expire` is used
-- for periodic cleanup, so it gets its own index.

CREATE TABLE IF NOT EXISTS session (
   sid    VARCHAR     NOT NULL COLLATE "default" PRIMARY KEY,
   sess   JSON        NOT NULL,
   expire TIMESTAMP(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS session_expire_idx ON session (expire);

-- ---------------------------------------------------------------------------
-- Seed an admin
-- ---------------------------------------------------------------------------
-- The app has no admin-management UI, so there is no way to become the first
-- admin through the product itself. Register normally, then run this by hand.

-- UPDATE users SET is_admin = TRUE WHERE username = 'your-username';
