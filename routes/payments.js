const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { amount, projectId, projectName } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Donation to ${projectName}`,
                    },
                    unit_amount: amount * 100,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `https://crowd-funding-client-ebd6.vercel.app/success?session_id={CHECKOUT_SESSION_ID}&project_id=${projectId}&amount=${amount}`,
            cancel_url: `https://crowd-funding-client-ebd6.vercel.app/cancel`,
            metadata: { projectId }
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Optional: Verify payment on success page
router.post('/verify-payment', async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        res.json({
            success: session.payment_status === 'paid',
            session: session
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;