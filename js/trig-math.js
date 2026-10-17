/**
 * TrigoLab - Modul Matematika Trigonometri
 * Menyediakan fungsi perhitungan sudut, konversi radian, tabel nilai eksak,
 * dan pendeteksian sifat-sifat matematis trigonometri.
 */

const TrigMath = (() => {
  const PI = Math.PI;
  const TWO_PI = Math.PI * 2;

  // Konversi Derajat <-> Radian
  function degToRad(deg) {
    return (deg * PI) / 180;
  }

  function radToDeg(rad) {
    return (rad * 180) / PI;
  }

  // Normalisasi sudut ke rentang [0, 360)
  function normalizeAngleDeg(deg) {
    let norm = deg % 360;
    if (norm < 0) norm += 360;
    return norm;
  }

  // Identifikasi Kuadran
  function getQuadrant(deg) {
    const angle = normalizeAngleDeg(deg);
    if (angle === 0 || angle === 360) return { quad: 1, label: 'Batas Sumbu +X (0° / 360°)', rule: 'cos = 1, sin = 0' };
    if (angle === 90) return { quad: 1, label: 'Batas Sumbu +Y (90°)', rule: 'sin = 1, cos = 0' };
    if (angle === 180) return { quad: 2, label: 'Batas Sumbu -X (180°)', rule: 'cos = -1, sin = 0' };
    if (angle === 270) return { quad: 3, label: 'Batas Sumbu -Y (270°)', rule: 'sin = -1, cos = 0' };

    if (angle > 0 && angle < 90) {
      return {
        quad: 1,
        label: 'Kuadran I (0° – 90°)',
        desc: 'Semua fungsi bernilai Positif (+)',
        sinSign: '+', cosSign: '+', tanSign: '+'
      };
    } else if (angle > 90 && angle < 180) {
      return {
        quad: 2,
        label: 'Kuadran II (90° – 180°)',
        desc: 'Hanya Sinus bernilai Positif (+)',
        sinSign: '+', cosSign: '-', tanSign: '-'
      };
    } else if (angle > 180 && angle < 270) {
      return {
        quad: 3,
        label: 'Kuadran III (180° – 270°)',
        desc: 'Hanya Tangen bernilai Positif (+)',
        sinSign: '-', cosSign: '-', tanSign: '+'
      };
    } else {
      return {
        quad: 4,
        label: 'Kuadran IV (270° – 360°)',
        desc: 'Hanya Cosinus bernilai Positif (+)',
        sinSign: '-', cosSign: '+', tanSign: '-'
      };
    }
  }

  // Cek apakah mendekati asimtot tangen ((2k + 1) * 90 derajat)
  function isNearAsymptote(deg, threshold = 0.5) {
    const norm = normalizeAngleDeg(deg);
    return Math.abs(norm - 90) < threshold || Math.abs(norm - 270) < threshold;
  }

  // Format pecahan pi untuk label sumbu X
  function formatPiFraction(factor) {
    // factor * PI
    if (Math.abs(factor) < 1e-5) return '0';
    if (Math.abs(factor - 1) < 1e-5) return 'π';
    if (Math.abs(factor + 1) < 1e-5) return '-π';
    if (Math.abs(factor - 2) < 1e-5) return '2π';
    if (Math.abs(factor + 2) < 1e-5) return '-2π';

    const fractions = [
      { f: 1/6, s: 'π/6' },
      { f: 1/4, s: 'π/4' },
      { f: 1/3, s: 'π/3' },
      { f: 1/2, s: 'π/2' },
      { f: 2/3, s: '2π/3' },
      { f: 3/4, s: '3π/4' },
      { f: 5/6, s: '5π/6' },
      { f: 7/6, s: '7π/6' },
      { f: 5/4, s: '5π/4' },
      { f: 4/3, s: '4π/3' },
      { f: 3/2, s: '3π/2' },
      { f: 5/3, s: '5π/3' },
      { f: 7/4, s: '7π/4' },
      { f: 11/6, s: '11π/6' },
      { f: -1/2, s: '-π/2' },
      { f: -3/2, s: '-3π/2' },
      { f: -1/4, s: '-π/4' }
    ];

    for (let item of fractions) {
      if (Math.abs(factor - item.f) < 0.02) return item.s;
    }
    return `${factor.toFixed(2)}π`;
  }

  // Tabel sudut-sudut istimewa lengkap beserta nilai eksak pecahan bentuk akar
  const SPECIAL_ANGLES = [
    { deg: 0, radStr: '0', sinExact: '0', cosExact: '1', tanExact: '0', isAsymptote: false },
    { deg: 30, radStr: 'π/6', sinExact: '1/2', cosExact: '½√3', tanExact: '⅓√3', isAsymptote: false },
    { deg: 45, radStr: 'π/4', sinExact: '½√2', cosExact: '½√2', tanExact: '1', isAsymptote: false },
    { deg: 60, radStr: 'π/3', sinExact: '½√3', cosExact: '1/2', tanExact: '√3', isAsymptote: false },
    { deg: 90, radStr: 'π/2', sinExact: '1', cosExact: '0', tanExact: '∞ (Tak Terdefinisi)', isAsymptote: true },
    { deg: 120, radStr: '2π/3', sinExact: '½√3', cosExact: '-1/2', tanExact: '-√3', isAsymptote: false },
    { deg: 135, radStr: '3π/4', sinExact: '½√2', cosExact: '-½√2', tanExact: '-1', isAsymptote: false },
    { deg: 150, radStr: '5π/6', sinExact: '1/2', cosExact: '-½√3', tanExact: '-⅓√3', isAsymptote: false },
    { deg: 180, radStr: 'π', sinExact: '0', cosExact: '-1', tanExact: '0', isAsymptote: false },
    { deg: 210, radStr: '7π/6', sinExact: '-1/2', cosExact: '-½√3', tanExact: '⅓√3', isAsymptote: false },
    { deg: 225, radStr: '5π/4', sinExact: '-½√2', cosExact: '-½√2', tanExact: '1', isAsymptote: false },
    { deg: 240, radStr: '4π/3', sinExact: '-½√3', cosExact: '-1/2', tanExact: '√3', isAsymptote: false },
    { deg: 270, radStr: '3π/2', sinExact: '-1', cosExact: '0', tanExact: '-∞ (Tak Terdefinisi)', isAsymptote: true },
    { deg: 300, radStr: '5π/3', sinExact: '-½√3', cosExact: '1/2', tanExact: '-√3', isAsymptote: false },
    { deg: 315, radStr: '7π/4', sinExact: '-½√2', cosExact: '½√2', tanExact: '-1', isAsymptote: false },
    { deg: 330, radStr: '11π/6', sinExact: '-1/2', cosExact: '½√3', tanExact: '-⅓√3', isAsymptote: false },
    { deg: 360, radStr: '2π', sinExact: '0', cosExact: '1', tanExact: '0', isAsymptote: false }
  ];

  // Cari apakah ada data sudut istimewa yang persis cocok
  function findSpecialAngle(deg) {
    const norm = normalizeAngleDeg(deg);
    return SPECIAL_ANGLES.find(item => Math.abs(item.deg - norm) < 0.2) || null;
  }

  // Hitung nilai gelombang transformasi: A * f(B * x + C) + D
  function evaluateWave(funcType, xRad, A = 1, B = 1, C = 0, D = 0) {
    const arg = B * xRad + C;
    let baseVal = 0;
    if (funcType === 'sin') {
      baseVal = Math.sin(arg);
    } else if (funcType === 'cos') {
      baseVal = Math.cos(arg);
    } else if (funcType === 'tan') {
      baseVal = Math.tan(arg);
      // Tangani nilai asimtot ekstrim
      if (Math.abs(baseVal) > 50) {
        baseVal = Math.sign(baseVal) * 50;
      }
    }
    return A * baseVal + D;
  }

  return {
    PI,
    TWO_PI,
    degToRad,
    radToDeg,
    normalizeAngleDeg,
    getQuadrant,
    isNearAsymptote,
    formatPiFraction,
    SPECIAL_ANGLES,
    findSpecialAngle,
    evaluateWave
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TrigMath;
}
