-- ============================================================
-- CodeVault - Initial Database Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for text search on code


-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE language_enum AS ENUM (
  'python', 'java', 'c', 'cpp', 'javascript', 'typescript', 'other'
);

CREATE TYPE ai_mode_enum AS ENUM (
  'beginner', 'detailed', 'exam'
);

CREATE TYPE message_role_enum AS ENUM (
  'user', 'assistant'
);

CREATE TYPE difficulty_enum AS ENUM (
  'easy', 'medium', 'hard'
);

CREATE TYPE quiz_type_enum AS ENUM (
  'mcq', 'output_prediction', 'fill_blanks', 'debug_challenge', 'mock_exam'
);

CREATE TYPE session_type_enum AS ENUM (
  'quick', 'flashcard', 'mcq', 'viva'
);


-- ============================================================
-- TABLE: users
-- Extends Supabase auth.users
-- ============================================================
CREATE TABLE public.users (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT        UNIQUE NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users: select own"  ON public.users FOR SELECT  USING (auth.uid() = id);
CREATE POLICY "users: update own"  ON public.users FOR UPDATE  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "users: insert own"  ON public.users FOR INSERT  WITH CHECK (auth.uid() = id);


-- ============================================================
-- TABLE: subjects
-- ============================================================
CREATE TABLE public.subjects (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name              TEXT        NOT NULL,
  description       TEXT,
  semester          TEXT,
  color             TEXT        NOT NULL DEFAULT '#6B7280',  -- grayscale tailwind shade hex
  experiment_count  INT         NOT NULL DEFAULT 0,          -- maintained via trigger
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subjects: all own" ON public.subjects
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_subjects_user_id   ON public.subjects(user_id);
CREATE INDEX idx_subjects_created_at ON public.subjects(created_at);


-- ============================================================
-- TABLE: experiments
-- ============================================================
CREATE TABLE public.experiments (
  id                UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID            NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id        UUID            NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title             TEXT            NOT NULL,
  experiment_number INT,
  topic             TEXT,
  language          language_enum   NOT NULL DEFAULT 'other',
  aim               TEXT,
  theory            TEXT,
  algorithm         TEXT,
  source_code       TEXT,
  sample_input      TEXT,
  expected_output   TEXT,
  actual_output     TEXT,
  observations      TEXT,
  personal_notes    TEXT,
  time_complexity   TEXT,
  space_complexity  TEXT,
  is_bookmarked     BOOLEAN         NOT NULL DEFAULT FALSE,
  is_revised        BOOLEAN         NOT NULL DEFAULT FALSE,
  revision_count    INT             NOT NULL DEFAULT 0,
  last_opened_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "experiments: all own" ON public.experiments
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_experiments_user_id      ON public.experiments(user_id);
CREATE INDEX idx_experiments_subject_id   ON public.experiments(subject_id);
CREATE INDEX idx_experiments_language     ON public.experiments(language);
CREATE INDEX idx_experiments_created_at   ON public.experiments(created_at);
CREATE INDEX idx_experiments_is_bookmarked ON public.experiments(is_bookmarked) WHERE is_bookmarked = TRUE;
CREATE INDEX idx_experiments_is_revised    ON public.experiments(is_revised);
-- GIN index for full-text search on code
CREATE INDEX idx_experiments_source_code_trgm ON public.experiments USING GIN (source_code gin_trgm_ops);
CREATE INDEX idx_experiments_title_trgm        ON public.experiments USING GIN (title gin_trgm_ops);


-- ============================================================
-- TABLE: experiment_files
-- ============================================================
CREATE TABLE public.experiment_files (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id  UUID        NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  user_id        UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  filename       TEXT        NOT NULL,
  file_path      TEXT        NOT NULL,  -- Supabase Storage path
  file_size      BIGINT,               -- bytes
  file_type      TEXT,                 -- MIME type
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.experiment_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "experiment_files: all own" ON public.experiment_files
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_experiment_files_experiment_id ON public.experiment_files(experiment_id);
CREATE INDEX idx_experiment_files_user_id       ON public.experiment_files(user_id);


-- ============================================================
-- TABLE: experiment_notes
-- ============================================================
CREATE TABLE public.experiment_notes (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id  UUID        NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  user_id        UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content        TEXT        NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.experiment_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "experiment_notes: all own" ON public.experiment_notes
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_experiment_notes_experiment_id ON public.experiment_notes(experiment_id);
CREATE INDEX idx_experiment_notes_user_id       ON public.experiment_notes(user_id);


-- ============================================================
-- TABLE: ai_explanations
-- ============================================================
CREATE TABLE public.ai_explanations (
  id                    UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id         UUID          NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  user_id               UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mode                  ai_mode_enum  NOT NULL DEFAULT 'detailed',
  program_overview      TEXT,
  simple_explanation    TEXT,
  line_by_line          TEXT,
  logic_breakdown       TEXT,
  execution_flow        TEXT,
  variables_and_functions TEXT,
  algorithm_explanation TEXT,
  io_explanation        TEXT,
  time_complexity       TEXT,
  space_complexity      TEXT,
  common_mistakes       TEXT,
  exam_points           TEXT,
  raw_response          JSONB,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  -- One explanation per (experiment, user, mode) combination
  UNIQUE (experiment_id, user_id, mode)
);

ALTER TABLE public.ai_explanations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_explanations: all own" ON public.ai_explanations
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ai_explanations_experiment_id ON public.ai_explanations(experiment_id);
CREATE INDEX idx_ai_explanations_user_id       ON public.ai_explanations(user_id);


-- ============================================================
-- TABLE: conversations
-- ============================================================
CREATE TABLE public.conversations (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  experiment_id  UUID        REFERENCES public.experiments(id) ON DELETE SET NULL,  -- nullable
  title          TEXT        NOT NULL DEFAULT 'New Chat',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations: all own" ON public.conversations
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_conversations_user_id       ON public.conversations(user_id);
CREATE INDEX idx_conversations_experiment_id ON public.conversations(experiment_id);
CREATE INDEX idx_conversations_created_at    ON public.conversations(created_at);


-- ============================================================
-- TABLE: messages
-- ============================================================
CREATE TABLE public.messages (
  id               UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id  UUID               NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role             message_role_enum  NOT NULL,
  content          TEXT               NOT NULL,
  metadata         JSONB,             -- token counts, model info, etc.
  created_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages RLS: join through conversations
CREATE POLICY "messages: all own" ON public.messages
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND c.user_id = auth.uid()
    )
  );

CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at      ON public.messages(created_at);


-- ============================================================
-- TABLE: flashcards
-- ============================================================
CREATE TABLE public.flashcards (
  id              UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id   UUID             NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  user_id         UUID             NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  question        TEXT             NOT NULL,
  answer          TEXT             NOT NULL,
  difficulty      difficulty_enum  NOT NULL DEFAULT 'medium',
  times_shown     INT              NOT NULL DEFAULT 0,
  times_correct   INT              NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flashcards: all own" ON public.flashcards
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_flashcards_experiment_id ON public.flashcards(experiment_id);
CREATE INDEX idx_flashcards_user_id       ON public.flashcards(user_id);
CREATE INDEX idx_flashcards_difficulty    ON public.flashcards(difficulty);


-- ============================================================
-- TABLE: quizzes
-- ============================================================
CREATE TABLE public.quizzes (
  id             UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id  UUID            REFERENCES public.experiments(id) ON DELETE CASCADE,   -- nullable
  subject_id     UUID            REFERENCES public.subjects(id) ON DELETE CASCADE,      -- nullable
  user_id        UUID            NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quiz_type      quiz_type_enum  NOT NULL DEFAULT 'mcq',
  title          TEXT            NOT NULL,
  created_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  -- At least one of experiment_id or subject_id must be set
  CONSTRAINT quizzes_scope_check CHECK (experiment_id IS NOT NULL OR subject_id IS NOT NULL)
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quizzes: all own" ON public.quizzes
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_quizzes_experiment_id ON public.quizzes(experiment_id);
CREATE INDEX idx_quizzes_subject_id    ON public.quizzes(subject_id);
CREATE INDEX idx_quizzes_user_id       ON public.quizzes(user_id);


-- ============================================================
-- TABLE: quiz_questions
-- ============================================================
CREATE TABLE public.quiz_questions (
  id             UUID   PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id        UUID   NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text  TEXT   NOT NULL,
  option_a       TEXT,
  option_b       TEXT,
  option_c       TEXT,
  option_d       TEXT,
  correct_option CHAR(1),  -- 'A', 'B', 'C', or 'D'
  explanation    TEXT,
  code_snippet   TEXT,
  order_index    INT    NOT NULL DEFAULT 0,
  CONSTRAINT quiz_questions_correct_option_check
    CHECK (correct_option IS NULL OR correct_option IN ('A','B','C','D'))
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Quiz questions RLS: join through quizzes
CREATE POLICY "quiz_questions: all own" ON public.quiz_questions
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_questions.quiz_id
        AND q.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_questions.quiz_id
        AND q.user_id = auth.uid()
    )
  );

CREATE INDEX idx_quiz_questions_quiz_id     ON public.quiz_questions(quiz_id);
CREATE INDEX idx_quiz_questions_order_index ON public.quiz_questions(quiz_id, order_index);


-- ============================================================
-- TABLE: quiz_attempts
-- ============================================================
CREATE TABLE public.quiz_attempts (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id          UUID        NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score            NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_questions  INT         NOT NULL DEFAULT 0,
  time_taken_seconds INT,
  answers          JSONB,      -- {"question_id": "A", ...}
  completed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_attempts: all own" ON public.quiz_attempts
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_quiz_attempts_quiz_id      ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_user_id      ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_completed_at ON public.quiz_attempts(completed_at);


-- ============================================================
-- TABLE: revision_sessions
-- ============================================================
CREATE TABLE public.revision_sessions (
  id              UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID               NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  experiment_id   UUID               NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  scheduled_date  DATE               NOT NULL,
  completed_at    TIMESTAMPTZ,       -- NULL means not yet completed
  session_type    session_type_enum  NOT NULL DEFAULT 'quick',
  notes           TEXT,
  created_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

ALTER TABLE public.revision_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "revision_sessions: all own" ON public.revision_sessions
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_revision_sessions_user_id       ON public.revision_sessions(user_id);
CREATE INDEX idx_revision_sessions_experiment_id ON public.revision_sessions(experiment_id);
CREATE INDEX idx_revision_sessions_scheduled_date ON public.revision_sessions(scheduled_date);


-- ============================================================
-- TABLE: exam_schedules
-- ============================================================
CREATE TABLE public.exam_schedules (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id       UUID        REFERENCES public.subjects(id) ON DELETE SET NULL,  -- nullable
  exam_name        TEXT        NOT NULL,
  exam_date        DATE        NOT NULL,
  experiment_ids   UUID[]      NOT NULL DEFAULT '{}',  -- array of experiment UUIDs to revise
  reminder_days    INT         NOT NULL DEFAULT 3,
  is_completed     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.exam_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exam_schedules: all own" ON public.exam_schedules
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_exam_schedules_user_id    ON public.exam_schedules(user_id);
CREATE INDEX idx_exam_schedules_subject_id ON public.exam_schedules(subject_id);
CREATE INDEX idx_exam_schedules_exam_date  ON public.exam_schedules(exam_date);


-- ============================================================
-- TABLE: bookmarks
-- ============================================================
CREATE TABLE public.bookmarks (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  experiment_id  UUID        NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Prevent duplicate bookmarks
  UNIQUE (user_id, experiment_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookmarks: all own" ON public.bookmarks
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_bookmarks_user_id       ON public.bookmarks(user_id);
CREATE INDEX idx_bookmarks_experiment_id ON public.bookmarks(experiment_id);
CREATE INDEX idx_bookmarks_created_at    ON public.bookmarks(created_at);


-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- ---- 1. Auto-create users row on auth.users insert ----
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      SPLIT_PART(NEW.email, '@', 1)  -- fall back to email prefix
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ---- 2. updated_at auto-update trigger function ----
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER set_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_experiments_updated_at
  BEFORE UPDATE ON public.experiments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_experiment_notes_updated_at
  BEFORE UPDATE ON public.experiment_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_ai_explanations_updated_at
  BEFORE UPDATE ON public.ai_explanations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ---- 3. Keep subjects.experiment_count in sync ----
CREATE OR REPLACE FUNCTION public.update_subject_experiment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.subjects
    SET experiment_count = experiment_count + 1
    WHERE id = NEW.subject_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.subjects
    SET experiment_count = GREATEST(experiment_count - 1, 0)
    WHERE id = OLD.subject_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.subject_id <> OLD.subject_id THEN
    -- Moved to a different subject
    UPDATE public.subjects
    SET experiment_count = GREATEST(experiment_count - 1, 0)
    WHERE id = OLD.subject_id;
    UPDATE public.subjects
    SET experiment_count = experiment_count + 1
    WHERE id = NEW.subject_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_experiment_count
  AFTER INSERT OR DELETE OR UPDATE OF subject_id ON public.experiments
  FOR EACH ROW EXECUTE FUNCTION public.update_subject_experiment_count();


-- ---- 4. Sync bookmarks.is_bookmarked to experiments.is_bookmarked ----
CREATE OR REPLACE FUNCTION public.sync_experiment_bookmark_flag()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.experiments SET is_bookmarked = TRUE  WHERE id = NEW.experiment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.experiments SET is_bookmarked = FALSE WHERE id = OLD.experiment_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_sync_bookmark_flag
  AFTER INSERT OR DELETE ON public.bookmarks
  FOR EACH ROW EXECUTE FUNCTION public.sync_experiment_bookmark_flag();


-- ---- 5. Sync revision_sessions completion to experiments.is_revised ----
CREATE OR REPLACE FUNCTION public.sync_experiment_revised_flag()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    UPDATE public.experiments
    SET
      is_revised     = TRUE,
      revision_count = revision_count + 1
    WHERE id = NEW.experiment_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_sync_revised_flag
  AFTER UPDATE ON public.revision_sessions
  FOR EACH ROW EXECUTE FUNCTION public.sync_experiment_revised_flag();


-- ============================================================
-- HELPER VIEWS
-- ============================================================

-- Experiments with subject name and revision progress
CREATE OR REPLACE VIEW public.experiments_with_subject AS
SELECT
  e.*,
  s.name        AS subject_name,
  s.color       AS subject_color,
  s.semester    AS subject_semester
FROM public.experiments e
JOIN public.subjects s ON s.id = e.subject_id;

-- Flashcard accuracy per experiment
CREATE OR REPLACE VIEW public.flashcard_stats AS
SELECT
  experiment_id,
  user_id,
  COUNT(*)                                                AS total_cards,
  SUM(times_shown)                                        AS total_shown,
  SUM(times_correct)                                      AS total_correct,
  ROUND(
    CASE WHEN SUM(times_shown) = 0 THEN 0
         ELSE SUM(times_correct)::NUMERIC / SUM(times_shown) * 100
    END, 1
  )                                                       AS accuracy_pct,
  COUNT(*) FILTER (WHERE difficulty = 'easy')             AS easy_count,
  COUNT(*) FILTER (WHERE difficulty = 'medium')           AS medium_count,
  COUNT(*) FILTER (WHERE difficulty = 'hard')             AS hard_count
FROM public.flashcards
GROUP BY experiment_id, user_id;


-- ============================================================
-- STORAGE BUCKETS (run after enabling Storage extension)
-- These are created via Supabase dashboard or CLI, not SQL.
-- See README for bucket setup instructions.
-- ============================================================
