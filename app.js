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
        start_date: '01/01/2026',
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
// Metric Information Data
// ================================================================
const METRIC_INFO = {
    'Piotroski': 'Salud financiera (0-9). >7 es excelente, <4 es débil.',
    'MOS': 'Margen de Seguridad: Descuento del precio vs valor real estimado.',
    'ROIC': 'Retorno sobre Capital: Qué tan bien genera ganancias el negocio.',
    'OLD_MOS': 'MOS Histórico para comparar la evolución de la oportunidad.',
    'Growth_Est': 'Crecimiento anual compuesto esperado para los próximos 5 años.',
    'FCF_Yield': 'Caja libre generada relativa al valor de mercado de la empresa.',
    'Retorno': 'Rendimiento porcentual total acumulado desde la fecha inicial.',
    'Contribución': 'Impacto real de este activo en el rendimiento de tu portafolio.',
    'Peso': 'Porcentaje que representa este activo del total de tu capital.',
    'Ganancia': 'Monto total ganado o perdido en dólares con esta posición.',
    'Capital_Inicial': 'Monto invertido originalmente en este activo.',
    'Volatilidad': 'Variabilidad del precio. >30% indica riesgo elevado.'
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

        // Comprehensive scroll-to-top strategy
        const forceScroll = () => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        };

        forceScroll();
        requestAnimationFrame(forceScroll);
        setTimeout(forceScroll, 50);
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

// ================================================================
// Home Screen Handlers
// ================================================================
function initHomeScreen() {
    document.querySelectorAll('.explorer-trigger').forEach(trigger => {
        trigger.addEventListener('click', async () => {
            const market = trigger.dataset.market || 'USA';
            console.log(`Starting analysis for market: ${market}`);

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
                console.error('Analysis error:', error);
                alert('Error al realizar el análisis. Por favor, intenta nuevamente.');
                navigateToScreen('homeScreen');
            }
        });
    });
}

