// ================================================================
// Application State
// ================================================================
const appState = {
    currentScreen: 'home',
    analysisData: null,
    refinedData: null,
    selectedTickers: new Set(),
    portfolioData: null,
    formData: {
        start_date: '',
        initial_capital: 10000
    }
};

// ================================================================
// API Configuration
// ================================================================
// Auto-detect if we're in development (localhost) or production
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// In development, use local proxy. In production, use Netlify Function proxy
const API_BASE = isDevelopment
    ? 'http://localhost:3001'
    : '/api'; // This maps to the Netlify Function via netlify.toml

const API_ENDPOINTS = {
    analyze: `${API_BASE}/analyze`,
    refine: `${API_BASE}/refine`,
    follow: `${API_BASE}/follow`
};

// ================================================================
// API Service
// ================================================================
const API = {
    async analyze() {
        try {
            const response = await fetch(API_ENDPOINTS.analyze);
            if (!response.ok) throw new Error('Error al analizar');
            return await response.json();
        } catch (error) {
            console.error('API Error (analyze):', error);
            throw error;
        }
    },

    async refine() {
        try {
            const response = await fetch(API_ENDPOINTS.refine);
            if (!response.ok) throw new Error('Error al refinar');
            return await response.json();
        } catch (error) {
            console.error('API Error (refine):', error);
            throw error;
        }
    },

    async follow(tickers, startDate, initialCapital) {
        try {
            const response = await fetch(API_ENDPOINTS.follow, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tickers,
                    start_date: startDate,
                    initial_capital: initialCapital
                })
            });
            if (!response.ok) throw new Error('Error en el análisis de portafolio');
            return await response.json();
        } catch (error) {
            console.error('API Error (follow):', error);
            throw error;
        }
    }
};

// ================================================================
// Circular Progress Loader
// ================================================================
let progressInterval = null;
let currentProgress = 0;

function startCircularProgress() {
    const progressElement = document.getElementById('progressPercent');
    const circle = document.querySelector('.progress-ring-progress');
    const radius = 90;
    const circumference = 2 * Math.PI * radius;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;

    currentProgress = 0;
    progressElement.textContent = '0%';

    // Simulate progress
    progressInterval = setInterval(() => {
        if (currentProgress < 95) {
            currentProgress += Math.random() * 15;
            if (currentProgress > 95) currentProgress = 95;

            const offset = circumference - (currentProgress / 100) * circumference;
            circle.style.strokeDashoffset = offset;
            progressElement.textContent = `${Math.round(currentProgress)}%`;

            // Update progress steps
            updateProgressSteps(currentProgress);
        }
    }, 500);
}

function completeProgress() {
    if (progressInterval) {
        clearInterval(progressInterval);
    }

    const circle = document.querySelector('.progress-ring-progress');
    const radius = 90;
    const circumference = 2 * Math.PI * radius;

    circle.style.strokeDashoffset = 0;
    document.getElementById('progressPercent').textContent = '100%';

    // Mark all steps as completed
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.add('completed');
        step.classList.remove('active');
    });
}

function updateProgressSteps(progress) {
    const steps = document.querySelectorAll('.progress-step');

    if (progress > 25) {
        steps[0]?.classList.add('completed');
        steps[0]?.classList.remove('active');
    }
    if (progress > 50) {
        steps[1]?.classList.add('completed');
        steps[1]?.classList.remove('active');
    }
    if (progress > 75) {
        steps[2]?.classList.add('completed');
        steps[2]?.classList.remove('active');
    }

    // Set active step
    if (progress <= 25) {
        steps[0]?.classList.add('active');
    } else if (progress <= 50) {
        steps[1]?.classList.add('active');
    } else if (progress <= 75) {
        steps[2]?.classList.add('active');
    } else {
        steps[3]?.classList.add('active');
    }
}

// ================================================================
// Screen Navigation
// ================================================================
function navigateToScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        appState.currentScreen = screenId;
    }
}

// ================================================================
// Utility Functions
// ================================================================
function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined) return '-';
    return Number(num).toFixed(decimals);
}

function formatPercent(num, decimals = 2) {
    if (num === null || num === undefined) return '-';
    const value = formatNumber(num * 100, decimals);
    return num >= 0 ? `+${value}%` : `${value}%`;
}

function formatCurrency(num, decimals = 2) {
    if (num === null || num === undefined) return '-';
    return `$${formatNumber(num, decimals)}`;
}

