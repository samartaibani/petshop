const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function deletePets() {
    console.log('Starting deletion of live pets...');
    const snapshot = await db.collection('products').where('type', '==', 'pet').get();
    if (snapshot.empty) {
        console.log('No pets found to delete.');
        return;
    }

    const batch = db.batch();
    let count = 0;
    snapshot.docs.forEach(doc => {
        console.log(`Deleting pet: ${doc.id} - ${doc.data().name}`);
        batch.delete(doc.ref);
        count++;
    });

    await batch.commit();
    console.log(`Successfully deleted ${count} live pets from Firestore.`);
}

deletePets().catch(error => {
    console.error('Error during deletion:', error);
    process.exit(1);
});
