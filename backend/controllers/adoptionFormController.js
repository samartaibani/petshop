const { getFirestore } = require('firebase-admin/firestore');

exports.getForm = async (req, res) => {
    try {
        const userId = req.user.uid;
        const db = getFirestore();
        const snapshot = await db.collection('adoption_forms').where('userId', '==', userId).limit(1).get();

        if (snapshot.empty) {
            return res.json(null);
        }

        const doc = snapshot.docs[0];
        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error(`[adoptionFormController] Error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.saveForm = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { formData, userImage, familyMembers } = req.body;
        const db = getFirestore();

        // Check if already exists
        const existing = await db.collection('adoption_forms').where('userId', '==', userId).get();
        if (!existing.empty) {
            return res.status(400).json({ error: "Form already exists. Use update instead." });
        }

        const newDoc = db.collection('adoption_forms').doc();
        await newDoc.set({
            userId,
            formData,
            userImage: userImage || '',
            familyMembers: Number(familyMembers) || 1,
            updatedAt: new Date().toISOString()
        });

        res.status(201).json({ id: newDoc.id, message: "Form saved successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateForm = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        const { formData, userImage, familyMembers } = req.body;
        const db = getFirestore();

        // Ownership check
        const docRef = db.collection('adoption_forms').doc(id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) return res.status(404).json({ error: "Not found" });
        if (docSnap.data().userId !== userId) return res.status(403).json({ error: "Unauthorized" });

        const updateData = {
            formData,
            updatedAt: new Date().toISOString()
        };
        if (userImage !== undefined) updateData.userImage = userImage;
        if (familyMembers !== undefined) updateData.familyMembers = Number(familyMembers);

        await docRef.update(updateData);

        res.json({ message: "Form updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteForm = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        const db = getFirestore();

        const docRef = db.collection('adoption_forms').doc(id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) return res.status(404).json({ error: "Not found" });
        if (docSnap.data().userId !== userId) return res.status(403).json({ error: "Unauthorized" });

        await docRef.delete();
        res.json({ message: "Form deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
