# IMPORTANTE: Base de datos en Vercel

## SQLite solo para local

SQLite funciona perfecto en desarrollo, pero **no persiste en Vercel** porque el filesystem es efímero.

## Opción recomendada: Firebase (Firestore)

1. Crea una cuenta de servicio en tu proyecto Firebase con acceso a Firestore.
2. En Vercel agrega variables de entorno:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (usa `\n` para los saltos de línea)
   - Opcional: `FIREBASE_SERVICE_ACCOUNT` con el JSON completo.
3. Redeploy. El backend usa Firestore automáticamente si encuentra `FIREBASE_PROJECT_ID`. En local seguirá usando SQLite sin cambios.

## Alternativa: Vercel Postgres u otros

Si prefieres SQL:
- Vercel Postgres (recomendado si ya usas el ecosistema Vercel)
- Supabase
- PlanetScale
- MongoDB Atlas (NoSQL)

Para cambiar de motor, ajusta la capa `lib/db-*` según tu proveedor.
