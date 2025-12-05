# Scraper Berco - Sistema de Análisis de Precios

Sistema web para analizar y comparar precios de productos de la competencia.

## Características

- **Dashboard interactivo** con filtros avanzados
- **Análisis de precios** por producto (comparación entre proveedores)
- **Estadísticas por proveedor** (cantidad de productos, precios promedio, descuentos)
- **Importación de datos** desde Google Sheets
- **Base de datos SQLite** para desarrollo local
- **Diseño responsive** con modo oscuro

## Tecnologías

- **Next.js 15** con App Router
- **TypeScript**
- **Tailwind CSS**
- **Better-SQLite3** (base de datos)
- **Lucide React** (iconos)

## Instalación Local

1. Instalar dependencias:
```bash
npm install
```

2. Ejecutar en modo desarrollo:
```bash
npm run dev
```

3. Abrir navegador en [http://localhost:3000](http://localhost:3000)

## Importar Datos desde Google Sheets

### Opción 1: API Manual

Hacer una petición POST a `/api/import` con el siguiente formato:

```json
{
  "products": [
    {
      "url": "https://ejemplo.com/producto",
      "nombre": "Producto Ejemplo",
      "precio": 1000,
      "descuento": "10%",
      "categoria": "Categoría > Subcategoría",
      "proveedor": "Proveedor",
      "status": "OK",
      "precioLista": 1100
    }
  ],
  "clearBefore": false
}
```

### Opción 2: Script de Google Apps Script (Recomendado)

Hemos creado un **proyecto completo de Google Apps Script** con interfaz de usuario y validaciones.

**📁 Ubicación:** [`google-apps-script-project/`](./google-apps-script-project/)

**Características:**
- ✅ Menú personalizado en Google Sheets
- ✅ Validación de datos y confirmaciones
- ✅ Prueba de conexión antes de exportar
- ✅ Manejo de errores detallado
- ✅ Resumen de datos antes de exportar

**Instalación rápida:**

1. Abre tu Google Sheet
2. Ve a **Extensiones → Apps Script**
3. Copia el código de [`google-apps-script-project/Code.gs`](./google-apps-script-project/Code.gs)
4. Pega en el editor y guarda
5. Ejecuta la función `onOpen()` y autoriza permisos
6. Recarga tu Google Sheet

**Documentación completa:**
- [📖 README del proyecto](./google-apps-script-project/README.md)
- [🚀 Guía de instalación paso a paso](./google-apps-script-project/INSTALACION.md)

---

<details>
<summary>Opción 2b: Script simple (solo código)</summary>

Si prefieres un script más simple sin interfaz:

```javascript
function exportarAAPI() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Scraper');
  const data = sheet.getDataRange().getValues();

  const products = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Saltar filas vacías

    products.push({
      url: row[0],
      nombre: row[1],
      precio: row[2],
      descuento: row[3],
      categoria: row[4],
      proveedor: row[5],
      status: row[6],
      fecha_scraping: new Date().toISOString(),
      precioLista: row[10] || null
    });
  }

  // Para desarrollo local
  const url = 'http://localhost:3000/api/import';

  // Para producción en Vercel
  // const url = 'https://tu-proyecto.vercel.app/api/import';

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      products: products,
      clearBefore: true // Limpiar DB antes de importar
    }),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    Logger.log('Importación exitosa: ' + result.message);
    SpreadsheetApp.getUi().alert('Importación exitosa: ' + result.imported + ' productos');
  } catch (error) {
    Logger.log('Error: ' + error);
    SpreadsheetApp.getUi().alert('Error en la importación: ' + error);
  }
}
```

</details>

---

## Estructura del Proyecto

```
scrapper-berco/
├── app/
│   ├── api/
│   │   ├── products/      # API de productos
│   │   ├── stats/         # API de estadísticas
│   │   └── import/        # API de importación
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página principal
│   └── globals.css        # Estilos globales
├── components/
│   ├── ProductTable.tsx   # Tabla de productos
│   ├── FilterPanel.tsx    # Panel de filtros
│   ├── PriceAnalysis.tsx  # Análisis de precios
│   ├── ProviderStats.tsx  # Estadísticas de proveedores
│   └── ThemeToggle.tsx    # Toggle de tema claro/oscuro
├── google-apps-script-project/  # 🆕 Proyecto de Google Apps Script
│   ├── Code.gs            # Código principal del exportador
│   ├── appsscript.json    # Configuración del proyecto
│   ├── README.md          # Documentación completa
│   └── INSTALACION.md     # Guía de instalación
├── lib/
│   └── db.ts              # Capa de base de datos
├── types/
│   └── index.ts           # Definiciones TypeScript
├── scripts/
│   └── seed-data.json     # Datos de prueba
└── products.db            # Base de datos SQLite (auto-generada)
```

## Deployment en Vercel

### 1. Preparar el proyecto

```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Iniciar sesión
vercel login
```

### 2. Configurar proyecto en Vercel

1. Ir a [vercel.com](https://vercel.com)
2. Hacer clic en "New Project"
3. Importar el repositorio
4. Vercel detectará automáticamente Next.js

### 3. Configurar Firebase (persistencia en Vercel)

1. Crea una cuenta de servicio en Firebase con acceso a Firestore.
2. En Vercel ve a **Settings → Environment Variables** y agrega:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (usa `\n` en los saltos de línea)
   - Opcional: `FIREBASE_SERVICE_ACCOUNT` con el JSON completo.
3. Con esas variables, el backend usa Firestore automáticamente en Vercel. En local sigue usando SQLite.

> Sin Firebase los datos se pierden en Vercel porque SQLite es efímero en cada deploy.

### 4. Deploy

```bash
# Deploy a producción
vercel --prod
```

### Nota sobre la base de datos en Vercel

- **Firestore (recomendado ahora)**: se activa al definir `FIREBASE_PROJECT_ID` y credenciales; persiste entre deploys.
- **SQLite**: solo para desarrollo local (se borra en cada build en Vercel).
- **Alternativas**: Vercel Postgres, Supabase, PlanetScale o MongoDB Atlas si prefieres SQL/NoSQL distinto.

## Filtros Disponibles

- **Búsqueda** por nombre o categoría
- **Proveedor** (dropdown)
- **Categoría** (dropdown)
- **Rango de precios** (mínimo y máximo)
- **Solo con descuento** (checkbox)

## Análisis

### Análisis de Precios
- Muestra productos con mayor diferencia de precio entre proveedores
- Indica proveedor más barato y más caro
- Calcula porcentaje de diferencia

### Estadísticas por Proveedor
- Cantidad de productos
- Precio promedio
- Productos con descuento
- Descuento promedio

## Licencia

MIT
