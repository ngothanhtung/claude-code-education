/**
 * Danh mục mô hình phân tử 3D (tọa độ thật từ PubChem, lưu ở public/molecules/<file>.sdf).
 * Thêm phân tử: tải SDF 3D từ PubChem (xem CLAUDE.md), thêm một mục ở đây.
 */
import { METAL_LATTICE, diamondLike, diatomic, graphite, metal, nearest, nobleGas, rockSalt } from './crystals';

export interface Mol3D {
  name: string;
  formula: string;
  /** điều học sinh cần nhìn thấy ở mô hình 3D */
  note: string;
  /** tọa độ dựng bằng code (định dạng XYZ) thay cho file SDF của PubChem */
  gen?: () => string;
  /** chỉ vẽ quả cầu (mạng kim loại, ion, khí hiếm): bán kính theo nguyên tố (Å) */
  spheres?: Record<string, number>;
}

export const MOL3D = {
  methane: { name: 'methane', formula: 'CH₄', note: 'tứ diện đều, góc liên kết khoảng 109,5°' },
  ethane: { name: 'ethane', formula: 'C₂H₆', note: 'liên kết đơn C–C, hai nhóm CH₃ quay quanh trục' },
  propane: { name: 'propane', formula: 'C₃H₈', note: 'mạch carbon gấp khúc, không thẳng' },
  butane: { name: 'butane', formula: 'C₄H₁₀', note: 'mạch carbon gấp khúc (zigzag)' },
  ethylene: { name: 'ethylene', formula: 'C₂H₄', note: 'liên kết đôi C=C, cả phân tử nằm trên một mặt phẳng' },
  propylene: { name: 'propylene', formula: 'C₃H₆', note: 'một liên kết đôi C=C ở đầu mạch' },
  acetylene: { name: 'acetylene', formula: 'C₂H₂', note: 'liên kết ba C≡C, bốn nguyên tử thẳng hàng' },
  ethanol: { name: 'ethylic alcohol', formula: 'C₂H₅OH', note: 'có nhóm –OH' },
  'dimethyl-ether': { name: 'dimethyl ether', formula: 'CH₃–O–CH₃', note: 'cùng công thức C₂H₆O với ethanol nhưng không có nhóm –OH' },
  'acetic-acid': { name: 'acetic acid', formula: 'CH₃COOH', note: 'có nhóm –COOH' },
  'ethyl-acetate': { name: 'ethyl acetate', formula: 'CH₃COOC₂H₅', note: 'ester tạo từ acetic acid và ethanol' },
  glucose: { name: 'glucose', formula: 'C₆H₁₂O₆', note: 'vòng 6 cạnh (5 C và 1 O)' },
  fructose: { name: 'fructose', formula: 'C₆H₁₂O₆', note: 'vòng 5 cạnh (4 C và 1 O): cùng công thức, khác cấu tạo glucose' },
  sucrose: { name: 'saccharose', formula: 'C₁₂H₂₂O₁₁', note: 'một vòng glucose và một vòng fructose nối qua nguyên tử O' },
  maltose: { name: 'maltose (đơn vị của tinh bột)', formula: 'C₁₂H₂₂O₁₁', note: 'hai vòng glucose nối kiểu α: mạch tinh bột cuộn xoắn' },
  cellobiose: { name: 'cellobiose (đơn vị của cellulose)', formula: 'C₁₂H₂₂O₁₁', note: 'hai vòng glucose nối kiểu β, lật ngược nhau: mạch cellulose thẳng, bền' },
  glycine: { name: 'glycine', formula: 'H₂N–CH₂–COOH', note: 'nhóm –NH₂ và nhóm –COOH' },
  alanine: { name: 'alanine', formula: 'CH₃–CH(NH₂)–COOH', note: 'như glycine nhưng có thêm nhóm –CH₃' },
  glycylglycine: { name: 'Gly-Gly', formula: 'C₄H₈N₂O₃', note: 'hai glycine nối bằng liên kết peptide –CO–NH–' },

  // ---- chất vô cơ hay gặp ----
  water: { name: 'nước', formula: 'H₂O', note: 'phân tử gấp khúc, góc liên kết khoảng 104,5°' },
  'carbon-dioxide': { name: 'carbon dioxide', formula: 'CO₂', note: 'phân tử thẳng hàng O=C=O' },
  'carbon-monoxide': { name: 'carbon monoxide', formula: 'CO', note: 'phân tử hai nguyên tử, liên kết ba' },
  ammonia: { name: 'ammonia', formula: 'NH₃', note: 'hình chóp tam giác, N ở đỉnh' },
  'hydrogen-chloride': { name: 'hydrogen chloride', formula: 'HCl', note: 'phân tử hai nguyên tử H–Cl' },
  'hydrogen-sulfide': { name: 'hydrogen sulfide', formula: 'H₂S', note: 'phân tử gấp khúc như nước' },
  'sulfur-dioxide': { name: 'sulfur dioxide', formula: 'SO₂', note: 'phân tử gấp khúc' },
  'sulfur-trioxide': { name: 'sulfur trioxide', formula: 'SO₃', note: 'tam giác phẳng, S ở tâm' },
  'sulfuric-acid': { name: 'sulfuric acid', formula: 'H₂SO₄', note: 'S ở tâm tứ diện của 4 nguyên tử O' },
  'nitric-acid': { name: 'nitric acid', formula: 'HNO₃', note: 'N ở tâm tam giác phẳng của 3 nguyên tử O' },
  nacl: {
    name: 'muối ăn (sodium chloride)', formula: 'NaCl', note: 'không có phân tử riêng: ion Na⁺ (tím, nhỏ) và Cl⁻ (xanh lá, lớn) xen kẽ trong mạng lập phương',
    gen: rockSalt, spheres: { Na: 1.02, Cl: 1.81 },
  },

  // ---- đơn chất phi kim dạng phân tử ----
  h2: { name: 'hydrogen', formula: 'H₂', note: 'phân tử hai nguyên tử H, liên kết đơn', gen: () => diatomic('H', 0.74) },
  f2: { name: 'fluorine', formula: 'F₂', note: 'phân tử hai nguyên tử F, liên kết đơn', gen: () => diatomic('F', 1.42) },
  nitrogen: { name: 'nitrogen', formula: 'N₂', note: 'phân tử hai nguyên tử, liên kết ba rất bền' },
  oxygen: { name: 'oxygen', formula: 'O₂', note: 'phân tử hai nguyên tử, liên kết đôi' },
  ozone: { name: 'ozone', formula: 'O₃', note: 'ba nguyên tử O, phân tử gấp khúc' },
  chlorine: { name: 'chlorine', formula: 'Cl₂', note: 'phân tử hai nguyên tử Cl' },
  bromine: { name: 'bromine', formula: 'Br₂', note: 'phân tử hai nguyên tử Br' },
  iodine: { name: 'iodine', formula: 'I₂', note: 'phân tử hai nguyên tử I' },
  'phosphorus-p4': { name: 'phosphorus trắng', formula: 'P₄', note: 'bốn nguyên tử P ở bốn đỉnh một tứ diện' },
  'sulfur-s8': { name: 'sulfur', formula: 'S₈', note: 'tám nguyên tử S tạo vòng gấp khúc như vương miện' },

  // ---- carbon, silicon: mạng tinh thể nguyên tử ----
  diamond: { name: 'kim cương', formula: 'C', note: 'mỗi C liên kết với 4 C theo hình tứ diện, mạng rất bền: cứng nhất', gen: () => diamondLike('C') },
  graphite: { name: 'than chì', formula: 'C', note: 'các lớp lục giác xếp chồng, lớp dễ trượt: mềm, dẫn điện', gen: graphite },
  silicon: { name: 'silicon', formula: 'Si', note: 'mạng giống kim cương, mỗi Si liên kết với 4 Si', gen: () => diamondLike('Si') },
} satisfies Record<string, Mol3D>;

