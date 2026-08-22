const { getFirestore } = require('firebase-admin/firestore');
// Lazy init

// Helper: Run transaction to check stock and decrement
exports.createOrder = async (req, res) => {
    // items: [{ productId, quantity, price, name }]
    const { items, totalAmount, paymentStatus, address, phone, customerName, email, paymentMethod } = req.body;
    // Security: Always take userId from the verified Token, not the body
    const userId = req.user.uid;
    const finalPaymentStatus = (paymentMethod === 'Card' || paymentMethod === 'UPI') ? 'Paid' : 'Pending';

    try {
        const db = getFirestore();
        await db.runTransaction(async (t) => {
            const productRefs = items.map(item => db.collection('products').doc(item.productId));
            const productDocs = await t.getAll(...productRefs);

            // 1. Check Stock
            productDocs.forEach((doc, index) => {
                if (!doc.exists) {
                    throw new Error(`Product ${items[index].productId} does not exist`);
                }
                const productData = doc.data();
                if (productData.stock < items[index].quantity) {
                    throw new Error(`Insufficient stock for product: ${productData.name}`);
                }
            });

            // 2. Decrement Stock
            productDocs.forEach((doc, index) => {
                const newStock = doc.data().stock - items[index].quantity;
                t.update(doc.ref, { stock: newStock });
            });

            // 3. Create Order
            const orderRef = db.collection('orders').doc();
            const orderId = orderRef.id;

            t.set(orderRef, {
                userId,
                items,
                totalAmount,
                paymentStatus: finalPaymentStatus, // Paid if Card, Pending if COD
                paymentMethod: paymentMethod || 'COD',
                status: 'Pending',
                createdAt: new Date().toISOString(),
                // Saved Address & Contact Info
                address,
                phone,
                customerName,
                email
            });

            // 4. Create Payment Record (DB Table Payment)
            const paymentRef = db.collection('payments').doc();
            const paymentData = {
                orderId: orderId,
                userId: userId,
                amount: totalAmount,
                method: paymentMethod || 'COD',
                status: finalPaymentStatus === 'Paid' ? 'Success' : 'Pending',
                transactionDate: new Date().toISOString(),
                details: paymentMethod === 'Card' ? 'Mock Card Payment' : 'Cash on Delivery'
            };
            t.set(paymentRef, paymentData);
        });

        res.status(201).json({ message: "Order placed successfully" });
    } catch (error) {
        console.error("Order Transaction Error:", error);
        res.status(400).json({ error: error.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const { uid, role } = req.user; // req.user has 'uid', not 'userId'
        const userId = uid; // Map for consistency
        const db = getFirestore();
        let query;

        if (role === 1) {
            // Admin sees all
            query = db.collection('orders').orderBy('createdAt', 'desc');
        } else {
            // User sees own
            query = db.collection('orders').where('userId', '==', userId);
        }

        const snapshot = await query.get();
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const db = getFirestore();
        const orderRef = db.collection('orders').doc(id);
        const doc = await orderRef.get();

        if (!doc.exists) return res.status(404).json({ error: "Order not found" });
        const currentData = doc.data();

        if ((currentData.status === 'Collected' || currentData.status === 'Delivered') && currentData.paymentStatus === 'Paid') {
            return res.status(400).json({ error: "Order is already Collected/Delivered and Paid. Cannot modify." });
        }

        const updates = { status };

        if (status === 'Collected' || status === 'Delivered') {
            // Auto-update Payment Status to Paid if it's currently Pending (e.g., COD)
            if (currentData.paymentStatus === 'Pending') {
                updates.paymentStatus = 'Paid';
            }
        }

        await orderRef.update(updates);

        // Optional: Update the separate 'payments' collection if needed
        // const paymentsQuery = await db.collection('payments').where('orderId', '==', id).get();
        // paymentsQuery.forEach(doc => doc.ref.update({ status: 'Success' }));

        res.json({ message: "Order status updated", paymentStatus: updates.paymentStatus });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getFirestore();
        const orderRef = db.collection('orders').doc(id);
        const doc = await orderRef.get();

        if (!doc.exists) return res.status(404).json({ error: "Order not found" });
        const currentData = doc.data();

        // Lock Logic: Cannot delete if Collected/Delivered AND Paid
        if ((currentData.status === 'Collected' || currentData.status === 'Delivered') && currentData.paymentStatus === 'Paid') {
            return res.status(400).json({ error: "Cannot delete a completed order." });
        }

        await orderRef.delete();
        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
