-- =====================================================
-- FRENCH CENTER - REVISED FULL SCHEMA v2
-- =====================================================

-- 0. ENUMS
CREATE TYPE user_role AS ENUM ('Admin', 'TeacherTA', 'Student');
CREATE TYPE attendance_status AS ENUM ('present', 'late', 'absent');
CREATE TYPE homework_status AS ENUM ('on_time', 'late', 'missing');
CREATE TYPE report_status AS ENUM ('draft', 'pending_approval', 'approved', 'sent');
CREATE TYPE cefr_level AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- 1. PROFILES (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'Student',
  full_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  phone TEXT,
  student_code TEXT UNIQUE,
  cefr_current cefr_level NOT NULL DEFAULT 'A1',
  cefr_progress_pct FLOAT NOT NULL DEFAULT 0 CHECK (cefr_progress_pct BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. CLASSES (course groups, e.g., "A2-Lundi-19h")
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  level cefr_level NOT NULL,
  teacher_id UUID NOT NULL REFERENCES profiles(id),
  schedule TEXT, -- e.g., "Mon 19:00-20:30, Wed 19:00-20:30"
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- 3. CLASS SESSIONS (individual meeting instances)
CREATE TABLE class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  teacher_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;

-- 4. ENROLLMENTS
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, class_id)
);
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- 5. EVALUATIONS (core rubric)
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  class_session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id),

  -- Production Orale (1-5)
  pronunciation INT NOT NULL CHECK (pronunciation BETWEEN 1 AND 5),
  fluency INT NOT NULL CHECK (fluency BETWEEN 1 AND 5),
  vocabulary_oral INT NOT NULL CHECK (vocabulary_oral BETWEEN 1 AND 5),

  -- Production Écrite (1-5)
  grammar_conjugation INT NOT NULL CHECK (grammar_conjugation BETWEEN 1 AND 5),
  structure INT NOT NULL CHECK (structure BETWEEN 1 AND 5),
  spelling INT NOT NULL CHECK (spelling BETWEEN 1 AND 5),

  -- Compréhension
  classwork_completion_rate FLOAT NOT NULL CHECK (classwork_completion_rate BETWEEN 0 AND 100),
  comprehension_rate INT NOT NULL CHECK (comprehension_rate BETWEEN 1 AND 5),

  -- Attitude / Effort
  attendance attendance_status NOT NULL DEFAULT 'present',
  engagement INT NOT NULL CHECK (engagement BETWEEN 1 AND 5),
  homework homework_status NOT NULL DEFAULT 'missing',

  -- Metadata
  notes TEXT,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  session_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(student_id, class_session_id)
);
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- 6. KNOWLEDGE GAPS (auto-tagged)
CREATE TABLE knowledge_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  gap_tag TEXT NOT NULL,
  gap_category TEXT NOT NULL DEFAULT 'grammar' CHECK (gap_category IN ('grammar','vocabulary','pronunciation','writing')),
  severity INT NOT NULL DEFAULT 1 CHECK (severity BETWEEN 1 AND 5),
  detected_at DATE NOT NULL,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE knowledge_gaps ENABLE ROW LEVEL SECURITY;

-- 7. MICRO PROGRESS (per-week sub-metric comparison)
CREATE TABLE micro_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  week_start DATE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_category TEXT NOT NULL,
  previous_value FLOAT,
  current_value FLOAT,
  change_pct FLOAT,
  direction TEXT CHECK (direction IN ('improved','declined','stable')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE micro_progress ENABLE ROW LEVEL SECURITY;

-- 8. REPORTS
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  class_id UUID REFERENCES classes(id),
  report_url TEXT,
  pdf_path TEXT,
  status report_status NOT NULL DEFAULT 'draft',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  is_weekly BOOLEAN NOT NULL DEFAULT true,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TRIGGER: AUTO-LOCK AFTER 12 HOURS
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
  FOR EACH ROW EXECUTE FUNCTION lock_evaluation();

-- =====================================================
-- TRIGGER: updated_at
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

-- Profiles
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin/Teacher view all" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','TeacherTA'))
);

-- Classes
CREATE POLICY "Anyone can view classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Admin/Teacher manage classes" ON classes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','TeacherTA'))
);

-- Enrollments
CREATE POLICY "Students view own enrollments" ON enrollments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Admin/Teacher manage enrollments" ON enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','TeacherTA'))
);

-- Evaluations
CREATE POLICY "Students view own evaluations" ON evaluations FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Teachers view their evaluations" ON evaluations FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "Admins view all evaluations" ON evaluations FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
);
CREATE POLICY "Teachers insert evaluations" ON evaluations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','TeacherTA'))
);
CREATE POLICY "Teachers update own unlocked" ON evaluations FOR UPDATE USING (teacher_id = auth.uid() AND is_locked = false);

-- Knowledge gaps
CREATE POLICY "Students view own gaps" ON knowledge_gaps FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Admin/Teacher view all gaps" ON knowledge_gaps FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','TeacherTA'))
);

-- Micro progress
CREATE POLICY "Students view own progress" ON micro_progress FOR SELECT USING (student_id = auth.uid());

-- Reports
CREATE POLICY "Students view own reports" ON reports FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Admin/Teacher manage reports" ON reports FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','TeacherTA'))
);

-- =====================================================
-- ANALYTICS FUNCTIONS
-- =====================================================

