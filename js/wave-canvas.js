/**
 * TrigoLab - WaveCanvas (Visualisasi Gelombang Trigonometri Kartesius)
 * Menggambar kurva Sinus, Cosinus, Tangen dengan presisi tinggi,
 * garis asimtot diskontinuitas, penjejakan titik real-time,
 * dan garis proyeksi laser dari lingkaran satuan.
 */

class WaveCanvasVisualizer {
  constructor(canvas, onAngleChange) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onAngleChange = onAngleChange;

    this.currentAngleDeg = 45;
    this.showSin = true;
    this.showCos = true;
    this.showTan = true;
    this.showAsymptotes = true;
    this.showGrid = true;
    this.showLaser = true;

    // Parameter Gelombang Umum: y = A * f(B * x + C) + D
    this.transformMode = false;
    this.activeFunc = 'sin'; // 'sin' | 'cos' | 'tan'
    this.paramA = 1.0;
    this.paramB = 1.0;
    this.paramC = 0.0;
    this.paramD = 0.0;

    // Rentang sumbu matematika default
    this.xMin = -Math.PI * 0.5;
    this.xMax = Math.PI * 2.5; // Menampilkan sedikit sebelum 0 hingga lewat 2π
    this.yMin = -3.2;
    this.yMax = 3.2;

    this.isDragging = false;
    this.unitCirclePoint = null; // Menyimpan titik proyeksi dari Unit Circle

