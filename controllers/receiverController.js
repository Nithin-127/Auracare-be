const receiverModel = require('../models/receiverModel');

exports.registerReceiver = async (req, res) => {
    try {
        const {
            firstName, lastName, email, phone, dob, gender,
            bloodGroup, address, city, state, organNeeded, urgency,
            hospitalName, doctorInCharge
        } = req.body;

        const photo = req.files['photo'] ? req.files['photo'][0].filename : null;
        const identityCard = req.files['identityCard'] ? req.files['identityCard'][0].filename : null;

        const newReceiver = new receiverModel({
            userId: req.userId,
            firstName, lastName, email, phone, dob, gender,
            bloodGroup, address, city, state,
            organNeeded, urgency,
            photo,
            identityCard,
            hospitalName,
            doctorInCharge
        });

        await newReceiver.save();

        let updatedUser = null;
        // Update user model profile picture if photo is provided
        if (photo) {
            const userModel = require('../models/userModel');
            updatedUser = await userModel.findByIdAndUpdate(req.userId, { profilePic: photo }, { new: true });
        }

        res.status(201).json({
            message: "Recipient request submitted successfully",
            receiver: newReceiver,
            user: updatedUser
        });
    } catch (error) {
        console.error("Receiver Registration Error:", error);
        res.status(500).json({ message: "Error occurred in the server" });
    }
};

exports.getAllReceivers = async (req, res) => {
    try {
        const receivers = await receiverModel.find().populate('userId', 'fullName email');
        res.status(200).json(receivers);
    } catch (error) {
        console.error("Get Receivers Error:", error);
        res.status(500).json({ message: "Error occurred in the server" });
    }
};

exports.getReceiverByUserId = async (req, res) => {
    try {
        const receiver = await receiverModel.findOne({ userId: req.params.userId });
        res.status(200).json(receiver);
    } catch (error) {
        res.status(500).json({ message: "Error occurred in the server" });
    }
};

exports.getApprovedReceivers = async (req, res) => {
    try {
        const approvedReceivers = await receiverModel.find({ status: 'approved' });
        res.status(200).json(approvedReceivers);
    } catch (error) {
        res.status(500).json({ message: "Error occurred in the server" });
    }
};
