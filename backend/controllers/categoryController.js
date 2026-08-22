const { getFirestore } = require('firebase-admin/firestore');
// Lazy init


exports.getAllCategories = async (req, res) => {
    try {
        const db = getFirestore();
        const snapshot = await db.collection('categories').get();
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const db = getFirestore();
        const newDoc = db.collection('categories').doc();
        await newDoc.set({
            name,
            status: 'Active',
            createdAt: new Date().toISOString()
        });
        res.status(201).json({ id: newDoc.id, message: "Category created" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getFirestore();
        await db.collection('categories').doc(id).update(req.body);
        res.json({ message: "Category updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getFirestore();
        await db.collection('categories').doc(id).delete();
        res.json({ message: "Category deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
