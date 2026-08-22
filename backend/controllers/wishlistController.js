const { getFirestore } = require('firebase-admin/firestore');

// Add item to wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.uid;

        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" });
        }

        const db = getFirestore();
        const wishlitsRef = db.collection('wishlist');

        // Check if item already in wishlist
        const snapshot = await wishlitsRef
            .where('userId', '==', userId)
            .where('productId', '==', productId)
            .get();

        if (!snapshot.empty) {
            return res.status(400).json({ error: "Product is already in your wishlist" });
        }

        const newWishlistItem = {
            userId,
            productId,
            createdAt: new Date().toISOString()
        };

        const docRef = await wishlitsRef.add(newWishlistItem);

        res.status(201).json({ message: "Added to wishlist successfully", id: docRef.id, ...newWishlistItem });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({ error: "Failed to add to wishlist" });
    }
};

// Get user wishlist items with product details
exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user.uid;
        const db = getFirestore();

        // 1. Get wishlist items for this user
        const snapshot = await db.collection('wishlist')
            .where('userId', '==', userId)
            .get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const wishlistItems = [];
        snapshot.forEach(doc => {
            wishlistItems.push({ id: doc.id, ...doc.data() });
        });

        // 2. Fetch product details for each wishlist item
        const populatedWishlist = [];
        for (let item of wishlistItems) {
            const productDoc = await db.collection('products').doc(item.productId).get();
            if (productDoc.exists) {
                populatedWishlist.push({
                    wishlistId: item.id,
                    product: { id: productDoc.id, ...productDoc.data() }
                });
            } else {
                // If product was deleted, maybe we just return the ID or filter it out
                populatedWishlist.push({
                    wishlistId: item.id,
                    product: null
                });
            }
        }

        res.status(200).json(populatedWishlist);
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ error: "Failed to fetch wishlist" });
    }
};

// Remove item from wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.uid;

        const db = getFirestore();
        const wishlitsRef = db.collection('wishlist');

        // We delete by productId and userId
        const snapshot = await wishlitsRef
            .where('userId', '==', userId)
            .where('productId', '==', productId)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ error: "Item not found in wishlist" });
        }

        // Delete all matching documents (usually just one)
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        res.status(200).json({ message: "Removed from wishlist successfully" });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        res.status(500).json({ error: "Failed to remove from wishlist" });
    }
};
