# EveTrade Proxy Server Deployment

## Desplegar en Render.com (GRATIS)

1. Ve a [render.com](https://render.com) y crea una cuenta
2. Haz clic en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub o sube estos archivos:
   - `proxy-server.js`
   - `package.json`

4. Configura el servicio:
   - **Name**: `evetrade-proxy`
   - **Environment**: `Node`
   - **Build Command**: (dejar vacío)
   - **Start Command**: `npm start`
   - **Plan**: `Free`

5. Haz clic en **"Create Web Service"**

6. Espera a que se despliegue (2-3 minutos)

7. Render te dará una URL como: `https://evetrade-proxy.onrender.com`

8. **IMPORTANTE**: Actualiza el archivo `app.js` línea 24:
   ```javascript
   : 'https://TU-URL-DE-RENDER.onrender.com';  // Reemplaza con tu URL
   ```

9. Sube el `app.js` actualizado a Netlify

¡Listo! Tu app funcionará en móviles 🚀
