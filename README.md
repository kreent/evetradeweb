# EveTrade - Análisis Inteligente de Inversiones

Aplicación web moderna para análisis de inversiones con IA.

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js instalado (para el servidor proxy)
- Python 3 instalado (para el servidor de archivos estáticos)

### Instrucciones de Ejecución

**Importante**: Debes ejecutar DOS servidores simultáneamente.

#### Terminal 1: Servidor Proxy (para resolver CORS)
```bash
cd /Users/caritoherrera/Documents/evetradeweb
node proxy-server.js
```
Esto iniciará el proxy en `http://localhost:3001`

#### Terminal 2: Servidor Web
```bash
cd /Users/caritoherrera/Documents/evetradeweb
python3 -m http.server 8000
```
Esto iniciará el servidor web en `http://localhost:8000`

### Abrir la Aplicación
Una vez que ambos servidores estén corriendo, abre tu navegador en:
```
http://localhost:8000
```

## 📋 Funcionalidades

### Pantalla Principal
- Explicación del proceso de análisis en 3 pasos
- Diseño moderno con tema oscuro y efectos glassmorfismo
- Botón CTA para iniciar el análisis

### Flujo de Análisis
1. **Análisis Inicial** (`/analyze`): Muestra candidatos de inversión con métricas fundamentales
2. **Refinamiento** (`/refine`): Categoriza las recomendaciones con explicaciones
3. **Análisis de Portafolio** (`/follow`): Simula el rendimiento del portafolio seleccionado

## 🛠️ Arquitectura Técnica

### Archivos Principales
- `index.html` - Estructura de la aplicación
- `styles.css` - Sistema de diseño con CSS variables
- `app.js` - Lógica de la aplicación y manejo de estado
- `proxy-server.js` - Servidor proxy para evitar errores CORS

### APIs Integradas
- **Analyze**: `GET /analyze` - Análisis inicial de mercado
- **Refine**: `GET /refine` - Refinamiento de recomendaciones
- **Follow**: `POST /follow` - Análisis de portafolio personalizado

### Stack Tecnológico
- HTML5 semántico
- CSS vanilla con diseño moderno
- JavaScript vanilla (ES6+)
- Node.js (solo para proxy)

## 🎨 Características de Diseño

- ✨ Tema oscuro premium
- 🌈 Gradientes vibrantes
- 💎 Efectos glassmorfismo
- 🎭 Animaciones suaves
- 📱 Diseño responsive
- ⚡ Micro-interacciones

## 🔧 Solución de Problemas

### Error: CORS Policy
Si ves errores de CORS, asegúrate de que el servidor proxy esté ejecutándose en el puerto 3001.

### Puerto en Uso
Si el puerto 8000 o 3001 está en uso:
- Cambia el puerto en `http.server`: `python3 -m http.server 8080`
- Cambia el puerto del proxy editando `PORT` en `proxy-server.js`

### APIs No Responden
Las APIs externas pueden tener tiempos de respuesta largos. El loader se mostrará mientras se procesan las solicitudes.

## 📝 Notas de Desarrollo

### Estado de la Aplicación
El estado se maneja con un objeto global `appState` que incluye:
- Pantalla actual
- Datos de análisis
- Tickers seleccionados
- Datos del formulario

### Navegación
La navegación entre pantallas se maneja con clases CSS `.active` y animaciones fade-in.

### Selección de Tickers
Los tickers se pueden seleccionar/deseleccionar haciendo clic en las tarjetas. Se usa un `Set` para evitar duplicados.

## 🚀 Deployment a Producción

Para deployment en producción, considera:

1. **Solución CORS**: Contactar al administrador de la API para habilitar CORS, o desplegar el proxy junto con la aplicación
2. **Hosting Estático**: Netlify, Vercel, o GitHub Pages
3. **CDN**: Para los assets estáticos
4. **SSL**: Certificado HTTPS para seguridad

---

Desarrollado con ❤️ usando tecnologías web modernas
