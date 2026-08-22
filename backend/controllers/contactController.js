const { getFirestore } = require('firebase-admin/firestore');
const nodemailer = require('nodemailer');

exports.submitContactForm = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: "Name, email, and message are required" });
        }

        const db = getFirestore();

        // 1. Save to Database (Firestore)
        const newContactMsg = {
            name,
            email,
            phone: phone || '',
            subject: subject || 'No Subject',
            message,
            createdAt: new Date().toISOString(),
            status: 'unread' // Admin can mark it read later
        };

        const docRef = await db.collection('contact_messages').add(newContactMsg);

        // 2. Send Email Notification to Admin using Nodemailer
        // IMPORTANT: The user must configure their real email and app password here!
        const adminEmail = 'samartaibani9@gmail.com'; // User needs to change this
        const emailPassword = 'zadbflrvaovowluw'; // User needs to change this

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: adminEmail,
                pass: emailPassword
            }
        });

        const mailOptions = {
            from: adminEmail,
            to: adminEmail, // Sending to yourself
            replyTo: email, // If you click "reply", it goes to the customer
            subject: `New Contact Request: ${subject || 'General Inquiry'}`,
            text: `You have received a new contact message from ${name} (${email}).\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}`
        };

        try {
            // Attempt to send the email
            // If the credentials are 'YOUR_EMAIL@gmail.com', this will throw an error
            if (adminEmail !== 'YOUR_EMAIL@gmail.com') {
                await transporter.sendMail(mailOptions);
                console.log('Contact email sent successfully!');
            } else {
                console.log('WARNING: Email not sent. Please add your credentials to contactController.js');
            }
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            // We don't want to break the whole request if just the email fails, 
            // since the message is already safely stored in the database.
        }

        res.status(201).json({
            message: "Contact message submitted successfully",
            id: docRef.id
        });

    } catch (error) {
        console.error("Error submitting contact form:", error);
        res.status(500).json({ error: "Failed to submit contact message" });
    }
};
