const { getFirestore } = require('firebase-admin/firestore');

exports.createRequest = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { petId, formData, userImage, familyMembers } = req.body;
        const db = getFirestore();
        const newDoc = db.collection('adoption_requests').doc();
        await newDoc.set({
            petId,
            userId,
            formData,
            userImage: userImage || '',
            familyMembers: Number(familyMembers) || 1,
            status: 'Pending',
            createdAt: new Date().toISOString()
        });
        res.status(201).json({ id: newDoc.id, message: "Request created" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRequests = async (req, res) => {
    try {
        const userId = req.user.uid;
        const role = req.user.role;
        const db = getFirestore();
        let query = db.collection('adoption_requests');

        // Admin can see everything, User only their own
        if (role !== 1) {
            query = query.where('userId', '==', userId);
        }
        
        const snapshot = await query.get();

        let requests = [];
        for (let doc of snapshot.docs) {
            let data = doc.data();
            let petSnap = await db.collection('products').doc(data.petId).get();
            if (petSnap.exists) {
                data.petData = { id: petSnap.id, ...petSnap.data() };
            } else {
                data.petData = null;
            }
            requests.push({ id: doc.id, ...data });
        }
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const db = getFirestore();
        const docRef = db.collection('adoption_requests').doc(id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) return res.status(404).json({ error: "Not found" });

        await docRef.update({ status });

        // Phase 4: If Approved, update pet product status to Adopted and track the time
        if (status === 'Approved') {
            const data = docSnap.data();

            // 1. Update the pet product
            if (data.petId) {
                await db.collection('products').doc(data.petId).update({
                    status: 'Adopted',
                    statusUpdatedAt: new Date().toISOString()
                });
            }

            // 2. Reject other pending requests for this pet
            const otherRequests = await db.collection('adoption_requests')
                .where('petId', '==', data.petId)
                .where('status', '==', 'Pending')
                .get();

            let batch = db.batch();
            otherRequests.docs.forEach(d => {
                if (d.id !== id) {
                    batch.update(d.ref, { status: 'Rejected' });
                }
            });
            await batch.commit();
        }

        res.json({ message: "Status updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        const { formData, userImage, familyMembers } = req.body;
        const db = getFirestore();

        const docRef = db.collection('adoption_requests').doc(id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) return res.status(404).json({ error: "Not found" });
        if (docSnap.data().userId !== userId) return res.status(403).json({ error: "Unauthorized" });

        const updateData = { formData };
        if (userImage !== undefined) updateData.userImage = userImage;
        if (familyMembers !== undefined) updateData.familyMembers = Number(familyMembers);

        await docRef.update(updateData);
        res.json({ message: "Request updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        const db = getFirestore();

        // Phase 5: Get request details before deletion to check if we need to revert pet status
        const docRef = db.collection('adoption_requests').doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) return res.status(404).json({ error: "Not found" });
        if (docSnap.data().userId !== userId) return res.status(403).json({ error: "Unauthorized" });

        const data = docSnap.data();
        // If the request was Approved or Paid, the pet status was set to 'Adopted'. 
        // We need to revert it to 'Available' if the request is cancelled/deleted.
        if ((data.status === 'Approved' || data.status === 'Paid') && data.petId) {
            await db.collection('products').doc(data.petId).update({
                status: 'Available',
                statusUpdatedAt: null
            });
        }

        await docRef.delete();
        res.json({ message: "Request deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.payFee = async (req, res) => {
    try {
        const { id } = req.params; // Adoption Request ID
        const userId = req.user.uid;
        const { amount, paymentMethod, transactionId, paymentDetails } = req.body;
        const db = getFirestore();

        // 1. Verify Request exists and is Approved
        const requestRef = db.collection('adoption_requests').doc(id);
        const requestSnap = await requestRef.get();

        if (!requestSnap.exists) {
            return res.status(404).json({ error: "Adoption request not found." });
        }
        if (requestSnap.data().userId !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        if (requestSnap.data().status !== 'Approved') {
            return res.status(400).json({ error: "Only approved requests can be paid." });
        }

        // 2. Save Payment Data to 'adoption_fees' collection
        const newFeeDoc = db.collection('adoption_fees').doc();
        await newFeeDoc.set({
            adoptionRequestId: id,
            userId,
            amount: Number(amount),
            paymentMethod, // 'Card' or 'UPI'
            transactionId,
            paymentDetails: paymentDetails || {},
            status: 'Success',
            paidAt: new Date().toISOString()
        });

        // 3. Update Adoption Request Status to 'Paid'
        await requestRef.update({
            status: 'Paid',
            paymentStatus: true,
            feeId: newFeeDoc.id
        });

        res.status(200).json({
            message: "Payment successful and adoption request updated.",
            feeId: newFeeDoc.id
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateDeliveryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { deliveryStatus, destinationBranch } = req.body;
        const db = getFirestore();
        const docRef = db.collection('adoption_requests').doc(id);

        const docSnap = await docRef.get();
        if (!docSnap.exists) return res.status(404).json({ error: "Not found" });

        const updateData = { deliveryStatus };
        if (destinationBranch) updateData.destinationBranch = destinationBranch;

        // If ready for pickup, calculate deadline (7 days from now)
        if (deliveryStatus === 'Ready for Pickup') {
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + 7);
            updateData.pickupDeadline = deadline.toISOString();
        }

        // If 'Handed Over', sync the main adoption status to Completed
        if (deliveryStatus === 'Handed Over') {
            updateData.status = 'Completed';
        }

        await docRef.update(updateData);
        res.json({ message: "Delivery status updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
