import type { Level, Module, Lesson } from '@/types/learning';

export const LEVELS: Level[] = [
  { id: 'a1', difficulty: 'A1', title_fr: 'Débutant', title_vi: 'Sơ cấp', description: 'Làm quen với tiếng Pháp — bảng chữ cái, chào hỏi, số đếm, và các cấu trúc cơ bản nhất.', icon: '🌱', vocab_count: 300, grammar_points: 15, order: 1 },
  { id: 'a2', difficulty: 'A2', title_fr: 'Élémentaire', title_vi: 'Cơ bản', description: 'Mở rộng vốn từ và ngữ pháp — giới thiệu bản thân, mua sắm, chỉ đường, thì quá khứ.', icon: '🌿', vocab_count: 600, grammar_points: 25, order: 2 },
  { id: 'b1', difficulty: 'B1', title_fr: 'Intermédiaire', title_vi: 'Trung cấp', description: 'Giao tiếp tự tin — ý kiến, giả định, sự kiện, điều kiện. Chuẩn bị thi DELF B1.', icon: '🌳', vocab_count: 1200, grammar_points: 35, order: 3 },
];

export const MODULES: Module[] = [
  { id: 'a1-vocab', level_id: 'a1', skill: 'vocabulary', title_fr: 'Vocabulaire de base', title_vi: 'Từ vựng cơ bản', description: 'Các từ vựng thông dụng nhất hàng ngày', icon: 'book', order: 1 },
  { id: 'a1-grammar', level_id: 'a1', skill: 'grammar', title_fr: 'Grammaire A1', title_vi: 'Ngữ pháp A1', description: 'Động từ être/avoir, danh từ, giống, số nhiều', icon: 'pen', order: 2 },
  { id: 'a1-listening', level_id: 'a1', skill: 'listening', title_fr: 'Compréhension orale', title_vi: 'Nghe hiểu', description: 'Luyện nghe các đoạn hội thoại ngắn', icon: 'headphones', order: 3 },
  { id: 'a1-reading', level_id: 'a1', skill: 'reading', title_fr: 'Lecture A1', title_vi: 'Đọc hiểu', description: 'Các bài đọc ngắn về chủ đề gần gũi', icon: 'book', order: 4 },
  { id: 'a2-vocab', level_id: 'a2', skill: 'vocabulary', title_fr: 'Vocabulaire thématique', title_vi: 'Từ vựng theo chủ đề', description: 'Từ vựng về du lịch, ăn uống, công việc', icon: 'book', order: 1 },
  { id: 'a2-grammar', level_id: 'a2', skill: 'grammar', title_fr: 'Grammaire A2', title_vi: 'Ngữ pháp A2', description: 'Passé composé, imparfait, futur proche', icon: 'pen', order: 2 },
  { id: 'a2-listening', level_id: 'a2', skill: 'listening', title_fr: 'Dialogues quotidiens', title_vi: 'Hội thoại hàng ngày', description: 'Nghe các tình huống thực tế', icon: 'headphones', order: 3 },
  { id: 'a2-reading', level_id: 'a2', skill: 'reading', title_fr: 'Articles courts', title_vi: 'Bài báo ngắn', description: 'Đọc hiểu các bài báo đơn giản', icon: 'book', order: 4 },
  { id: 'b1-vocab', level_id: 'b1', skill: 'vocabulary', title_fr: 'Vocabulaire avancé', title_vi: 'Từ vựng nâng cao', description: 'Thành ngữ, từ vựng học thuật', icon: 'book', order: 1 },
  { id: 'b1-grammar', level_id: 'b1', skill: 'grammar', title_fr: 'Grammaire B1', title_vi: 'Ngữ pháp B1', description: 'Subjonctif, conditionnel, discours indirect', icon: 'pen', order: 2 },
  { id: 'b1-listening', level_id: 'b1', skill: 'listening', title_fr: 'Actualités et débats', title_vi: 'Tin tức và thảo luận', description: 'Nghe tin tức và tranh luận', icon: 'headphones', order: 3 },
  { id: 'b1-reading', level_id: 'b1', skill: 'reading', title_fr: 'Littérature et presse', title_vi: 'Văn học và báo chí', description: 'Đọc trích đoạn văn học và báo chí', icon: 'book', order: 4 },
];

