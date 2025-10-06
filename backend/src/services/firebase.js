/**
 * Firebase Admin Service
 * Backend database using Firestore
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let db = null;

export function initializeFirebase() {
  if (!db) {
    try {
      // Initialize Firebase Admin with service account
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

      db = admin.firestore();
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error.message);
      throw error;
    }
  }
  
  return db;
}

export function getFirestore() {
  if (!db) {
    return initializeFirebase();
  }
  return db;
}

export default { initializeFirebase, getFirestore };
