const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function listProducts() {
    console.log('Querying for products...');
    const snapshot = await db.collection('products').get();
    console.log(`Found ${snapshot.size} products.`);
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id} | NAME: ${data.name} | TYPE: ${data.type}`);
    });
}

listProducts().catch(console.error);
