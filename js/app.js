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
    
    // Capability 2.2 Data Stores
    indexedTilesCount: 4820,
    activeChangeScenario: 'construction',
    activeClusterId: 1,
    activeQueueId: 'REV-801',
    isWipeDragging: false,

    reviewQueue: [
      {
        id: 'REV-801',
        title: 'Newly Built River Structures',
        sector: 'Chamoli Valley, Alaknanda Reach',
        coords: '30.3842° N, 79.3267° E',
        priority: 'high',
        changeType: 'Newly Built Structures (Construction)',
        confidence: 94.8,
        status: 'Pending Review',
        date: '13 Mar 2026',
        sceneT1: 'S2A_MSIL2A_20260112T051831_N0500_R019_T44RLV',
        sceneT2: 'S2B_MSIL2A_20260313T052219_N0500_R019_T44RLV',
        earliestObs: '11 Feb 2026',
        desc: 'Rapid appearance of 3 rectangular concrete foundations within 45m of active riverbank line.'
      },
      {
        id: 'REV-802',
        title: 'Large Vehicle Staging on Open Ground',
        sector: 'Thar Open Ground Corridor',
        coords: '27.0214° N, 71.9125° E',
        priority: 'high',
        changeType: 'Vehicle Concentration Appearance',
        confidence: 92.4,
        status: 'Pending Review',
        date: '12 Mar 2026',
        sceneT1: 'S2A_MSIL2A_20260124T052011_N0500_R062_T43RER',
        sceneT2: 'S2B_MSIL2A_20260312T052144_N0500_R062_T43RER',
        earliestObs: '19 Feb 2026',
        desc: 'Cluster of 34 high-reflectance vehicle formations organized in linear convoy arrays on bare soil.'
      },
      {
        id: 'REV-803',
        title: 'Forest Canopy Loss & Access Track Cut',
        sector: 'North Ridge Himalayan Slope',
        coords: '30.4218° N, 79.2891° E',
        priority: 'med',
        changeType: 'Clearance & Road Development',
        confidence: 87.2,
        status: 'Pending Review',
        date: '08 Mar 2026',
        sceneT1: 'LC09_L2SP_146039_20260108_20260116_02_T1',
        sceneT2: 'LC09_L2SP_146039_20260308_20260316_02_T1',
        earliestObs: '06 Feb 2026',
        desc: 'Linear strip of vegetation depletion accompanied by freshly graded unpaved access cut.'
      },
      {
        id: 'REV-804',
        title: 'Reservoir Margin Siltation & Water Retreat',
        sector: 'Tehri Dam Catchment Reach',
        coords: '30.3789° N, 78.4812° E',
        priority: 'low',
        changeType: 'Water-Extent Variation',
        confidence: 78.5,
        status: 'Pending Review',
        date: '02 Mar 2026',
        sceneT1: 'S1A_IW_GRDH_1SDV_20260116T004522...',
        sceneT2: 'S1A_IW_GRDH_1SDV_20260302T004523...',
        earliestObs: '16 Jan 2026',
        desc: 'Waterline contraction exposing 18 hectares of dried alluvial siltation flats.'
      }
    ],

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
      
      // Initialize Challenge 2.2 Capabilities
      this.initCapabilities();

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
    },

    // =========================================================================
    // CHALLENGE 2.2 CAPABILITIES IMPLEMENTATION
    // =========================================================================

    initCapabilities: function () {
      this.initSemanticRetrieval();
      this.initWipeSlider();
      this.initClustering();
      this.initAnalystQueue();
      this.initIngestionHub();
    },

    // -------------------------------------------------------------------------
    // 2.2.1 Semantic and Multimodal Retrieval
    // -------------------------------------------------------------------------
    initSemanticRetrieval: function () {
      const input = document.getElementById('semantic-search-input');
      if (input) {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            this.executeSemanticSearch();
          }
        });
      }
      this.executeSemanticSearch('newly built structures near a river');
    },

    applyPromptPill: function (promptText, btnEl) {
      this.playUiClick();
      const input = document.getElementById('semantic-search-input');
      if (input) input.value = promptText;
      
      document.querySelectorAll('.prompt-pills-row .prompt-pill').forEach(p => p.classList.remove('active'));
      if (btnEl) btnEl.classList.add('active');

      this.executeSemanticSearch(promptText);
    },

    simulateImageQuery: function () {
      this.playUiClick();
      this.showToast('Reference tile loaded: EarthSemantic-ViT extracting 512-D visual embedding...');
      const input = document.getElementById('semantic-search-input');
      if (input) input.value = '[Image-to-Image Query: Tile_T44RLV_20260313_B8A.cog]';
      this.executeSemanticSearch('image-to-image');
    },

    executeSemanticSearch: function (overrideQuery) {
      this.playUiClick();
      const queryInput = document.getElementById('semantic-search-input');
      const query = (overrideQuery || (queryInput ? queryInput.value : '')).toLowerCase().trim();

      const statusEl = document.getElementById('search-status-text');
      const latencyEl = document.getElementById('search-latency-stat');
      if (statusEl) statusEl.innerText = 'Extracting query embedding & searching FAISS HNSW graph...';

      setTimeout(() => {
        const results = this.generateSemanticMatches(query);
        this.renderSemanticResults(results, query);
        if (statusEl) statusEl.innerText = `Vector Search Complete: ${results.length} Rank-Ordered Candidates`;
        if (latencyEl) latencyEl.innerText = `${(1.2 + Math.random() * 0.5).toFixed(1)} ms`;
        this.playSuccessChime();
      }, 240);
    },

    generateSemanticMatches: function (query) {
      const isVehicle = query.includes('vehicle') || query.includes('truck') || query.includes('convoy');
      const isClearance = query.includes('forest') || query.includes('clear') || query.includes('tree') || query.includes('track');
      const isWater = query.includes('water') || query.includes('reservoir') || query.includes('river') || query.includes('lake');
      const isImage = query.includes('image-to-image');

      if (isVehicle) {
        return [
          { rank: 1, title: 'Thar Open Ground Sector 12B', sim: 95.8, coords: '27.021°N, 71.912°E', date: '12 Mar 2026', sensor: 'Sentinel-2B (10m)', cloud: '0.0%', theme: 'vehicle', changeType: 'Vehicle Staging' },
          { rank: 2, title: 'Barmer Logistics Field Array', sim: 93.4, coords: '25.752°N, 71.398°E', date: '11 Mar 2026', sensor: 'Cartosat-3 (0.28m)', cloud: '1.2%', theme: 'vehicle', changeType: 'Vehicle Staging' },
          { rank: 3, title: 'Pokhran Transit Staging Ground', sim: 91.0, coords: '26.918°N, 71.884°E', date: '09 Mar 2026', sensor: 'Sentinel-1 SAR', cloud: 'All-Weather', theme: 'vehicle', changeType: 'Machinery Gathering' },
          { rank: 4, title: 'Jaisalmer Northern Corridor Site', sim: 88.6, coords: '26.980°N, 71.210°E', date: '08 Mar 2026', sensor: 'Landsat-9 OLI', cloud: '2.4%', theme: 'vehicle', changeType: 'Vehicle Concentration' }
        ];
      } else if (isClearance) {
        return [
          { rank: 1, title: 'North Ridge Slope Clearance 4A', sim: 94.6, coords: '30.421°N, 79.289°E', date: '08 Mar 2026', sensor: 'Landsat-9 (30m)', cloud: '3.1%', theme: 'clearance', changeType: 'Canopy Loss & Track' },
          { rank: 2, title: 'Gorge Pass Timber Corridor', sim: 92.1, coords: '30.395°N, 79.310°E', date: '06 Mar 2026', sensor: 'Sentinel-2A (10m)', cloud: '4.5%', theme: 'clearance', changeType: 'Forest Clearing' },
          { rank: 3, title: 'Upper Valley Graded Cut Sector', sim: 89.4, coords: '30.448°N, 79.255°E', date: '02 Mar 2026', sensor: 'Sentinel-1 SAR', cloud: '0.0%', theme: 'clearance', changeType: 'Linear Track Cut' }
        ];
      } else if (isWater) {
        return [
          { rank: 1, title: 'Alaknanda Riverbank Sector 4B', sim: 95.4, coords: '30.384°N, 79.326°E', date: '13 Mar 2026', sensor: 'Sentinel-2B (10m)', cloud: '2.1%', theme: 'river_struct', changeType: 'River Structures' },
          { rank: 2, title: 'Tehri Inundation Delta 2', sim: 93.8, coords: '30.378°N, 78.481°E', date: '10 Mar 2026', sensor: 'Sentinel-2B (10m)', cloud: '1.8%', theme: 'water', changeType: 'Reservoir Contraction' },
          { rank: 3, title: 'Rudraprayag Confluence Bank', sim: 91.5, coords: '30.285°N, 78.980°E', date: '09 Mar 2026', sensor: 'Sentinel-1 SAR', cloud: 'All-Weather', theme: 'river_struct', changeType: 'Pier Construction' },
          { rank: 4, title: 'Bhagirathi Embankment Zone', sim: 89.2, coords: '30.412°N, 78.520°E', date: '07 Mar 2026', sensor: 'Landsat-9 OLI', cloud: '5.2%', theme: 'river_struct', changeType: 'Foundation Footprint' }
        ];
      } else if (isImage) {
        return [
          { rank: 1, title: 'Query Tile Visual Match (Direct Co-occurrence)', sim: 96.8, coords: '30.384°N, 79.326°E', date: '13 Mar 2026', sensor: 'Sentinel-2B (10m)', cloud: '2.1%', theme: 'river_struct', changeType: 'Construction' },
          { rank: 2, title: 'Neighboring River Reach Pier Site', sim: 94.2, coords: '30.389°N, 79.331°E', date: '13 Mar 2026', sensor: 'Sentinel-2B (10m)', cloud: '2.1%', theme: 'river_struct', changeType: 'Construction' },
          { rank: 3, title: 'Downstream Riparian Concrete Pad', sim: 91.7, coords: '30.370°N, 79.315°E', date: '08 Mar 2026', sensor: 'Cartosat-3 (0.28m)', cloud: '0.0%', theme: 'river_struct', changeType: 'Structure' }
        ];
      } else {
        // Default: Problem statement's "newly built structures near a river"
        return [
          { rank: 1, title: 'Alaknanda Riverbank Sector 4B', sim: 95.4, coords: '30.384°N, 79.326°E', date: '13 Mar 2026', sensor: 'Sentinel-2B (10m)', cloud: '2.1%', theme: 'river_struct', changeType: 'Newly Built Structures' },
          { rank: 2, title: 'Chamoli Confluence Construction Reach', sim: 93.1, coords: '30.392°N, 79.340°E', date: '11 Mar 2026', sensor: 'Sentinel-2B (10m)', cloud: '1.4%', theme: 'river_struct', changeType: 'Concrete Foundation' },
          { rank: 3, title: 'Brahmaputra Riparian Infrastructure Pad', sim: 91.8, coords: '26.195°N, 91.782°E', date: '09 Mar 2026', sensor: 'Cartosat-3 (0.28m)', cloud: '0.8%', theme: 'river_struct', changeType: 'Embankment Pier' },
          { rank: 4, title: 'Tehri Valley Access & Structural Zone', sim: 89.2, coords: '30.378°N, 78.481°E', date: '07 Mar 2026', sensor: 'Landsat-9 OLI', cloud: '4.2%', theme: 'river_struct', changeType: 'Building Footprint' },
          { rank: 5, title: 'Rudraprayag Embankment Works', sim: 87.5, coords: '30.285°N, 78.980°E', date: '04 Mar 2026', sensor: 'Sentinel-1 SAR', cloud: 'All-Weather', theme: 'river_struct', changeType: 'River Works' }
        ];
      }
    },

    getProceduralTileSvg: function (theme) {
      if (theme === 'vehicle') {
        return `<svg width="100%" height="100%" viewBox="0 0 280 180" style="background:#4a3728;">
          <rect width="280" height="180" fill="#6d543e"/>
          <!-- Road/dirt track -->
          <path d="M0,90 L280,90" stroke="#8c6f54" stroke-width="24"/>
          <!-- Vehicles in linear arrays -->
          <g fill="#f8fafc" stroke="#1e293b" stroke-width="1.5">
            <rect x="30" y="55" width="22" height="12" rx="2"/><rect x="60" y="55" width="22" height="12" rx="2"/>
            <rect x="90" y="55" width="22" height="12" rx="2"/><rect x="120" y="55" width="22" height="12" rx="2"/>
            <rect x="150" y="55" width="22" height="12" rx="2"/><rect x="180" y="55" width="22" height="12" rx="2"/>
            <rect x="30" y="115" width="22" height="12" rx="2"/><rect x="60" y="115" width="22" height="12" rx="2"/>
            <rect x="90" y="115" width="22" height="12" rx="2"/><rect x="120" y="115" width="22" height="12" rx="2"/>
          </g>
          <text x="14" y="30" fill="#fde68a" font-size="11" font-weight="800">VEHICLE CONVOY DETECTED</text>
        </svg>`;
      } else if (theme === 'clearance') {
        return `<svg width="100%" height="100%" viewBox="0 0 280 180" style="background:#133827;">
          <!-- Dense canopy -->
          <rect width="280" height="180" fill="#184e36"/>
          <!-- Diagonal cleared swath -->
          <path d="M-20,160 L240,-20 L280,-20 L20,180 Z" fill="#785a3a"/>
          <path d="M-10,165 L250,-15" stroke="#a38260" stroke-width="4" stroke-dasharray="8 6"/>
          <text x="14" y="30" fill="#fca5a5" font-size="11" font-weight="800">CANOPY LOSS & TRACK</text>
        </svg>`;
      } else if (theme === 'water') {
        return `<svg width="100%" height="100%" viewBox="0 0 280 180" style="background:#1b4d3e;">
          <!-- Exposed mudflat margin -->
          <path d="M0,0 Q140,80 180,180 L0,180 Z" fill="#8c7853"/>
          <!-- Retreated water body -->
          <path d="M0,0 Q110,60 130,180 L0,180 Z" fill="#0284c7"/>
          <text x="14" y="30" fill="#bae6fd" font-size="11" font-weight="800">SHORELINE RETREAT (-18 HA)</text>
        </svg>`;
      } else {
        // River with structures
        return `<svg width="100%" height="100%" viewBox="0 0 280 180" style="background:#164e3f;">
          <!-- River corridor -->
          <path d="M-20,110 Q140,50 300,120 L300,160 Q140,90 -20,150 Z" fill="#0284c7"/>
          <!-- Concrete pads & structures -->
          <rect x="70" y="40" width="40" height="26" fill="#cbd5e1" stroke="#0f172a" stroke-width="1.5" rx="2"/>
          <rect x="125" y="35" width="55" height="32" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.5" rx="2"/>
          <rect x="195" y="45" width="35" height="24" fill="#cbd5e1" stroke="#0f172a" stroke-width="1.5" rx="2"/>
          <line x1="150" y1="67" x2="150" y2="105" stroke="#64748b" stroke-width="6"/>
          <text x="14" y="25" fill="#a7f3d0" font-size="11" font-weight="800">NEW RIVER STRUCTURES</text>
        </svg>`;
      }
    },

    renderSemanticResults: function (items, query) {
      const container = document.getElementById('ranked-results-container');
      if (!container) return;

      container.innerHTML = items.map(item => `
        <div class="ranked-tile-card">
          <div class="ranked-tile-media">
            ${this.getProceduralTileSvg(item.theme)}
            <div class="rank-index-badge">#${item.rank}</div>
            <div class="sim-score-badge">${item.sim}% Match</div>
          </div>
          <div class="ranked-tile-body">
            <div class="ranked-tile-title">${item.title}</div>
            <div class="ranked-meta-list">
              <div class="ranked-meta-item"><span>Coordinates:</span> <strong>${item.coords}</strong></div>
              <div class="ranked-meta-item"><span>Platform:</span> <strong>${item.sensor}</strong></div>
              <div class="ranked-meta-item"><span>Acquisition:</span> <strong>${item.date}</strong></div>
              <div class="ranked-meta-item"><span>Cloud Quality:</span> <strong>${item.cloud}</strong></div>
            </div>
            <div class="ranked-card-actions">
              <button class="btn-card-action" onclick="window.EarthApp.inspectInChange('${item.theme}')">Inspect Changes</button>
              <button class="btn-card-action" onclick="window.EarthApp.navigateTo('clustering')">Cluster Peers</button>
              <button class="btn-card-action" onclick="window.EarthApp.pushCandidateToReview('${item.title}', '${item.coords}', '${item.sim}')">+ Queue</button>
            </div>
          </div>
        </div>
      `).join('');
    },

    inspectInChange: function (theme) {
      this.playUiClick();
      const themeMap = {
        'river_struct': 'construction',
        'vehicle': 'vehicles',
        'clearance': 'clearance',
        'water': 'water'
      };
      const key = themeMap[theme] || 'construction';
      this.navigateTo('change-analysis');
      setTimeout(() => {
        const btn = document.querySelector(`.prompt-pills-row button[onclick*="${key}"]`);
        this.loadChangeScenario(key, btn);
      }, 100);
    },

    pushCandidateToReview: function (title, coords, sim) {
      this.playSuccessChime();
      const newId = `REV-${805 + AppState.reviewQueue.length - 4}`;
      const candidate = {
        id: newId,
        title: title,
        sector: 'Target AOI Reach',
        coords: coords,
        priority: 'high',
        changeType: 'Semantic Match Event',
        confidence: parseFloat(sim),
        status: 'Pending Review',
        date: '13 Mar 2026',
        sceneT1: 'S2A_MSIL2A_20260112T...',
        sceneT2: 'S2B_MSIL2A_20260313T...',
        earliestObs: '11 Feb 2026',
        desc: `High similarity candidate (${sim}%) dispatched from semantic retrieval.`
      };
      AppState.reviewQueue.unshift(candidate);
      this.renderQueueItems();
      this.showToast(`Candidate ${newId} dispatched to Analyst Review Queue`);
      const queueBadge = document.getElementById('sidebar-queue-badge');
      if (queueBadge) queueBadge.innerText = AppState.reviewQueue.filter(q => q.status === 'Pending Review').length;
    },

    // -------------------------------------------------------------------------
    // 2.2.2 & 2.2.3 Multi-Temporal Change & False-Alarm Wipe Slider
    // -------------------------------------------------------------------------
    initWipeSlider: function () {
      const container = document.getElementById('wipe-container');
      const handle = document.getElementById('wipe-handle');
      const overlay = document.getElementById('wipe-overlay-after');
      if (!container || !handle || !overlay) return;

      const updateSlider = (clientX) => {
        const rect = container.getBoundingClientRect();
        let posX = clientX - rect.left;
        if (posX < 0) posX = 0;
        if (posX > rect.width) posX = rect.width;
        const pct = (posX / rect.width) * 100;

        overlay.style.width = `${pct}%`;
        handle.style.left = `${pct}%`;
      };

      const onPointerMove = (e) => {
        if (!AppState.isWipeDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        updateSlider(clientX);
      };

      const onPointerUp = () => {
        AppState.isWipeDragging = false;
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('touchend', onPointerUp);
      };

      const onPointerDown = (e) => {
        AppState.isWipeDragging = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        updateSlider(clientX);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchmove', onPointerMove);
        window.addEventListener('touchend', onPointerUp);
      };

      handle.addEventListener('mousedown', onPointerDown);
      handle.addEventListener('touchstart', onPointerDown);
      container.addEventListener('click', (e) => updateSlider(e.clientX));
    },

    loadChangeScenario: function (scenarioKey, btnEl) {
      this.playUiClick();
      AppState.activeChangeScenario = scenarioKey;

      document.querySelectorAll('#view-change-analysis .prompt-pills-row .prompt-pill').forEach(b => b.classList.remove('active'));
      if (btnEl) btnEl.classList.add('active');

      const titleEl = document.getElementById('wipe-scenario-title');
      const typeBadge = document.getElementById('badge-change-type');
      const obsBadge = document.getElementById('badge-earliest-obs');

      if (scenarioKey === 'clearance') {
        if (titleEl) titleEl.innerText = 'Bi-Temporal Inspection: Upper Valley Slope [30.421°N, 79.289°E]';
        if (typeBadge) { typeBadge.innerText = 'Forest Canopy Clearance & Access Road'; typeBadge.className = 'nav-badge red'; }
        if (obsBadge) obsBadge.innerText = 'Earliest Obs: 06 Feb 2026';
        this.showToast('Loaded Scenario B: Canopy Loss & Track Cut (Earliest: 06 Feb 2026)');
      } else if (scenarioKey === 'vehicles') {
        if (titleEl) titleEl.innerText = 'Bi-Temporal Inspection: Thar Open Ground [27.021°N, 71.912°E]';
        if (typeBadge) { typeBadge.innerText = 'Large Vehicle Staging on Open Ground'; typeBadge.className = 'nav-badge gold'; }
        if (obsBadge) obsBadge.innerText = 'Earliest Obs: 19 Feb 2026';
        this.showToast('Loaded Scenario C: Vehicle Formation Appearance (Earliest: 19 Feb 2026)');
      } else if (scenarioKey === 'water') {
        if (titleEl) titleEl.innerText = 'Bi-Temporal Inspection: Tehri Reservoir Basin [30.378°N, 78.481°E]';
        if (typeBadge) { typeBadge.innerText = 'Reservoir Water-Extent Contraction'; typeBadge.className = 'nav-badge blue'; }
        if (obsBadge) obsBadge.innerText = 'Earliest Obs: 16 Jan 2026';
        this.showToast('Loaded Scenario D: Waterline Contraction (Earliest: 16 Jan 2026)');
      } else {
        if (titleEl) titleEl.innerText = 'Bi-Temporal Inspection: Alaknanda River Sector [30.384°N, 79.326°E]';
        if (typeBadge) { typeBadge.innerText = 'Newly Built Structures (Construction)'; typeBadge.className = 'nav-badge red'; }
        if (obsBadge) obsBadge.innerText = 'Earliest Obs: 11 Feb 2026';
        this.showToast('Loaded Scenario A: Newly Built Structures Near River (Earliest: 11 Feb 2026)');
      }
    },

    scrubTimeline: function (nodeIdx) {
      this.playUiClick();
      const nodes = document.querySelectorAll('.timeline-track .timeline-node');
      nodes.forEach((n, idx) => {
        if (idx === nodeIdx) {
          n.classList.add('active');
        } else {
          n.classList.remove('active');
        }
      });

      const dates = ['12 Jan 2026', '27 Jan 2026', '11 Feb 2026', '26 Feb 2026', '13 Mar 2026'];
      if (nodeIdx === 2) {
        this.showToast('⭐ Earliest observation ($T_{earliest}$) supported by cloud-free usable imagery: 11 Feb 2026');
      } else if (nodeIdx === 1) {
        this.showToast('⚠️ Pass on 27 Jan 2026 obscured by cloud cover (Fmask QA band rejected)');
      } else {
        this.showToast(`Timeline Scrubber set to observation pass: ${dates[nodeIdx]}`);
      }
    },

    updateQualityMasks: function () {
      this.playUiClick();
      const chkCloud = document.getElementById('chk-mask-cloud');
      const chkShadow = document.getElementById('chk-mask-shadow');
      const cloudLayer = document.getElementById('mask-cloud-layer');
      const shadowLayer = document.getElementById('mask-shadow-layer');

      if (cloudLayer) {
        if (chkCloud && chkCloud.checked) cloudLayer.classList.add('active');
        else cloudLayer.classList.remove('active');
      }

      if (shadowLayer) {
        if (chkShadow && chkShadow.checked) shadowLayer.classList.add('active');
        else shadowLayer.classList.remove('active');
      }

      this.showToast('Quality masks recalibrated: Precision confidence locked at 97.2%');
    },

    toggleChangeHeatmap: function () {
      this.playUiClick();
      const mask = document.getElementById('mask-change-heat');
      if (mask) {
        mask.classList.toggle('active');
        const isActive = mask.classList.contains('active');
        this.showToast(isActive ? 'Change detection heatmap overlay: ON' : 'Change detection heatmap overlay: OFF');
      }
    },

    sendToAnalystQueue: function (eventId) {
      this.playSuccessChime();
      this.navigateTo('analyst-queue');
      this.selectQueueItem(eventId || 'REV-801');
      this.showToast('Event transferred to Analyst Review Queue for validation.');
    },

    // -------------------------------------------------------------------------
    // 2.2.4 Discovery and Clustering
    // -------------------------------------------------------------------------
    initClustering: function () {
      this.selectCluster(1);
    },

    selectCluster: function (clusterId, cardEl) {
      this.playUiClick();
      AppState.activeClusterId = clusterId;

      document.querySelectorAll('.cluster-group-card').forEach((c, i) => {
        if (i + 1 === clusterId) c.classList.add('active');
        else c.classList.remove('active');
      });

      const header = document.getElementById('active-cluster-member-header');
      const clusterNames = [
        'Discovered Peer Sites in Cluster 1 (Riverbank Construction)',
        'Discovered Peer Sites in Cluster 2 (Heavy Vehicle Staging Formations)',
        'Discovered Peer Sites in Cluster 3 (Woodland Slope Clearance)',
        'Discovered Peer Sites in Cluster 4 (Reservoir Margin Siltation)'
      ];
      if (header) header.innerText = clusterNames[clusterId - 1] || 'Cluster Peer Sites';

      this.renderClusterPeers(clusterId);
    },

    renderClusterPeers: function (clusterId) {
      const container = document.getElementById('cluster-peer-cards-container');
      if (!container) return;

      const mockPeers = [
        { name: `Site Cluster-${clusterId}.01`, sim: 96.4, coords: '30.384°N, 79.326°E', gsd: '10m' },
        { name: `Site Cluster-${clusterId}.02`, sim: 94.8, coords: '30.395°N, 79.338°E', gsd: '10m' },
        { name: `Site Cluster-${clusterId}.03`, sim: 93.1, coords: '30.370°N, 79.312°E', gsd: '10m' },
        { name: `Site Cluster-${clusterId}.04`, sim: 91.5, coords: '30.412°N, 79.360°E', gsd: '10m' }
      ];

      container.innerHTML = mockPeers.map(p => `
        <div style="background:var(--bg-subtle);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:10px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <strong style="font-size:12px;color:var(--text-title);">${p.name}</strong>
            <span class="nav-badge green" style="font-size:10px;">${p.sim}% Sim</span>
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">${p.coords} • GSD ${p.gsd}</div>
          <button class="btn-card-action" style="width:100%;font-size:11px;" onclick="window.EarthApp.inspectInChange('river_struct')">Inspect Evidence</button>
        </div>
      `).join('');
    },

    // -------------------------------------------------------------------------
    // 2.2.5 Analyst Workflow and Provenance
    // -------------------------------------------------------------------------
    initAnalystQueue: function () {
      this.renderQueueItems();
      this.selectQueueItem('REV-801');
    },

    renderQueueItems: function () {
      const list = document.getElementById('queue-items-list');
      if (!list) return;

      list.innerHTML = AppState.reviewQueue.map(item => `
        <div class="queue-candidate-card ${item.id === AppState.activeQueueId ? 'active' : ''}" onclick="window.EarthApp.selectQueueItem('${item.id}')">
          <div class="queue-candidate-top">
            <span class="queue-priority-pill ${item.priority}">${item.priority} Priority</span>
            <span style="font-size:11px;font-weight:700;color:var(--text-muted);">${item.date}</span>
          </div>
          <div style="font-size:13px;font-weight:800;color:var(--text-title);margin-bottom:3px;">${item.id}: ${item.title}</div>
          <div style="font-size:11.5px;color:var(--text-muted);margin-bottom:6px;">${item.coords}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:11px;font-weight:700;color:var(--brand-primary);">${item.confidence}% Confidence</span>
            <span class="badge-status ${item.status === 'Confirmed Change' ? 'success' : (item.status === 'Rejected (False Alarm)' ? 'danger' : 'info')}" style="font-size:10.5px;">${item.status}</span>
          </div>
        </div>
      `).join('');
    },

    selectQueueItem: function (id) {
      this.playUiClick();
      AppState.activeQueueId = id;
      this.renderQueueItems();

      const candidate = AppState.reviewQueue.find(q => q.id === id) || AppState.reviewQueue[0];
      const inspector = document.getElementById('queue-inspector-column');
      if (!inspector) return;

      inspector.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span class="queue-priority-pill ${candidate.priority}">${candidate.priority} Priority</span>
              <span class="nav-badge red" style="font-size:11px;">${candidate.changeType}</span>
            </div>
            <h3 style="font-size:17px;font-weight:800;color:var(--text-title);">${candidate.id} — ${candidate.title}</h3>
            <span style="font-size:12px;color:var(--text-muted);">${candidate.sector} • ${candidate.coords}</span>
          </div>
          <div style="text-align:right;">
            <div style="font-size:22px;font-weight:900;color:var(--brand-primary);">${candidate.confidence}%</div>
            <span style="font-size:11px;color:var(--text-muted);font-weight:700;">Calibrated Confidence</span>
          </div>
        </div>

        <!-- Before/After Evidence Thumbnails -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div style="border:1px solid var(--border-color);border-radius:var(--radius-sm);overflow:hidden;background:#0f172a;height:140px;position:relative;">
            <div style="position:absolute;top:6px;left:6px;background:rgba(15,23,42,0.8);color:#fff;font-size:10px;padding:2px 8px;border-radius:var(--radius-full);z-index:2;">T1: 12 Jan 2026 (Baseline)</div>
            ${this.getProceduralTileSvg('water')}
          </div>
          <div style="border:1px solid var(--border-color);border-radius:var(--radius-sm);overflow:hidden;background:#0f172a;height:140px;position:relative;">
            <div style="position:absolute;top:6px;left:6px;background:rgba(5,150,105,0.9);color:#fff;font-size:10px;padding:2px 8px;border-radius:var(--radius-full);z-index:2;">T2: 13 Mar 2026 (Post-Event)</div>
            ${this.getProceduralTileSvg('river_struct')}
          </div>
        </div>

        <p style="font-size:12.5px;color:var(--text-main);background:var(--bg-subtle);padding:10px 14px;border-radius:var(--radius-sm);border-left:3px solid var(--brand-accent);">
          <strong>Analyst Finding:</strong> ${candidate.desc}
        </p>

        <!-- Provenance & Source Metadata Sheet -->
        <div class="provenance-sheet">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <strong style="font-size:12px;color:var(--text-title);">Geospatial Provenance & Lineage (Section 2.2.5)</strong>
            <span class="nav-badge green" style="font-size:10px;">Air-Gapped Sovereign Certified</span>
          </div>
          <table class="provenance-table">
            <tr><td class="provenance-label">T1 Source Scene:</td><td class="provenance-val">${candidate.sceneT1}</td></tr>
            <tr><td class="provenance-label">T2 Source Scene:</td><td class="provenance-val">${candidate.sceneT2}</td></tr>
            <tr><td class="provenance-label">Projection / CRS:</td><td class="provenance-val">EPSG:32644 (WGS 84 / UTM Zone 44N)</td></tr>
            <tr><td class="provenance-label">Co-Registration:</td><td class="provenance-val">SIFT Sub-pixel (RMSE: 0.14 px) — Passed</td></tr>
            <tr><td class="provenance-label">AI Model Runtime:</td><td class="provenance-val">EarthSemantic-ViT-L/14 INT8 ONNX (Local CPU)</td></tr>
            <tr><td class="provenance-label">Earliest Obs (T_earliest):</td><td class="provenance-val">${candidate.earliestObs}</td></tr>
          </table>
        </div>

        <!-- Human-in-the-Loop Decision Buttons -->
        <div>
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px;">Analyst Decision (Feeds Continuous Reranking Loop):</div>
          <div class="analyst-decision-bar">
            <button class="btn-decision btn-confirm" onclick="window.EarthApp.analystDecision('Confirm', '${candidate.id}')">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Confirm Genuine Change</span>
            </button>
            <button class="btn-decision btn-reject" onclick="window.EarthApp.analystDecision('Reject', '${candidate.id}')">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              <span>Reject (False Alarm)</span>
            </button>
            <button class="btn-decision btn-escalate" onclick="window.EarthApp.analystDecision('Escalate', '${candidate.id}')">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span>Escalate Tasking</span>
            </button>
          </div>
        </div>
      `;
    },

    analystDecision: function (action, eventId) {
      const candidate = AppState.reviewQueue.find(q => q.id === eventId);
      if (!candidate) return;

      if (action === 'Confirm') {
        this.playSuccessChime();
        candidate.status = 'Confirmed Change';
        this.showToast(`✅ ${eventId} Confirmed: Positive feedback applied to retrieval reranker.`);
        this.appendAuditRow(eventId, 'Confirmed Change', 'success', candidate.changeType, candidate.sceneT2, '+0.12 (Positive Reinforce)');
      } else if (action === 'Reject') {
        this.playBeep(420, 0.15, 'sawtooth');
        candidate.status = 'Rejected (False Alarm)';
        this.showToast(`❌ ${eventId} Rejected as False Alarm: Confounder penalty recorded.`);
        this.appendAuditRow(eventId, 'Rejected (False Alarm)', 'danger', 'Confounder Filtered', candidate.sceneT2, '-0.24 (Penalized Confounder)');
      } else {
        this.playBeep(880, 0.1, 'sine');
        candidate.status = 'Escalated for Tasking';
        this.showToast(`🚩 ${eventId} Escalated for Cartosat-3 sub-meter retasking.`);
        this.appendAuditRow(eventId, 'Escalated Tasking', 'warning', 'High-Res Requested', candidate.sceneT2, '0.00 (Neutral)');
      }

      this.selectQueueItem(eventId);
      const pendingCount = AppState.reviewQueue.filter(q => q.status === 'Pending Review').length;
      const countBadge = document.getElementById('badge-pending-count');
      const sidebarBadge = document.getElementById('sidebar-queue-badge');
      if (countBadge) countBadge.innerText = `${pendingCount} Pending Verification`;
      if (sidebarBadge) sidebarBadge.innerText = pendingCount;
    },

    appendAuditRow: function (id, decisionText, badgeClass, cat, scene, feedback) {
      const tbody = document.getElementById('audit-trail-tbody');
      if (!tbody) return;

      const now = new Date();
      const timeStr = `${now.toLocaleDateString()} ${now.toLocaleTimeString()} UTC`;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><code>${id}</code></td>
        <td>${timeStr}</td>
        <td>Admin Officer (SDMA)</td>
        <td><span class="badge-status ${badgeClass}">${decisionText}</span></td>
        <td>${cat}</td>
        <td><code>${scene.substring(0, 24)}...</code></td>
        <td><strong style="color:${badgeClass === 'success' ? 'var(--brand-primary)' : (badgeClass === 'danger' ? '#ef4444' : '#f59e0b')}">${feedback}</strong></td>
      `;
      tbody.insertBefore(tr, tbody.firstChild);
    },

    clearAuditLog: function () {
      this.playUiClick();
      const tbody = document.getElementById('audit-trail-tbody');
      if (tbody) tbody.innerHTML = '';
      this.showToast('Demo audit log cleared.');
    },

    exportAuditTrail: function () {
      this.playSuccessChime();
      this.showToast('Exporting cryptographic audit log (JSON-LD Provenance)...');
    },

    // -------------------------------------------------------------------------
    // 2.2.6 & 2.3 Incremental Archive Ingestion & Evaluation Hub
    // -------------------------------------------------------------------------
    initIngestionHub: function () {
      // Prepared for interactive calls
    },

    simulateIncrementalIngestion: function (sceneName) {
      this.playUiClick();
      this.showToast(`Ingesting incoming pass: ${sceneName}...`);

      const p1 = document.getElementById('pip-step-1');
      const p2 = document.getElementById('pip-step-2');
      const p3 = document.getElementById('pip-step-3');
      const p4 = document.getElementById('pip-step-4');
      const term = document.getElementById('ingest-terminal-output');

      [p1, p2, p3, p4].forEach(p => { if (p) { p.classList.remove('complete'); p.classList.remove('active'); } });

      if (p1) p1.classList.add('active');
      if (term) term.innerHTML += `<br>[INGEST] Ingesting Cloud Optimized GeoTIFF: ${sceneName}...`;

      setTimeout(() => {
        if (p1) { p1.classList.remove('active'); p1.classList.add('complete'); }
        if (p2) p2.classList.add('active');
        if (term) term.innerHTML += `<br>[QUALITY] Applying Fmask 4.4 and Co-registration sub-pixel alignment...`;
      }, 500);

      setTimeout(() => {
        if (p2) { p2.classList.remove('active'); p2.classList.add('complete'); }
        if (p3) p3.classList.add('active');
        if (term) term.innerHTML += `<br>[EMBEDDING] Local EarthSemantic-ViT ONNX generating 512-D vectors for 144 new tiles...`;
      }, 1000);

      setTimeout(() => {
        if (p3) { p3.classList.remove('active'); p3.classList.add('complete'); }
        if (p4) p4.classList.add('active');
        if (term) term.innerHTML += `<br>[FAISS] Appending 144 vectors to HNSW graph index. Index rebuild skipped (0ms downtime).`;
      }, 1500);

      setTimeout(() => {
        if (p4) { p4.classList.remove('active'); p4.classList.add('complete'); }
        AppState.indexedTilesCount += 144;
        const countEl = document.getElementById('telemetry-total-tiles');
        const searchCountEl = document.getElementById('search-tiles-stat');
        const evalModalTiles = document.getElementById('eval-modal-tiles-val');

        if (countEl) countEl.innerText = `${AppState.indexedTilesCount.toLocaleString()} Tiles`;
        if (searchCountEl) searchCountEl.innerText = `${AppState.indexedTilesCount.toLocaleString()} Tiles`;
        if (evalModalTiles) evalModalTiles.innerText = `${AppState.indexedTilesCount.toLocaleString()} Tiles`;

        if (term) {
          term.innerHTML += `<br><span style="color:#34d399;">[SUCCESS] Incremental update complete. Total indexed archive: ${AppState.indexedTilesCount} tiles. Air-gapped compliance: 100%.</span>`;
          term.scrollTop = term.scrollHeight;
        }

        this.playSuccessChime();
        this.showToast(`✅ Successfully indexed +144 tiles from ${sceneName} without rebuilding index!`);
      }, 2000);
    },

    showEvaluationModal: function () {
      this.playUiClick();
      const modal = document.getElementById('modal-eval-report');
      if (modal) modal.classList.add('open');
    },

    closeEvaluationModal: function () {
      this.playUiClick();
      const modal = document.getElementById('modal-eval-report');
      if (modal) modal.classList.remove('open');
    }
  };

  window.EarthApp = EarthApp;

  document.addEventListener('DOMContentLoaded', () => EarthApp.init());
})();