function formatLargeNumber(num) {
    if (num === null || num === undefined) return '-';
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
}

function getTickerInitial(ticker) {
    return ticker ? ticker.charAt(0).toUpperCase() : 'A';
}

// ================================================================
// Home Screen Handlers
// ================================================================
function initHomeScreen() {
    const startBtn = document.getElementById('startBtn');
    startBtn.addEventListener('click', async () => {
        navigateToScreen('loaderScreen');
        startCircularProgress();

        try {
            const data = await API.analyze();
            completeProgress();
            appState.analysisData = data;

            setTimeout(() => {
                renderResultsStage1(data);
                navigateToScreen('resultsScreen1');
            }, 500);
        } catch (error) {
            alert('Error al realizar el análisis. Por favor, intenta nuevamente.');
            navigateToScreen('homeScreen');
        }
    });
}

// ================================================================
// Results Stage 1 - Initial Analysis (Card Format)
// ================================================================
function renderResultsStage1(data) {
    // Update stats
    document.getElementById('totalAnalyzed').textContent = data.total_analyzed || '-';
    document.getElementById('candidatesCount').textContent = data.candidates_count || '-';

    // Render cards
    const container = document.getElementById('resultsGrid');
    container.innerHTML = '';

    if (data.results && Array.isArray(data.results)) {
        data.results.forEach(stock => {
            const card = createStockCard(stock);
            container.appendChild(card);
        });
    }
}

function createStockCard(stock) {
    const card = document.createElement('div');
    card.className = 'stock-card';

    const roicClass = (stock.ROIC || 0) >= 0 ? 'color: var(--primary);' : 'color: #ef4444;';
    const mosClass = (stock.MOS || 0) >= 0 ? 'color: var(--primary);' : 'color: #ef4444;';
    const initial = getTickerInitial(stock.Ticker);

    card.innerHTML = `
        <div class="card-header">
            <div class="ticker-info">
                <div class="ticker-symbol">
                    <div class="ticker-badge-small">${initial}</div>
                    ${stock.Ticker}
                </div>
                <div class="sector-pill">${stock.Sector || 'N/A'}</div>
            </div>
            <div class="price-info">
                <span class="price-current">${formatCurrency(stock.Price)}</span>
                <!-- Assuming formatted percentage logic if available, or just empty for now -->
            </div>
        </div>
        
        <div class="card-metrics">
            <div class="metric-item">
                <span class="metric-title">ROIC</span>
                <span class="metric-value" style="${roicClass}">${formatPercent(stock.ROIC, 1)}</span>
            </div>
            <div class="metric-item">
                <span class="metric-title">Piotroski</span>
                <span class="metric-value highlight">${stock.Piotroski}/9</span>
            </div>
            <div class="metric-item">
                <span class="metric-title">Growth</span>
                <span class="metric-value">${formatPercent(stock.Growth_Est, 1)}</span>
            </div>
            <div class="metric-item">
                <span class="metric-title">MOS</span>
                <span class="metric-value" style="${mosClass}">${formatPercent(stock.MOS, 1)}</span>
            </div>
        </div>

        <div class="card-footer">
            <div style="text-align: left;">
                <span class="intrinsic-label">Intrinsic Val</span>
                <span class="intrinsic-value">${formatLargeNumber(stock.Intrinsic)}</span>
            </div>
            <div class="valuation-status">
                <span class="valuation-label">Valuation</span>
                <span class="valuation-tag">${(stock.MOS || 0) > 0 ? 'UNDERVALUED' : 'OVERVALUED'}</span>
            </div>
        </div>
    `;

    return card;
}

function initResultsScreen1() {
    const refineBtn = document.getElementById('refineBtn');
    refineBtn.addEventListener('click', async () => {
        navigateToScreen('loaderScreen');
        startCircularProgress();

        try {
            const data = await API.refine();
            completeProgress();
            appState.refinedData = data;

            setTimeout(() => {
                renderResultsStage2(data);
                navigateToScreen('resultsScreen2');
            }, 500);
        } catch (error) {
            alert('Error al refinar el análisis. Por favor, intenta nuevamente.');
            navigateToScreen('resultsScreen1');
        }
    });
}

