require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.')); // Serve static files from current directory

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify Transporter
transporter.verify((error, success) => {
    if (error) {
        console.error('Transporter verification failed:', error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

// Debug Endpoint (Temporary)
app.get('/api/debug-env', (req, res) => {
    res.json({
        message: 'Environment Variable Debug',
        emailUserConfigured: !!process.env.EMAIL_USER,
        emailPassConfigured: !!process.env.EMAIL_PASS,
        emailUserLength: process.env.EMAIL_USER ? process.env.EMAIL_USER.length : 0,
        emailPassLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
    });
});

// Contact Form Endpoint
app.post('/api/contact', async (req, res) => {
    const { name, email, company, budget, services, message } = req.body;

    const mailOptions = {
        from: `"${name}" <${email}>`, // Sender address (Note: Gmail might override this with auth user)
        to: process.env.EMAIL_USER, // List of receivers
        subject: `New Contact Form Submission from ${name}`,
        html: `
            <h3>New Contact Request</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Company:</strong> ${company || 'N/A'}</p>
            <p><strong>Budget:</strong> ${budget}</p>
            <p><strong>Services:</strong> ${services ? services.join(', ') : 'None'}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send message.' });
    }
});

// Newsletter Subscription Endpoint
app.post('/api/subscribe', async (req, res) => {
    const { email } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to admin for now
        subject: 'New Newsletter Subscriber',
        html: `
            <h3>New Subscriber</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p>Please add this email to the newsletter list.</p>
        `
    };

    // Optional: Send confirmation to user
    const userConfirmationOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to NEAHXp Newsletter',
        html: `
            <h3>Welcome!</h3>
            <p>Thank you for subscribing to the NEAHXp newsletter. You'll receive the latest updates on AI and technology.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        await transporter.sendMail(userConfirmationOptions); // Send welcome email
        res.status(200).json({ success: true, message: 'Subscribed successfully!' });
    } catch (error) {
        console.error('Error subscribing:', error);
        res.status(500).json({ success: false, message: 'Failed to subscribe.' });
    }
});

// Quote Form Endpoint
app.post('/api/quote', async (req, res) => {
    const {
        companyName, industry, companySize, website, description,
        objective, secondary_goals, audience,
        timeline, budget, urgency,
        services, features,
        name, email, phone, contact_pref, notes
    } = req.body;

    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.EMAIL_USER,
        subject: `New Quote Request from ${companyName}`,
        html: `
            <h2>New Quote Request</h2>
            
            <h3>Company Information</h3>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Industry:</strong> ${industry}</p>
            <p><strong>Size:</strong> ${companySize}</p>
            <p><strong>Website:</strong> ${website || 'N/A'}</p>
            <p><strong>Description:</strong> ${description || 'N/A'}</p>

            <h3>Project Goals</h3>
            <p><strong>Primary Objective:</strong> ${objective}</p>
            <p><strong>Secondary Goals:</strong> ${Array.isArray(secondary_goals) ? secondary_goals.join(', ') : secondary_goals || 'None'}</p>
            <p><strong>Target Audience:</strong> ${audience || 'N/A'}</p>

            <h3>Timeline & Budget</h3>
            <p><strong>Timeline:</strong> ${timeline}</p>
            <p><strong>Budget:</strong> ${budget}</p>
            <p><strong>Urgency:</strong> ${urgency}</p>

            <h3>Requirements</h3>
            <p><strong>Services Needed:</strong> ${Array.isArray(services) ? services.join(', ') : services || 'None'}</p>
            <p><strong>Specific Features:</strong> ${features || 'N/A'}</p>

            <h3>Contact Details</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Preferred Contact:</strong> ${contact_pref}</p>
            <p><strong>Notes:</strong> ${notes || 'N/A'}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Quote request sent successfully!' });
    } catch (error) {
        console.error('Error sending quote email:', error);
        res.status(500).json({ success: false, message: 'Failed to send quote request.' });
    }
});

// Export the app for serverless deployments (Vercel, etc.)
module.exports = app;

// Only start the server if this file is run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
