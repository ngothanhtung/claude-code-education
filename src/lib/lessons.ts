/**
 * Danh sách chủ đề và bài – nguồn duy nhất cho trang mục lục, thanh chuyển bài và tiêu đề trang.
 * Thêm bài mới: thêm một mục ở đây, tạo thư mục src/app/<slug>/ và src/lessons/<slug>/,
 * và thêm hình thu nhỏ trong components/LessonThumbs.tsx.
 */
export const TOPICS = [
  {
    id: 'chuyen-dong',
    title: 'Chuyển động',
    intro: 'Đổi số liệu bằng thanh trượt, cho xe chạy rồi đối chiếu với bài giải bên cạnh.',
  },
  {
    id: 'do-luong',
    title: 'Đo lường',
    intro: 'Đổi số liệu, xem hình minh họa cắt ghép hoặc xếp hình rồi đối chiếu với bài giải bên cạnh.',
  },
] as const;

export type TopicId = (typeof TOPICS)[number]['id'];

export const LESSONS = [
  // ---------------- Chuyển động ----------------
  {
    slug: 'van-toc-quang-duong-thoi-gian',
    topic: 'chuyen-dong',
    nav: 'Vận tốc',
    title: 'Vận tốc, quãng đường, thời gian',
    summary:
      'Một ô tô đi từ A đến B. Biết hai trong ba đại lượng, tìm đại lượng còn lại. Sơ đồ chia quãng đường theo từng giờ để thấy vận tốc là số ki-lô-mét đi được trong một giờ.',
    rule: { term: 'Vận tốc', text: 'quãng đường : thời gian' },
  },
  {
    slug: 'gio-den-noi',
    topic: 'chuyen-dong',
    nav: 'Giờ đến nơi',
    title: 'Giờ khởi hành, giờ đến nơi',
    summary:
      'Ô tô khởi hành lúc mấy giờ, đi bao lâu, nghỉ dọc đường bao lâu, và đến nơi lúc mấy giờ. Đồng hồ kim chạy theo xe để học sinh không quên cộng thời gian nghỉ.',
    rule: { term: 'Giờ đến', text: 'giờ khởi hành + thời gian đi + thời gian nghỉ' },
  },
  {
    slug: 'hai-xe-chuyen-dong-nguoc-chieu',
    topic: 'chuyen-dong',
    nav: 'Ngược chiều',
    title: 'Hai xe chuyển động ngược chiều',
    summary:
      'Hai ô tô đi từ hai đầu quãng đường và chạy về phía nhau, xuất phát cùng lúc hoặc một xe đi trước. Sau bao lâu thì gặp nhau, chỗ gặp cách mỗi đầu bao xa?',
    rule: { term: 'Thời gian gặp nhau', text: 'quãng đường : tổng vận tốc' },
  },
  {
    slug: 'hai-xe-chuyen-dong-cung-chieu',
    topic: 'chuyen-dong',
    nav: 'Cùng chiều',
    title: 'Hai xe chuyển động cùng chiều',
    summary:
      'Ô tô đuổi theo xe máy: xe máy đi trước một khoảng thời gian, hoặc hai xe cùng xuất phát nhưng cách nhau một quãng. Sau bao lâu ô tô đuổi kịp, chỗ gặp cách A bao xa?',
    rule: { term: 'Thời gian đuổi kịp', text: 'khoảng cách : hiệu vận tốc' },
  },

  // ---------------- Đo lường ----------------
  {
    slug: 'doi-don-vi-do',
    topic: 'do-luong',
    nav: 'Đổi đơn vị',
    title: 'Đổi đơn vị đo',
    summary:
      'Đổi số đo độ dài, khối lượng, diện tích, thể tích bằng bảng đơn vị. Dấu phẩy dịch qua từng cột: mỗi đơn vị ứng với 1 chữ số (độ dài, khối lượng), 2 chữ số (diện tích) hay 3 chữ số (thể tích).',
    rule: { term: 'Hai đơn vị diện tích liền nhau', text: 'hơn kém nhau 100 lần' },
  },
  {
    slug: 'dien-tich-tam-giac-hinh-thang',
    topic: 'do-luong',
    nav: 'Tam giác, hình thang',
    title: 'Diện tích hình tam giác, hình thang',
    summary:
      'Cắt và xoay các mảnh hình để thấy vì sao phải chia 2: tam giác ghép thành hình chữ nhật, hình thang ghép thành tam giác có đáy bằng tổng hai đáy.',
    rule: { term: 'Diện tích hình thang', text: '(đáy lớn + đáy bé) × chiều cao : 2' },
  },
  {
    slug: 'hinh-tron',
    topic: 'do-luong',
    nav: 'Hình tròn',
    title: 'Chu vi và diện tích hình tròn',
    summary:
      'Lăn hình tròn để trải chu vi ra thành đoạn thẳng dài hơn 3 lần đường kính. Cắt hình tròn thành 16 hình quạt rồi xếp lại thành gần một hình chữ nhật.',
    rule: { term: 'Diện tích hình tròn', text: 'bán kính × bán kính × 3,14' },
  },
  {
    slug: 'the-tich-hinh-hop',
    topic: 'do-luong',
    nav: 'Thể tích',
    title: 'Thể tích hình hộp chữ nhật, hình lập phương',
    summary:
      'Xếp từng hình lập phương 1 cm³ vào trong hộp, từng hàng, từng lớp, để thấy thể tích là chiều dài × chiều rộng × chiều cao.',
    rule: { term: 'Thể tích hình hộp chữ nhật', text: 'chiều dài × chiều rộng × chiều cao' },
  },
] as const satisfies readonly {
  slug: string;
  topic: TopicId;
  nav: string;
  title: string;
  summary: string;
  rule: { term: string; text: string };
}[];

export type LessonSlug = (typeof LESSONS)[number]['slug'];

export function getLesson(slug: LessonSlug) {
  const lesson = LESSONS.find((l) => l.slug === slug);
  if (!lesson) throw new Error(`Không tìm thấy bài: ${slug}`);
  return lesson;
}

export function getTopic(id: TopicId) {
  const topic = TOPICS.find((t) => t.id === id);
  if (!topic) throw new Error(`Không tìm thấy chủ đề: ${id}`);
  return topic;
}

export const lessonsOf = (topic: TopicId) => LESSONS.filter((l) => l.topic === topic);
