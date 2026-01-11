const userModel = require('../models/userModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.trim() : '');

exports.createCheckoutSession = async (req, res) => {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error("CRITICAL: STRIPE_SECRET_KEY is missing from .env");
            return res.status(500).json({ message: "Server configuration error: Stripe key missing" });
        }

        console.log("Creating checkout session for user:", req.userId);

        const userId = req.userId; // From jwtMiddleware
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'AuraCare Premium Membership',
                            description: 'Get exclusive access to book doctor consultations',
                        },
                        unit_amount: 4900, // $49.00
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/premium`,
            client_reference_id: userId.toString(),
            customer_email: user.email,
        });

        res.status(200).json({ id: session.id, url: session.url });
    } catch (error) {
        console.error("Stripe Session Error:", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Error creating payment session",
            error: error
        });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const userId = session.client_reference_id;
            await userModel.findByIdAndUpdate(userId, { isPremium: true });
            res.status(200).json({ message: "Payment verified, premium activated", isPremium: true });
        } else {
            res.status(400).json({ message: "Payment not completed" });
        }
    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ message: "Error verifying payment" });
    }
};
