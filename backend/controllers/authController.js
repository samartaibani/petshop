const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
// Lazy init


exports.register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // 1. Create User in Firebase Authentication
        const userRecord = await getAuth().createUser({
            email,
            password,
            displayName: name
        });

        // 2. Create User Document in Firestore (Role 0 = User)
        const db = getFirestore();
        await db.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            name: name,
            email: email,
            role: 0, // Default to User
            profileImage: '',
            createdAt: new Date().toISOString()
        });

        res.status(201).json({ message: "User registered successfully", uid: userRecord.uid });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    // NOTE: Password validation should ideally happen on Client using Firebase SDK,
    // then send ID Token here. But if we MUST do an API login, we can't easily verification password 
    // without the Client SDK. 
    // STRATEGY: This endpoint will assume the CLIENT has logged in and sent an ID Token 
    // to get the User Role and Details.

    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ error: "ID Token required" });

        // Verify Token
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Get User Role from Firestore
        const db = getFirestore();
        const userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found in database" });
        }

        const userData = userDoc.data();

        res.json({
            message: "Login successful",
            user: {
                uid: uid,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                profileImage: userData.profileImage
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(401).json({ error: "Invalid Token" });
    }
};