type BaseId = keyof typeof MOL3D;

const LATTICE_NAME = { bcc: 'mạng lập phương tâm khối', fcc: 'mạng lập phương tâm mặt', hcp: 'mạng lục phương' } as const;
const NOBLE = ['He', 'Ne', 'Ar', 'Kr', 'Xe'] as const;
/** bán kính van der Waals của khí hiếm (Å) */
const NOBLE_R: Record<string, number> = { He: 1.4, Ne: 1.54, Ar: 1.88, Kr: 2.02, Xe: 2.16 };

/** Danh mục đầy đủ: thêm mạng kim loại và khí hiếm dựng bằng code */
export const ALL3D: Record<string, Mol3D> = {
  ...MOL3D,
  ...Object.fromEntries(
    Object.entries(METAL_LATTICE).map(([el, m]) => [
      `metal-${el}`,
      {
        name: el,
        formula: el,
        note: `kim loại: ${LATTICE_NAME[m.type]}, các nguyên tử xếp sát nhau`,
        gen: () => metal(el),
        spheres: { [el]: nearest(m) / 2 },
      },
    ]),
  ),
  ...Object.fromEntries(
    NOBLE.map((el) => [
      `noble-${el}`,
      { name: el, formula: el, note: 'khí hiếm: các nguyên tử đứng riêng lẻ, không liên kết với nhau', gen: () => nobleGas(el), spheres: { [el]: NOBLE_R[el] } },
    ]),
  ),
};

export type Mol3DId = BaseId | `metal-${string}` | `noble-${string}`;

export interface Mol3DGroup {
  label: string;
  files: Mol3DId[];
}

/** Đơn chất của mỗi nguyên tố (bảng tuần hoàn) */
export interface SolidView {
  kind: string;
  files: Mol3DId[];
  groups?: Mol3DGroup[];
  initialGroup?: number;
}

