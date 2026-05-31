# Mapa del Código - Club de Suboficiales (Cotizador)

Este documento es un mapa rápido de la arquitectura del proyecto. Sirve para que cualquier inteligencia artificial o desarrollador entienda la estructura del código rápidamente sin tener que leer todos los archivos línea por línea.

## 📁 Estructura de Archivos

1. **`index.html`** (Cotizador Principal)
   - Es una aplicación de una sola página (SPA) que maneja toda la lógica de cotización.
   - Contiene la interfaz principal (carrito, botones móviles, desglose).
   - Genera el PDF utilizando estilos de impresión puros (`@media print`).
   - Exporta a CSV y formatea el mensaje de WhatsApp.
   - Utiliza la base de datos que se lee desde `localStorage`.

2. **`admin.html`** (Panel de Administración)
   - Permite modificar precios, crear nuevos productos y ajustar "supuestos" (Márgenes, IVA, Comisión de Transbank).
   - Está protegido por una pantalla de login básica (`machy650@gmail.com` / `1234`).
   - Sincroniza la información directamente en `localStorage`.

3. **`/pwa/sw.js`** y **`/pwa/manifest.json`**
   - Hacen que la página funcione como una App (PWA).
   - El Service Worker (`sw.js`) utiliza una estrategia *Network-first* (Busca primero en la red, si no hay red usa caché) para asegurar que las actualizaciones de precios y código se apliquen automáticamente.

4. **`/assets/`**
   - Imágenes como `logo2.jpg` (con mix-blend-mode en el código para simular transparencia) y `calzada.jpg` (fondo).

## 💾 Gestión de Estado y Base de Datos

Toda la base de datos vive de forma local en el navegador del usuario utilizando `localStorage`. 
- **Llave:** `cds_cotizador_v1`
- Si la llave no existe, el sistema carga unos valores por defecto predefinidos en la constante `DATABASE_DEFAULTS` (en `index.html`).
- **Estructura:**
  - `supuestos`: Valores globales (IVA, Margen, Transbank, IPC, etc).
  - `database`: Objeto con las distintas categorías (APERITIVOS, CÓCTEL, ENTRADAS, PRINCIPALES, etc.), donde cada producto es un objeto con `{ id, n (nombre), c (costo), p (precio calculado) }`.

## ⚙️ Funciones Clave (index.html)

- **`updateUI()`**: Función crítica. Recalcula todos los totales (carrito de adultos, carrito de niños, totales sumados) y actualiza los textos en el DOM.
- **`renderProducts()` / `renderCategories()`**: Dibujan dinámicamente las tarjetas (cards) de los productos basándose en la pestaña activa (Adultos/Niños).
- **`toggleProduct(id)`**: Agrega o quita productos del carrito correspondiente.
- **`shareWhatsApp()` / `exportCSV()`**: Toman el estado actual del carrito, generan el desglose línea por línea y activan la exportación.
- **`toggleDrawer()`**: Controla la visualización del carrito flotante en móviles (soporta cerrar deslizando hacia abajo).

## 🐞 Bugs Solucionados Recientemente
- El diseño en móviles ya no se desborda horizontalmente (ocultamos elementos sobrantes en el header y comprimimos la barra inferior).
- El logo JPG tiene un recuadro blanco que se oculta dinámicamente usando CSS `mix-blend-mode: multiply`.
- La pantalla de login del administrador arregló la sensibilidad a mayúsculas usando `.toLowerCase()`.
