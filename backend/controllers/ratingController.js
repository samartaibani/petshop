const { getFirestore } = require('firebase-admin/firestore');

// Add or update a product rating
exports.addRating = async (req, res) => {
    try {
        const { productId, rating, message } = req.body;
        const userId = req.user.uid;

        if (!productId || rating === undefined) {
            return res.status(400).json({ error: "Product ID and rating are required" });
        }

        const db = getFirestore();
        const ratingDocId = `${userId}_${productId}`;
        const ratingRef = db.collection('ratings').doc(ratingDocId);

        // Store or update the rating
        await ratingRef.set({
            userId,
            productId,
            rating: Number(rating),
            message: message || '',
            createdAt: new Date().toISOString()
        });

        // Recalculate average rating for the product
        const snapshot = await db.collection('ratings').where('productId', '==', productId).get();
        let totalRatings = snapshot.size;
        let sumRatings = 0;

        snapshot.docs.forEach(doc => {
            sumRatings += Number(doc.data().rating);
        });

        let averageRating = totalRatings > 0 ? (sumRatings / totalRatings) : 0;
        // Round to 1 decimal place
        averageRating = Math.round(averageRating * 10) / 10;

        // Update the product document with new stats
        await db.collection('products').doc(productId).update({
            averageRating,
            ratingCount: totalRatings
        });

        res.status(200).json({
            message: "Rating submitted successfully",
            averageRating,
            ratingCount: totalRatings
        });

    } catch (error) {
        console.error("Error adding rating:", error);
        res.status(500).json({ error: "Failed to submit rating" });
    }
};

// Get all ratings for a product
exports.getProductRatings = async (req, res) => {
    try {
        const { productId } = req.params;
        const db = getFirestore();

        const snapshot = await db.collection('ratings')
            .where('productId', '==', productId)
            .get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const ratings = [];

        // Use Promise.all to fetch user info for each rating concurrently
        const ratingPromises = snapshot.docs.map(async (doc) => {
            const data = doc.data();
            let userName = 'Anonymous';
            let userImageUrl = '';

            try {
                // Fetch the user document corresponding to this rating
                const userDoc = await db.collection('users').doc(data.userId).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    userName = userData.name || userData.username || 'Anonymous User';
                    userImageUrl = userData.profileImage || '';
                }
            } catch (err) {
                console.error("Failed to fetch user for rating:", err);
            }

            return {
                id: doc.id,
                ...data,
                userName,
                userImageUrl
            };
        });

        const resolvedRatings = await Promise.all(ratingPromises);

        // Sort by newest first
        resolvedRatings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json(resolvedRatings);
    } catch (error) {
        console.error("Error fetching ratings:", error);
        res.status(500).json({ error: "Failed to fetch ratings" });
    }
};
