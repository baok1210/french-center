-- =====================================================
-- LEARNING RESOURCES CATALOG (from awesome-french)
-- =====================================================

CREATE TYPE resource_category AS ENUM (
  'Video',
  'Audio',
  'Audio_Text',
  'Website',
  'Course',
  'Article',
  'Product',
  'Pronunciation',
  'Keyboard'
);

CREATE TABLE learning_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  category resource_category NOT NULL,
  language TEXT DEFAULT 'French',
  subtitle TEXT CHECK (subtitle IN ('French', 'English', 'Both', NULL)),
  is_kids BOOLEAN NOT NULL DEFAULT false,
  is_free BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view learning resources"
  ON learning_resources FOR SELECT
  USING (true);

-- Seed data from awesome-french
INSERT INTO learning_resources (title, url, description, category, subtitle, tags) VALUES
-- Video: French subtitles
('Easy French', 'https://www.youtube.com/@easyfrench', 'Street interviews with French/English subtitles', 'Video', 'Both', ARRAY['youtube', 'subtitles', 'interview']),
('Super Easy French', 'https://www.youtube.com/playlist?list=PLA5UIoabheFMChKPAUUNNEOd7BobVJVoQ', 'Super easy French videos for beginners', 'Video', 'Both', ARRAY['youtube', 'beginner', 'subtitles']),
('French Comprehensible Input', 'https://www.youtube.com/@FrenchComprehensibleInput', 'CI-based French learning videos', 'Video', 'Both', ARRAY['youtube', 'ci', 'subtitles']),
('French Facile', 'https://www.youtube.com/@FrenchFacile12', 'Easy French lessons', 'Video', 'Both', ARRAY['youtube', 'beginner']),
('French mornings with Elisa', 'https://www.youtube.com/@FrenchmorningswithElisa', 'French learning with Elisa', 'Video', 'Both', ARRAY['youtube', 'subtitles']),
('Piece of French', 'https://www.youtube.com/@pieceoffrench', 'French videos with subtitles', 'Video', 'Both', ARRAY['youtube', 'subtitles']),
('Learn French With Stories', 'https://www.youtube.com/@Maintenant_ou_jamais', 'Learn French through stories', 'Video', 'French', ARRAY['youtube', 'stories']),
('Français Authentique', 'https://www.youtube.com/@francaisauthentique', 'Authentic French for learners', 'Video', 'French', ARRAY['youtube', 'authentic']),
('Parlez-vous FRENCH', 'https://www.youtube.com/@parlezvousfrench', 'French lessons on YouTube', 'Video', 'French', ARRAY['youtube', 'lessons']),
('Francais avec Pierre', 'https://www.youtube.com/@francaisavecpierre', 'French with Pierre', 'Video', 'French', ARRAY['youtube', 'lessons']),
('alice ayel', 'https://www.youtube.com/@aliceayel', 'French learning channel', 'Video', 'French', ARRAY['youtube', 'ci']),

-- Video: English subtitles
('French pronunciation with Nastya', 'https://www.youtube.com/@french.pronunciation', 'Pronunciation-focused French lessons', 'Video', 'English', ARRAY['youtube', 'pronunciation']),
('Learn French With Alexa', 'https://www.youtube.com/@learnfrenchwithalexa', 'Popular French learning channel', 'Video', 'English', ARRAY['youtube', 'popular']),
('FluentU French', 'https://www.youtube.com/@fluentufrench', 'Real-world French videos', 'Video', 'English', ARRAY['youtube', 'real-world']),

-- Video: Kids
('Treehouse Direct Français', 'https://www.youtube.com/channel/UCsi-_xGuc5S9Efh0D1jjvwA', 'French cartoons for kids', 'Video', NULL, ARRAY['youtube', 'kids', 'cartoons']),

