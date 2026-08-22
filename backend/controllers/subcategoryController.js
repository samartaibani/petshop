const { getFirestore } = require('firebase-admin/firestore');

exports.getAllSubCategories = async (req, res) => {
    try {
        const { categoryId } = req.query;
        const db = getFirestore();
        let query = db.collection('subcategories');
        if (categoryId) {
            query = query.where('categoryId', '==', categoryId);
        }
        const snapshot = await query.get();
        const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(subs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createSubCategory = async (req, res) => {
    try {
        const { name, categoryId } = req.body;
        const db = getFirestore();
        const newDoc = db.collection('subcategories').doc();
        await newDoc.set({ name, categoryId, createdAt: new Date().toISOString() });
        res.status(201).json({ id: newDoc.id, message: "SubCategory created" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getFirestore();
        await db.collection('subcategories').doc(id).update(req.body);
        res.json({ message: "SubCategory updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getFirestore();
        await db.collection('subcategories').doc(id).delete();
        res.json({ message: "SubCategory deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
