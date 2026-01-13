# Product Requirements Document (PRD)
## EveTrade - Screener Automático de Inversión Inteligente

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Visión del Producto](#visión-del-producto)
3. [Objetivos y Métricas de Éxito](#objetivos-y-métricas-de-éxito)
4. [Usuarios Objetivo](#usuarios-objetivo)
5. [Descripción Funcional](#descripción-funcional)
6. [Arquitectura Técnica](#arquitectura-técnica)
7. [Flujo de Usuario](#flujo-de-usuario)
8. [Especificaciones de la API](#especificaciones-de-la-api)
9. [Diseño y UX](#diseño-y-ux)
10. [Requisitos No Funcionales](#requisitos-no-funcionales)
11. [Roadmap y Fases](#roadmap-y-fases)
12. [Riesgos y Mitigación](#riesgos-y-mitigación)

---

## 📄 Resumen Ejecutivo

**EveTrade** es una aplicación web moderna de análisis de inversiones que permite a los usuarios escanear y filtrar miles de acciones y ETFs en segundos, utilizando estrategias de **Value Investing**, **Momentum** y **Análisis Fundamental**.

### Propuesta de Valor

| Aspecto | Descripción |
|---------|-------------|
| **Problema** | Los inversores individuales enfrentan dificultades para analizar el mercado completo y encontrar oportunidades de inversión subvaluadas |
| **Solución** | Plataforma automatizada que analiza +8,000 activos usando +50 métricas combinadas en milisegundos |
| **Diferenciador** | Flujo de 3 etapas (Análisis → Refinamiento → Proyección) con IA integrada |

---

## 🎯 Visión del Producto

### Declaración de Visión
> "Democratizar el análisis profesional de inversiones, proporcionando a cualquier inversor herramientas de screening institucional con una interfaz intuitiva y resultados accionables."

### Principios Guía

1. **Simplicidad**: Interfaz elegante que oculta la complejidad del análisis
2. **Velocidad**: Resultados en tiempo real (objetivo < 20ms)
3. **Precisión**: Métricas validadas por análisis fundamental sólido
4. **Acción**: Cada pantalla guía al usuario hacia una decisión clara

---

## 📊 Objetivos y Métricas de Éxito

### KPIs Primarios

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| **Tiempo de Análisis** | < 20ms | P95 latencia |
| **Activos Analizados** | 8,000+ | Por ejecución |
| **Tasa de Refinamiento** | > 60% | Usuarios que pasan a etapa 2 |
| **Proyecciones Generadas** | > 40% | Usuarios que completan el flujo |

### KPIs Secundarios

| Métrica | Objetivo |
|---------|----------|
| Tiempo promedio en sesión | > 5 minutos |
| Bounce rate | < 35% |
| Mobile usage | > 30% |
| Usuarios recurrentes (semanal) | > 25% |

---

## 👥 Usuarios Objetivo

### Persona Primaria: "El Inversor Independiente"

| Atributo | Descripción |
|----------|-------------|
| **Nombre** | Carlos R. |
| **Edad** | 35-55 años |
| **Perfil** | Profesional con ahorros para invertir |
| **Experiencia** | Intermedia en bolsa, conoce términos básicos |
| **Frustración** | "No tengo tiempo para analizar miles de acciones" |
| **Motivación** | Encontrar oportunidades subvaluadas rápidamente |
| **Comportamiento** | Revisa portafolio 2-3 veces por semana |

### Persona Secundaria: "El Trader Activo"

| Atributo | Descripción |
|----------|-------------|
| **Nombre** | María L. |
| **Edad** | 28-40 años |
| **Perfil** | Trader part-time con conocimiento técnico |
| **Experiencia** | Avanzada, entiende métricas financieras |
| **Frustración** | "Las herramientas profesionales son muy caras" |
| **Motivación** | Herramienta potente a costo accesible |
| **Comportamiento** | Busca señales diarias de trading |

---

## 🔧 Descripción Funcional

### Módulos del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    EVETRADE WEB APP                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   │
│  │   HOME      │──▶│   LOADER    │──▶│  RESULTS 1  │   │
│  │   SCREEN    │   │   SCREEN    │   │   SCREEN    │   │
│  └─────────────┘   └─────────────┘   └──────┬──────┘   │
│                                              │          │
│                    ┌─────────────────────────┘          │
│                    ▼                                    │
│            ┌─────────────┐   ┌─────────────┐           │
│            │  RESULTS 2  │──▶│  RESULTS 3  │           │
│            │   SCREEN    │   │   SCREEN    │           │
│            └─────────────┘   └─────────────┘           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### F1: Pantalla Principal (Home Screen)

**Descripción**: Landing page con información del producto y CTA principal.

#### Especificaciones

| Elemento | Detalle |
|----------|---------|
| **Título** | "EveTrade" con acento visual en "Trade" |
| **Subtítulo** | Propuesta de valor en una oración |
| **CTA Principal** | Botón "Ejecutar Script" |
| **Estadísticas** | 4 métricas clave del sistema |

#### Estadísticas Mostradas

1. **8,000+** - Activos Analizados
2. **20ms** - Tiempo de Ejecución
3. **50+** - Métricas Combinadas
4. **24/7** - Monitoreo

---

### F2: Pantalla de Carga (Loader Screen)

**Descripción**: Indicador visual de progreso durante el análisis.

#### Componentes

| Componente | Función |
|------------|---------|
| **Circular Progress** | Animación SVG con porcentaje |
| **Progress Steps** | Lista de pasos del análisis |
| **Mensaje de Estado** | Texto descriptivo de la etapa actual |

#### Estados de Progreso

1. Conectando con API de Bolsa (120ms)
2. Filtrando por volumen mínimo (850ms)
3. Aplicando análisis fundamental
4. Calculando métricas de momentum
5. Generando recomendaciones

---

### F3: Resultados - Etapa 1 (Análisis Fundamental)

**Descripción**: Muestra los candidatos que pasaron el screening inicial.

#### Datos de Salida

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `ticker` | Símbolo del activo | String |
| `price` | Precio actual | Number |
| `sector` | Sector de la empresa | String |
| `score` | Puntuación de calidad | Number (0-100) |
| `pe_ratio` | Price-to-Earnings | Number |
| `roe` | Return on Equity | Percentage |
| `upside_potential` | Potencial de subida | Percentage |
| `volume` | Volumen de operaciones | Number |

#### Formato de Visualización

- **Tarjetas (Cards)**: Grid responsive con métricas clave
- **Indicadores visuales**: Código de colores para métricas positivas/negativas
- **Acción disponible**: Botón "Refinar Búsqueda"

---

### F4: Resultados - Etapa 2 (Categorización y Selección)

**Descripción**: Candidatos refinados organizados por categorías.

#### Categorías de Análisis

| Categoría | Criterio | Icono |
|-----------|----------|-------|
| **Value Picks** | Alta calidad, precio bajo | 💎 |
| **Growth Potential** | Alto crecimiento proyectado | 🚀 |
| **Dividend Leaders** | Alto rendimiento por dividendos | 💰 |
| **Momentum Plays** | Fuerte impulso técnico | ⚡ |

#### Funcionalidades

| Feature | Descripción |
|---------|-------------|
| **Selección múltiple** | Click para agregar/quitar del carrito |
| **Carrito de selección** | Muestra tickers seleccionados |
| **Formulario de proyección** | Fecha de inicio + Capital inicial |
| **Chips removibles** | Quitar tickers del carrito |

---

### F5: Resultados - Etapa 3 (Análisis de Portafolio)

**Descripción**: Simulación del rendimiento del portafolio seleccionado.

#### Métricas del Portafolio

| Métrica | Descripción |
|---------|-------------|
| `initial_capital` | Capital inicial ingresado |
| `current_value` | Valor actual del portafolio |
| `total_return` | Retorno total (%) |
| `total_gain_loss` | Ganancia/Pérdida ($) |
| `volatility` | Volatilidad del portafolio |
| `sharpe_ratio` | Ratio riesgo/retorno |

#### Detalle por Acción (Grid de Cards)

| Campo | Descripción |
|-------|-------------|
| Ticker | Símbolo |
| Initial Capital | Inversión inicial |
| Contribution % | Porcentaje de contribución |
| Current Value | Valor actual |
| Return % | Retorno individual |
| Volatility | Volatilidad individual |

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
├─────────────────────────────────────────────────────────┤
│  HTML5 │ CSS3 (Vanilla) │ JavaScript ES6+ (Vanilla)    │
│  Google Fonts (Inter, Outfit) │ SVG Animations         │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    PROXY LAYER                          │
├─────────────────────────────────────────────────────────┤
│  Node.js HTTP Proxy │ Netlify Functions (Serverless)   │
│  CORS Handler │ Request Forwarding                      │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND API                          │
├─────────────────────────────────────────────────────────┤
│  Google Cloud Run (Europe-West1)                        │
│  https://bulletproofuniverse-*.run.app                  │
└─────────────────────────────────────────────────────────┘
```

### Estructura de Archivos

```
evetradeweb/
├── index.html              # Estructura principal
├── styles.css              # Sistema de diseño completo
├── app.js                  # Lógica de aplicación (~760 líneas)
├── proxy-server.js         # Servidor proxy local (Node.js)
├── package.json            # Dependencias Node.js
├── netlify.toml            # Configuración Netlify
├── functions/
│   └── proxy.js            # Función serverless para Netlify
├── home_background.png     # Imagen de fondo premium
├── README.md               # Documentación técnica
└── DEPLOY_PROXY.md         # Guía de deployment
```

### Estado de la Aplicación (appState)

```javascript
const appState = {
    currentScreen: 'home',      // Pantalla activa
    analysisData: null,         // Datos del análisis inicial
    refinedData: null,          // Datos refinados
    selectedTickers: new Set(), // Tickers seleccionados
    formData: {
        startDate: null,        // Fecha de inicio
        initialCapital: 10000   // Capital inicial
    },
    portfolioData: null         // Resultados del portafolio
};
```

---

## 🔌 Especificaciones de la API

### Base URL

| Entorno | URL |
|---------|-----|
| **Producción** | `https://bulletproofuniverse-281506149568.europe-west1.run.app` |
| **Local (proxy)** | `http://localhost:3001` |

### Endpoints

#### `GET /analyze`

**Descripción**: Ejecuta el análisis fundamental del mercado.

```json
// Response
{
  "candidates": [
    {
      "ticker": "AAPL",
      "price": 185.50,
      "sector": "Technology",
      "score": 87,
      "pe_ratio": 28.5,
      "roe": 0.147,
      "upside_potential": 0.15,
      "volume": 58000000
    }
  ],
  "total_analyzed": 8234,
  "execution_time_ms": 18
}
```

---

#### `GET /refine`

**Descripción**: Refina y categoriza los candidatos del análisis.

```json
// Response
{
  "categories": {
    "value_picks": [...],
    "growth_potential": [...],
    "dividend_leaders": [...],
    "momentum_plays": [...]
  },
  "total_refined": 45,
  "criteria_applied": ["pe_ratio", "roe", "momentum"]
}
```

---

#### `POST /follow`

**Descripción**: Simula el rendimiento del portafolio seleccionado.

```json
// Request
{
  "tickers": ["AAPL", "MSFT", "GOOGL"],
  "start_date": "2024-01-15",
  "initial_capital": 10000
}

// Response
{
  "portfolio_summary": {
    "initial_capital": 10000,
    "current_value": 11250.75,
    "total_return": 0.1251,
    "total_gain_loss": 1250.75,
    "volatility": 0.18,
    "sharpe_ratio": 1.45
  },
  "positions": [
    {
      "ticker": "AAPL",
      "initial_capital": 3333.33,
      "current_value": 3650.00,
      "contribution_pct": 0.33,
      "return_pct": 0.095,
      "volatility": 0.22
    }
  ],
  "analysis_period": {
    "start": "2024-01-15",
    "end": "2024-12-15"
  }
}
```

---

## 🎨 Diseño y UX

### Sistema de Diseño

#### Paleta de Colores

| Variable | Valor | Uso |
|----------|-------|-----|
| `--primary` | `#00ff88` | Color principal (verde neón) |
| `--primary-dark` | `#00cc6a` | Hover states |
| `--primary-light` | `#00ffaa` | Acentos brillantes |
| `--bg-primary` | `#0a1f1a` | Fondo principal |
| `--bg-secondary` | `#0d2923` | Fondos elevados |
| `--danger` | `#ef4444` | Valores negativos |
| `--warning` | `#fbbf24` | Alertas |

#### Tipografía

| Fuente | Uso |
|--------|-----|
| **Inter** | Cuerpo de texto, labels |
| **Outfit** | Títulos, números destacados |

#### Espaciado (Design Tokens)

| Token | Valor |
|-------|-------|
| `--spacing-xs` | 0.5rem |
| `--spacing-sm` | 1rem |
| `--spacing-md` | 1.5rem |
| `--spacing-lg` | 2rem |
| `--spacing-xl` | 3rem |
| `--spacing-2xl` | 4rem |

### Efectos Visuales

| Efecto | Aplicación |
|--------|------------|
| **Glassmorphism** | Cards con blur y transparencia |
| **Glow shadows** | Botones CTA con resplandor verde |
| **Micro-animations** | Hover, transiciones, pulse |
| **Gradient backgrounds** | Fondos radiales sutiles |

### Responsive Breakpoints

| Breakpoint | Comportamiento |
|------------|----------------|
| `> 768px` | Grid de 4 columnas para stats |
| `<= 768px` | Grid de 2 columnas, layout stack |

---

## 📋 Requisitos No Funcionales

### Rendimiento

| Requisito | Especificación |
|-----------|----------------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Lighthouse Score | > 90 |
| Bundle size | < 100KB (gzipped) |

### Seguridad

| Requisito | Implementación |
|-----------|----------------|
| CORS | Proxy server con headers apropiados |
| Input Validation | Sanitización en formularios |
| HTTPS | Obligatorio en producción |

### Compatibilidad

| Navegador | Versión Mínima |
|-----------|----------------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |

### Accesibilidad

| Criterio | Nivel |
|----------|-------|
| WCAG | 2.1 AA |
| Contraste de colores | ≥ 4.5:1 |
| Navegación por teclado | Completa |
| Screen readers | Compatible |

---

## 🗺️ Roadmap y Fases

### Fase 1: MVP (Actual) ✅

- [x] Home screen con branding
- [x] Loader animado con progreso
- [x] Resultados en formato card
- [x] Flujo de 3 etapas completo
- [x] Selección de tickers
- [x] Proyección de portafolio
- [x] Diseño responsive
- [x] Proxy para CORS

### Fase 2: Mejoras Core (Q1 2026)

- [ ] Autenticación de usuarios
- [ ] Guardado de portafolios
- [ ] Histórico de análisis
- [ ] Alertas de precios
- [ ] Exportación a CSV/PDF

### Fase 3: Features Avanzados (Q2 2026)

- [ ] Comparativa de portafolios
- [ ] Integración con brokers
- [ ] Análisis técnico avanzado
- [ ] Machine Learning para predicciones
- [ ] Dashboard personalizable

### Fase 4: Expansión (Q3-Q4 2026)

- [ ] App móvil nativa
- [ ] API pública para desarrolladores
- [ ] Mercados internacionales
- [ ] Criptomonedas
- [ ] Plan premium con features exclusivos

---

## ⚠️ Riesgos y Mitigación

### Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| API externa no disponible | Media | Alto | Implementar caché local, retry logic |
| Problemas de CORS | Baja | Medio | Proxy deployado, Netlify Functions |
| Latencia alta en móviles | Media | Medio | Optimización de bundle, lazy loading |

### Riesgos de Negocio

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Competencia de herramientas institucionales | Alta | Medio | Diferenciación por UX y precio |
| Cambios en APIs financieras | Media | Alto | Abstracción de la capa de datos |
| Regulaciones financieras | Media | Alto | Disclaimers claros, no asesoría |

---

## 📎 Anexos

### A. Glosario de Términos

| Término | Definición |
|---------|------------|
| **Screener** | Herramienta que filtra activos según criterios |
| **P/E Ratio** | Precio dividido entre ganancias por acción |
| **ROE** | Retorno sobre el patrimonio (Return on Equity) |
| **Momentum** | Indicador de fuerza de tendencia |
| **Upside Potential** | Potencial de apreciación estimado |
| **Volatility** | Medida de variabilidad del precio |
| **Sharpe Ratio** | Retorno ajustado por riesgo |

### B. Referencias

1. API Backend: Google Cloud Run
2. Hosting: Netlify (recomendado)
3. Fuentes: Google Fonts (Inter, Outfit)
4. Iconografía: Emoji nativos

---

**Documento creado**: 9 de Enero, 2026  
**Versión**: 1.0  
**Autor**: EveTrade Development Team  
**Estado**: Aprobado para MVP

---

*Este documento está sujeto a actualizaciones conforme evolucione el producto.*
