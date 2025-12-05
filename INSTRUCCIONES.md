# Instrucciones Completas - Sistema de Análisis de Precios

## 📋 Tabla de Contenidos

1. [Uso Local](#uso-local)
2. [Importar Datos desde Google Sheets](#importar-datos-desde-google-sheets)
3. [Deployment en Vercel](#deployment-en-vercel)
4. [Estructura de Datos](#estructura-de-datos)
5. [API Endpoints](#api-endpoints)

---

## 🖥️ Uso Local

### 1. Iniciar el servidor

```bash
npm run dev
```

El servidor se iniciará en [http://localhost:3000](http://localhost:3000) (o el siguiente puerto disponible).

### 2. Acceder al dashboard

Abre tu navegador en la URL mostrada. Verás:

- **Pestaña Productos**: Tabla con todos los productos importados
- **Pestaña Análisis de Precios**: Comparación de precios entre proveedores
- **Pestaña Estadísticas**: Métricas por proveedor

### 3. Filtrar productos

Usa el panel de filtros para:
- 🔍 Buscar por nombre o categoría
- 🏢 Filtrar por proveedor
- 📂 Filtrar por categoría
- 💰 Rango de precios (mínimo y máximo)
- 🏷️ Solo productos con descuento

---

## 📊 Importar Datos desde Google Sheets

Hay **3 opciones** para importar datos:

### Opción 1: Script de Google Apps Script (Recomendado)

1. **Abrir Google Sheet** con tus datos de scraping
2. **Ir a**: Extensiones > Apps Script
3. **Copiar todo el contenido** de `scripts/google-apps-script.js`
4. **Pegar** en el editor de Apps Script
5. **Modificar la URL** en línea 20:
   ```javascript
   // Para desarrollo local:
   const URL_API = 'http://localhost:3002/api/import';

   // Para producción:
   // const URL_API = 'https://tu-proyecto.vercel.app/api/import';
   ```
6. **Guardar** (Ctrl+S o Cmd+S)
7. **Ejecutar** la función `exportarAAPI`
8. **Autorizar** los permisos la primera vez

#### Menú personalizado

Una vez ejecutes `onOpen()` o recargues la hoja, aparecerá un menú:

```
Exportar a API
├── Exportar productos
└── Ver instrucciones
```

### Opción 2: cURL (Manual)

```bash
curl -X POST http://localhost:3002/api/import \
  -H "Content-Type: application/json" \
  -d @scripts/seed-data.json
```

### Opción 3: Postman / Insomnia

- **URL**: `http://localhost:3002/api/import` (o tu URL de producción)
- **Método**: POST
- **Headers**: `Content-Type: application/json`
- **Body**:

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
  "clearBefore": true
}
```

**clearBefore**:
- `true`: Limpia la base de datos antes de importar
- `false`: Agrega productos sin borrar existentes

---

## 🚀 Deployment en Vercel

### Paso 1: Preparar el repositorio

```bash
# Inicializar git (si no lo has hecho)
git init
git add .
git commit -m "Initial commit"

# Crear repositorio en GitHub y subir
git remote add origin https://github.com/tu-usuario/scrapper-berco.git
git branch -M main
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. **Ir a** [vercel.com](https://vercel.com)
2. **Login** con GitHub
3. **New Project** → Importar tu repositorio
4. **Framework Preset**: Next.js (detectado automáticamente)
5. **Deploy**

### Paso 3: Configurar persistencia en Producción (Firebase)

IMPORTANTE: SQLite no funciona en Vercel (filesystem efímero). Usa Firestore para que los datos persistan:

1. Crea una cuenta de servicio en Firebase con acceso a Firestore.
2. En Vercel ve a **Settings → Environment Variables** y agrega:
   - FIREBASE_PROJECT_ID
   - FIREBASE_CLIENT_EMAIL
   - FIREBASE_PRIVATE_KEY (usa \n para los saltos de línea)
   - Opcional: FIREBASE_SERVICE_ACCOUNT con el JSON completo.
3. Despliega de nuevo en Vercel. El adaptador usa Firestore automáticamente si existe FIREBASE_PROJECT_ID. En local seguirás usando SQLite sin cambios.

¿No quieres Firebase? Alternativas: Vercel Postgres, Supabase, PlanetScale o MongoDB Atlas (ajustando la capa lib/db-* si cambias de motor).

### Paso 4: Actualizar Google Apps Script

Una vez deployado, actualiza la URL en tu script:

```javascript
const URL_API = 'https://tu-proyecto.vercel.app/api/import';
```

---

## 📦 Estructura de Datos

### Formato de importación

```typescript
{
  "products": [
    {
      "url": string,           // URL del producto
      "nombre": string,        // Nombre del producto
      "precio": number,        // Precio actual (número sin símbolos)
      "descuento": string,     // Descuento (ej: "10%" o vacío)
      "categoria": string,     // Categoría (puede incluir ">")
      "proveedor": string,     // Nombre del proveedor
      "status": string,        // Estado del scraping (ej: "OK", "ERROR")
      "fecha_scraping": string, // ISO 8601 (opcional, se genera automáticamente)
      "precioLista": number    // Precio original antes de descuento (opcional)
    }
  ],
  "clearBefore": boolean       // true: limpia DB antes, false: agrega
}
```

### Mapeo desde Google Sheets

Si tu sheet tiene este formato:

| A | B | C | D | E | F | G | H-J | K |
|---|---|---|---|---|---|---|-----|---|
| URL | Nombre | Precio | Descuento | Categoría | Proveedor | Status | Debug | PrecioLista |

El script mapea automáticamente:
- Columna A → `url`
- Columna B → `nombre`
- Columna C → `precio`
- Columna D → `descuento`
- Columna E → `categoria`
- Columna F → `proveedor`
- Columna G → `status`
- Columna K → `precioLista`

---

## 🔌 API Endpoints

### GET /api/products

Obtiene productos con filtros.

**Query Parameters**:
- `proveedor` (string): Filtrar por proveedor
- `categoria` (string): Filtrar por categoría
- `search` (string): Buscar en nombre y categoría
- `minPrice` (number): Precio mínimo
- `maxPrice` (number): Precio máximo
- `hasDiscount` (boolean): Solo con descuento
- `page` (number): Página (default: 1)
- `limit` (number): Resultados por página (default: 50)

**Ejemplo**:
```
GET /api/products?proveedor=Supermat&minPrice=10000&page=1
```

**Respuesta**:
```json
{
  "products": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

### GET /api/products?action=providers

Obtiene lista de proveedores únicos.

**Respuesta**:
```json
{
  "providers": ["Supermat", "El Amigo", "Unimax", ...]
}
```

### GET /api/products?action=categories

Obtiene lista de categorías únicas.

### GET /api/stats?type=price-analysis

Análisis de precios por producto (comparación entre proveedores).

**Query Parameters**:
- `search` (string): Filtrar productos por nombre

**Respuesta**:
```json
{
  "analysis": [
    {
      "producto": "Taladro Percutor 13mm 650W",
      "precioMinimo": 89990,
      "precioMaximo": 95000,
      "precioPromedio": 92496.67,
      "proveedorMasBarato": "Supermat",
      "proveedorMasCaro": "Unimax",
      "diferenciaPorcentaje": 5.57
    }
  ]
}
```

### GET /api/stats?type=provider-stats

Estadísticas por proveedor.

**Respuesta**:
```json
{
  "stats": [
    {
      "proveedor": "Supermat",
      "cantidadProductos": 50,
      "precioPromedio": 45000,
      "productosConDescuento": 35,
      "descuentoPromedio": 15.5
    }
  ]
}
```

### POST /api/import

Importa productos desde JSON.

**Body**:
```json
{
  "products": [...],
  "clearBefore": true
}
```

**Respuesta**:
```json
{
  "success": true,
  "imported": 15,
  "message": "15 productos importados exitosamente"
}
```

---

## 🐛 Solución de Problemas

### Error: "Cannot find module 'better-sqlite3'"

```bash
npm install
```

### Error: "Port 3000 is in use"

Next.js usará automáticamente el siguiente puerto disponible (ej: 3002, 3001).

### Error en Google Apps Script: "URL Fetch failed"

1. Verifica que el servidor esté corriendo
2. Verifica la URL (debe incluir `http://` o `https://`)
3. Para desarrollo local, asegúrate de usar la IP correcta

### Base de datos no persiste en Vercel

Esto es normal con SQLite. Migra a Vercel Postgres o similar (ver sección Deployment).

### No aparecen datos después de importar

1. Revisa la respuesta del endpoint `/api/import`
2. Verifica el formato JSON
3. Chequea los logs de Next.js (`npm run dev`)

---

## 📝 Notas Adicionales

- El sistema está optimizado para **desarrollo local**
- Para **producción**, debes migrar a una base de datos persistente
- Los datos de prueba están en `scripts/seed-data.json`
- El formato de descuento debe incluir el símbolo `%` (ej: "15%")
- Los precios deben ser números sin símbolos de moneda

---

## 📞 Soporte

Si encuentras problemas o necesitas ayuda, revisa:
1. Los logs del servidor (`npm run dev`)
2. La consola del navegador (F12)
3. Los logs de Google Apps Script (Ctrl+Enter en el editor)
