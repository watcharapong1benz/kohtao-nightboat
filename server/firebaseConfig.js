const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin
let db;

function initializeFirebase() {
    if (!db) {
        // Check if using service account key file (recommended for development)
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            const serviceAccountPath = path.resolve(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS);
            const serviceAccount = require(serviceAccountPath);

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('✅ Firebase initialized with service account key');
        }
        // Check if running in production (with service account JSON string)
        else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('✅ Firebase initialized with service account from env');
        }
        // Fallback: Use project ID (may not work without additional auth)
        else if (process.env.FIREBASE_PROJECT_ID) {
            admin.initializeApp({
                projectId: process.env.FIREBASE_PROJECT_ID
            });
            console.log('✅ Firebase initialized with project ID');
        }
        else {
            throw new Error('❌ No Firebase credentials found. Please set GOOGLE_APPLICATION_CREDENTIALS, FIREBASE_SERVICE_ACCOUNT, or FIREBASE_PROJECT_ID in .env');
        }

        db = admin.firestore();
        console.log('✅ Firestore connected successfully');
    }
    return db;
}

module.exports = { initializeFirebase, admin };

