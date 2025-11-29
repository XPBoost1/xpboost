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
// Contact Form Endpoint
app.post('/api/contact', async (req, res) => {
    const { fullName, email, phone, preferredContact, services, message } = req.body;

    const mailOptions = {
        from: `"${fullName}" <${email}>`, // Sender address
        to: process.env.EMAIL_USER, // List of receivers
        subject: `New Contact Form Submission from ${fullName}`,
        html: `
            <h3>New Contact Request</h3>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Preferred Contact:</strong> ${preferredContact || 'N/A'}</p>
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
        res.status(500).json({ success: false, message: error.message });
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
        companyName, companySize, industry,
        goals, other_goal,
        timeline,
        budget,
        services, other_service, additional_info,
        name, email
    } = req.body;

    // Format goals to include custom "other" text
    let goalsDisplay;
    if (Array.isArray(goals)) {
        goalsDisplay = goals.map(goal => {
            if (goal === 'other' && other_goal) {
                return `other (${other_goal})`;
            }
            return goal;
        }).join(', ');
    } else if (goals) {
        goalsDisplay = goals;
    } else {
        goalsDisplay = 'None selected';
    }

    // Format services to include custom "other" text
    let servicesDisplay;
    if (Array.isArray(services)) {
        servicesDisplay = services.map(service => {
            if (service === 'other' && other_service) {
                return `other (${other_service})`;
            }
            return service;
        }).join(', ');
    } else if (services) {
        servicesDisplay = services;
    } else {
        servicesDisplay = 'None selected';
    }

    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.EMAIL_USER,
        subject: `New Quote Request from ${companyName}`,
        html: `
            <h2>New Quote Request</h2>
            <br>
            <h3>Company Information</h3>
            <p><strong>Company Name:</strong> ${companyName}</p>
            <p><strong>Company Size:</strong> ${companySize || 'Not specified'}</p>
            <p><strong>Industry:</strong> ${industry}</p>
            <br>
            <h3>Project Goals</h3>
            <p><strong>Goals:</strong> ${goalsDisplay}</p>
            <br>
            <h3>Timeline</h3>
            <p><strong>Project Timeline:</strong> ${timeline}</p>
            <br>
            <h3>Budget</h3>
            <p><strong>Budget Range:</strong> ${budget}</p>
            <br>
            <h3>Services & Requirements</h3>
            <p><strong>Services Needed:</strong> ${servicesDisplay}</p>
            <p><strong>Additional Information:</strong></p>
            <p>${additional_info || 'None provided'}</p>
            <br>
            <h3>Contact Details</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Quote request sent successfully!' });
    } catch (error) {
        console.error('Error sending quote email:', error);
        res.status(500).json({ success: false, message: error.message });
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