-- Time-weighted average (recent 40% heavier)
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
      * (1.4 - (EXTRACT(EPOCH FROM (NOW() - e.session_date::TIMESTAMPTZ)) / 86400.0) / p_days_back * 0.4)
    ),
    SUM(1.4 - (EXTRACT(EPOCH FROM (NOW() - e.session_date::TIMESTAMPTZ)) / 86400.0) / p_days_back * 0.4)
  INTO weighted_sum, total_weight
  FROM evaluations e
  WHERE e.student_id = p_student_id
    AND e.session_date >= (CURRENT_DATE - p_days_back);

  IF total_weight IS NULL OR total_weight = 0 THEN RETURN 0; END IF;
  RETURN weighted_sum / total_weight;
END;
$$ LANGUAGE plpgsql;

-- Effort score (attendance + homework + engagement mapped to 1-5)
CREATE OR REPLACE FUNCTION calculate_effort_score(p_student_id UUID, p_days_back INT DEFAULT 90)
RETURNS FLOAT AS $$
DECLARE
  total_score FLOAT;
  total_count INT;
BEGIN
  SELECT
    SUM(
      CASE e.attendance
        WHEN 'present' THEN 5.0
        WHEN 'late' THEN 3.0
        WHEN 'absent' THEN 1.0
      END
      +
      CASE e.homework
        WHEN 'on_time' THEN 5.0
        WHEN 'late' THEN 3.0
        WHEN 'missing' THEN 1.0
      END
      + e.engagement
    ),
    COUNT(*)
  INTO total_score, total_count
  FROM evaluations e
  WHERE e.student_id = p_student_id
    AND e.session_date >= (CURRENT_DATE - p_days_back);

  IF total_count IS NULL OR total_count = 0 THEN RETURN 0; END IF;
  RETURN total_score / (total_count * 3);
END;
$$ LANGUAGE plpgsql;

-- Skill delta (week-over-week)
CREATE OR REPLACE FUNCTION calculate_skill_delta(p_student_id UUID)
RETURNS TABLE (this_week_avg FLOAT, last_week_avg FLOAT, delta FLOAT, tag TEXT) AS $$
DECLARE
  v_this_week FLOAT;
  v_last_week FLOAT;
  v_delta FLOAT;
BEGIN
  SELECT AVG((e.pronunciation+e.fluency+e.vocabulary_oral+e.grammar_conjugation+e.structure+e.spelling+e.comprehension_rate+e.engagement)/8.0)
  INTO v_this_week
  FROM evaluations e
  WHERE e.student_id = p_student_id AND e.session_date >= (CURRENT_DATE - 7) AND e.session_date < CURRENT_DATE;

  SELECT AVG((e.pronunciation+e.fluency+e.vocabulary_oral+e.grammar_conjugation+e.structure+e.spelling+e.comprehension_rate+e.engagement)/8.0)
  INTO v_last_week
  FROM evaluations e
  WHERE e.student_id = p_student_id AND e.session_date >= (CURRENT_DATE - 14) AND e.session_date < (CURRENT_DATE - 7);

  v_delta := COALESCE(v_this_week, 0) - COALESCE(v_last_week, 0);
  RETURN QUERY SELECT COALESCE(v_this_week,0), COALESCE(v_last_week,0), v_delta,
    CASE WHEN v_delta >= 0.5 THEN 'Cải thiện tốt' WHEN v_delta <= -0.5 THEN 'Sa sút - Cần cảnh báo' ELSE 'Dậm chân tại chỗ' END;
END;
$$ LANGUAGE plpgsql;

-- Micro-progress: find at least one improved metric
CREATE OR REPLACE FUNCTION calculate_micro_progress(p_student_id UUID)
RETURNS TABLE (metric_name TEXT, metric_category TEXT, previous_value FLOAT, current_value FLOAT, change_pct FLOAT, direction TEXT) AS $$
DECLARE
  metrics TEXT[] := ARRAY['pronunciation','fluency','vocabulary_oral','grammar_conjugation','structure','spelling','classwork_completion_rate','comprehension_rate','attendance','engagement'];
  m TEXT;
  prev_avg FLOAT;
  curr_avg FLOAT;
  chg FLOAT;
  sub_sql TEXT;
BEGIN
  FOREACH m IN ARRAY metrics
  LOOP
    sub_sql := format(
      'SELECT
        (SELECT AVG(e.%I) FROM evaluations e WHERE e.student_id = %L AND e.session_date >= (CURRENT_DATE - 14) AND e.session_date < (CURRENT_DATE - 7)),
        (SELECT AVG(e.%I) FROM evaluations e WHERE e.student_id = %L AND e.session_date >= (CURRENT_DATE - 7) AND e.session_date < CURRENT_DATE)',
      m, p_student_id, m, p_student_id
    );
    EXECUTE sub_sql INTO prev_avg, curr_avg;
    prev_avg := COALESCE(prev_avg, 0);
    curr_avg := COALESCE(curr_avg, 0);
    IF prev_avg > 0 THEN
      chg := round(((curr_avg - prev_avg) / prev_avg * 100)::numeric, 1);
    ELSE
      chg := 0;
    END IF;

    metric_name := m;
    metric_category := CASE
      WHEN m IN ('pronunciation','fluency','vocabulary_oral') THEN 'Production Orale'
      WHEN m IN ('grammar_conjugation','structure','spelling') THEN 'Production Écrite'
      WHEN m IN ('classwork_completion_rate','comprehension_rate') THEN 'Compréhension'
      ELSE 'Attitude'
    END;
    previous_value := prev_avg;
    current_value := curr_avg;
    change_pct := chg;
    direction := CASE WHEN chg > 0 THEN 'improved' WHEN chg < 0 THEN 'declined' ELSE 'stable' END;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
