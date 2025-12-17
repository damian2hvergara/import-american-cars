markdown
# IMPORT AMERICAN CARS - SISTEMA DE GESTIÓN

Sistema completo para la gestión y visualización de vehículos americanos importados.

## 🚀 INSTALACIÓN RÁPIDA

### 1. ESTRUCTURA DE ARCHIVOS
import-american-cars/
├── index.html
├── favicon.ico
├── README.md
├── css/
│ ├── main.css
│ ├── base.css
│ ├── layout.css
│ ├── components.css
│ ├── sections.css
│ └── responsive.css
├── js/
│ ├── config.js
│ ├── supabase.js
│ ├── productos.js
│ ├── app.js
│ └── ui/
│ ├── ui-core.js
│ ├── ui-modals.js
│ ├── ui-kits.js
│ ├── ui-slider.js
│ ├── ui-notifications.js
│ └── ui-manager.js
└── assets/
└── logo.png (opcional)

text

### 2. CONFIGURACIÓN OBLIGATORIA

**PASO 1: Obtener credenciales de Supabase**
1. Ve a https://app.supabase.com
2. Crea un proyecto o selecciona uno existente
3. Ve a Settings → API
4. Copia:
   - **Project URL** (ej: https://abcdefghijklmnop.supabase.co)
   - **anon public** key

**PASO 2: Configurar `config.js`**
Abre `js/config.js` y reemplaza:
```javascript
supabase: {
  url: "https://TU_PROYECTO.supabase.co", // ← REEMPLAZA CON TU URL
  anonKey: "sb_publishable_xxxxxxxxxxxx" // ← REEMPLAZA CON TU KEY
}