// ================================================================
// Results Stage 2 - Refined Analysis (Category Cards)
// ================================================================
function renderResultsStage2(data) {
    const container = document.getElementById('categoriesContainer');
    container.innerHTML = '';

    if (!data.refined_data || !data.refined_data.refined_results) return;

    // Group results by category
    const groupedByCategory = {};
    data.refined_data.refined_results.forEach(item => {
        const cat = item.Cat || 'Sin categoría';
        if (!groupedByCategory[cat]) {
            groupedByCategory[cat] = [];
        }
        groupedByCategory[cat].push(item);
    });

    // Category configuration
    const categoryConfig = {
        '✅ Oportunidad': { title: 'Oportunidades', icon: '✅', badge: 'Top Pick', priority: 1 },
        '💎 Gema': { title: 'Gemas Escondidas', icon: '💎', badge: 'Hidden Gems', priority: 2 },
        '⚖️ Precio Justo': { title: 'Precio Justo', icon: '⚖️', badge: 'Fair Value', priority: 3 },
        '🏦 Banco/Seguro': { title: 'Bancos / Seguros', icon: '🏦', badge: 'Financials', priority: 4 },
        '⚠️ Trampa Valor?': { title: 'Posibles Trampas de Valor', icon: '⚠️', badge: 'Caution', priority: 5 },
        '⚠️ Trampa Valor': { title: 'Trampas de Valor', icon: '⚠️', badge: 'Warning', priority: 6 },
        '❌ Cara/Ajustada': { title: 'Sobrevaloradas', icon: '❌', badge: 'Overpriced', priority: 7 }
    };

    // Sort categories
    const sortedCategories = Object.keys(groupedByCategory).sort((a, b) => {
        const priorityA = categoryConfig[a]?.priority || 999;
        const priorityB = categoryConfig[b]?.priority || 999;
        return priorityA - priorityB;
    });

    // Create sections
    sortedCategories.forEach(catKey => {
        const items = groupedByCategory[catKey];
        const config = categoryConfig[catKey] || { title: catKey, icon: '📊', badge: catKey, priority: 999 };

        const categoryData = {
            key: catKey,
            title: config.title,
            icon: config.icon,
            badge: `${items.length} acciones`,
            count: items.length
        };

        const section = createCategorySection(categoryData, items);
        container.appendChild(section);
    });

    // Show summary stats
    if (data.refined_data.summary) {
        console.log('Summary:', data.refined_data.summary);
    }
}

function createCategorySection(category, items) {
    const section = document.createElement('div');
    section.className = 'category-section';
    section.style.marginBottom = '40px';

    section.innerHTML = `
        <div class="category-header">
            <span class="category-icon">${category.icon}</span>
            <h2 class="category-title">${category.title}</h2>
            <span class="category-badge">${category.badge}</span>
        </div>
        <div class="cards-grid">
            <!-- Cards injected here -->
        </div>
    `;

    const grid = section.querySelector('.cards-grid');
    items.forEach(item => {
        const card = createRefinedStockCard(item);
        grid.appendChild(card);
    });

    return section;
}

function createRefinedStockCard(item) {
    const card = document.createElement('div');
    card.className = 'stock-card';
    card.dataset.ticker = item.Ticker;

    const roicClass = (item.ROIC || 0) >= 0 ? 'color: var(--primary);' : 'color: #ef4444;';
    const mosClass = (item.Real_MOS || item.Old_MOS || 0) >= 0 ? 'color: var(--primary);' : 'color: #ef4444;';
    const isSelected = appState.selectedTickers.has(item.Ticker);
    const initial = getTickerInitial(item.Ticker);

    card.innerHTML = `
         <div class="card-action">
            <button class="select-card-btn ${isSelected ? 'selected' : ''}" data-ticker="${item.Ticker}">
                ${isSelected ? '✓' : ''}
            </button>
        </div>

        <div class="card-header">
            <div class="ticker-info">
                <div class="ticker-symbol">
                    <div class="ticker-badge-small">${initial}</div>
                    ${item.Ticker}
                </div>
                <div class="sector-pill">${item.Sector || '-'}</div>
            </div>
             <!-- In refined data, we might not have price readily available in the same format depending on the refined object, checking data structure -->
             <!-- Assuming similar structure or omitting price if missing -->
        </div>
        
        <div class="card-metrics">
            <div class="metric-item">
                <span class="metric-title">ROIC</span>
                <span class="metric-value" style="${roicClass}">${formatPercent(item.ROIC, 1)}</span>
            </div>
            <div class="metric-item">
                <span class="metric-title">Piotroski</span>
                <span class="metric-value highlight">${item.Piotroski || '-'}/9</span>
            </div>
            <div class="metric-item">
                <span class="metric-title">Old MOS</span>
                <span class="metric-value">${formatPercent(item.Old_MOS, 1)}</span>
            </div>
            <div class="metric-item">
                <span class="metric-title">Real MOS</span>
                <span class="metric-value" style="${mosClass}">${formatPercent(item.Real_MOS, 1)}</span>
            </div>
        </div>

        <div class="card-reason">
            ${item.Why || 'Sin notas adicionales.'}
        </div>
    `;

    // Add click handler to the whole card or just the button
    const selectBtn = card.querySelector('.select-card-btn');
    // Also allow clicking the card itself to select, but prevent double triggering if clicking button
    card.addEventListener('click', (e) => {
        // If we clicked the button directly, the button handler will fire. 
        // If we clicked the card (but not the button), we can also trigger toggle.
        // Let's keep it simple: Click the button to toggle.
    });

    selectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTickerSelection(item.Ticker, selectBtn);
    });

    return card;
}

