/**
 * Earth-Semantic — Application Logic & Controller
 * Matches Screens 1-12 of Earth Semantic Design Documentation
 * Advanced Video-Demo Edition: Live API Integration, Audio Chimes & Micro-Animations
 */

(function () {
  'use strict';

  const AppState = {
    currentView: 'dashboard',
    currentStep: 1,
    isLoggedIn: false,
    isDarkMode: false,
    isTourRunning: false,
    audioEnabled: false,
    audioCtx: null,
    apiBase: '', // Same origin
    currentAnalysisResult: null,
    cases: [
      { id: '#1024', title: 'Uttarakhand Rainfall', type: 'Flash Flood', state: 'Uttarakhand', status: 'completed', priority: 'high', date: '21/09/2026' },
      { id: '#1023', title: 'Sikkim Landslide', type: 'Landslide', state: 'Sikkim', status: 'processing', priority: 'med', date: '20/09/2026' },
      { id: '#1022', title: 'Assam Flood', type: 'Flood', state: 'Assam', status: 'completed', priority: 'high', date: '20/09/2026' },
      { id: '#1021', title: 'Cyclone Tracking', type: 'Cyclone', state: 'Odisha', status: 'completed', priority: 'high', date: '19/09/2026' },
      { id: '#1020', title: 'Himachal Assessment', type: 'Flash Flood', state: 'Himachal', status: 'completed', priority: 'low', date: '18/09/2026' }
    ],
    alerts: [
      { id: 'ALT-01', title: 'Flash Flood Risk - Uttarakhand', severity: 'high', desc: 'Heavy rainfall expected in next 24 hours (Predicted: 320mm). Immediate evacuation advisory.', time: '2 minutes ago', case_id: '#1024' },
      { id: 'ALT-02', title: 'Landslide Alert - Sikkim', severity: 'high', desc: 'Increased landslide probability detected via SAR interferometry and ground slope monitoring.', time: '15 minutes ago', case_id: '#1023' },
      { id: 'ALT-03', title: 'Heavy Rainfall - Assam', severity: 'medium', desc: 'Continuous rainfall expected over upper Brahmaputra reach. River levels approaching warning marks.', time: '30 minutes ago', case_id: '#1022' },
      { id: 'ALT-04', title: 'Cyclone Tracking - Bay of Bengal', severity: 'medium', desc: 'Cyclone movement towards northern Odisha coast. Wind gusts up to 85 km/h.', time: '1 hour ago', case_id: '#1021' },
      { id: 'ALT-05', title: 'River Water Level - Bihar', severity: 'low', desc: 'Water level slightly above seasonal warning mark. Discharge stabilized.', time: '2 hours ago', case_id: '#1020' },
      { id: 'ALT-06', title: 'Dam Runoff Surge - Tehri Basin', severity: 'high', desc: 'Inflow rate elevated by 35% following upstream cloudburst. Spillway alert issued.', time: '3 hours ago', case_id: '#1024' }
    ]
  };

  const EarthApp = {
    init: function () {
      this.bindEvents();
      this.initIndiaMap();
      this.renderCharts();
      this.fetchLiveBackendData();
      this.animateKpiCounters();
      this.renderCasesTable();
      this.renderAlertsStack();

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('demo')) {
        this.loginDemo();
      }
      if (urlParams.has('tour')) {
        this.loginDemo();
        setTimeout(() => this.runGuidedDemoTour(), 1200);
      }
    },

    bindEvents: function () {
      // Sidebar Navigation
      document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          EarthApp.playUiClick();
          const targetView = item.getAttribute('data-view');
          if (targetView) {
            EarthApp.navigateTo(targetView);
          }
        });
      });

      // Global Search
      const searchInput = document.getElementById('global-search-input');
      if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            const query = searchInput.value.trim().toLowerCase();
            if (query) {
              EarthApp.handleGlobalSearch(query);
            }
          }
        });
      }
    },

    // -------------------------------------------------------------------------
    // Backend API Integrations
    // -------------------------------------------------------------------------
    fetchLiveBackendData: async function () {
      try {
        const kpiRes = await fetch('/api/kpis');
        if (kpiRes.ok) {
          const kpis = await kpiRes.json();
          const elTotal = document.getElementById('kpi-total-assessments');
          const elActive = document.getElementById('kpi-active-cases');
          const elAlerts = document.getElementById('kpi-alerts-count');
          const elResolved = document.getElementById('kpi-resolved-cases');

          if (elTotal) elTotal.innerText = kpis.total_assessments;
          if (elActive) elActive.innerText = kpis.active_cases;
          if (elAlerts) elAlerts.innerText = kpis.alerts_count;
          if (elResolved) elResolved.innerText = kpis.resolved_cases;
        }

        const casesRes = await fetch('/api/cases');
        if (casesRes.ok) {
          const casesData = await casesRes.json();
          AppState.cases = casesData;
          this.renderCasesTable();
        }

        const alertsRes = await fetch('/api/alerts');
        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();
          AppState.alerts = alertsData;
          this.renderAlertsStack();
        }
      } catch (err) {
        console.log('Local standalone mode active (API fallback engaged).', err);
      }
    },

    // -------------------------------------------------------------------------
    // Web Audio Sound Synthesis (Zero External Files)
    // -------------------------------------------------------------------------
    initAudio: function () {
      if (!AppState.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          AppState.audioCtx = new AudioContext();
        }
      }
    },

    toggleAudio: function () {
      this.initAudio();
      AppState.audioEnabled = !AppState.audioEnabled;
      const btn = document.getElementById('btn-audio-toggle');
      const icon = document.getElementById('icon-audio');

      if (AppState.audioEnabled) {
        this.playBeep(980, 0.08, 'sine');
        this.showToast('Audio FX: Enabled');
        if (icon) {
          icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>';
        }
      } else {
        this.showToast('Audio FX: Muted');
        if (icon) {
          icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
        }
      }
    },

    playUiClick: function () {
      if (!AppState.audioEnabled || !AppState.audioCtx) return;
      try {
        const osc = AppState.audioCtx.createOscillator();
        const gain = AppState.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(840, AppState.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(420, AppState.audioCtx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.08, AppState.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, AppState.audioCtx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(AppState.audioCtx.destination);
        osc.start();
        osc.stop(AppState.audioCtx.currentTime + 0.04);
      } catch (e) {}
    },

    playBeep: function (freq, duration, type = 'sine') {
      if (!AppState.audioEnabled || !AppState.audioCtx) return;
      try {
        const osc = AppState.audioCtx.createOscillator();
        const gain = AppState.audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, AppState.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, AppState.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, AppState.audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(AppState.audioCtx.destination);
        osc.start();
        osc.stop(AppState.audioCtx.currentTime + duration);
      } catch (e) {}
    },

    playSuccessChime: function () {
      if (!AppState.audioEnabled || !AppState.audioCtx) return;
      const now = AppState.audioCtx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        setTimeout(() => this.playBeep(freq, 0.18, 'triangle'), idx * 80);
      });
    },

    // -------------------------------------------------------------------------
    // Micro-Animations & Counters
    // -------------------------------------------------------------------------
    animateKpiCounters: function () {
      const counters = [
        { id: 'kpi-total-assessments', target: 128 },
        { id: 'kpi-active-cases', target: 17 },
        { id: 'kpi-alerts-count', target: 6 },
        { id: 'kpi-resolved-cases', target: 105 }
      ];

      counters.forEach(c => {
        const el = document.getElementById(c.id);
        if (!el) return;
        let start = 0;
        const duration = 1200;
        const stepTime = 30;
        const totalSteps = duration / stepTime;
        const increment = c.target / totalSteps;

        const timer = setInterval(() => {
          start += increment;
          if (start >= c.target) {
            el.innerText = c.target;
            clearInterval(timer);
          } else {
            el.innerText = Math.floor(start);
          }
        }, stepTime);
      });
    },

    // -------------------------------------------------------------------------
    // View Routing
    // -------------------------------------------------------------------------
    navigateTo: function (viewId) {
      if (AppState.currentView === viewId) return;

      document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => {
        if (nav.getAttribute('data-view') === viewId) {
          nav.classList.add('active');
        } else {
          nav.classList.remove('active');
        }
      });

      document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
      });

      const targetSection = document.getElementById(`view-${viewId}`);
      if (targetSection) {
        targetSection.classList.add('active');
        AppState.currentView = viewId;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (viewId === 'analytics') {
          setTimeout(() => this.renderCharts(), 100);
        }
      }
    },

    // -------------------------------------------------------------------------
    // Login & Authentication
    // -------------------------------------------------------------------------
    login: function () {
      this.playUiClick();
      const email = document.getElementById('login-email').value;
      this.showToast(`Authenticated as ${email}`);
      const loginView = document.getElementById('view-login');
      loginView.classList.add('hidden');
      AppState.isLoggedIn = true;
      this.navigateTo('dashboard');
      this.animateKpiCounters();
    },

    loginDemo: function () {
      this.playUiClick();
      this.showToast('Demo Mode Activated — Welcome, Chief Disaster Officer');
      const loginView = document.getElementById('view-login');
      loginView.classList.add('hidden');
      AppState.isLoggedIn = true;
      this.navigateTo('dashboard');
      this.animateKpiCounters();
    },

    logout: function () {
      this.playUiClick();
      const loginView = document.getElementById('view-login');
      loginView.classList.remove('hidden');
      AppState.isLoggedIn = false;
      this.showToast('Logged out of session');
    },

    // -------------------------------------------------------------------------
    // Screen 3 to 8: Stepper Workflow (New Assessment)
    // -------------------------------------------------------------------------
    startNewAssessment: function () {
      this.playUiClick();
      this.navigateTo('new-assessment');
      this.goToStep(1);
    },

    resetAssessmentForm: function () {
      this.playUiClick();
      document.getElementById('assess-title').value = 'Uttarakhand Rainfall Risk Assessment';
      document.getElementById('assess-disaster-type').value = 'Flash Flood';
      document.getElementById('assess-state').value = 'Uttarakhand';
      document.getElementById('assess-district').value = 'Chamoli';
      document.getElementById('assess-desc').value = 'Heavy rainfall reported in the region. Need risk analysis for potential flash floods.';
      document.getElementById('slider-rainfall').value = 320;
      document.getElementById('slider-moisture').value = 91;
      this.onParamChange();
      this.goToStep(1);
      this.showToast('Assessment form reset to baseline defaults');
    },

    onParamChange: function () {
      const rain = document.getElementById('slider-rainfall')?.value || 320;
      const moisture = document.getElementById('slider-moisture')?.value || 91;

      const rainLabel = document.getElementById('label-rainfall-val');
      const moistureLabel = document.getElementById('label-moisture-val');

      if (rainLabel) rainLabel.innerText = `${rain} mm`;
      if (moistureLabel) moistureLabel.innerText = `${moisture}%`;

      this.recalculateLiveRisk();
    },

    recalculateLiveRisk: async function () {
      const rain = parseFloat(document.getElementById('slider-rainfall')?.value || 320);
      const moisture = parseFloat(document.getElementById('slider-moisture')?.value || 91);
      const disasterType = document.getElementById('assess-disaster-type')?.value || 'Flash Flood';
      const district = document.getElementById('assess-district')?.value || 'Chamoli';

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: document.getElementById('assess-title')?.value || 'Assessment',
            disaster_type: disasterType,
            state: document.getElementById('assess-state')?.value || 'Uttarakhand',
            district: district,
            rainfall_mm: rain,
            soil_moisture: moisture,
            slope_deg: 34.0
          })
        });

        if (res.ok) {
          const data = await res.json();
          AppState.currentAnalysisResult = data;
          this.applyAnalysisResult(data);
          return;
        }
      } catch (e) {
        // Fallback calculation in offline client
      }

      // Local Fallback calculation
      const score = Math.min(Math.max((rain / 400 * 50) + (moisture / 100 * 35) + 12, 10), 98.6).toFixed(1);
      const isHigh = score >= 70;
      const badge = document.getElementById('live-risk-preview-badge');
      if (badge) {
        badge.innerText = `${isHigh ? 'HIGH RISK' : 'MEDIUM RISK'} (${score}%)`;
        badge.style.background = isHigh ? '#fee2e2' : '#fef3c7';
        badge.style.color = isHigh ? '#b91c1c' : '#b45309';
      }
    },

    applyAnalysisResult: function (data) {
      const badge = document.getElementById('live-risk-preview-badge');
      if (badge) {
        badge.innerText = `${data.risk_level.toUpperCase()} (${data.confidence_score}%)`;
        badge.style.background = data.priority === 'high' ? '#fee2e2' : data.priority === 'med' ? '#fef3c7' : '#d1fae5';
        badge.style.color = data.priority === 'high' ? '#b91c1c' : data.priority === 'med' ? '#b45309' : '#047857';
      }

      // Update Step 5 Result Panel
      const rTitle = document.getElementById('result-risk-title');
      const rSub = document.getElementById('result-risk-subtitle');
      const rConf = document.getElementById('result-confidence-num');
      const rBar = document.getElementById('result-confidence-bar');
      const rIcon = document.getElementById('result-risk-icon');
      const rBanner = document.getElementById('result-risk-banner');

      if (rTitle) rTitle.innerText = data.risk_level;
      if (rSub) rSub.innerText = data.banner_message;
      if (rConf) rConf.innerText = `${data.confidence_score}%`;
      if (rBar) rBar.style.width = `${data.confidence_score}%`;

      if (rBanner && rIcon) {
        if (data.priority === 'high') {
          rBanner.style.background = 'var(--risk-high-bg)';
          rBanner.style.borderColor = '#f87171';
          rIcon.style.background = 'var(--risk-high)';
        } else if (data.priority === 'med') {
          rBanner.style.background = 'var(--risk-med-bg)';
          rBanner.style.borderColor = '#fbbf24';
          rIcon.style.background = 'var(--risk-med)';
        } else {
          rBanner.style.background = 'var(--risk-low-bg)';
          rBanner.style.borderColor = '#86efac';
          rIcon.style.background = 'var(--risk-low)';
        }
      }

      // Update Key Findings
      const findingsList = document.getElementById('result-findings-container');
      if (findingsList && data.key_findings) {
        findingsList.innerHTML = data.key_findings.map(f => `
          <div class="finding-bullet">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <div>${f}</div>
          </div>
        `).join('');
      }
    },

    goToStep: function (stepNum) {
      this.playUiClick();
      if (stepNum < 1 || stepNum > 6) return;
      AppState.currentStep = stepNum;

      const lineFill = document.getElementById('stepper-line-fill');
      const percentage = Math.min(((stepNum - 1) / 4) * 100, 100);
      if (lineFill) lineFill.style.width = `${percentage}%`;

      for (let i = 1; i <= 5; i++) {
        const node = document.getElementById(`step-node-${i}`);
        if (!node) continue;
        node.classList.remove('active', 'completed');
        if (i < stepNum) {
          node.classList.add('completed');
          node.querySelector('.stepper-circle').innerHTML = '✓';
        } else if (i === stepNum || (stepNum === 6 && i === 5)) {
          node.classList.add('active');
          node.querySelector('.stepper-circle').innerHTML = i;
        } else {
          node.querySelector('.stepper-circle').innerHTML = i;
        }
      }

      document.querySelectorAll('.stepper-panel').forEach(panel => {
        panel.classList.remove('active');
      });

      const currentPanel = document.getElementById(`step-panel-${stepNum}`);
      if (currentPanel) currentPanel.classList.add('active');
    },

    switchInputTab: function (btn, tabName) {
      this.playUiClick();
      document.querySelectorAll('.data-input-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.showToast(`Input Channel Switched: ${tabName.toUpperCase()}`);
    },

    simulateFileUpload: function () {
      this.playUiClick();
      this.showToast('Selected file "sentinel_insar_alos2.tif" (6.4 MB) uploaded & validated');
    },

    startProcessing: function () {
      this.goToStep(4);
      
      const gaugeCircle = document.getElementById('gauge-circle-progress');
      const gaugeText = document.getElementById('gauge-percentage-text');
      const gaugeStatus = document.getElementById('gauge-status-label');
      const btnViewResult = document.getElementById('btn-view-result');
      const consoleEl = document.getElementById('processing-terminal');

      let progress = 0;
      gaugeText.innerText = '0%';
      gaugeStatus.innerText = 'Initializing Multimodal Pipeline...';
      if (btnViewResult) btnViewResult.style.display = 'none';

      if (consoleEl) {
        consoleEl.innerHTML = `
          <div class="terminal-line"><span class="terminal-tag">[00:14:01.2]</span> INGEST: Loading Sentinel-2 Multispectral Tile T44RLV...</div>
        `;
      }

      for (let i = 1; i <= 5; i++) {
        const item = document.getElementById(`pipe-step-${i}`);
        if (item) item.className = 'pipeline-step-item';
      }

      const logLines = [
        '[00:14:01.8] PREPROCESS: Radiometric normalization & SRTM orthorectification [DONE]',
        '[00:14:02.4] EMBED: ViT-L/14 extracting 512-dim multimodal spatial embeddings',
        '[00:14:03.1] SAR: Coherence change detection matrix computed against baseline T0',
        '[00:14:03.8] INFERENCE: UNet FloodNet neural classifier evaluating Alaknanda gorge',
        '[00:14:04.5] CLASSIFY: Inundation probability 87.4% -> HIGH RISK THRESHOLD TRIGGERED',
        '[00:14:05.1] XAI: Shapley values generated for gorge terrain slope and soil saturation'
      ];

      const interval = setInterval(() => {
        progress += 10;
        if (progress > 100) progress = 100;

        const offset = 440 - (440 * progress / 100);
        if (gaugeCircle) gaugeCircle.style.strokeDashoffset = offset;
        if (gaugeText) gaugeText.innerText = `${progress}%`;

        // Add log lines
        const logIdx = Math.floor(progress / 18);
        if (consoleEl && logLines[logIdx]) {
          const line = document.createElement('div');
          line.className = 'terminal-line';
          line.innerHTML = `<span class="terminal-tag">[AI-LOG]</span> ${logLines[logIdx]}`;
          consoleEl.appendChild(line);
          consoleEl.scrollTop = consoleEl.scrollHeight;
        }

        if (progress >= 20) {
          const s1 = document.getElementById('pipe-step-1');
          if (s1) s1.className = 'pipeline-step-item done';
        }
        if (progress >= 40) {
          const s2 = document.getElementById('pipe-step-2');
          if (s2) s2.className = 'pipeline-step-item done';
        }
        if (progress >= 60) {
          const s3 = document.getElementById('pipe-step-3');
          if (s3) s3.className = 'pipeline-step-item active';
          if (gaugeStatus) gaugeStatus.innerText = 'AI/ML Risk Prediction Model Running...';
        }
        if (progress >= 80) {
          const s3 = document.getElementById('pipe-step-3');
          if (s3) s3.className = 'pipeline-step-item done';
          const s4 = document.getElementById('pipe-step-4');
          if (s4) s4.className = 'pipeline-step-item done';
          if (gaugeStatus) gaugeStatus.innerText = 'Disaster Threshold Validation...';
        }
        if (progress >= 100) {
          clearInterval(interval);
          const s5 = document.getElementById('pipe-step-5');
          if (s5) s5.className = 'pipeline-step-item done';
          if (gaugeStatus) {
            gaugeStatus.innerText = 'Analysis Complete! Risk: HIGH';
            gaugeStatus.style.color = 'var(--risk-high)';
          }
          if (btnViewResult) btnViewResult.style.display = 'inline-flex';
          
          EarthApp.playSuccessChime();
          EarthApp.showToast('AI assessment finished: High Risk detected (Confidence: 87.4%)');
          
          setTimeout(() => {
            EarthApp.goToStep(5);
          }, 1400);
        }
      }, 250);
    },

    switchHeatmapFilter: function (btn, filterName) {
      this.playUiClick();
      document.querySelectorAll('.heatmap-layer-bar .layer-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const img = document.getElementById('heatmap-display-img');
      if (!img) return;

      if (filterName === 'normal') {
        img.style.filter = 'none';
        this.showToast('Layer: Standard AI Inundation Heatmap');
      } else if (filterName === 'contrast') {
        img.style.filter = 'contrast(1.5) saturate(1.8)';
        this.showToast('Layer: High-Contrast Inundation Boundaries');
      } else if (filterName === 'thermal') {
        img.style.filter = 'hue-rotate(90deg) saturate(2)';
        this.showToast('Layer: Thermal NDVI Moisture Signature');
      } else if (filterName === 'sar') {
        img.style.filter = 'grayscale(1) contrast(1.8)';
        this.showToast('Layer: SAR Coherence Radar Backscatter');
      }
    },

    saveAndGenerateReport: async function () {
      this.playUiClick();
      this.showToast('Assessment saved to case database. Generating official report...');
      
      try {
        await fetch('/api/cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: document.getElementById('assess-title')?.value || 'Uttarakhand Rainfall Risk Assessment',
            disaster_type: document.getElementById('assess-disaster-type')?.value || 'Flash Flood',
            state: document.getElementById('assess-state')?.value || 'Uttarakhand',
            district: document.getElementById('assess-district')?.value || 'Chamoli',
            status: 'completed',
            priority: 'high',
            risk_level: 'High Risk',
            confidence_score: 87.4
          })
        });
        this.fetchLiveBackendData();
      } catch (e) {}

      setTimeout(() => {
        this.navigateTo('reports');
      }, 700);
    },

    openDetailedModal: function () {
      this.playUiClick();
      const modal = document.getElementById('modal-detailed-analysis');
      if (modal) modal.style.display = 'flex';
    },

    closeDetailedModal: function () {
      this.playUiClick();
      const modal = document.getElementById('modal-detailed-analysis');
      if (modal) modal.style.display = 'none';
    },

    // -------------------------------------------------------------------------
    // Screen 2: Interactive India Risk Map
    // -------------------------------------------------------------------------
    initIndiaMap: function () {
      const paths = document.querySelectorAll('.state-path');
      const tooltip = document.getElementById('map-tooltip');
      const tooltipState = document.getElementById('tooltip-state-name');
      const tooltipRisk = document.getElementById('tooltip-risk-level');
      const tooltipInfo = document.getElementById('tooltip-info');

      paths.forEach(path => {
        path.addEventListener('mousemove', (e) => {
          const stateName = path.getAttribute('data-state');
          const riskLevel = path.getAttribute('data-risk');
          const info = path.getAttribute('data-info');

          if (tooltip && tooltipState) {
            tooltipState.innerText = stateName;
            tooltipRisk.innerText = `${riskLevel.toUpperCase()} RISK`;
            tooltipRisk.style.color = riskLevel === 'High' ? '#f87171' : riskLevel === 'Medium' ? '#fbbf24' : '#86efac';
            tooltipInfo.innerText = info;

            const mapContainer = document.getElementById('map-container');
            const rect = mapContainer.getBoundingClientRect();
            
            tooltip.style.left = `${e.clientX - rect.left + 15}px`;
            tooltip.style.top = `${e.clientY - rect.top - 20}px`;
            tooltip.style.display = 'block';
          }
        });

        path.addEventListener('mouseleave', () => {
          if (tooltip) tooltip.style.display = 'none';
        });

        path.addEventListener('click', () => {
          EarthApp.playUiClick();
          const stateName = path.getAttribute('data-state');
          const riskLevel = path.getAttribute('data-risk');
          EarthApp.showToast(`Selected Region: ${stateName} (${riskLevel} Risk)`);
          
          if (stateName === 'Uttarakhand') {
            EarthApp.loadCase('#1024');
          } else if (stateName === 'Sikkim') {
            EarthApp.loadCase('#1023');
          } else {
            EarthApp.startNewAssessment();
            const stateSelect = document.getElementById('assess-state');
            if (stateSelect) stateSelect.value = stateName;
          }
        });
      });
    },

    switchMapLayer: function (layerType) {
      this.playUiClick();
      const mapSvg = document.getElementById('india-map-svg');
      if (layerType === 'satellite') {
        if (mapSvg) mapSvg.style.filter = 'hue-rotate(30deg) saturate(1.4)';
        this.showToast('Map Mode: Live INSAT-3D Satellite Feed');
      } else {
        if (mapSvg) mapSvg.style.filter = 'contrast(1.4) saturate(2)';
        this.showToast('Map Mode: Precipitation Doppler Radar Composite');
      }
      setTimeout(() => {
        if (mapSvg) mapSvg.style.filter = 'none';
      }, 3500);
    },

    // -------------------------------------------------------------------------
    // Screen 9: Case Management
    // -------------------------------------------------------------------------
    renderCasesTable: function () {
      const tbody = document.getElementById('cases-table-body');
      if (!tbody) return;

      tbody.innerHTML = AppState.cases.map(c => `
        <tr data-id="${c.id}" data-type="${c.type || c.disaster_type}" data-state="${c.state}" data-status="${c.status}">
          <td style="font-weight:700;color:var(--brand-primary);">${c.id}</td>
          <td style="font-weight:600;">${c.title}</td>
          <td>${c.type || c.disaster_type}</td>
          <td>${c.state}</td>
          <td><span class="status-badge ${c.status}">${c.status.toUpperCase()}</span></td>
          <td><span class="priority-badge ${c.priority}">${c.priority.toUpperCase()}</span></td>
          <td>${c.date}</td>
          <td>
            <button class="btn-secondary" style="padding:4px 10px;font-size:12px;" onclick="window.EarthApp.loadCase('${c.id}')">View</button>
          </td>
        </tr>
      `).join('');
    },

    renderAlertsStack: function () {
      const container = document.getElementById('alerts-container');
      if (!container) return;

      container.innerHTML = AppState.alerts.map(a => `
        <div class="alert-row-card" data-severity="${a.severity}">
          <div class="alert-main-info">
            <div class="activity-icon-indicator ${a.severity}">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
            </div>
            <div>
              <div style="font-size:14px;font-weight:700;color:var(--text-title);">${a.title}</div>
              <div style="font-size:12.5px;color:var(--text-muted);margin-top:2px;">${a.desc}</div>
              <div style="font-size:11px;color:var(--text-light);margin-top:4px;">${a.time} • Emergency Command</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <span class="alert-badge-pill" style="background:${a.severity === 'high' ? '#fee2e2' : a.severity === 'medium' ? '#fef3c7' : '#d1fae5'};color:${a.severity === 'high' ? '#b91c1c' : a.severity === 'medium' ? '#b45309' : '#047857'};">${a.severity.toUpperCase()}</span>
            <button class="btn-secondary" onclick="window.EarthApp.loadCase('${a.case_id}')">View Case</button>
          </div>
        </div>
      `).join('');
    },

    loadCase: function (caseId) {
      this.playUiClick();
      this.showToast(`Loading assessment record for ${caseId}...`);
      if (caseId === '#1024') {
        this.navigateTo('new-assessment');
        this.goToStep(5);
      } else {
        this.navigateTo('reports');
      }
    },

    filterCases: function () {
      const searchQuery = (document.getElementById('case-search-input')?.value || '').toLowerCase();
      const statusFilter = (document.getElementById('case-filter-status')?.value || 'all').toLowerCase();
      const typeFilter = (document.getElementById('case-filter-type')?.value || 'all');
      const stateFilter = (document.getElementById('case-filter-state')?.value || 'all');

      const rows = document.querySelectorAll('#cases-table-body tr');
      rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        const rowStatus = row.getAttribute('data-status') || '';
        const rowType = row.getAttribute('data-type') || '';
        const rowState = row.getAttribute('data-state') || '';

        const matchesSearch = !searchQuery || text.includes(searchQuery);
        const matchesStatus = statusFilter === 'all' || rowStatus.toLowerCase() === statusFilter;
        const matchesType = typeFilter === 'all' || rowType === typeFilter;
        const matchesState = stateFilter === 'all' || rowState === stateFilter;

        if (matchesSearch && matchesStatus && matchesType && matchesState) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    },

    resetCaseFilters: function () {
      this.playUiClick();
      const s = document.getElementById('case-search-input'); if (s) s.value = '';
      const st = document.getElementById('case-filter-status'); if (st) st.value = 'all';
      const ty = document.getElementById('case-filter-type'); if (ty) ty.value = 'all';
      const sta = document.getElementById('case-filter-state'); if (sta) sta.value = 'all';
      this.filterCases();
      this.showToast('Filters cleared');
    },

    handleGlobalSearch: function (query) {
      this.playUiClick();
      if (query.includes('case') || query.includes('#') || query.includes('1024')) {
        this.navigateTo('cases');
        const s = document.getElementById('case-search-input');
        if (s) { s.value = query; this.filterCases(); }
      } else if (query.includes('alert')) {
        this.navigateTo('alerts');
      } else if (query.includes('report')) {
        this.navigateTo('reports');
      } else {
        this.navigateTo('cases');
        const s = document.getElementById('case-search-input');
        if (s) { s.value = query; this.filterCases(); }
      }
      this.showToast(`Search results filtered for "${query}"`);
    },

    // -------------------------------------------------------------------------
    // Screen 10: Canvas Charts (Self-contained, Zero Dependency)
    // -------------------------------------------------------------------------
    renderCharts: function () {
      this.renderRiskTrendChart();
      this.renderDisasterDistChart();
    },

    renderRiskTrendChart: function () {
      const canvas = document.getElementById('canvas-risk-trend');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const dpr = window.devicePixelRatio || 1;
      canvas.width = 540 * dpr;
      canvas.height = 260 * dpr;
      canvas.style.width = '100%';
      canvas.style.height = '260px';
      ctx.scale(dpr, dpr);

      const width = 540;
      const height = 260;
      const padding = { top: 20, right: 30, bottom: 40, left: 40 };
      const plotW = width - padding.left - padding.right;
      const plotH = height - padding.top - padding.bottom;

      ctx.clearRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = AppState.isDarkMode ? '#1e3a32' : '#f1f5f9';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (plotH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(40 - i * 10, padding.left - 8, y + 3);
      }

      // X Labels
      const dates = ['1 Sep', '5 Sep', '10 Sep', '15 Sep', '20 Sep', '25 Sep'];
      dates.forEach((d, i) => {
        const x = padding.left + (plotW / (dates.length - 1)) * i;
        ctx.fillStyle = AppState.isDarkMode ? '#94a3b8' : '#64748b';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d, x, height - 15);
      });

      // Data series
      const series = [
        { label: 'High', color: '#ef4444', points: [12, 18, 14, 28, 34, 30] },
        { label: 'Medium', color: '#f59e0b', points: [25, 32, 29, 45, 52, 48] },
        { label: 'Low', color: '#10b981', points: [30, 28, 35, 38, 42, 45] }
      ];

      series.forEach(s => {
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        s.points.forEach((val, i) => {
          const x = padding.left + (plotW / (dates.length - 1)) * i;
          const y = padding.top + plotH - (val / 60) * plotH;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        s.points.forEach((val, i) => {
          const x = padding.left + (plotW / (dates.length - 1)) * i;
          const y = padding.top + plotH - (val / 60) * plotH;
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      });
    },

    renderDisasterDistChart: function () {
      const canvas = document.getElementById('canvas-disaster-dist');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const dpr = window.devicePixelRatio || 1;
      canvas.width = 400 * dpr;
      canvas.height = 260 * dpr;
      canvas.style.width = '100%';
      canvas.style.height = '260px';
      ctx.scale(dpr, dpr);

      const cx = 130;
      const cy = 130;
      const outerR = 90;
      const innerR = 55;

      const data = [
        { label: 'Flood', percent: 0.35, color: '#3b82f6', text: 'Flood 35%' },
        { label: 'Landslide', percent: 0.25, color: '#ef4444', text: 'Landslide 25%' },
        { label: 'Cyclone', percent: 0.20, color: '#06b6d4', text: 'Cyclone 20%' },
        { label: 'Drought', percent: 0.10, color: '#f59e0b', text: 'Drought 10%' },
        { label: 'Others', percent: 0.10, color: '#8b5cf6', text: 'Others 10%' }
      ];

      ctx.clearRect(0, 0, 400, 260);

      let currentAngle = -0.5 * Math.PI;

      data.forEach(item => {
        const sliceAngle = item.percent * 2 * Math.PI;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, currentAngle, currentAngle + sliceAngle);
        ctx.arc(cx, cy, innerR, currentAngle + sliceAngle, currentAngle, true);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        currentAngle += sliceAngle;
      });

      ctx.fillStyle = AppState.isDarkMode ? '#ffffff' : '#0f172a';
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('128', cx, cy - 2);

      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText('Total Cases', cx, cy + 16);

      const legendX = 260;
      let legendY = 60;
      data.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(legendX, legendY, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = AppState.isDarkMode ? '#e2e8f0' : '#334155';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(item.text, legendX + 12, legendY + 4);
        legendY += 30;
      });
    },

    // -------------------------------------------------------------------------
    // Screen 11: Alerts & Notifications
    // -------------------------------------------------------------------------
    filterAlerts: function (btn, severity) {
      this.playUiClick();
      document.querySelectorAll('.alerts-tab-filter .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cards = document.querySelectorAll('#alerts-container .alert-row-card');
      cards.forEach(card => {
        const cardSev = card.getAttribute('data-severity');
        if (severity === 'all' || cardSev === severity) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    },

    shareReport: function () {
      this.playUiClick();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
      this.showToast('Secure report link copied to clipboard (ES-2026-09-1024)');
    },

    toggleDarkMode: function () {
      this.playUiClick();
      AppState.isDarkMode = !AppState.isDarkMode;
      document.body.classList.toggle('dark-mode', AppState.isDarkMode);
      this.showToast(`Switched to ${AppState.isDarkMode ? 'Dark Command Center' : 'Light'} theme`);
      this.renderCharts();
    },

    showToast: function (msg) {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `
        <svg width="18" height="18" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <span>${msg}</span>
      `;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3200);
    },

    // -------------------------------------------------------------------------
    // Automated Guided Video Demo Tour
    // -------------------------------------------------------------------------
    runGuidedDemoTour: function () {
      if (AppState.isTourRunning) return;
      AppState.isTourRunning = true;
      this.playUiClick();
      this.showToast('🎬 Starting Automated Platform Walkthrough for Video Demo...');

      const steps = [
        () => {
          this.navigateTo('dashboard');
          this.showToast('Step 1: Operational Dashboard & India Live Risk Overview');
        },
        () => {
          const mapEl = document.querySelector('.state-path.risk-high');
          if (mapEl) {
            mapEl.dispatchEvent(new MouseEvent('mousemove', { clientX: 450, clientY: 260 }));
          }
        },
        () => {
          this.startNewAssessment();
          this.showToast('Step 2: Starting New Assessment for Uttarakhand');
        },
        () => {
          // Adjust rainfall slider to show dynamic logic
          const slider = document.getElementById('slider-rainfall');
          if (slider) {
            slider.value = 380;
            this.onParamChange();
          }
          this.showToast('Live Parameter Modeling: Rainfall set to 380mm');
        },
        () => {
          this.goToStep(2);
          this.showToast('Step 3: Multi-modal Data Ingestion (GeoTIFF, CSV, Radar)');
        },
        () => {
          this.goToStep(3);
          this.showToast('Step 4: Automated Pre-flight Data Verification');
        },
        () => {
          this.startProcessing();
          this.showToast('Step 5: Multimodal Deep Learning & Feature Extraction Pipeline');
        },
        () => {
          this.goToStep(5);
          this.showToast('Step 6: AI Inundation Model Results & Heatmap');
        },
        () => {
          // Toggle a heatmap layer
          const layerBtn = document.querySelectorAll('.heatmap-layer-bar .layer-btn')[1];
          if (layerBtn) this.switchHeatmapFilter(layerBtn, 'contrast');
        },
        () => {
          this.goToStep(6);
          this.showToast('Step 7: Actionable Decision Directives & Agency Tasking');
        },
        () => {
          this.navigateTo('reports');
          this.showToast('Step 8: Official Disaster Intelligence Report Preview');
        },
        () => {
          this.navigateTo('cases');
          this.showToast('Step 9: Real-time Multi-Case Tracking & Historical Archive');
        },
        () => {
          this.navigateTo('analytics');
          this.showToast('Step 10: Macro Risk Trends & Disaster Distribution Analytics');
        },
        () => {
          this.navigateTo('alerts');
          this.showToast('Step 11: Real-time Incident Alerts Stream');
        },
        () => {
          this.navigateTo('dashboard');
          this.showToast('✅ Demo Tour Complete — Platform Ready for Deployment');
          AppState.isTourRunning = false;
        }
      ];

      let currentStepIndex = 0;
      function nextTourStep() {
        if (currentStepIndex < steps.length) {
          steps[currentStepIndex]();
          currentStepIndex++;
          setTimeout(nextTourStep, 3400);
        }
      }

      nextTourStep();
    }
  };

  window.EarthApp = EarthApp;
  document.addEventListener('DOMContentLoaded', () => EarthApp.init());
})();
