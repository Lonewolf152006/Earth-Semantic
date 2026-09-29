/**
 * Earth-Semantic — Application Logic & Controller
 * Matches Screens 1-12 of Earth Semantic Design Documentation
 */

(function () {
  'use strict';

  const AppState = {
    currentView: 'dashboard',
    currentStep: 1,
    isLoggedIn: false,
    isDarkMode: false,
    isTourRunning: false,
    cases: [
      { id: '#1024', title: 'Uttarakhand Rainfall', type: 'Flash Flood', state: 'Uttarakhand', status: 'completed', priority: 'high', date: '21/09/2026' },
      { id: '#1023', title: 'Sikkim Landslide', type: 'Landslide', state: 'Sikkim', status: 'processing', priority: 'med', date: '20/09/2026' },
      { id: '#1022', title: 'Assam Flood', type: 'Flood', state: 'Assam', status: 'completed', priority: 'high', date: '20/09/2026' },
      { id: '#1021', title: 'Cyclone Tracking', type: 'Cyclone', state: 'Odisha', status: 'completed', priority: 'high', date: '19/09/2026' },
      { id: '#1020', title: 'Himachal Assessment', type: 'Flash Flood', state: 'Himachal', status: 'completed', priority: 'low', date: '18/09/2026' }
    ]
  };

  const EarthApp = {
    init: function () {
      this.bindEvents();
      this.initIndiaMap();
      this.renderCharts();
      
      // Check query param for immediate demo or tour mode
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
    // View Routing
    // -------------------------------------------------------------------------
    navigateTo: function (viewId) {
      if (AppState.currentView === viewId) return;

      // Update Nav active state
      document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => {
        if (nav.getAttribute('data-view') === viewId) {
          nav.classList.add('active');
        } else {
          nav.classList.remove('active');
        }
      });

      // Hide all view sections
      document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
      });

      // Show target view
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
      const email = document.getElementById('login-email').value;
      this.showToast(`Authenticated as ${email}`);
      const loginView = document.getElementById('view-login');
      loginView.classList.add('hidden');
      AppState.isLoggedIn = true;
      this.navigateTo('dashboard');
    },

    loginDemo: function () {
      this.showToast('Demo Mode Activated — Welcome, Chief Disaster Officer');
      const loginView = document.getElementById('view-login');
      loginView.classList.add('hidden');
      AppState.isLoggedIn = true;
      this.navigateTo('dashboard');
    },

    logout: function () {
      const loginView = document.getElementById('view-login');
      loginView.classList.remove('hidden');
      AppState.isLoggedIn = false;
      this.showToast('Logged out of session');
    },

    // -------------------------------------------------------------------------
    // Screen 3 to 8: Stepper Workflow (New Assessment)
    // -------------------------------------------------------------------------
    startNewAssessment: function () {
      this.navigateTo('new-assessment');
      this.goToStep(1);
    },

    resetAssessmentForm: function () {
      document.getElementById('assess-title').value = 'Uttarakhand Rainfall Risk Assessment';
      document.getElementById('assess-disaster-type').value = 'Flash Flood';
      document.getElementById('assess-state').value = 'Uttarakhand';
      document.getElementById('assess-district').value = 'Chamoli';
      document.getElementById('assess-desc').value = 'Heavy rainfall reported in the region. Need risk analysis for potential flash floods.';
      this.goToStep(1);
      this.showToast('Assessment form reset to baseline defaults');
    },

    goToStep: function (stepNum) {
      if (stepNum < 1 || stepNum > 6) return;
      AppState.currentStep = stepNum;

      // Update Stepper Line Fill
      const lineFill = document.getElementById('stepper-line-fill');
      const percentage = Math.min(((stepNum - 1) / 4) * 100, 100);
      if (lineFill) {
        lineFill.style.width = `${percentage}%`;
      }

      // Update Step Nodes
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

      // Show Correct Panel
      document.querySelectorAll('.stepper-panel').forEach(panel => {
        panel.classList.remove('active');
      });

      const currentPanel = document.getElementById(`step-panel-${stepNum}`);
      if (currentPanel) {
        currentPanel.classList.add('active');
      }
    },

    switchInputTab: function (btn, tabName) {
      document.querySelectorAll('.data-input-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.showToast(`Switched input mode to: ${tabName.toUpperCase()}`);
    },

    simulateFileUpload: function () {
      this.showToast('Selected file "sentinel_insar_alos2.tif" (6.4 MB) uploaded & validated');
    },

    startProcessing: function () {
      this.goToStep(4);
      
      const gaugeCircle = document.getElementById('gauge-circle-progress');
      const gaugeText = document.getElementById('gauge-percentage-text');
      const gaugeStatus = document.getElementById('gauge-status-label');
      const btnViewResult = document.getElementById('btn-view-result');

      let progress = 0;
      gaugeText.innerText = '0%';
      gaugeStatus.innerText = 'Initializing Multimodal Pipeline...';
      if (btnViewResult) btnViewResult.style.display = 'none';

      // Reset pipeline indicators
      for (let i = 1; i <= 5; i++) {
        const item = document.getElementById(`pipe-step-${i}`);
        if (item) {
          item.className = 'pipeline-step-item';
        }
      }

      const interval = setInterval(() => {
        progress += 10;
        if (progress > 100) progress = 100;

        // Gauge offset: 440 circumference -> offset = 440 - (440 * progress / 100)
        const offset = 440 - (440 * progress / 100);
        if (gaugeCircle) gaugeCircle.style.strokeDashoffset = offset;
        if (gaugeText) gaugeText.innerText = `${progress}%`;

        // Update pipeline steps dynamically
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
          if (gaugeStatus) gaugeStatus.innerText = 'Rule-based Disaster Threshold Validation...';
        }
        if (progress >= 100) {
          clearInterval(interval);
          const s5 = document.getElementById('pipe-step-5');
          if (s5) s5.className = 'pipeline-step-item done';
          if (gaugeStatus) {
            gaugeStatus.innerText = 'Analysis Complete! Risk: HIGH';
            gaugeStatus.style.color = 'var(--risk-high)';
          }
          if (btnViewResult) {
            btnViewResult.style.display = 'inline-flex';
          }
          EarthApp.showToast('AI assessment finished: High Risk detected (Confidence: 87%)');
          
          // Auto-advance to Result after 1 second if on tour or quick mode
          setTimeout(() => {
            EarthApp.goToStep(5);
          }, 1200);
        }
      }, 250);
    },

    saveAndGenerateReport: function () {
      this.showToast('Assessment saved to case database. Generating official report...');
      setTimeout(() => {
        this.navigateTo('reports');
      }, 700);
    },

    openDetailedModal: function () {
      const modal = document.getElementById('modal-detailed-analysis');
      if (modal) modal.style.display = 'flex';
    },

    closeDetailedModal: function () {
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

    // -------------------------------------------------------------------------
    // Screen 9: Case Management
    // -------------------------------------------------------------------------
    loadCase: function (caseId) {
      this.showToast(`Loading assessment record for ${caseId}...`);
      if (caseId === '#1024') {
        this.navigateTo('new-assessment');
        this.goToStep(5); // Show results directly
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
      const s = document.getElementById('case-search-input'); if (s) s.value = '';
      const st = document.getElementById('case-filter-status'); if (st) st.value = 'all';
      const ty = document.getElementById('case-filter-type'); if (ty) ty.value = 'all';
      const sta = document.getElementById('case-filter-state'); if (sta) sta.value = 'all';
      this.filterCases();
      this.showToast('Filters cleared');
    },

    handleGlobalSearch: function (query) {
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
      const w = canvas.width;
      const h = canvas.height;

      // Handle Retina displays
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

        // Y Labels
        ctx.fillStyle = AppState.isDarkMode ? '#94a3b8' : '#94a3b8';
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

        // Points
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

      // Center Text
      ctx.fillStyle = AppState.isDarkMode ? '#ffffff' : '#0f172a';
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('128', cx, cy - 2);

      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText('Total Cases', cx, cy + 16);

      // Legend on right
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
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
      this.showToast('Secure report link copied to clipboard (ES-2026-09-1024)');
    },

    toggleDarkMode: function () {
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
    // Walks through all 12 screens smoothly so anyone recording a video gets a perfect demo!
    // -------------------------------------------------------------------------
    runGuidedDemoTour: function () {
      if (AppState.isTourRunning) return;
      AppState.isTourRunning = true;
      this.showToast('🎬 Starting Automated Platform Walkthrough for Video Demo...');

      const steps = [
        // 1. Dashboard
        () => {
          this.navigateTo('dashboard');
          this.showToast('Step 1: Operational Dashboard & India Live Risk Overview');
        },
        // 2. Hover state on Uttarakhand
        () => {
          const mapEl = document.querySelector('.state-path.risk-high');
          if (mapEl) {
            mapEl.dispatchEvent(new MouseEvent('mousemove', { clientX: 450, clientY: 260 }));
          }
        },
        // 3. Start New Assessment
        () => {
          this.startNewAssessment();
          this.showToast('Step 2: Starting New Assessment for Uttarakhand');
        },
        // 4. Move to Step 2 (Data & Input)
        () => {
          this.goToStep(2);
          this.showToast('Step 3: Multi-modal Data Ingestion (GeoTIFF, CSV, Radar)');
        },
        // 5. Move to Step 3 (Verification)
        () => {
          this.goToStep(3);
          this.showToast('Step 4: Automated Pre-flight Data Verification');
        },
        // 6. Processing
        () => {
          this.startProcessing();
          this.showToast('Step 5: Multimodal Deep Learning & Feature Extraction Pipeline');
        },
        // 7. Results (will be auto-shown by startProcessing or jump directly)
        () => {
          this.goToStep(5);
          this.showToast('Step 6: AI Inundation Model Results & Heatmap');
        },
        // 8. Recommendations
        () => {
          this.goToStep(6);
          this.showToast('Step 7: Actionable Decision Directives & Agency Tasking');
        },
        // 9. Generate Report
        () => {
          this.navigateTo('reports');
          this.showToast('Step 8: Official Disaster Intelligence Report Preview');
        },
        // 10. Cases Management
        () => {
          this.navigateTo('cases');
          this.showToast('Step 9: Real-time Multi-Case Tracking & Historical Archive');
        },
        // 11. Analytics
        () => {
          this.navigateTo('analytics');
          this.showToast('Step 10: Macro Risk Trends & Disaster Distribution Analytics');
        },
        // 12. Alerts
        () => {
          this.navigateTo('alerts');
          this.showToast('Step 11: Real-time Incident Alerts Stream');
        },
        // 13. Back to Dashboard
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
          setTimeout(nextTourStep, 3200);
        }
      }

      nextTourStep();
    }
  };

  window.EarthApp = EarthApp;
  document.addEventListener('DOMContentLoaded', () => EarthApp.init());
})();