    this.initEvents();
    this.resize();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 340;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.render();
  }

  setAngle(deg) {
    this.currentAngleDeg = deg;
    this.render();
  }

  setUnitCirclePoint(point) {
    this.unitCirclePoint = point;
    this.render();
  }

  setToggles({ showSin, showCos, showTan, showAsymptotes, showGrid, showLaser }) {
    if (showSin !== undefined) this.showSin = showSin;
    if (showCos !== undefined) this.showCos = showCos;
    if (showTan !== undefined) this.showTan = showTan;
    if (showAsymptotes !== undefined) this.showAsymptotes = showAsymptotes;
    if (showGrid !== undefined) this.showGrid = showGrid;
    if (showLaser !== undefined) this.showLaser = showLaser;
    this.render();
  }

  setTransformParams({ isTransformMode, activeFunc, A, B, C, D }) {
    if (isTransformMode !== undefined) this.transformMode = isTransformMode;
    if (activeFunc !== undefined) this.activeFunc = activeFunc;
    if (A !== undefined) this.paramA = A;
    if (B !== undefined) this.paramB = B;
    if (C !== undefined) this.paramC = C;
    if (D !== undefined) this.paramD = D;
    this.render();
  }

  setXRange(minRad, maxRad) {
    this.xMin = minRad;
    this.xMax = maxRad;
    this.render();
  }

  // Konversi koordinat Matematika -> Piksel Canvas
  mathToPixel(x, y) {
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);

    const px = ((x - this.xMin) / (this.xMax - this.xMin)) * width;
    const py = height - ((y - this.yMin) / (this.yMax - this.yMin)) * height;
    return { px, py };
  }

  // Konversi Piksel Canvas -> Koordinat Matematika
  pixelToMath(px, py) {
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);

    const x = this.xMin + (px / width) * (this.xMax - this.xMin);
    const y = this.yMin + ((height - py) / height) * (this.yMax - this.yMin);
    return { x, y };
  }

  initEvents() {
    const handleScrub = (clientX) => {
      const rect = this.canvas.getBoundingClientRect();
      const px = clientX - rect.left;
      const math = this.pixelToMath(px, 0);
      let deg = TrigMath.radToDeg(math.x);
      if (deg < 0) deg = 0; // Batasi jika perlu
      if (this.onAngleChange) {
        this.onAngleChange(deg);
      }
    };

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      handleScrub(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        handleScrub(e.clientX);
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch support
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.isDragging = true;
        handleScrub(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length > 0) {
        handleScrub(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  render() {
    const ctx = this.ctx;
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, width, height);

    // 1. Gambar Grid Matematika & Label Radian
    if (this.showGrid) {
      this.drawGrid(ctx, width, height);
    }

    // 2. Garis Sumbu Utama X & Y
    this.drawAxes(ctx, width, height);

    // 3. Garis Asimtot Tangen (x = π/2 + kπ)
    if ((this.showTan || (this.transformMode && this.activeFunc === 'tan')) && this.showAsymptotes) {
      this.drawAsymptotes(ctx, width, height);
    }

    // 4. Render Kurva Fungsi
    if (this.transformMode) {
      // Mode Eksplorasi Transformasi Gelombang y = A * f(Bx + C) + D
      this.drawTransformedWave(ctx, width, height);
    } else {
      // Mode Perbandingan Standar (Sinus, Cosinus, Tangen)
      if (this.showCos) this.drawFunctionCurve(ctx, width, height, 'cos', '#a855f7', 'rgba(168, 85, 247, 0.4)');
      if (this.showSin) this.drawFunctionCurve(ctx, width, height, 'sin', '#00f0ff', 'rgba(0, 240, 255, 0.4)');
      if (this.showTan) this.drawFunctionCurve(ctx, width, height, 'tan', '#f59e0b', 'rgba(245, 158, 11, 0.4)');
    }

    // 5. Garis Indikator Posisi Sudut Saat Ini (Vertical Needle)
    const currentRad = TrigMath.degToRad(this.currentAngleDeg);
    const needleP = this.mathToPixel(currentRad, 0);

    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(needleP.px, 0);
    ctx.lineTo(needleP.px, height);
    ctx.stroke();
    ctx.restore();

    // 6. Titik Penjejak (Tracking Beads) & Proyeksi Laser
    this.drawTrackingBeads(ctx, width, height, currentRad);

    // 7. Laser Proyeksi Garis Horizontal dari Lingkaran Satuan
    if (this.showLaser && this.unitCirclePoint && !this.transformMode) {
      this.drawLaserProjection(ctx, needleP.px);
    }
  }

  drawGrid(ctx, width, height) {
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    // Garis Vertikal per pi/4 (45 derajat)
    const stepRad = Math.PI / 4;
    const startStep = Math.floor(this.xMin / stepRad);
    const endStep = Math.ceil(this.xMax / stepRad);

    for (let i = startStep; i <= endStep; i++) {
      const rad = i * stepRad;
      const { px } = this.mathToPixel(rad, 0);
      const isMajor = i % 2 === 0; // kelipatan pi/2

      ctx.beginPath();
      ctx.strokeStyle = isMajor ? 'rgba(255, 255, 255, 0.09)' : 'rgba(255, 255, 255, 0.03)';
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();

      // Label Radian & Derajat pada sumbu
      if (isMajor && px > 20 && px < width - 20) {
        const factor = i / 4; // fraction of pi
        const piLabel = TrigMath.formatPiFraction(factor);
        const degVal = Math.round(TrigMath.radToDeg(rad));
        const pyOrigin = this.mathToPixel(0, 0).py;
        const textY = Math.min(Math.max(pyOrigin + 16, 25), height - 10);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.fillText(piLabel, px, textY);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillText(`${degVal}°`, px, textY + 12);
      }
    }

    // Garis Horizontal per 1 satuan
    for (let y = Math.floor(this.yMin); y <= Math.ceil(this.yMax); y++) {
      if (y === 0) continue;
      const { py } = this.mathToPixel(0, y);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();

      // Label Nilai Y
      const pxOrigin = this.mathToPixel(0, 0).px;
      const labelX = Math.min(Math.max(pxOrigin - 12, 12), width - 20);
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillText(y.toString(), labelX, py + 3);
    }
    ctx.restore();
  }

  drawAxes(ctx, width, height) {
    const origin = this.mathToPixel(0, 0);

    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';

    // Sumbu X
    ctx.beginPath();
    ctx.moveTo(0, origin.py);
    ctx.lineTo(width, origin.py);
    ctx.stroke();

    // Sumbu Y
    ctx.beginPath();
    ctx.moveTo(origin.px, 0);
    ctx.lineTo(origin.px, height);
    ctx.stroke();

    // Panah & label sumbu
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '11px "Outfit", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('θ (Sudut)', width - 10, origin.py - 8);
    ctx.textAlign = 'left';
    ctx.fillText('y (Nilai)', origin.px + 8, 16);
    ctx.restore();
  }

  drawAsymptotes(ctx, width, height) {
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1.2;

    // Asimtot standar: x = π/2 + kπ
    let stepK = Math.floor((this.xMin - Math.PI / 2) / Math.PI);
    let endK = Math.ceil((this.xMax - Math.PI / 2) / Math.PI);

    // Jika mode transformasi tangen, asimtot berubah sesuai B dan C: B*x + C = π/2 + kπ
    for (let k = stepK; k <= endK; k++) {
      let asympX = Math.PI / 2 + k * Math.PI;
      if (this.transformMode && this.activeFunc === 'tan') {
        asympX = (Math.PI / 2 + k * Math.PI - this.paramC) / (this.paramB || 1);
      }

      if (asympX >= this.xMin && asympX <= this.xMax) {
        const { px } = this.mathToPixel(asympX, 0);
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, height);
        ctx.stroke();

        ctx.fillStyle = 'rgba(245, 158, 11, 0.55)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Asimtot', px, height - 6);
      }
    }
    ctx.restore();
  }

  drawFunctionCurve(ctx, width, height, type, color, glowColor) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2.8;

    const sampleStep = 2; // pixel step
    let isDrawing = false;

    ctx.beginPath();

    for (let px = 0; px <= width; px += sampleStep) {
      const mathX = this.pixelToMath(px, 0).x;
      let mathY = 0;

      if (type === 'sin') {
        mathY = Math.sin(mathX);
      } else if (type === 'cos') {
        mathY = Math.cos(mathX);
      } else if (type === 'tan') {
        mathY = Math.tan(mathX);
        // Tangani pemotongan asimtot agar tidak menarik garis vertikal liar
        if (Math.abs(mathY) > 8 || isNaN(mathY)) {
          isDrawing = false;
          continue;
        }
      }

      const { py } = this.mathToPixel(mathX, mathY);

      if (!isDrawing) {
        ctx.moveTo(px, py);
        isDrawing = true;
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.stroke();
    ctx.restore();
  }

  drawTransformedWave(ctx, width, height) {
    const A = this.paramA;
    const B = this.paramB;
    const C = this.paramC;
    const D = this.paramD;
    const func = this.activeFunc;

    let color = '#00f0ff';
    let glow = 'rgba(0, 240, 255, 0.4)';
    if (func === 'cos') {
      color = '#a855f7';
      glow = 'rgba(168, 85, 247, 0.4)';
    } else if (func === 'tan') {
      color = '#f59e0b';
      glow = 'rgba(245, 158, 11, 0.4)';
    }

    // Gambar garis garis tengah rata-rata y = D
    if (Math.abs(D) > 0.05) {
      const lineD = this.mathToPixel(0, D);
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, lineD.py);
      ctx.lineTo(width, lineD.py);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px "Outfit", sans-serif';
      ctx.fillText(`Garis Tengah D = ${D.toFixed(1)}`, 10, lineD.py - 6);
      ctx.restore();
    }

    // Gambar kurva transformasi utama
    ctx.save();
    ctx.strokeStyle = color;
    ctx.shadowColor = glow;
    ctx.shadowBlur = 12;
    ctx.lineWidth = 3.2;

    let isDrawing = false;
    ctx.beginPath();

    const sampleStep = 1.5;
    for (let px = 0; px <= width; px += sampleStep) {
      const mathX = this.pixelToMath(px, 0).x;
      const mathY = TrigMath.evaluateWave(func, mathX, A, B, C, D);

      if (func === 'tan' && (Math.abs(mathY - D) > 12 * Math.abs(A) || isNaN(mathY))) {
        isDrawing = false;
        continue;
      }

      const { py } = this.mathToPixel(mathX, mathY);

      if (!isDrawing) {
        ctx.moveTo(px, py);
        isDrawing = true;
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.stroke();
    ctx.restore();
  }

  drawTrackingBeads(ctx, width, height, currentRad) {
    if (this.transformMode) {
      // Penjejak pada mode transformasi
      const mathY = TrigMath.evaluateWave(this.activeFunc, currentRad, this.paramA, this.paramB, this.paramC, this.paramD);
      const { px, py } = this.mathToPixel(currentRad, mathY);

      if (px >= 0 && px <= width && py >= 0 && py <= height) {
        this.renderSingleBead(ctx, px, py, '#ffffff', '#00f0ff', `${this.activeFunc}: ${mathY.toFixed(2)}`);
      }
      return;
    }

    // Mode standar: Render bead untuk Sinus, Cosinus, Tangen
    if (this.showSin) {
      const sinVal = Math.sin(currentRad);
      const { px, py } = this.mathToPixel(currentRad, sinVal);
      if (px >= 0 && px <= width) {
        this.renderSingleBead(ctx, px, py, '#ffffff', '#00f0ff', `sin: ${sinVal.toFixed(2)}`);
      }
    }

    if (this.showCos) {
      const cosVal = Math.cos(currentRad);
      const { px, py } = this.mathToPixel(currentRad, cosVal);
      if (px >= 0 && px <= width) {
        this.renderSingleBead(ctx, px, py, '#ffffff', '#a855f7', `cos: ${cosVal.toFixed(2)}`);
      }
    }

    if (this.showTan) {
      const tanVal = Math.tan(currentRad);
      if (Math.abs(tanVal) <= 3.5) {
        const { px, py } = this.mathToPixel(currentRad, tanVal);
        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          this.renderSingleBead(ctx, px, py, '#ffffff', '#f59e0b', `tan: ${tanVal.toFixed(2)}`);
        }
      }
    }
  }

  renderSingleBead(ctx, px, py, fillColor, strokeColor, label) {
    ctx.save();
    // Halo
    ctx.beginPath();
    ctx.arc(px, py, 9, 0, Math.PI * 2);
    ctx.fillStyle = strokeColor + '44';
    ctx.fill();

    // Bead
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label Nilai
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillStyle = strokeColor;
    ctx.fillText(label, px + 8, py - 8);
    ctx.restore();
  }

  drawLaserProjection(ctx, targetPx) {
    // Garis proyeksi horizontal menghubungkan nilai sinus ke gelombang
    const currentRad = TrigMath.degToRad(this.currentAngleDeg);
    const sinVal = Math.sin(currentRad);
    const wavePoint = this.mathToPixel(currentRad, sinVal);

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 1.5;

    // Garis horizontal dari tepi kiri canvas ke titik sin
    ctx.beginPath();
    ctx.moveTo(0, wavePoint.py);
    ctx.lineTo(wavePoint.px, wavePoint.py);
    ctx.stroke();
    ctx.restore();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WaveCanvasVisualizer;
}