// ================================================================
// Results Stage 1 - Initial Analysis (Card Format)
// ================================================================
function renderResultsStage1(data) {
    // Update stats
    const candidatesEl = document.getElementById('candidatesCount');
    if (candidatesEl) candidatesEl.textContent = data.candidates_count || '-';

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
                <span class="metric-title" data-tooltip="${METRIC_INFO['ROIC']}">ROIC</span>
                <span class="metric-value" style="${roicClass}">${formatPercent(stock.ROIC, 1)}</span>
            </div>
            <div class="metric-item">
                <span class="metric-title" data-tooltip="${METRIC_INFO['Piotroski']}">Piotroski</span>
                <span class="metric-value highlight">${stock.Piotroski}/9</span>
            </div>
            <div class="metric-item">
                <span class="metric-title" data-tooltip="${METRIC_INFO['Growth_Est']}">Growth</span>
                <span class="metric-value">${formatPercent(stock.Growth_Est, 1)}</span>
            </div>
            <div class="metric-item">
                <span class="metric-title" data-tooltip="${METRIC_INFO['MOS']}">MOS</span>
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
        'Oportunidad': {
            title: 'Oportunidad',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#44b7df"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480v320q0 33-23.5 56.5T800-80H480Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 23 3 45t9 43l148-148 132 111 131-131h-63v-80h200v200h-80v-63L456-320 325-432 207-314q42 69 113.5 111.5T480-160Zm300 20q17 0 28.5-11.5T820-180q0-17-11.5-28.5T780-220q-17 0-28.5 11.5T740-180q0 17 11.5 28.5T780-140ZM455-480Z"/></svg>`,
            badge: 'Top Pick', priority: 1
        },
        '💎 JOYA': {
            title: 'Joya',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#44b7df"><path d="M480-120 80-600l120-240h560l120 240-400 480Zm-95-520h190l-60-120h-70l-60 120Zm55 347v-267H218l222 267Zm80 0 222-267H520v267Zm144-347h106l-60-120H604l60 120Zm-474 0h106l60-120H250l-60 120Z"/></svg>`,
            badge: 'Hidden Gems', priority: 2
        },
        'Precio Justo': { title: 'PRECIO JUSTO', icon: '⚖️', badge: 'Fair Value', priority: 3 },
        'Banco/Seguro': { title: 'BANCOS / SEGUROS', icon: '🏦', badge: 'Financials', priority: 4 },
        'Trampa': { title: 'POSIBLES TRAMPAS', icon: '⚠️', badge: 'Caution', priority: 5 },
        'Sobrevaloradas': { title: 'SOBREVALORADAS', icon: '❌', badge: 'Overpriced', priority: 7 }
    };

    // Sort categories
    const sortedCategories = Object.keys(groupedByCategory).sort((a, b) => {
        const findConfig = (k) => {
            const key = Object.keys(categoryConfig).find(ck => k.includes(ck)) || k;
            return categoryConfig[key];
        };
        const priorityA = findConfig(a)?.priority || 999;
        const priorityB = findConfig(b)?.priority || 999;
        return priorityA - priorityB;
    });

    // Create sections
    sortedCategories.forEach(catKey => {
        const items = groupedByCategory[catKey];
        const configKey = Object.keys(categoryConfig).find(ck => catKey.includes(ck)) || catKey;
        const config = categoryConfig[configKey] || { title: catKey, icon: '📊', badge: catKey, priority: 999 };

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
            <h2 class="category-title">${category.title} (${category.count} )</h2>
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
                <span class="metric-title" data-tooltip="${METRIC_INFO['ROIC']}">ROIC</span>
                <span class="metric-value" style="${roicClass}">${formatPercent(item.ROIC, 1)}</span>
            </div>
            <div class="metric-item">
                <span class="metric-title" data-tooltip="${METRIC_INFO['Piotroski']}">Piotroski</span>
                <span class="metric-value highlight">${item.Piotroski || '-'}/9</span>
            </div>
            <div class="metric-item">
                <span class="metric-title" data-tooltip="${METRIC_INFO['OLD_MOS']}">Old MOS</span>
                <span class="metric-value">${formatPercent(item.Old_MOS, 1)}</span>
            </div>
            <div class="metric-item">
                <span class="metric-title" data-tooltip="${METRIC_INFO['MOS']}">Real MOS</span>
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

    if (count) count.textContent = appState.selectedTickers.size;

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

    // const metrics = data.analysis.portfolio_metrics; // Metrics section removed

    console.log('Rendering Results Stage 3');

    const projectionSubtitle = document.getElementById('projectionSubtitle');
    if (projectionSubtitle && data.analysis && data.analysis.ticker_analysis && data.analysis.ticker_analysis.detalle_por_accion) {
        const capital = formatCurrency(document.getElementById('initialCapital').value || 1000);
        const tickersData = data.analysis.ticker_analysis.detalle_por_accion;
        const count = tickersData.length;
        const date = data.start_date || document.getElementById('startDate').value || '-';

        const tickerNames = tickersData.map(t => {
            // Try to find the full name from Stage 2 data in appState
            let fullName = '';
            if (appState.analysisData && appState.analysisData.detailed_results) {
                const found = appState.analysisData.detailed_results.find(item => item.Ticker === t.ticker);
                if (found) fullName = found.Company || found.Name || '';
            }
            return fullName ? `${fullName} - ${t.ticker}` : t.ticker;
        });

        let stocksText = '';
        if (count === 1) {
            stocksText = `en la acción específica (${tickerNames[0]})`;
        } else {
            const last = tickerNames.pop();
            stocksText = `en ${count} acciones específicas (${tickerNames.join(', ')} y ${last})`;
        }

        projectionSubtitle.innerHTML = `Estos son los resultados de la simulación: qué hubiera pasado de haber invertido <strong>${capital}</strong> ${stocksText} desde la fecha <strong>${date}</strong>.`;
    }

    // Update portfolio metrics


    // Render ticker analysis cards
    const container = document.getElementById('portfolioGrid');
    container.innerHTML = '';

    if (data.analysis.ticker_analysis && data.analysis.ticker_analysis.detalle_por_accion) {
        const tickers = data.analysis.ticker_analysis.detalle_por_accion;

        const positiveReturns = tickers.filter(t => (t.retorno_pct || 0) >= 0);
        const negativeReturns = tickers.filter(t => (t.retorno_pct || 0) < 0);

        // Sort by return value magnitude (descending for winners, ascending (most negative first) for losers)
        positiveReturns.sort((a, b) => (b.retorno_pct || 0) - (a.retorno_pct || 0));
        negativeReturns.sort((a, b) => (a.retorno_pct || 0) - (b.retorno_pct || 0));

        // Render Positive Section
        if (positiveReturns.length > 0) {
            const positiveHeader = document.createElement('div');
            positiveHeader.style.gridColumn = '1 / -1';
            positiveHeader.innerHTML = `<h3 style="color: var(--primary); margin: 2rem 0 1rem; border-bottom: 1px solid rgba(74, 222, 128, 0.2); padding-bottom: 0.5rem;">Estas acciones podrían ser una excelente oportunidad</h3>`;
            container.appendChild(positiveHeader);

            positiveReturns.forEach(ticker => {
                const card = createPortfolioCard(ticker);
                container.appendChild(card);
            });
        }

        // Render Negative Section
        if (negativeReturns.length > 0) {
            const negativeHeader = document.createElement('div');
            negativeHeader.style.gridColumn = '1 / -1';
            negativeHeader.innerHTML = `<h3 style="color: #ef4444; margin: 2rem 0 1rem; border-bottom: 1px solid rgba(239, 68, 68, 0.2); padding-bottom: 0.5rem;">Hay que analizarlas un poco más</h3>`;
            container.appendChild(negativeHeader);

            negativeReturns.forEach(ticker => {
                const card = createPortfolioCard(ticker);
                container.appendChild(card);
            });
        }
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
                <span class="metric-title" data-tooltip="${METRIC_INFO['Retorno']}">Retorno</span>
                <span class="metric-value" style="${returnClass}">${formatPercent(ticker.retorno_pct / 100)}</span>
            </div>
             <div class="metric-item">
                <span class="metric-title" data-tooltip="${METRIC_INFO['Contribución']}">Contribución</span>
                <span class="metric-value" style="${contributionClass}">${formatPercent(ticker.contribucion_retorno_pct / 100)}</span>
            </div>
            <div class="metric-item">
                <span class="metric-title" data-tooltip="${METRIC_INFO['Ganancia']}">Ganancia/Pérdida</span>
                <span class="metric-value" style="${contributionClass}">${formatCurrency(ticker.ganancia_perdida)}</span>
            </div>
            <div class="metric-item">
                <span class="metric-title" data-tooltip="${METRIC_INFO['Peso']}">Peso</span>
                <span class="metric-value">${formatPercent(ticker.peso_portfolio / 100, 1)}</span>
            </div>
        </div>

        <div class="card-footer" style="padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
            <div class="metric-item" style="align-items: flex-start;">
                <span class="metric-title" data-tooltip="${METRIC_INFO['Capital_Inicial']}">Capital Inicial</span>
                <span class="metric-value" style="font-size: 0.9rem;">${formatCurrency(ticker.capital_inicial)}</span>
            </div>
             <div class="metric-item" style="align-items: flex-end;">
                <span class="metric-title" data-tooltip="${METRIC_INFO['Volatilidad']}">Volatilidad</span>
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

        // Reset form inputs
        document.getElementById('startDate').value = '2026-01-01';
        document.getElementById('initialCapital').value = '10000';

        // Reset selections visual state
        document.querySelectorAll('.select-card-btn').forEach(btn => {
            btn.classList.remove('selected');
            btn.textContent = '';
        });
        updateSelectionCart();

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
    initHoverGlow();
    initGlossary();

    // Set default date to 01/01/2024 as requested
    document.getElementById('startDate').value = '2026-01-01';
}

// ================================================================
// Glossary Logic
// ================================================================
function initGlossary() {
    const openBtn = document.getElementById('openGlossaryBtn');
    const closeBtn = document.getElementById('closeGlossaryBtn');
    const modal = document.getElementById('glossaryModal');
    const backdrop = document.getElementById('glossaryBackdrop');

    const toggle = (show) => {
        modal.classList.toggle('active', show);
        backdrop.classList.toggle('active', show);
        document.body.style.overflow = show ? 'hidden' : '';
    };

    openBtn.addEventListener('click', () => toggle(true));
    closeBtn.addEventListener('click', () => toggle(false));
    backdrop.addEventListener('click', () => toggle(false));

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            toggle(false);
        }
    });
}

// ================================================================
// Interaction Effects
// ================================================================
function initHoverGlow() {
    // We use event delegation to handle all buttons, including those that might be dynamic
    document.addEventListener('mousemove', (e) => {
        const button = e.target.closest('.cta-button');
        if (button) {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            button.style.setProperty('--glow-x', `${x}px`);
            button.style.setProperty('--glow-y', `${y}px`);
        }
    });
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
