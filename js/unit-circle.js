/**
 * TrigoLab - UnitCircle (Visualisasi Lingkaran Satuan Interaktif)
 * Menggambar lingkaran satuan, vektor sudut, segitiga siku-siku trigonometri,
 * garis tangen, dan mendukung interaksi drag/touch.
 */

class UnitCircleVisualizer {
  constructor(canvas, onAngleChange) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onAngleChange = onAngleChange;

    this.angleDeg = 45; // Sudut default
    this.isDragging = false;
    this.showSin = true;
    this.showCos = true;
    this.showTan = true;
    this.showTriangle = true;
    this.showAngleArc = true;

    this.radius = 120;
    this.centerX = 0;
    this.centerY = 0;

    this.initEvents();
    this.resize();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || 320;
    const height = rect.height || 320;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.centerX = width / 2;
    this.centerY = height / 2;
    // Radius adaptif
    this.radius = Math.min(width, height) * 0.36;
    this.render();
  }

  setAngle(deg) {
    this.angleDeg = deg;
    this.render();
  }

  setToggles({ showSin, showCos, showTan, showTriangle, showAngleArc }) {
    if (showSin !== undefined) this.showSin = showSin;
    if (showCos !== undefined) this.showCos = showCos;
    if (showTan !== undefined) this.showTan = showTan;
    if (showTriangle !== undefined) this.showTriangle = showTriangle;
    if (showAngleArc !== undefined) this.showAngleArc = showAngleArc;
    this.render();
  }

  initEvents() {
    const handleMove = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = clientX - rect.left - this.centerX;
      const y = -(clientY - rect.top - this.centerY); // Invert Y sumbu kartesius

      let rad = Math.atan2(y, x);
      if (rad < 0) rad += 2 * Math.PI;
      const deg = (rad * 180) / Math.PI;

      if (this.onAngleChange) {
        this.onAngleChange(deg);
      }
    };

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      handleMove(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        handleMove(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Sentuhan Touchscreen (HP / Tablet)
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.isDragging = true;
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  // Mengembalikan koordinat absolut ujung titik P(cos, sin) di layar untuk laser proyeksi
  getScreenPoint() {
    const rad = TrigMath.degToRad(this.angleDeg);
    const cosVal = Math.cos(rad);
    const sinVal = Math.sin(rad);
    const px = this.centerX + cosVal * this.radius;
    const py = this.centerY - sinVal * this.radius;
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: rect.left + px,
      y: rect.top + py,
      canvasX: px,
      canvasY: py,
      cosVal,
      sinVal,
      rad
    };
  }

  render() {
    const ctx = this.ctx;
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);
    const cx = this.centerX;
    const cy = this.centerY;
    const R = this.radius;

    ctx.clearRect(0, 0, width, height);

    // 1. Gambar Grid Koordinat Halus
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    const gridStep = R / 4;
    for (let x = cx % gridStep; x < width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = cy % gridStep; y < height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Sumbu X dan Sumbu Y
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    // Sumbu X
    ctx.beginPath();
    ctx.moveTo(15, cy);
    ctx.lineTo(width - 15, cy);
    ctx.stroke();
    // Sumbu Y
    ctx.beginPath();
    ctx.moveTo(cx, 15);
    ctx.lineTo(cx, height - 15);
    ctx.stroke();

    // Panah sumbu
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '11px "Outfit", sans-serif';
    ctx.fillText('+X', width - 26, cy - 8);
    ctx.fillText('+Y', cx + 8, 22);
    ctx.fillText('-X', 8, cy - 8);
    ctx.fillText('-Y', cx + 8, height - 10);
    ctx.fillText('0', cx - 14, cy + 14);

    // 3. Lingkaran Satuan Utama (R = 1)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)'; // Cyan halus
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.restore();

    // Label 1, -1 pada sumbu
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('1', cx + R + 4, cy + 13);
    ctx.fillText('-1', cx - R - 16, cy + 13);
    ctx.fillText('1', cx + 6, cy - R + 4);
    ctx.fillText('-1', cx + 6, cy + R + 12);

    // Titik-titik sudut istimewa pada lingkaran
    const specialAngles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    specialAngles.forEach(ang => {
      const aRad = TrigMath.degToRad(ang);
      const dotX = cx + Math.cos(aRad) * R;
      const dotY = cy - Math.sin(aRad) * R;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Perhitungan Sudut Sekarang
    const rad = TrigMath.degToRad(this.angleDeg);
    const cosVal = Math.cos(rad);
    const sinVal = Math.sin(rad);
    const tanVal = Math.tan(rad);

    const px = cx + cosVal * R;
    const py = cy - sinVal * R;
    const cosX = cx + cosVal * R;

    // 5. Arsiran Busur Sudut (Angle Arc)
    if (this.showAngleArc) {
      ctx.save();
      const normAngle = TrigMath.normalizeAngleDeg(this.angleDeg);
      const sweepRad = TrigMath.degToRad(normAngle);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, Math.min(36, R * 0.3), 0, -sweepRad, true);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Label Sudut θ
      const midAngleRad = -sweepRad / 2;
      const arcLabelR = Math.min(48, R * 0.42);
      const lx = cx + Math.cos(midAngleRad) * arcLabelR;
      const ly = cy + Math.sin(midAngleRad) * arcLabelR;
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 12px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(this.angleDeg)}°`, lx, ly);
      ctx.restore();
    }

    // 6. Garis Segitiga Siku-siku (Bayangan Segitiga Trigonometri)
    if (this.showTriangle) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cosX, cy);
      ctx.lineTo(px, py);
      ctx.closePath();
      ctx.fill();

      // Simbol siku-siku di titik (cosX, cy)
      const sqSize = 8;
      const sgnX = cosVal >= 0 ? 1 : -1;
      const sgnY = sinVal >= 0 ? -1 : 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cosX - sgnX * sqSize, cy);
      ctx.lineTo(cosX - sgnX * sqSize, cy + sgnY * sqSize);
      ctx.lineTo(cosX, cy + sgnY * sqSize);
      ctx.stroke();
      ctx.restore();
    }

    // 7. Garis Tangen (Garis Singgung)
    if (this.showTan && Math.abs(cosVal) > 0.04) {
      ctx.save();
      // Visualisasi geometris standar tangen:
      // Garis singgung vertikal pada x = +1 (atau x = -1 tergantung arah)
      const isRight = cosVal >= 0;
      const tanWallX = cx + (isRight ? R : -R);
      const tanY = cy - tanVal * (isRight ? R : -R);

      // Garis bantu perpanjangan radius menembus dinding tangen
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(tanWallX, tanY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Garis tangen vertikal dari sumbu X ke titik temu
      ctx.strokeStyle = '#f59e0b'; // Amber / Orange
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(tanWallX, cy);
      ctx.lineTo(tanWallX, tanY);
      ctx.stroke();

      // Titik potong tangen
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(tanWallX, tanY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label Tan
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`tan: ${tanVal.toFixed(2)}`, tanWallX + (isRight ? 8 : -65), (cy + tanY) / 2);
      ctx.restore();
    }

    // 8. Vektor Cosinus (Sisi Samping pada sumbu X)
    if (this.showCos) {
      ctx.save();
      ctx.strokeStyle = '#a855f7'; // Neon Violet/Purple
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cosX, cy);
      ctx.stroke();

      // Label Cosinus
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#c084fc';
      ctx.textAlign = 'center';
      const cosLabelY = cy + (sinVal >= 0 ? 18 : -10);
      ctx.fillText(`cos: ${cosVal.toFixed(2)}`, (cx + cosX) / 2, cosLabelY);
      ctx.restore();
    }

    // 9. Vektor Sinus (Sisi Depan / Garis Tegak)
    if (this.showSin) {
      ctx.save();
      ctx.strokeStyle = '#00f0ff'; // Neon Cyan
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cosX, cy);
      ctx.lineTo(cosX, py);
      ctx.stroke();

      // Label Sinus
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.textAlign = cosVal >= 0 ? 'left' : 'right';
      const sinLabelX = cosX + (cosVal >= 0 ? 8 : -8);
      ctx.fillText(`sin: ${sinVal.toFixed(2)}`, sinLabelX, (cy + py) / 2);
      ctx.restore();
    }

    // 10. Jari-jari Hipotenusa (Sisi Miring = 1)
    ctx.save();
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Label r = 1
    const rLabelX = (cx + px) / 2 - 12 * Math.sin(rad);
    const rLabelY = (cy + py) / 2 - 12 * Math.cos(rad);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '10px "Outfit", sans-serif';
    ctx.fillText('r = 1', rLabelX, rLabelY);
    ctx.restore();

    // 11. Titik Putar P (Handle Interaktif yang bisa di-drag)
    ctx.save();
    // Halo glow berdenyut
    ctx.beginPath();
    ctx.arc(px, py, 11, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.fill();

    // Titik pusat handle
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tooltip Koordinat P(x, y)
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#e2e8f0';
    const tagX = px + (cosVal >= 0 ? 12 : -75);
    const tagY = py + (sinVal >= 0 ? -12 : 20);
    ctx.fillText(`P(${cosVal.toFixed(2)}, ${sinVal.toFixed(2)})`, tagX, tagY);
    ctx.restore();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = UnitCircleVisualizer;
}