const SOLIDS: Record<string, SolidView> = {
  H: { kind: 'phân tử H₂', files: ['h2'] },
  N: { kind: 'phân tử N₂', files: ['nitrogen'] },
  O: { kind: 'phân tử O₂ (và ozone O₃)', files: ['oxygen', 'ozone'], groups: [{ label: 'O₂ – O₃', files: ['oxygen', 'ozone'] }] },
  F: { kind: 'phân tử F₂', files: ['f2'] },
  Cl: { kind: 'phân tử Cl₂', files: ['chlorine'] },
  Br: { kind: 'phân tử Br₂', files: ['bromine'] },
  I: { kind: 'phân tử I₂', files: ['iodine'] },
  P: { kind: 'phân tử P₄ (phosphorus trắng)', files: ['phosphorus-p4'] },
  S: { kind: 'phân tử S₈', files: ['sulfur-s8'] },
  C: {
    kind: 'kim cương và than chì: cùng nguyên tố, cấu trúc khác nhau',
    files: ['diamond', 'graphite'],
    groups: [{ label: 'kim cương – than chì', files: ['diamond', 'graphite'] }],
    initialGroup: 0,
  },
  Si: { kind: 'mạng tinh thể giống kim cương', files: ['silicon'] },
  ...Object.fromEntries(Object.keys(METAL_LATTICE).map((el) => [el, { kind: 'mạng tinh thể kim loại', files: [`metal-${el}` as Mol3DId] }])),
  ...Object.fromEntries(NOBLE.map((el) => [el, { kind: 'khí đơn nguyên tử', files: [`noble-${el}` as Mol3DId] }])),
};

export const solidOf = (symbol: string): SolidView | undefined => SOLIDS[symbol];

/** Công thức gõ trong ô khối lượng mol → mô hình 3D (nhiều chất cùng công thức thì so sánh) */
const BY_FORMULA: Record<string, SolidView> = {
  H2O: { kind: '', files: ['water'] }, CO2: { kind: '', files: ['carbon-dioxide'] }, CO: { kind: '', files: ['carbon-monoxide'] },
  NH3: { kind: '', files: ['ammonia'] }, HCl: { kind: '', files: ['hydrogen-chloride'] }, H2S: { kind: '', files: ['hydrogen-sulfide'] },
  SO2: { kind: '', files: ['sulfur-dioxide'] }, SO3: { kind: '', files: ['sulfur-trioxide'] }, H2SO4: { kind: '', files: ['sulfuric-acid'] },
  HNO3: { kind: '', files: ['nitric-acid'] }, NaCl: { kind: '', files: ['nacl'] },
  H2: { kind: '', files: ['h2'] }, N2: { kind: '', files: ['nitrogen'] }, O2: { kind: '', files: ['oxygen'] }, O3: { kind: '', files: ['ozone'] },
  F2: { kind: '', files: ['f2'] }, Cl2: { kind: '', files: ['chlorine'] }, Br2: { kind: '', files: ['bromine'] }, I2: { kind: '', files: ['iodine'] },
  P4: { kind: '', files: ['phosphorus-p4'] }, S8: { kind: '', files: ['sulfur-s8'] },
  CH4: { kind: '', files: ['methane'] }, C2H6: { kind: '', files: ['ethane'] }, C3H8: { kind: '', files: ['propane'] }, C4H10: { kind: '', files: ['butane'] },
  C2H4: { kind: '', files: ['ethylene'] }, C3H6: { kind: '', files: ['propylene'] }, C2H2: { kind: '', files: ['acetylene'] },
  C2H5OH: { kind: '', files: ['ethanol'] }, CH3CH2OH: { kind: '', files: ['ethanol'] }, CH3OCH3: { kind: '', files: ['dimethyl-ether'] },
  C2H6O: {
    kind: 'có hai chất cùng công thức C₂H₆O', files: ['ethanol', 'dimethyl-ether'],
    groups: [{ label: 'ethanol – dimethyl ether', files: ['ethanol', 'dimethyl-ether'] }], initialGroup: 0,
  },
  CH3COOH: { kind: '', files: ['acetic-acid'] }, C2H4O2: { kind: '', files: ['acetic-acid'] }, CH3COOC2H5: { kind: '', files: ['ethyl-acetate'] },
  C6H12O6: {
    kind: 'glucose và fructose cùng công thức C₆H₁₂O₆', files: ['glucose', 'fructose'],
    groups: [{ label: 'glucose – fructose', files: ['glucose', 'fructose'] }], initialGroup: 0,
  },
  C12H22O11: {
    kind: 'saccharose, maltose, cellobiose cùng công thức C₁₂H₂₂O₁₁', files: ['sucrose', 'maltose', 'cellobiose'],
    groups: [{ label: 'saccharose – maltose – cellobiose', files: ['sucrose', 'maltose', 'cellobiose'] }], initialGroup: 0,
  },
  C2H5NO2: { kind: '', files: ['glycine'] }, H2NCH2COOH: { kind: '', files: ['glycine'] }, C3H7NO2: { kind: '', files: ['alanine'] },
};

/** Chuẩn hóa công thức gõ vào: bỏ khoảng trắng, đổi chỉ số dạng ₂ thành 2 */
export function view3dOfFormula(input: string): SolidView | undefined {
  const key = input.trim().replace(/[₀-₉]/g, (d) => String(d.charCodeAt(0) - 0x2080)).replace(/\s+/g, '');
  return BY_FORMULA[key];
}