export const LESSONS: Record<string, Lesson[]> = {
  'a1-vocab': [
    { id: 'a1-vocab-1', module_id: 'a1-vocab', type: 'flashcard', title_fr: 'Les salutations', title_vi: 'Lời chào hỏi', content: { type: 'flashcard', cards: [
      { id: 'c1', term_fr: 'Bonjour', term_vi: 'Xin chào', image_url: '', example_fr: 'Bonjour, comment allez-vous?', example_vi: 'Xin chào, bạn khỏe không?' },
      { id: 'c2', term_fr: 'Au revoir', term_vi: 'Tạm biệt', example_fr: 'Au revoir et bonne journée!', example_vi: 'Tạm biệt và chúc một ngày tốt lành!' },
      { id: 'c3', term_fr: 'Merci', term_vi: 'Cảm ơn', example_fr: 'Merci beaucoup!', example_vi: 'Cảm ơn rất nhiều!' },
      { id: 'c4', term_fr: "S'il vous plaît", term_vi: 'Làm ơn', example_fr: 'Un café, s\'il vous plaît.', example_vi: 'Một ly cà phê, làm ơn.' },
      { id: 'c5', term_fr: 'Pardon', term_vi: 'Xin lỗi', example_fr: 'Pardon, je suis en retard.', example_vi: 'Xin lỗi, tôi đến muộn.' },
    ]}, duration_min: 10, order: 1 },
    { id: 'a1-vocab-2', module_id: 'a1-vocab', type: 'flashcard', title_fr: 'Les nombres 1-20', title_vi: 'Số đếm 1-20', content: { type: 'flashcard', cards: [
      { id: 'c6', term_fr: 'Un', term_vi: 'Một' },
      { id: 'c7', term_fr: 'Deux', term_vi: 'Hai' },
      { id: 'c8', term_fr: 'Trois', term_vi: 'Ba' },
      { id: 'c9', term_fr: 'Dix', term_vi: 'Mười' },
      { id: 'c10', term_fr: 'Vingt', term_vi: 'Hai mươi' },
    ]}, duration_min: 8, order: 2 },
    { id: 'a1-vocab-3', module_id: 'a1-vocab', type: 'flashcard', title_fr: 'Les couleurs', title_vi: 'Màu sắc', content: { type: 'flashcard', cards: [
      { id: 'c11', term_fr: 'Rouge', term_vi: 'Đỏ' },
      { id: 'c12', term_fr: 'Bleu', term_vi: 'Xanh dương' },
      { id: 'c13', term_fr: 'Vert', term_vi: 'Xanh lá' },
      { id: 'c14', term_fr: 'Jaune', term_vi: 'Vàng' },
      { id: 'c15', term_fr: 'Noir', term_vi: 'Đen' },
    ]}, duration_min: 8, order: 3 },
  ],
  'a1-grammar': [
    { id: 'a1-grammar-1', module_id: 'a1-grammar', type: 'video', title_fr: 'Le verbe Être', title_vi: 'Động từ Être', content: { type: 'video', video_url: '', transcript_fr: 'Je suis, tu es, il/elle/on est, nous sommes, vous êtes, ils/elles sont.', transcript_vi: 'Tôi là, bạn là, anh ấy/cô ấy/chúng ta là, chúng tôi là, các bạn là, họ là.', exercises: [
      { id: 'e1', instruction_fr: 'Conjuguez le verbe être', instruction_vi: 'Chia động từ être', prompt: 'Je ___ (être) heureux.', answer: 'suis' },
      { id: 'e2', instruction_fr: 'Conjuguez le verbe être', instruction_vi: 'Chia động từ être', prompt: 'Nous ___ (être) fatigués.', answer: 'sommes' },
    ]}, duration_min: 15, order: 1 },
    { id: 'a1-grammar-2', module_id: 'a1-grammar', type: 'video', title_fr: 'Le verbe Avoir', title_vi: 'Động từ Avoir', content: { type: 'video', video_url: '', transcript_fr: "J'ai, tu as, il/elle/on a, nous avons, vous avez, ils/elles ont.", transcript_vi: 'Tôi có, bạn có, anh ấy/cô ấy có, chúng tôi có, các bạn có, họ có.', exercises: [
      { id: 'e3', instruction_fr: 'Conjuguez le verbe avoir', instruction_vi: 'Chia động từ avoir', prompt: "J'___ (avoir) un livre.", answer: 'ai' },
    ]}, duration_min: 15, order: 2 },
  ],
  'a1-listening': [
    { id: 'a1-listen-1', module_id: 'a1-listening', type: 'audio', title_fr: 'Se présenter', title_vi: 'Tự giới thiệu', content: { type: 'audio', audio_url: '/audio/se-presenter.mp3', transcript_fr: "Bonjour! Je m'appelle Marie. J'ai 25 ans. Je suis française. J'habite à Paris.", transcript_vi: 'Xin chào! Tôi tên là Marie. Tôi 25 tuổi. Tôi là người Pháp. Tôi sống ở Paris.', duration_sec: 30 }, duration_min: 10, order: 1 },
  ],
  'a1-reading': [
    { id: 'a1-read-1', module_id: 'a1-reading', type: 'text', title_fr: 'Ma famille', title_vi: 'Gia đình tôi', content: { type: 'text', body_fr: "Je m'appelle Pierre. Voici ma famille. Mon père s'appelle Jean. Ma mère s'appelle Sophie. J'ai un frère et une sœur. Nous habitons à Lyon.", body_vi: 'Tôi tên Pierre. Đây là gia đình tôi. Bố tôi tên Jean. Mẹ tôi tên Sophie. Tôi có một anh trai và một chị gái. Chúng tôi sống ở Lyon.', vocabulary: [
      { word_fr: 'le père', word_vi: 'người cha' },
      { word_fr: 'la mère', word_vi: 'người mẹ' },
      { word_fr: 'le frère', word_vi: 'anh/em trai' },
      { word_fr: 'la sœur', word_vi: 'chị/em gái' },
      { word_fr: 'habiter', word_vi: 'sống ở' },
    ], questions: [
      { id: 'q1', question_fr: "Comment s'appelle le père?", question_vi: 'Bố tên là gì?', options: ['Pierre', 'Jean', 'Sophie', 'Lyon'], correct_index: 1 },
      { id: 'q2', question_fr: 'Où habite la famille?', question_vi: 'Gia đình sống ở đâu?', options: ['Paris', 'Lyon', 'Marseille', 'Nice'], correct_index: 1 },
    ]}, duration_min: 15, order: 1 },
  ],
  'a2-grammar': [
    { id: 'a2-grammar-1', module_id: 'a2-grammar', type: 'video', title_fr: 'Le Passé Composé', title_vi: 'Thì quá khứ kép', content: { type: 'video', video_url: '', transcript_fr: "Le passé composé se forme avec l'auxiliaire être ou avoir au présent + le participe passé.", transcript_vi: 'Passé composé được hình thành với trợ động từ être hoặc avoir ở hiện tại + quá khứ phân từ.', exercises: [] }, duration_min: 20, order: 1 },
  ],
};

export const getLevelById = (id: string) => LEVELS.find(l => l.id === id);
export const getModulesByLevel = (levelId: string) => MODULES.filter(m => m.level_id === levelId);
export const getLessonsByModule = (moduleId: string) => LESSONS[moduleId] || [];
export const getLessonById = (id: string) => { for (const arr of Object.values(LESSONS)) { const found = arr.find(l => l.id === id); if (found) return found; } return null; };