-- Audio
('Language Transfer: French', 'https://www.languagetransfer.org/french', 'Free audio course using the thinking method', 'Audio', NULL, ARRAY['audio', 'free', 'beginner']),
('Oh, la Frenchie! podcast', 'https://podcasters.spotify.com/pod/show/oh-la-frenchie', 'French podcast', 'Audio', NULL, ARRAY['podcast', 'audio']),
('Coffee Break French', 'https://coffeebreaklanguages.com/category/coffee-break-french/', 'Popular coffee break French podcast', 'Audio', NULL, ARRAY['podcast', 'popular']),

-- Audio + Text
('LanguaTalk Slow French', 'https://languatalk.com/blog/podcast/french', 'Slow French podcast with interactive transcripts', 'Audio_Text', NULL, ARRAY['podcast', 'transcript', 'slow']),
('InnerFrench podcast', 'https://innerfrench.com/podcast/', 'Intermediate French podcast with transcripts', 'Audio_Text', NULL, ARRAY['podcast', 'intermediate', 'transcript']),
('Français Authentique podcast', 'https://www.francaisauthentique.com/podcasts/', 'Authentic French podcast', 'Audio_Text', NULL, ARRAY['podcast', 'authentic']),
('Balades podcast', 'https://www.dropbox.com/sh/2hmza3ye9rwmtln/AAArk-R7FnCuuVzjwoqm6kn1a?dl=0', 'French podcast with transcripts', 'Audio_Text', NULL, ARRAY['podcast', 'transcript']),
('Duolingo French Podcast', 'https://podcast.duolingo.com/french', 'Duolingo French podcast', 'Audio_Text', NULL, ARRAY['podcast', 'duolingo']),
('France Bienvenue', 'https://francebienvenue1.fr/', 'Real conversations with transcription', 'Audio_Text', NULL, ARRAY['podcast', 'conversation', 'transcript']),

-- Websites
('Lawless French', 'https://www.lawlessfrench.com/', 'French lessons and language tools', 'Website', NULL, ARRAY['grammar', 'lessons']),
('Tex French Grammar', 'https://www.laits.utexas.edu/tex/index.html', 'University of Texas French grammar', 'Website', NULL, ARRAY['grammar', 'university']),
('francaisfacile.com', 'https://www.francaisfacile.com/', 'Free French exercises', 'Website', NULL, ARRAY['exercises', 'free']),
('dicteeinteractive.fr', 'https://www.dicteeinteractive.fr/', 'Interactive French dictation', 'Website', NULL, ARRAY['dictation', 'listening']),
('Lingolia French', 'https://francais.lingolia.com/en/', 'French grammar and exercises', 'Website', NULL, ARRAY['grammar', 'exercises']),
('RFI Francais Facile', 'https://francaisfacile.rfi.fr/fr/', 'RFI easy French news', 'Website', NULL, ARRAY['news', 'listening']),
('TV5MONDE - Apprendre', 'https://apprendre.tv5monde.com/fr', 'Learn French with TV5MONDE', 'Website', NULL, ARRAY['tv5monde', 'video', 'exercises']),
('podcast francais facile', 'https://www.podcastfrancaisfacile.com/', 'Easy French podcast website', 'Website', NULL, ARRAY['podcast', 'beginner']),

-- Courses
('UMontrealX: Français élémentaire 1', 'https://www.edx.org/learn/language/universite-de-montreal-francais-elementaire-1', 'Elementary French from University of Montreal', 'Course', NULL, ARRAY['mooc', 'university', 'beginner']),
('French in Action', 'https://www.learner.org/series/french-in-action/', 'Classic French video course', 'Course', NULL, ARRAY['video', 'classic']),
('Coursera B1-B2 Intermediate', 'https://www.coursera.org/learn/etudier-en-france', 'Intermediate French B1-B2', 'Course', NULL, ARRAY['mooc', 'intermediate']),

-- Keyboard
('Bepo Layout', 'https://bepo.fr/', 'Ergonomic French keyboard layout', 'Keyboard', NULL, ARRAY['keyboard', 'typing']);
