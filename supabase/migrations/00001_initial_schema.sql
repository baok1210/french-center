-- =====================================================
-- FRENCH CENTER PERFORMANCE APP - INITIAL SCHEMA
-- =====================================================

-- 1. CUSTOM TYPES
CREATE TYPE user_role AS ENUM ('Admin', 'TeacherTA', 'Student');

-- 2. PROFILES TABLE (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'Student',
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. CLASSES / SESSIONS
CREATE TABLE class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  teacher_id UUID NOT NULL REFERENCES profiles(id),
  level TEXT NOT NULL CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;

-- 4. ENROLLMENTS (links students to classes)
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  class_session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, class_session_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- 5. EVALUATIONS TABLE (core rubric scoring)
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  class_session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id),

  -- Production Orale (1-5 scale)
  pronunciation INT NOT NULL CHECK (pronunciation BETWEEN 1 AND 5),
  fluency INT NOT NULL CHECK (fluency BETWEEN 1 AND 5),
  vocabulary_oral INT NOT NULL CHECK (vocabulary_oral BETWEEN 1 AND 5),

  -- Production Écrite (1-5 scale)
  grammar_conjugation INT NOT NULL CHECK (grammar_conjugation BETWEEN 1 AND 5),
  structure INT NOT NULL CHECK (structure BETWEEN 1 AND 5),
  spelling INT NOT NULL CHECK (spelling BETWEEN 1 AND 5),

  -- Compréhension
  classwork_completion_rate FLOAT NOT NULL CHECK (classwork_completion_rate BETWEEN 0 AND 100),
  comprehension_rate INT NOT NULL CHECK (comprehension_rate BETWEEN 1 AND 5),

  -- Attitude
  attendance BOOLEAN NOT NULL DEFAULT false,
  engagement INT NOT NULL CHECK (engagement BETWEEN 1 AND 5),
  homework_status BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  notes TEXT,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  session_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(student_id, class_session_id)
);

ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- 6. KNOWLEDGE GAPS (automated tagging)
CREATE TABLE knowledge_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  gap_tag TEXT NOT NULL,
  detected_at DATE NOT NULL,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE knowledge_gaps ENABLE ROW LEVEL SECURITY;

-- 7. REPORTS (PDF storage)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  report_url TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TRIGGER: AUTO-LOCK EVALUATIONS AFTER 12 HOURS
-- =====================================================
CREATE OR REPLACE FUNCTION lock_evaluation()
RETURNS TRIGGER AS $$
DECLARE
  session_end TIMESTAMPTZ;
BEGIN
  SELECT (cs.session_date + cs.end_time)::TIMESTAMPTZ
  INTO session_end
  FROM class_sessions cs
  WHERE cs.id = NEW.class_session_id;

  IF NOW() > session_end + INTERVAL '12 hours' THEN
    NEW.is_locked := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_lock_evaluation
  BEFORE INSERT OR UPDATE ON evaluations
  FOR EACH ROW
  EXECUTE FUNCTION lock_evaluation();

-- =====================================================
-- TRIGGER: AUTO UPDATE updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_evaluations_updated_at
  BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Profiles: users can read own profile; admins/teachers can read all
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admin and Teacher can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('Admin', 'TeacherTA')
    )
  );

-- Evaluations: students see own; teachers see their classes; admins see all
CREATE POLICY "Students view own evaluations"
  ON evaluations FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Teachers view evaluations they created"
  ON evaluations FOR SELECT
  USING (teacher_id = auth.uid());

CREATE POLICY "Admins view all evaluations"
  ON evaluations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Teachers can insert evaluations"
  ON evaluations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('Admin', 'TeacherTA')
    )
  );

CREATE POLICY "Teachers can update own evaluations (if not locked)"
  ON evaluations FOR UPDATE
  USING (teacher_id = auth.uid() AND is_locked = false);

-- Knowledge gaps: students see own; teachers/admins see all
CREATE POLICY "Students view own gaps"
  ON knowledge_gaps FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Teachers and admins view all gaps"
  ON knowledge_gaps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('Admin', 'TeacherTA')
    )
  );

-- =====================================================
-- HELPER: TIME-WEIGHTED AVERAGE SCORE
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_time_weighted_avg(p_student_id UUID, p_days_back INT DEFAULT 90)
RETURNS FLOAT AS $$
DECLARE
  weighted_sum FLOAT;
  total_weight FLOAT;
BEGIN
  SELECT
    SUM(
      (e.pronunciation + e.fluency + e.vocabulary_oral +
       e.grammar_conjugation + e.structure + e.spelling +
       e.comprehension_rate + e.engagement) / 8.0
      * (1.0 + (EXTRACT(EPOCH FROM (NOW() - e.session_date::TIMESTAMPTZ)) / 86400.0) / p_days_back)
    ),
    SUM(1.0 + (EXTRACT(EPOCH FROM (NOW() - e.session_date::TIMESTAMPTZ)) / 86400.0) / p_days_back)
  INTO weighted_sum, total_weight
  FROM evaluations e
  WHERE e.student_id = p_student_id
    AND e.session_date >= (CURRENT_DATE - p_days_back);

  IF total_weight IS NULL OR total_weight = 0 THEN
    RETURN 0;
  END IF;

  RETURN weighted_sum / total_weight;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- HELPER: SKILL DELTA (week-over-week comparison)
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_skill_delta(p_student_id UUID)
RETURNS TABLE (
  this_week_avg FLOAT,
  last_week_avg FLOAT,
  delta FLOAT,
  tag TEXT
) AS $$
DECLARE
  v_this_week FLOAT;
  v_last_week FLOAT;
  v_delta FLOAT;
BEGIN
  -- Average of last 7 days
  SELECT AVG(
    (e.pronunciation + e.fluency + e.vocabulary_oral +
     e.grammar_conjugation + e.structure + e.spelling +
     e.comprehension_rate + e.engagement) / 8.0
  ) INTO v_this_week
  FROM evaluations e
  WHERE e.student_id = p_student_id
    AND e.session_date >= (CURRENT_DATE - 7)
    AND e.session_date < CURRENT_DATE;

  -- Average of 7-14 days ago
  SELECT AVG(
    (e.pronunciation + e.fluency + e.vocabulary_oral +
     e.grammar_conjugation + e.structure + e.spelling +
     e.comprehension_rate + e.engagement) / 8.0
  ) INTO v_last_week
  FROM evaluations e
  WHERE e.student_id = p_student_id
    AND e.session_date >= (CURRENT_DATE - 14)
    AND e.session_date < (CURRENT_DATE - 7);

  v_delta := COALESCE(v_this_week, 0) - COALESCE(v_last_week, 0);

  RETURN QUERY SELECT
    COALESCE(v_this_week, 0),
    COALESCE(v_last_week, 0),
    v_delta,
    CASE
      WHEN v_delta >= 0.5 THEN 'Cải thiện tốt'
      WHEN v_delta <= -0.5 THEN 'Sa sút - Cần cảnh báo'
      ELSE 'Dậm chân tại chỗ'
    END;
END;
$$ LANGUAGE plpgsql;
