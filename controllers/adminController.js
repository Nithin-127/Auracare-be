const userModel = require('../models/userModel');
const donorModel = require('../models/donorModel');
const receiverModel = require('../models/receiverModel');
const messageModel = require('../models/messageModel');

exports.saveMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const newMessage = new messageModel({ name, email, subject, message });
        await newMessage.save();
        res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to send message" });
    }
};

exports.getAllMessages = async (req, res) => {
    try {
        const messages = await messageModel.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};

exports.getStats = async (req, res) => {
    try {
        const totalUsers = await userModel.countDocuments();
        const totalDonors = await donorModel.countDocuments();
        const totalReceivers = await receiverModel.countDocuments();
        const pendingDonors = await donorModel.countDocuments({ status: 'pending' });
        const pendingReceivers = await receiverModel.countDocuments({ status: 'pending' });

        res.status(200).json({
            totalUsers,
            totalDonors,
            totalReceivers,
            pendingDonors,
            pendingReceivers
        });
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ message: "Error occurred in the server" });
    }
};

exports.updateDonorStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const donor = await donorModel.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.status(200).json({ message: `Donor status updated to ${status}`, donor });
    } catch (error) {
        res.status(500).json({ message: "Error updating status" });
    }
};

exports.updateReceiverStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const receiver = await receiverModel.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.status(200).json({ message: `Receiver status updated to ${status}`, receiver });
    } catch (error) {
        res.status(500).json({ message: "Error updating status" });
    }
};
