/**
 * Danh sách lớp → môn → chủ đề → bài: nguồn duy nhất cho trang mục lục, thanh chuyển bài,
 * đường dẫn ngược (breadcrumb) và tiêu đề trang.
 * Đường dẫn: / (chọn lớp) → /classes/<no>/subjects (các môn) → /classes/<no>/subjects/<môn>
 * (các chủ đề và bài) → /classes/<no>/subjects/<môn>/topics/<chủ đề> (các bài) → /<slug> (bài).
 * Mã nguồn xếp theo lớp → môn → chủ đề (dùng GRADES[].id, SUBJECTS[].slug, TOPICS[].id):
 *   src/lessons/<lop>/<mon>/<chu-de>/<slug>/   Lesson.tsx, sketch.ts, exercises.ts (5 bài tập)
 *   src/app/(<lop>)/(<mon>)/(<chu-de>)/<slug>/page.tsx   (route group: URL vẫn là /<slug>)
 * Thêm bài mới: thêm một mục vào LESSONS, tạo hai thư mục trên đúng lớp/môn/chủ đề,
 * và thêm hình thu nhỏ trong components/LessonThumbs.tsx.
 */
export const GRADES = [
  { id: 'lop-5', no: '5', title: 'Lớp 5', level: 'Tiểu học' },
  { id: 'lop-9', no: '9', title: 'Lớp 9', level: 'Trung học cơ sở' },
] as const;

export type GradeId = (typeof GRADES)[number]['id'];

export const SUBJECTS = [
  { id: 'toan-5', slug: 'toan', grade: 'lop-5', title: 'Toán', note: '', calculator: false, periodicTable: false },
  {
    id: 'vat-ly-9', slug: 'vat-ly', grade: 'lop-9', title: 'Vật lý',
    note: 'Phần Vật lý của môn Khoa học tự nhiên 9.',
    /** Hiện nút "Máy tính" (máy tính khoa học nổi) trong mọi bài của môn */
    calculator: true,
    periodicTable: false,
  },
  {
    id: 'hoa-hoc-9', slug: 'hoa-hoc', grade: 'lop-9', title: 'Hóa học',
    note: 'Phần Hóa học của môn Khoa học tự nhiên 9 (Kết nối tri thức): kim loại, phi kim, hydrocarbon và nhiên liệu.',
    calculator: true,
    /** Hiện nút "Bảng tuần hoàn" (tra cứu nguyên tố, tính khối lượng mol) */
    periodicTable: true,
  },
] as const satisfies readonly {
  id: string; slug: string; grade: GradeId; title: string; note: string; calculator: boolean; periodicTable: boolean;
}[];

export type SubjectId = (typeof SUBJECTS)[number]['id'];

