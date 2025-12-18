const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
let db;

function initializeFirebase() {
    if (!db) {
        // Check if running in production (with service account) or development (with emulator)
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            // Production: Use service account credentials
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else if (process.env.FIREBASE_PROJECT_ID) {
            // Development: Use project ID (can work with emulator or default credentials)
            admin.initializeApp({
                projectId: process.env.FIREBASE_PROJECT_ID
            });
        } else {
            // Fallback: Try to initialize with default credentials
            admin.initializeApp();
        }

        db = admin.firestore();
        console.log('✅ Firebase initialized successfully');
    }
    return db;
}

module.exports = { initializeFirebase, admin };
