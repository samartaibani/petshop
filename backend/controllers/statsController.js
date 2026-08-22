const { getFirestore } = require('firebase-admin/firestore');

exports.getPublicStats = async (req, res) => {
    try {
        const db = getFirestore();

        // Count Categories
        const categoriesSnapshot = await db.collection('categories').get();
        const totalCategories = categoriesSnapshot.size;

        // Count Orders
        // Note: For orders, a simple .get().then(snap => snap.size) is fine since the dataset is smallish
        const ordersSnapshot = await db.collection('orders').get();
        const totalOrders = ordersSnapshot.size;

        // Count Customers (Users where role is 'user' or just all users)
        const usersSnapshot = await db.collection('users').where('role', '==', 'user').get();
        const totalCustomers = usersSnapshot.size;

        res.status(200).json({
            totalCategories,
            totalOrders,
            totalCustomers
        });

    } catch (error) {
        console.error("Error fetching public stats:", error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
};