// Remove old button styles logic since we moved it to CSS file
// But we need to update toggleTickerSelection to work with the new button logic/styles
function toggleTickerSelection(ticker, buttonElement) {
    if (appState.selectedTickers.has(ticker)) {
        appState.selectedTickers.delete(ticker);
        buttonElement.classList.remove('selected');
        buttonElement.textContent = '';
    } else {
        appState.selectedTickers.add(ticker);
        buttonElement.classList.add('selected');
        buttonElement.textContent = '✓';
    }

    updateSelectionCart();
}

function updateSelectionCart() {
    const cart = document.getElementById('selectionCart');
    const count = document.getElementById('selectedCount');
    const list = document.getElementById('selectedTickersList');

    count.textContent = appState.selectedTickers.size;

    if (appState.selectedTickers.size > 0) {
        cart.style.display = 'block';

        list.innerHTML = '';
        appState.selectedTickers.forEach(ticker => {
            const chip = createTickerChip(ticker);
            list.appendChild(chip);
        });
    } else {
        cart.style.display = 'none';
    }
}

function createTickerChip(ticker) {
    const chip = document.createElement('div');
    chip.className = 'selected-ticker-chip';
    chip.innerHTML = `
        <span>${ticker}</span>
        <button class="remove-ticker" data-ticker="${ticker}">×</button>
    `;

    const removeBtn = chip.querySelector('.remove-ticker');
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeTickerFromSelection(ticker);
    });

    return chip;
}

function removeTickerFromSelection(ticker) {
    appState.selectedTickers.delete(ticker);

    // Update button visual state
    const button = document.querySelector(`[data-ticker="${ticker}"].select-ticker-btn`);
    if (button) {
        button.classList.remove('selected');
        button.textContent = '+';
    }

    updateSelectionCart();
}

function initResultsScreen2() {
    const form = document.getElementById('followForm');
    const clearBtn = document.getElementById('clearSelection');

    clearBtn.addEventListener('click', () => {
        appState.selectedTickers.clear();
        document.querySelectorAll('.select-ticker-btn').forEach(btn => {
            btn.classList.remove('selected');
            btn.textContent = '+';
        });
        updateSelectionCart();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (appState.selectedTickers.size === 0) {
            alert('Por favor selecciona al menos un ticker');
            return;
        }

        const startDate = document.getElementById('startDate').value;
        const initialCapital = parseFloat(document.getElementById('initialCapital').value);

        navigateToScreen('loaderScreen');
        startCircularProgress();

        try {
            const tickers = Array.from(appState.selectedTickers);
            const data = await API.follow(tickers, startDate, initialCapital);
            completeProgress();
            appState.portfolioData = data;

            setTimeout(() => {
                renderResultsStage3(data);
                navigateToScreen('resultsScreen3');
            }, 500);
        } catch (error) {
            alert('Error al analizar el portafolio. Por favor, intenta nuevamente.');
            navigateToScreen('resultsScreen2');
        }
    });
}

