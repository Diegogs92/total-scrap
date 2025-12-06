import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getCredentials() {
  // 1) FIREBASE_SERVICE_ACCOUNT como JSON completo
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
  }

  // 2) Variables sueltas con PRIVATE_KEY (acepta con \n o multilinea)
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    const normalizedKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/\r/g, '');
    return cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: normalizedKey,
    });
  }

  // 3) Fallback a credencial por defecto (GCP)
  return applicationDefault();
}

// Inicializa Firebase Admin de forma idempotente.
const app = getApps()[0] || initializeApp({ credential: getCredentials() });

export const db = getFirestore(app);
