const { getFirestore } = require('firebase-admin/firestore');

// Create Payment Record (Internal or API)
exports.createPayment = async (data) => {
    // data: { orderId, userId, amount, method, status, details }
    const db = getFirestore();
    const paymentRef = db.collection('payments').doc();
    await paymentRef.set({
        ...data,
        createdAt: new Date().toISOString()
    });
    return paymentRef.id;
};

// Get All Payments (Admin)
exports.getAllPayments = async (req, res) => {
    try {
        const db = getFirestore();
        const snapshot = await db.collection('payments').orderBy('createdAt', 'desc').get();
        const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get My Payments (User)
exports.getMyPayments = async (req, res) => {
    try {
        const uid = req.user.uid;
        const db = getFirestore();
        const snapshot = await db.collection('payments').where('userId', '==', uid).get();
        const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Payment Status (Internal or Admin)
exports.updatePaymentStatusByOrderId = async (orderId, status) => {
    const db = getFirestore();
    const snapshot = await db.collection('payments').where('orderId', '==', orderId).get();
    if (snapshot.empty) return;

    // Usually 1 payment per order
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { status: status });
    });
    await batch.commit();
};