// ================================================================
// Results Stage 3 - Portfolio Analysis
// ================================================================
function renderResultsStage3(data) {
    if (!data.analysis) return;

    const metrics = data.analysis.portfolio_metrics;

    // Update portfolio metrics
    document.getElementById('cagr').textContent = formatPercent(metrics.cagr_pct / 100);
    document.getElementById('volatility').textContent = formatPercent(metrics.volatilidad_anual_pct / 100);
    document.getElementById('daysInvested').textContent = metrics.dias_invertidos || '-';
    document.getElementById('currentDate').textContent = metrics.fecha_actual || '-';
    document.getElementById('startDateDisplay').textContent = data.start_date || '-';
    document.getElementById('maxDrawdown').textContent = formatPercent(metrics.max_drawdown_pct / 100);
    document.getElementById('totalReturn').textContent = formatPercent(metrics.retorno_total_pct / 100);
    document.getElementById('sharpeRatio').textContent = formatNumber(metrics.sharpe_ratio);
    document.getElementById('initialCapitalDisplay').textContent = formatCurrency(metrics.valor_inicial);
    document.getElementById('currentValue').textContent = formatCurrency(metrics.valor_actual);

    // Render ticker analysis cards
    const container = document.getElementById('portfolioGrid');
    container.innerHTML = '';

    if (data.analysis.ticker_analysis && data.analysis.ticker_analysis.detalle_por_accion) {
        data.analysis.ticker_analysis.detalle_por_accion.forEach(ticker => {
            const card = createPortfolioCard(ticker);
            container.appendChild(card);
        });
    }
}

function createPortfolioCard(ticker) {
    const card = document.createElement('div');
    card.className = 'stock-card';

    const contributionClass = (ticker.contribucion_retorno_pct || 0) >= 0 ? 'color: var(--primary);' : 'color: #ef4444;';
    const returnClass = (ticker.retorno_pct || 0) >= 0 ? 'color: var(--primary);' : 'color: #ef4444;';
    const initial = getTickerInitial(ticker.ticker);

    card.innerHTML = `
        <div class="card-header">
            <div class="ticker-info">
                <div class="ticker-symbol">
                    <div class="ticker-badge-small">${initial}</div>
                    ${ticker.ticker || '-'}
                </div>
            </div>
            <div class="price-info">
                <span class="price-current">${formatCurrency(ticker.valor_actual)}</span>
                <span style="font-size: 0.75rem; color: var(--text-secondary); display: block;">Valor Actual</span>
            </div>
        </div>
        
        <div class="card-metrics">
            <div class="metric-item">
                <span class="metric-title">Retorno</span>
                <span class="metric-value" style="${returnClass}">${formatPercent(ticker.retorno_pct / 100)}</span>
            </div>
             <div class="metric-item">
                <span class="metric-title">Contribución</span>
                <span class="metric-value" style="${contributionClass}">${formatPercent(ticker.contribucion_retorno_pct / 100)}</span>
            </div>
            <div class="metric-item">
                <span class="metric-title">Ganancia/Pérdida</span>
                <span class="metric-value" style="${contributionClass}">${formatCurrency(ticker.ganancia_perdida)}</span>
            </div>
            <div class="metric-item">
                <span class="metric-title">Peso</span>
                <span class="metric-value">${formatPercent(ticker.peso_portfolio / 100, 1)}</span>
            </div>
        </div>

        <div class="card-footer" style="padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
            <div class="metric-item" style="align-items: flex-start;">
                <span class="metric-title">Capital Inicial</span>
                <span class="metric-value" style="font-size: 0.9rem;">${formatCurrency(ticker.capital_inicial)}</span>
            </div>
             <div class="metric-item" style="align-items: flex-end;">
                <span class="metric-title">Volatilidad</span>
                <span class="metric-value" style="font-size: 0.9rem;">${formatPercent(ticker.volatilidad_anual_pct / 100)}</span>
            </div>
        </div>
    `;

    return card;
}

function initResultsScreen3() {
    const startOverBtn = document.getElementById('startOverBtn');
    startOverBtn.addEventListener('click', () => {
        // Reset state
        appState.analysisData = null;
        appState.refinedData = null;
        appState.selectedTickers.clear();
        appState.portfolioData = null;

        navigateToScreen('homeScreen');
    });
}

// ================================================================
// Initialization
// ================================================================
function init() {
    initHomeScreen();
    initResultsScreen1();
    initResultsScreen2();
    initResultsScreen3();

    // Set default date to 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const defaultDate = sixMonthsAgo.toISOString().split('T')[0];
    document.getElementById('startDate').value = defaultDate;
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
