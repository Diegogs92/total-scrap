# 🚀 INSTALAR AHORA - 3 Pasos Rápidos

## ✅ Paso 1: Copiar el Código

El archivo **`Code.gs`** debería estar abierto en tu editor.

**Acciones:**
1. Presiona `Ctrl+A` (seleccionar todo)
2. Presiona `Ctrl+C` (copiar)

Si no se abrió, ábrelo manualmente desde:
```
C:\Users\diego\OneDrive\Documentos\scrapper-berco\google-apps-script-project\Code.gs
```

---

## ✅ Paso 2: Ir a Google Sheets

1. **Abre tu Google Sheet** con los datos del scraper
   - URL: https://docs.google.com/spreadsheets/d/1CwkMP4lPQowSxc9TE0tnFAshRgSZ3Ht95Fk3O-4aQ6k/edit

2. **Ve al menú**: `Extensiones` → `Apps Script`
   - Se abrirá una nueva pestaña con el editor de Google Apps Script

3. **Elimina todo** el código que aparece por defecto
   - Presiona `Ctrl+A` en el editor
   - Presiona `Delete`

4. **Pega el código** que copiaste
   - Presiona `Ctrl+V`

5. **Guarda**
   - Presiona `Ctrl+S`
   - Dale un nombre: "Exportador Scraper Berco"

---

## ✅ Paso 3: Configurar y Ejecutar

### 3.1. Modificar la URL

Busca esta línea al inicio del código (línea ~20):

```javascript
const URL_API = 'http://localhost:3002/api/import';
```

**Déjala así para desarrollo local** (ya está correcta).

Para producción en Vercel, cámbiala a:
```javascript
const URL_API = 'https://scrapper-berco-2ri9s4b22-dgarciasantillan-7059s-projects.vercel.app/api/import';
```

### 3.2. Ejecutar la primera vez

1. En el menú superior del editor, selecciona **`onOpen`** en el dropdown
2. Haz clic en **▶️ Ejecutar**
3. Aparecerá un mensaje: **"Autorización necesaria"**
4. Haz clic en **"Revisar permisos"**
5. Selecciona tu cuenta de Google
6. Verás: **"Google no verificó esta app"**
   - Haz clic en **"Opciones avanzadas"**
   - Haz clic en **"Ir a Exportador Scraper Berco (no seguro)"**
7. Haz clic en **"Permitir"**

### 3.3. Verificar instalación

1. **Vuelve a tu Google Sheet**
2. **Recarga la página** (F5)
3. Deberías ver un nuevo menú: **"📊 Exportar Datos"**

---

## ✅ Paso 4: Probar

### Opción A: Probar Conexión Primero (Recomendado)

1. En tu Google Sheet, ve al menú: **📊 Exportar Datos**
2. Haz clic en: **🧪 Probar conexión**
3. Si ves **"✅ Conexión Exitosa"** → ¡Todo funciona!

### Opción B: Exportar Directamente

1. **📊 Exportar Datos** → **🚀 Exportar productos a API**
2. Confirma la exportación
3. Espera el mensaje de confirmación

---

## 🎉 ¡Listo!

Ya tienes el exportador instalado. Cada vez que actualices datos en tu sheet:

1. **📊 Exportar Datos** → **🚀 Exportar productos a API**
2. Los datos se sincronizarán automáticamente con el sistema

---

## ❓ Solución Rápida de Problemas

### No aparece el menú "📊 Exportar Datos"

**Solución:**
1. En Apps Script, ejecuta `onOpen()` manualmente
2. Recarga tu Google Sheet (F5)

### Error: "No se puede conectar"

**Para desarrollo local:**
1. Abre una terminal
2. Ve a la carpeta del proyecto: `cd C:\Users\diego\OneDrive\Documentos\scrapper-berco`
3. Ejecuta: `npm run dev`
4. Verifica que diga: `Local: http://localhost:3002`
5. Vuelve a probar

**Para Vercel:**
1. Verifica que la URL en el código sea correcta
2. Verifica que el proyecto esté deployado en Vercel

### Error de permisos

**Solución:**
1. Ve a: https://myaccount.google.com/permissions
2. Busca "Exportador Scraper Berco"
3. Elimina el acceso
4. Vuelve a ejecutar `onOpen()` en Apps Script
5. Autoriza de nuevo

---

## 📱 Contacto

Si tienes problemas, revisa:
- [README completo](README.md)
- [Guía de instalación detallada](INSTALACION.md)
- Logs en Apps Script: `Ver` → `Registros`

---

## 🔗 Enlaces Útiles

- **Tu Google Sheet**: https://docs.google.com/spreadsheets/d/1CwkMP4lPQowSxc9TE0tnFAshRgSZ3Ht95Fk3O-4aQ6k/edit
- **Dashboard local**: http://localhost:3002
- **Dashboard Vercel**: https://scrapper-berco-2ri9s4b22-dgarciasantillan-7059s-projects.vercel.app
- **GitHub**: https://github.com/Diegogs92/scrapper-berco
