/**
 * TrigoLab - App Orchestrator
 * Menghubungkan visualisasi lingkaran satuan, grafik gelombang kartesius,
 * telemetri matematika, kontrol UI, dan interaksi pengguna.
 */

document.addEventListener('DOMContentLoaded', () => {
  // State Aplikasi
  const state = {
    angleDeg: 45,
    isPlaying: false,
    speed: 1.0, // Multiplier kecepatan animasi
    viewMode: 'dual', // 'dual' | 'wave-focus' | 'transform'
    toggles: {
      showSin: true,
      showCos: true,
      showTan: true,
      showTriangle: true,
      showLaser: true,
      showAsymptotes: true,
      showGrid: true,
      audioEnabled: false
    },
    transform: {
      func: 'sin',
      A: 1.0,
      B: 1.0,
      C: 0.0,
      D: 0.0
    }
  };

  // Elemen DOM
  const unitCircleCanvas = document.getElementById('unit-circle-canvas');
  const waveCanvas = document.getElementById('wave-canvas');

  // Tombol Kontrol Utama
  const playBtn = document.getElementById('btn-play');
  const playIcon = document.getElementById('play-icon');
  const resetBtn = document.getElementById('btn-reset');
  const speedBtns = document.querySelectorAll('.speed-pill');
  const angleSlider = document.getElementById('angle-slider');
  const angleInput = document.getElementById('angle-number-input');

  // Tab Mode
  const tabBtns = document.querySelectorAll('.mode-tab-btn');
  const mainStage = document.getElementById('main-stage');
  const transformPanel = document.getElementById('transform-panel');
  const theorySection = document.getElementById('theory-section');

  // Telemetri Values
  const degDisplay = document.getElementById('deg-display');
  const radDisplay = document.getElementById('rad-display');
  const quadrantBadge = document.getElementById('quadrant-badge');
  const quadrantDesc = document.getElementById('quadrant-desc');

  const sinValElem = document.getElementById('sin-val');
  const sinExactElem = document.getElementById('sin-exact');
  const cosValElem = document.getElementById('cos-val');
  const cosExactElem = document.getElementById('cos-exact');
  const tanValElem = document.getElementById('tan-val');
  const tanExactElem = document.getElementById('tan-exact');

  const pythagoreanVal = document.getElementById('pythagorean-val');
  const pythagoreanBar = document.getElementById('pythagorean-bar');

  // Toggles DOM
  const toggleSin = document.getElementById('toggle-sin');
  const toggleCos = document.getElementById('toggle-cos');
  const toggleTan = document.getElementById('toggle-tan');
  const toggleTriangle = document.getElementById('toggle-triangle');
  const toggleLaser = document.getElementById('toggle-laser');
  const toggleAsymptote = document.getElementById('toggle-asymptote');
  const toggleAudio = document.getElementById('toggle-audio');

  // Transform Controls
  const paramASlider = document.getElementById('param-a-slider');
  const paramBSlider = document.getElementById('param-b-slider');
  const paramCSlider = document.getElementById('param-c-slider');
  const paramDSlider = document.getElementById('param-d-slider');

  const paramAVal = document.getElementById('param-a-val');
  const paramBVal = document.getElementById('param-b-val');
  const paramCVal = document.getElementById('param-c-val');
  const paramDVal = document.getElementById('param-d-val');

  const formulaDisplay = document.getElementById('live-formula');
  const transformFuncBtns = document.querySelectorAll('.func-choice-btn');
  const presetBtns = document.querySelectorAll('.preset-btn');

  // Sudut Istimewa Pills
  const specialAnglePills = document.querySelectorAll('.angle-chip');

  // Inisialisasi Modul
  const audioSynth = new AudioSynthesizer();

  const handleAngleUpdate = (newDeg) => {
    state.angleDeg = newDeg;
    syncAngleUI();
    renderAll();
  };

  const unitCircle = new UnitCircleVisualizer(unitCircleCanvas, handleAngleUpdate);
  const waveVisualizer = new WaveCanvasVisualizer(waveCanvas, handleAngleUpdate);

  // Resize Listener
  window.addEventListener('resize', () => {
    unitCircle.resize();
    waveVisualizer.resize();
    renderAll();
  });

  // Fungsi Render Terkoordinasi
  function renderAll() {
    unitCircle.setAngle(state.angleDeg);
    const screenP = unitCircle.getScreenPoint();
    waveVisualizer.setUnitCirclePoint(screenP);
    waveVisualizer.setAngle(state.angleDeg);

    updateTelemetry();
    if (state.toggles.audioEnabled) {
      if (state.viewMode === 'transform') {
        audioSynth.update(state.transform.B, state.transform.A);
      } else {
        const sinVal = Math.sin(TrigMath.degToRad(state.angleDeg));
        audioSynth.update(1.0, 0.5 + 0.5 * Math.abs(sinVal));
      }
    }
  }

  // Sinkronisasi Angka & Slider Sudut
  function syncAngleUI() {
    const rounded = Math.round(state.angleDeg * 10) / 10;
    if (angleSlider) angleSlider.value = (state.angleDeg % 360).toFixed(1);
    if (angleInput) angleInput.value = rounded.toFixed(1);

    // Sorot chip sudut istimewa jika aktif
    const norm = TrigMath.normalizeAngleDeg(state.angleDeg);
    specialAnglePills.forEach(pill => {
      const pillDeg = parseFloat(pill.dataset.deg);
      if (Math.abs(pillDeg - norm) < 1.0) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  // Update Data Telemetri Real-Time
  function updateTelemetry() {
    const deg = state.angleDeg;
    const normDeg = TrigMath.normalizeAngleDeg(deg);
    const rad = TrigMath.degToRad(normDeg);

    // Derajat & Radian
    if (degDisplay) degDisplay.textContent = `${normDeg.toFixed(1)}°`;
    if (radDisplay) {
      const piFraction = TrigMath.formatPiFraction(normDeg / 180);
      radDisplay.innerHTML = `${rad.toFixed(3)} rad <span class="fraction">(${piFraction})</span>`;
    }

    // Kuadran
    const quadInfo = TrigMath.getQuadrant(normDeg);
    if (quadrantBadge) {
      quadrantBadge.textContent = quadInfo.label;
    }
    if (quadrantDesc) {
      quadrantDesc.textContent = quadInfo.desc || quadInfo.rule || '';
    }

    // Nilai Sinus, Cosinus, Tangen
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    const isAsymp = TrigMath.isNearAsymptote(normDeg, 0.3);
    const tan = isAsymp ? Infinity : Math.tan(rad);

    if (sinValElem) sinValElem.textContent = sin.toFixed(4);
    if (cosValElem) cosValElem.textContent = cos.toFixed(4);
    if (tanValElem) {
      if (isAsymp) {
        tanValElem.innerHTML = '<span class="undefined-tag">±∞ (Tak Terdefinisi)</span>';
      } else {
        tanValElem.textContent = tan.toFixed(4);
      }
    }

    // Nilai Eksak (Pecahan bentuk akar)
    const special = TrigMath.findSpecialAngle(normDeg);
    if (sinExactElem) sinExactElem.textContent = special ? `Eksak: ${special.sinExact}` : `≈ ${sin.toFixed(3)}`;
    if (cosExactElem) cosExactElem.textContent = special ? `Eksak: ${special.cosExact}` : `≈ ${cos.toFixed(3)}`;
    if (tanExactElem) tanExactElem.textContent = special ? `Eksak: ${special.tanExact}` : (isAsymp ? 'Asimtot' : `≈ ${tan.toFixed(3)}`);

    // Identitas Pythagoras: sin²θ + cos²θ = 1
    const pythagoras = sin * sin + cos * cos;
    if (pythagoreanVal) pythagoreanVal.textContent = pythagoras.toFixed(4);
    if (pythagoreanBar) pythagoreanBar.style.width = `${Math.min(100, pythagoras * 100)}%`;

    // Highlight baris tabel sudut istimewa jika ada
    document.querySelectorAll('.table-row-special').forEach(row => {
      const rowDeg = parseFloat(row.dataset.deg);
      if (Math.abs(rowDeg - normDeg) < 1.0) {
        row.classList.add('highlight-row');
      } else {
        row.classList.remove('highlight-row');
      }
    });
  }

  // Loop Animasi 60 FPS
  let lastTimestamp = performance.now();
  function animationLoop(timestamp) {
    if (state.isPlaying) {
      const deltaSec = (timestamp - lastTimestamp) / 1000;
      // 45 derajat per detik pada speed 1.0x
      const degDelta = 45 * state.speed * deltaSec;
      state.angleDeg = (state.angleDeg + degDelta) % 720;
      syncAngleUI();
      renderAll();
    }
    lastTimestamp = timestamp;
    requestAnimationFrame(animationLoop);
  }
  requestAnimationFrame(animationLoop);

  // Play / Pause Button
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      state.isPlaying = !state.isPlaying;
      updatePlayBtnUI();
    });
  }

  function updatePlayBtnUI() {
    if (state.isPlaying) {
      playBtn.classList.add('playing');
      playIcon.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
      playBtn.querySelector('.btn-label').textContent = 'Jeda';
    } else {
      playBtn.classList.remove('playing');
      playIcon.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
      playBtn.querySelector('.btn-label').textContent = 'Putar';
    }
  }

  // Reset Button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.angleDeg = 0;
      syncAngleUI();
      renderAll();
    });
  }

  // Speed Selector Buttons
  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.speed = parseFloat(btn.dataset.speed) || 1.0;
    });
  });

  // Slider Sudut
  if (angleSlider) {
    angleSlider.addEventListener('input', (e) => {
      state.angleDeg = parseFloat(e.target.value);
      if (angleInput) angleInput.value = state.angleDeg.toFixed(1);
      renderAll();
    });
  }

  if (angleInput) {
    angleInput.addEventListener('change', (e) => {
      let val = parseFloat(e.target.value);
      if (isNaN(val)) val = 0;
      state.angleDeg = TrigMath.normalizeAngleDeg(val);
      syncAngleUI();
      renderAll();
    });
  }

  // Sudut Istimewa Pills Klik
  specialAnglePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const targetDeg = parseFloat(pill.dataset.deg);
      state.angleDeg = targetDeg;
      syncAngleUI();
      renderAll();
    });
  });

  // Toggle Checkboxes / Buttons
  if (toggleSin) {
    toggleSin.addEventListener('change', (e) => {
      state.toggles.showSin = e.target.checked;
      unitCircle.setToggles({ showSin: state.toggles.showSin });
      waveVisualizer.setToggles({ showSin: state.toggles.showSin });
    });
  }
  if (toggleCos) {
    toggleCos.addEventListener('change', (e) => {
      state.toggles.showCos = e.target.checked;
      unitCircle.setToggles({ showCos: state.toggles.showCos });
      waveVisualizer.setToggles({ showCos: state.toggles.showCos });
    });
  }
  if (toggleTan) {
    toggleTan.addEventListener('change', (e) => {
      state.toggles.showTan = e.target.checked;
      unitCircle.setToggles({ showTan: state.toggles.showTan });
      waveVisualizer.setToggles({ showTan: state.toggles.showTan });
    });
  }
  if (toggleTriangle) {
    toggleTriangle.addEventListener('change', (e) => {
      state.toggles.showTriangle = e.target.checked;
      unitCircle.setToggles({ showTriangle: state.toggles.showTriangle });
    });
  }
  if (toggleLaser) {
    toggleLaser.addEventListener('change', (e) => {
      state.toggles.showLaser = e.target.checked;
      waveVisualizer.setToggles({ showLaser: state.toggles.showLaser });
    });
  }
  if (toggleAsymptote) {
    toggleAsymptote.addEventListener('change', (e) => {
      state.toggles.showAsymptotes = e.target.checked;
      waveVisualizer.setToggles({ showAsymptotes: state.toggles.showAsymptotes });
    });
  }
  if (toggleAudio) {
    toggleAudio.addEventListener('change', (e) => {
      state.toggles.audioEnabled = e.target.checked;
      audioSynth.toggle(state.toggles.audioEnabled);
      if (state.toggles.audioEnabled) {
        audioSynth.update(state.transform.B, state.transform.A);
      }
    });
  }

  // Mode View Switcher (Dual View vs Wave Focus vs Transform Sandbox)
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.viewMode = btn.dataset.mode;

      if (state.viewMode === 'dual') {
        mainStage.className = 'stage-container layout-dual';
        transformPanel.style.display = 'none';
        theorySection.style.display = 'none';
        waveVisualizer.setTransformParams({ isTransformMode: false });
      } else if (state.viewMode === 'wave-focus') {
        mainStage.className = 'stage-container layout-wave-focus';
        transformPanel.style.display = 'none';
        theorySection.style.display = 'none';
        waveVisualizer.setTransformParams({ isTransformMode: false });
      } else if (state.viewMode === 'transform') {
        mainStage.className = 'stage-container layout-wave-focus';
        transformPanel.style.display = 'block';
        theorySection.style.display = 'none';
        waveVisualizer.setTransformParams({
          isTransformMode: true,
          activeFunc: state.transform.func,
          A: state.transform.A,
          B: state.transform.B,
          C: state.transform.C,
          D: state.transform.D
        });
        updateTransformFormula();
      } else if (state.viewMode === 'theory') {
        theorySection.style.display = 'block';
        theorySection.scrollIntoView({ behavior: 'smooth' });
      }

      // Re-adjust canvas sizes
      setTimeout(() => {
        unitCircle.resize();
        waveVisualizer.resize();
        renderAll();
      }, 50);
    });
  });

  // Transform Sandbox Handlers
  function updateTransformFormula() {
    const A = state.transform.A;
    const B = state.transform.B;
    const C = state.transform.C;
    const D = state.transform.D;
    const f = state.transform.func;

    if (paramAVal) paramAVal.textContent = A.toFixed(2);
    if (paramBVal) paramBVal.textContent = B.toFixed(2);
    if (paramCVal) {
      const cFrac = TrigMath.formatPiFraction(C / Math.PI);
      paramCVal.textContent = `${C.toFixed(2)} rad (${cFrac})`;
    }
    if (paramDVal) paramDVal.textContent = D.toFixed(2);

    // Format string rumus: y = A * sin(B*x + C) + D
    let signC = C >= 0 ? `+ ${C.toFixed(2)}` : `- ${Math.abs(C).toFixed(2)}`;
    if (Math.abs(C) < 0.01) signC = '';
    let signD = D >= 0 ? `+ ${D.toFixed(2)}` : `- ${Math.abs(D).toFixed(2)}`;
    if (Math.abs(D) < 0.01) signD = '';

    const formulaHtml = `
      <span class="var-y">y</span> = 
      <span class="var-a">${A.toFixed(2)}</span> · 
      <span class="var-func">${f}</span>(
      <span class="var-b">${B.toFixed(2)}</span>x 
      ${signC ? `<span class="var-c">${signC}</span>` : ''}) 
      ${signD ? `<span class="var-d">${signD}</span>` : ''}
    `;

    if (formulaDisplay) {
      formulaDisplay.innerHTML = formulaHtml;
    }

    waveVisualizer.setTransformParams({
      isTransformMode: true,
      activeFunc: f,
      A, B, C, D
    });
  }

  // Transform Function Type (sin / cos / tan)
  transformFuncBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      transformFuncBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.transform.func = btn.dataset.func;
      updateTransformFormula();
      renderAll();
    });
  });

  // Parameter Sliders
  if (paramASlider) {
    paramASlider.addEventListener('input', (e) => {
      state.transform.A = parseFloat(e.target.value);
      updateTransformFormula();
      renderAll();
    });
  }
  if (paramBSlider) {
    paramBSlider.addEventListener('input', (e) => {
      state.transform.B = parseFloat(e.target.value);
      updateTransformFormula();
      renderAll();
    });
  }
  if (paramCSlider) {
    paramCSlider.addEventListener('input', (e) => {
      state.transform.C = parseFloat(e.target.value);
      updateTransformFormula();
      renderAll();
    });
  }
  if (paramDSlider) {
    paramDSlider.addEventListener('input', (e) => {
      state.transform.D = parseFloat(e.target.value);
      updateTransformFormula();
      renderAll();
    });
  }

  // Presets Gelombang
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      if (preset === 'standard') {
        state.transform.A = 1.0;
        state.transform.B = 1.0;
        state.transform.C = 0.0;
        state.transform.D = 0.0;
      } else if (preset === 'high-amp') {
        state.transform.A = 2.5;
        state.transform.B = 1.0;
        state.transform.C = 0.0;
        state.transform.D = 0.0;
      } else if (preset === 'fast-freq') {
        state.transform.A = 1.0;
        state.transform.B = 3.0;
        state.transform.C = 0.0;
        state.transform.D = 0.0;
      } else if (preset === 'phase-shift') {
        // Fase 90 derajat = pi/2
        state.transform.A = 1.0;
        state.transform.B = 1.0;
        state.transform.C = Math.PI / 2;
        state.transform.D = 0.0;
      } else if (preset === 'floating') {
        state.transform.A = 1.2;
        state.transform.B = 1.5;
        state.transform.C = -Math.PI / 4;
        state.transform.D = 1.2;
      }

      if (paramASlider) paramASlider.value = state.transform.A;
      if (paramBSlider) paramBSlider.value = state.transform.B;
      if (paramCSlider) paramCSlider.value = state.transform.C;
      if (paramDSlider) paramDSlider.value = state.transform.D;

      updateTransformFormula();
      renderAll();
    });
  });

  // Keyboard Shortcuts: Spacebar (Play/Pause), Left/Right Arrows (Angle step), R (Reset)
  window.addEventListener('keydown', (e) => {
    // Abaikan jika fokus di input field
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (e.code === 'Space') {
      e.preventDefault();
      state.isPlaying = !state.isPlaying;
      updatePlayBtnUI();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      const step = e.shiftKey ? 15 : 5;
      state.angleDeg = (state.angleDeg + step) % 720;
      syncAngleUI();
      renderAll();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      const step = e.shiftKey ? 15 : 5;
      let newDeg = state.angleDeg - step;
      if (newDeg < 0) newDeg += 360;
      state.angleDeg = newDeg;
      syncAngleUI();
      renderAll();
    } else if (e.code === 'KeyR') {
      state.angleDeg = 0;
      syncAngleUI();
      renderAll();
    }
  });

  // Inisialisasi Pertama
  syncAngleUI();
  renderAll();
});