export const TOPICS = [
  {
    id: 'chuyen-dong',
    subject: 'toan-5',
    title: 'Chuyển động',
    intro: 'Đổi số liệu bằng thanh trượt, cho xe chạy rồi đối chiếu với bài giải bên dưới.',
  },
  {
    id: 'do-luong',
    subject: 'toan-5',
    title: 'Đo lường',
    intro: 'Đổi số liệu, xem hình minh họa cắt ghép hoặc xếp hình rồi đối chiếu với bài giải bên dưới.',
  },
  {
    id: 'nang-luong-co-hoc',
    subject: 'vat-ly-9',
    title: 'Năng lượng cơ học',
    intro: 'Đổi khối lượng, độ cao, thời gian; xem năng lượng chuyển hóa rồi đối chiếu với bài giải bên dưới.',
  },
  {
    id: 'quang-hoc',
    subject: 'vat-ly-9',
    title: 'Quang học',
    intro: 'Đổi góc tới, môi trường, vị trí vật; xem đường truyền tia sáng rồi đối chiếu với bài giải bên dưới.',
  },
  {
    id: 'dien-hoc',
    subject: 'vat-ly-9',
    title: 'Điện học',
    intro: 'Đổi hiệu điện thế, điện trở, cách mắc; quan sát dòng điện trong mạch rồi đối chiếu với bài giải bên dưới.',
  },
  {
    id: 'kim-loai',
    subject: 'hoa-hoc-9',
    title: 'Kim loại và phi kim',
    intro: 'Chọn kim loại, dung dịch, khối lượng; quan sát phản ứng trong ống nghiệm rồi đối chiếu với bài giải bên dưới.',
  },
  {
    id: 'hydrocarbon',
    subject: 'hoa-hoc-9',
    title: 'Hydrocarbon và nhiên liệu',
    intro: 'Quan sát mô hình phân tử và phương trình hóa học động, đổi lượng chất rồi đối chiếu với bài giải bên dưới.',
  },
  {
    id: 'ruou-axit',
    subject: 'hoa-hoc-9',
    title: 'Ethylic alcohol và acetic acid',
    intro: 'Đổi lượng chất, dạng phản ứng; xem phương trình hóa học bằng mô hình phân tử rồi đối chiếu với bài giải bên dưới.',
  },
  {
    id: 'hop-chat-thien-nhien',
    subject: 'hoa-hoc-9',
    title: 'Lipid, carbohydrate, protein, polymer',
    intro: 'Các hợp chất hữu cơ trong đời sống: đổi khối lượng nguyên liệu, hiệu suất và đối chiếu với bài giải bên dưới.',
  },
  {
    id: 'vo-trai-dat',
    subject: 'hoa-hoc-9',
    title: 'Tài nguyên từ vỏ Trái Đất',
    intro: 'Khoáng vật, đá vôi, silicate và nhiên liệu hóa thạch: tính lượng kim loại, sản phẩm và khí CO₂ thải ra.',
  },
] as const satisfies readonly { id: string; subject: SubjectId; title: string; intro: string }[];

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

  // ---------------- Vật lý 9: Năng lượng cơ học ----------------
  {
    slug: 'dong-nang',
    topic: 'nang-luong-co-hoc',
    nav: 'Động năng',
    title: 'Động năng',
    summary:
      'Quả bóng, quả cầu, xe máy, ô tô lao vào khúc gỗ: vật có động năng càng lớn thì đẩy khúc gỗ đi càng xa. Tính động năng, vận tốc hoặc khối lượng.',
    rule: { term: 'Động năng', text: '$W_\\text{đ} = \\frac{1}{2} \\times m \\times v^2$' },
  },
  {
    slug: 'the-nang',
    topic: 'nang-luong-co-hoc',
    nav: 'Thế năng',
    title: 'Thế năng trọng trường',
    summary:
      'Ròng rọc nâng vật lên cao, cột thế năng tăng theo độ cao. Tính thế năng, độ cao, khối lượng và so sánh thế năng khi đổi mốc thế năng.',
    rule: { term: 'Thế năng trọng trường', text: '$W_\\text{t} = P \\times h$' },
  },
  {
    slug: 'co-nang',
    topic: 'nang-luong-co-hoc',
    nav: 'Cơ năng',
    title: 'Cơ năng, bảo toàn cơ năng',
    summary:
      'Thả một vật rơi từ độ cao h. Cột năng lượng cho thấy thế năng giảm bao nhiêu thì động năng tăng bấy nhiêu, còn cơ năng không đổi khi bỏ qua sức cản.',
    rule: { term: 'Cơ năng', text: '$W = W_\\text{đ} + W_\\text{t}$' },
  },
  {
    slug: 'cong-co-hoc',
    topic: 'nang-luong-co-hoc',
    nav: 'Công',
    title: 'Công cơ học',
    summary:
      'Lực kéo vật trên mặt ngang hoặc nâng vật lên cao: lực chỉ thực hiện công khi vật dịch chuyển theo phương của lực. Tính công hoặc lực kéo.',
    rule: { term: 'Công cơ học', text: '$A = F \\times s$' },
  },
  {
    slug: 'cong-suat',
    topic: 'nang-luong-co-hoc',
    nav: 'Công suất',
    title: 'Công suất',
    summary:
      'Hai cần cẩu nâng hai kiện hàng cùng lúc. Máy nào thực hiện công nhiều hơn chưa chắc đã khỏe hơn: phải so sánh công thực hiện trong 1 giây.',
    rule: { term: 'Công suất', text: '$\\mathscr{P} = A \\chia t$' },
  },
  {
    slug: 'nha-may-thuy-dien',
    topic: 'nang-luong-co-hoc',
    nav: 'Thủy điện',
    title: 'Ứng dụng: nhà máy thủy điện',
    summary:
      'Nước từ hồ chứa trên cao chảy xuống làm quay tuabin. Theo dõi thế năng của nước chuyển thành động năng rồi thành điện năng, và tính công suất điện.',
    rule: { term: 'Hiệu suất', text: '$H = \\mathscr{P}_\\text{có ích} \\chia \\mathscr{P}_\\text{toàn phần}$' },
  },

  // ---------------- Vật lý 9: Quang học ----------------
  {
    slug: 'khuc-xa-anh-sang',
    topic: 'quang-hoc',
    nav: 'Khúc xạ',
    title: 'Khúc xạ ánh sáng',
    summary:
      'Chiếu tia sáng qua mặt phân cách giữa không khí và nước, thủy tinh hay kim cương. Đổi góc tới, đo góc khúc xạ và kiểm tra định luật khúc xạ.',
    rule: { term: 'Định luật khúc xạ', text: '$\\sin i \\chia \\sin r = n_2 \\chia n_1$' },
  },
  {
    slug: 'phan-xa-toan-phan',
    topic: 'quang-hoc',
    nav: 'Phản xạ toàn phần',
    title: 'Phản xạ toàn phần',
    summary:
      'Ánh sáng đi từ thủy tinh ra không khí: tăng góc tới đến quá góc tới hạn thì tia khúc xạ biến mất. Ứng dụng trong sợi quang của cáp internet.',
    rule: { term: 'Góc tới hạn', text: '$\\sin i_\\text{gh} = n_2 \\chia n_1$' },
  },
  {
    slug: 'lang-kinh',
    topic: 'quang-hoc',
    nav: 'Lăng kính',
    title: 'Lăng kính',
    summary:
      'Tia sáng qua lăng kính bị lệch về phía đáy. Chiếu ánh sáng trắng thì lăng kính tách ra dải màu từ đỏ đến tím, giống cầu vồng.',
    rule: { term: 'Tia ló qua lăng kính', text: 'lệch về phía đáy lăng kính' },
  },
  {
    slug: 'thau-kinh',
    topic: 'quang-hoc',
    nav: 'Thấu kính',
    title: 'Thấu kính hội tụ, thấu kính phân kỳ',
    summary:
      'Dựng ảnh của vật qua thấu kính bằng các tia sáng đặc biệt. Kéo vật lại gần, ra xa để thấy ảnh đổi từ thật sang ảo, rồi tính vị trí và độ cao ảnh.',
    rule: { term: 'Tia qua quang tâm', text: 'truyền thẳng' },
  },
  {
    slug: 'kinh-lup-do-tieu-cu',
    topic: 'quang-hoc',
    nav: 'Kính lúp, tiêu cự',
    title: 'Kính lúp và đo tiêu cự thấu kính',
    summary:
      'Kính lúp cho ảnh ảo lớn hơn vật với số bội giác G = 25 : f. Trên băng quang học, dịch thấu kính và màn để tìm ảnh rõ nét bằng vật rồi tính tiêu cự.',
    rule: { term: 'Số bội giác kính lúp', text: '$G = 25 \\chia f$ ($f$ tính bằng cm)' },
  },

  // ---------------- Vật lý 9: Điện học ----------------
  {
    slug: 'dien-tro-dinh-luat-om',
    topic: 'dien-hoc',
    nav: 'Định luật Ôm',
    title: 'Điện trở, định luật Ôm',
    summary:
      'Đóng khóa K, ampe kế và vôn kế cho biết cường độ dòng điện và hiệu điện thế. Đồ thị I theo U là đường thẳng qua gốc tọa độ; điện trở dây dẫn phụ thuộc chiều dài, tiết diện và vật liệu.',
    rule: { term: 'Định luật Ôm', text: '$I = U \\chia R$' },
  },
  {
    slug: 'mach-noi-tiep-song-song',
    topic: 'dien-hoc',
    nav: 'Nối tiếp, song song',
    title: 'Đoạn mạch nối tiếp, đoạn mạch song song',
    summary:
      'Hai điện trở mắc nối tiếp có cùng cường độ dòng điện; mắc song song thì dòng điện mạch chính chia thành hai nhánh. Tính điện trở tương đương, cường độ dòng điện và hiệu điện thế.',
    rule: { term: 'Nối tiếp', text: '$R_\\text{tđ} = R_1 + R_2$' },
  },
  {
    slug: 'cong-suat-dien',
    topic: 'dien-hoc',
    nav: 'Công suất điện',
    title: 'Công suất điện',
    summary:
      'Số oát ghi trên bóng đèn là công suất định mức. Đóng khóa K, đọc ampe kế để tính cường độ dòng điện, điện trở hoặc công suất của đèn.',
    rule: { term: 'Công suất điện', text: '$\\mathscr{P} = U \\times I$' },
  },
  {
    slug: 'dien-nang',
    topic: 'dien-hoc',
    nav: 'Điện năng',
    title: 'Điện năng, tiền điện',
    summary:
      'Ấm điện, nồi cơm điện, quạt, máy điều hòa dùng mỗi ngày. Công tơ điện đếm điện năng tiêu thụ theo kWh để tính tiền điện.',
    rule: { term: 'Điện năng', text: '$A = \\mathscr{P} \\times t$' },
  },
  {
    slug: 'cam-ung-dien-tu',
    topic: 'dien-hoc',
    nav: 'Cảm ứng điện từ',
    title: 'Cảm ứng điện từ, dòng điện xoay chiều',
    summary:
      'Đưa nam châm vào, giữ yên rồi kéo ra khỏi cuộn dây để thấy khi nào có dòng điện cảm ứng. Khung dây quay trong từ trường tạo ra dòng điện xoay chiều đổi chiều 2 lần mỗi vòng.',
    rule: { term: 'Tần số dòng điện', text: '$f = n$ (số vòng quay mỗi giây)' },
  },

  // ---------------- Hóa học 9: Kim loại và phi kim ----------------
  {
    slug: 'tinh-chat-kim-loai',
    topic: 'kim-loai',
    nav: 'Tính chất kim loại',
    title: 'Tính chất hóa học chung của kim loại',
    summary:
      'Kim loại cháy trong oxygen, chlorine và tác dụng với dung dịch acid giải phóng khí hydrogen. Tính khối lượng sản phẩm và thể tích khí ở điều kiện chuẩn.',
    rule: { term: 'Kim loại + acid', text: 'muối + khí hydrogen' },
  },
  {
    slug: 'day-hoat-dong-hoa-hoc',
    topic: 'kim-loai',
    nav: 'Dãy hoạt động',
    title: 'Dãy hoạt động hóa học của kim loại',
    summary:
      'Nhúng thanh kim loại vào dung dịch acid hoặc muối: kim loại đứng trước đẩy được kim loại đứng sau ra khỏi dung dịch muối, kim loại đứng trước H đẩy được hydrogen ra khỏi acid.',
    rule: { term: 'Dãy hoạt động', text: 'K Na Ca Mg Al Zn Fe Pb H Cu Ag Au' },
  },
  {
    slug: 'tach-kim-loai-hop-kim',
    topic: 'kim-loai',
    nav: 'Tách kim loại, hợp kim',
    title: 'Tách kim loại và việc sử dụng hợp kim',
    summary:
      'Luyện gang từ quặng hematite trong lò cao, điện phân nhôm oxide nóng chảy, và xác định thành phần đồng thau bằng dung dịch acid. Tính lượng kim loại thu được theo hiệu suất.',
    rule: { term: 'Lò cao', text: '$\\mathrm{Fe_2O_3} + 3\\mathrm{CO} \\rightarrow 2\\mathrm{Fe} + 3\\mathrm{CO_2}$' },
  },
  {
    slug: 'kim-loai-va-phi-kim',
    topic: 'kim-loai',
    nav: 'Kim loại và phi kim',
    title: 'Sự khác nhau cơ bản giữa kim loại và phi kim',
    summary:
      'Đốt lưu huỳnh, carbon, phosphorus, sodium, calcium trong oxygen rồi hòa oxide vào nước có giấy quỳ: oxide phi kim cho acid làm quỳ hóa đỏ, oxide kim loại cho base làm quỳ hóa xanh.',
    rule: { term: 'Oxide phi kim + nước', text: 'acid, quỳ tím hóa đỏ' },
  },

  // ---------------- Hóa học 9: Hydrocarbon và nhiên liệu ----------------
  {
    slug: 'hop-chat-huu-co',
    topic: 'hydrocarbon',
    nav: 'Hợp chất hữu cơ',
    title: 'Giới thiệu về hợp chất hữu cơ',
    summary:
      'Lắp mô hình phân tử methane, ethanol, acetic acid… từng nguyên tử. Tính phần trăm khối lượng các nguyên tố, hoặc tìm công thức phân tử từ phần trăm và khối lượng mol.',
    rule: { term: '% khối lượng C', text: '$\\%\\mathrm{C} = 12 \\times x \\times 100 \\chia M$' },
  },
  {
    slug: 'alkane',
    topic: 'hydrocarbon',
    nav: 'Alkane',
    title: 'Alkane',
    summary:
      'Methane, ethane, propane, butane cháy tạo carbon dioxide và nước, tham gia phản ứng thế với chlorine khi có ánh sáng. Tính lượng oxygen cần dùng và sản phẩm tạo thành.',
    rule: { term: 'Alkane', text: '$\\mathrm{C_nH_{2n+2}}$, chỉ có liên kết đơn' },
  },
  {
    slug: 'alkene',
    topic: 'hydrocarbon',
    nav: 'Alkene',
    title: 'Alkene',
    summary:
      'Dẫn ethylene vào nước bromine: màu da cam nhạt dần vì phản ứng cộng. Tách ethylene khỏi methane, đốt cháy ethylene và trùng hợp thành polyethylene.',
    rule: { term: 'Alkene', text: '$\\mathrm{C_nH_{2n}}$, có một liên kết đôi' },
  },
  {
    slug: 'nguon-nhien-lieu',
    topic: 'hydrocarbon',
    nav: 'Nguồn nhiên liệu',
    title: 'Nguồn nhiên liệu',
    summary:
      'Đốt khí methane, khí gas (butane) hay than để đun nước: tính nhiệt lượng tỏa ra, lượng nhiên liệu cần dùng theo hiệu suất và lượng khí carbon dioxide thải vào không khí.',
    rule: { term: 'Nhiệt lượng tỏa ra', text: '$Q = n \\times Q_\\text{1 mol}$' },
  },

  // ---------------- Hóa học 9: Ethylic alcohol và acetic acid ----------------
  {
    slug: 'ethylic-alcohol',
    topic: 'ruou-axit',
    nav: 'Ethylic alcohol',
    title: 'Ethylic alcohol',
    summary:
      'Ethylic alcohol cháy với ngọn lửa xanh, tác dụng với sodium giải phóng hydrogen, được điều chế bằng cách lên men glucose. Tính độ cồn, lượng chất tham gia và sản phẩm.',
    rule: { term: 'Độ cồn', text: '$V_\\text{rượu} \\times 100 \\chia V_\\text{dung dịch}$' },
  },
  {
    slug: 'acetic-acid',
    topic: 'ruou-axit',
    nav: 'Acetic acid',
    title: 'Acetic acid',
    summary:
      'Acetic acid (có trong giấm ăn) tác dụng với base, kim loại, muối carbonate và với ethylic alcohol tạo ester. Tính lượng chất theo phương trình và hiệu suất.',
    rule: { term: 'Ester hóa', text: '$\\mathrm{CH_3COOH} + \\mathrm{C_2H_5OH} \\rightleftharpoons \\mathrm{CH_3COOC_2H_5} + \\mathrm{H_2O}$' },
  },

  // ---------------- Hóa học 9: Lipid, carbohydrate, protein, polymer ----------------
  {
    slug: 'lipid',
    topic: 'hop-chat-thien-nhien',
    nav: 'Lipid',
    title: 'Lipid',
    summary:
      'Chất béo là ester của glycerol và acid béo. Đun chất béo với dung dịch kiềm (phản ứng xà phòng hóa) thu được xà phòng và glycerol. Tính lượng xà phòng, áp dụng bảo toàn khối lượng.',
    rule: { term: 'Xà phòng hóa', text: 'chất béo + kiềm → muối của acid béo (xà phòng) + glycerol' },
  },
  {
    slug: 'glucose-saccharose',
    topic: 'hop-chat-thien-nhien',
    nav: 'Glucose, saccharose',
    title: 'Glucose và saccharose',
    summary:
      'Glucose tham gia phản ứng tráng bạc, lên men tạo ethylic alcohol; saccharose thủy phân tạo glucose và fructose; cây xanh tạo glucose nhờ quang hợp.',
    rule: { term: 'Glucose', text: '$\\mathrm{C_6H_{12}O_6}$, có trong quả chín, mật ong' },
  },
  {
    slug: 'tinh-bot-cellulose',
    topic: 'hop-chat-thien-nhien',
    nav: 'Tinh bột, cellulose',
    title: 'Tinh bột và cellulose',
    summary:
      'Thủy phân tinh bột, cellulose tạo glucose; sản xuất ethylic alcohol từ gạo, ngô, sắn; cây xanh tạo tinh bột từ carbon dioxide và nước. Tính theo hàm lượng và hiệu suất.',
    rule: { term: 'Thủy phân', text: '$(\\mathrm{C_6H_{10}O_5})_n + n\\mathrm{H_2O} \\rightarrow n\\mathrm{C_6H_{12}O_6}$' },
  },
  {
    slug: 'protein',
    topic: 'hop-chat-thien-nhien',
    nav: 'Protein',
    title: 'Protein',
    summary:
      'Protein tạo bởi các amino acid. Tính phần trăm nitrogen trong amino acid, khối lượng amino acid khi thủy phân peptide, và lượng thực phẩm cần ăn để đủ protein mỗi ngày.',
    rule: { term: 'Thủy phân protein', text: 'protein + nước → hỗn hợp amino acid' },
  },
  {
    slug: 'polymer',
    topic: 'hop-chat-thien-nhien',
    nav: 'Polymer',
    title: 'Polymer',
    summary:
      'Nhiều phân tử monomer nối với nhau thành polymer: PE, PVC, polystyrene. Tính hệ số polymer hóa, khối lượng polymer theo hiệu suất và phần trăm chlorine trong PVC.',
    rule: { term: 'Hệ số polymer hóa', text: '$n = M_\\text{polymer} \\chia M_\\text{mắt xích}$' },
  },

  // ---------------- Hóa học 9: Tài nguyên từ vỏ Trái Đất ----------------
  {
    slug: 'vo-trai-dat',
    topic: 'vo-trai-dat',
    nav: 'Vỏ Trái Đất',
    title: 'Sơ lược về hóa học vỏ Trái Đất',
    summary:
      'Oxygen và silicon chiếm phần lớn vỏ Trái Đất; kim loại nằm trong các khoáng vật, quặng. Tính phần trăm kim loại trong khoáng vật và khối lượng kim loại có trong quặng.',
    rule: { term: '% kim loại trong khoáng vật', text: '$x \\times M_\\text{kim loại} \\times 100 \\chia M_\\text{khoáng vật}$' },
  },
  {
    slug: 'da-voi-silicate',
    topic: 'vo-trai-dat',
    nav: 'Đá vôi, silicate',
    title: 'Khai thác đá vôi. Công nghiệp silicate',
    summary:
      'Nung đá vôi trong lò nung vôi tạo vôi sống và khí carbon dioxide, tôi vôi tạo vôi tôi; nấu thủy tinh từ cát, soda và đá vôi. Tính khối lượng sản phẩm theo hàm lượng và hiệu suất.',
    rule: { term: 'Nung vôi', text: '$\\mathrm{CaCO_3} \\xrightarrow{t^\\circ} \\mathrm{CaO} + \\mathrm{CO_2}$' },
  },
  {
    slug: 'nhien-lieu-hoa-thach',
    topic: 'vo-trai-dat',
    nav: 'Chu trình carbon',
    title: 'Nhiên liệu hóa thạch. Chu trình carbon và sự ấm lên toàn cầu',
    summary:
      'Đốt xăng, than thải carbon dioxide vào khí quyển; cây xanh và đại dương hấp thụ lại một phần. Tính lượng CO₂ thải ra và số cây xanh cần trồng để bù lại.',
    rule: { term: 'Ấm lên toàn cầu', text: 'khí nhà kính (CO₂, CH₄…) tăng làm nhiệt độ Trái Đất tăng' },
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

export function getSubject(id: SubjectId) {
  const subject = SUBJECTS.find((s) => s.id === id);
  if (!subject) throw new Error(`Không tìm thấy môn: ${id}`);
  return subject;
}

export function getGrade(id: GradeId) {
  const grade = GRADES.find((g) => g.id === id);
  if (!grade) throw new Error(`Không tìm thấy lớp: ${id}`);
  return grade;
}

export const lessonsOf = (topic: TopicId) => LESSONS.filter((l) => l.topic === topic);
export const topicsOf = (subject: SubjectId) => TOPICS.filter((t) => t.subject === subject);
export const subjectsOf = (grade: GradeId) => SUBJECTS.filter((s) => s.grade === grade);

/** Lớp, môn, chủ đề của một bài (cho đường dẫn ngược) */
export function trailOf(slug: LessonSlug) {
  const lesson = getLesson(slug);
  const topic = getTopic(lesson.topic);
  const subject = getSubject(topic.subject);
  const grade = getGrade(subject.grade);
  return { lesson, topic, subject, grade };
}

/** Tra ngược từ đường dẫn; trả undefined nếu không khớp (trang gọi notFound) */
export const gradeByNo = (no: string) => GRADES.find((g) => g.no === no);
export const subjectBySlug = (grade: GradeId, slug: string) =>
  subjectsOf(grade).find((s) => s.slug === slug);
export const topicIn = (subject: SubjectId, id: string) => topicsOf(subject).find((t) => t.id === id);

/** Đường dẫn tới trang của lớp, môn, chủ đề (dùng cho mọi liên kết, không tự ghép chuỗi) */
export const classHref = (grade: GradeId) => `/classes/${getGrade(grade).no}/subjects`;

export function subjectHref(id: SubjectId) {
  const s = getSubject(id);
  return `${classHref(s.grade)}/${s.slug}`;
}

export const topicHref = (id: TopicId) => `${subjectHref(getTopic(id).subject)}/topics/${id}`;

export const lessonCountOfSubject = (subject: SubjectId) =>
  topicsOf(subject).reduce((n, t) => n + lessonsOf(t.id).length, 0);
