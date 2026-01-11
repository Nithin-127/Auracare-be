const donorModel = require('../models/donorModel');
const requestModel = require('../models/requestModel');
const receiverModel = require('../models/receiverModel');

exports.contactDonor = async (req, res) => {
    try {
        const { donorUserId, receiverUserId } = req.body;

        // Check if request already exists
        const existingRequest = await requestModel.findOne({ donorId: donorUserId, receiverId: receiverUserId });
        if (existingRequest) {
            return res.status(409).json({ message: "Request already sent" });
        }

        const newRequest = new requestModel({
            donorId: donorUserId,
            receiverId: receiverUserId
        });

        await newRequest.save();
        res.status(201).json({ message: "Contact request sent successfully" });
    } catch (error) {
        console.error("Contact Donor Error:", error);
        res.status(500).json({ message: "Error occurred in the server" });
    }
};

exports.getDonorRequests = async (req, res) => {
    try {
        const { donorId } = req.params;
        const requests = await requestModel.find({ donorId }).populate({
            path: 'receiverId',
            select: 'fullName email'
        });

        // Get detailed profiles for each receiver
        const detailedRequests = await Promise.all(requests.map(async (req) => {
            const profile = await receiverModel.findOne({ userId: req.receiverId._id });
            return {
                ...req._doc,
                receiverProfile: profile
            };
        }));

        res.status(200).json(detailedRequests);
    } catch (error) {
        console.error("Get Donor Requests Error:", error);
        res.status(500).json({ message: "Error occurred in the server" });
    }
};

exports.registerDonor = async (req, res) => {
    try {
        const {
            firstName, lastName, email, phone, dob, gender,
            bloodGroup, address, city, state, organs,
            witnessName, witnessRelation, hospitalName, doctorInCharge
        } = req.body;

        const photo = req.files['photo'] ? req.files['photo'][0].filename : null;
        const witnessPhoto = req.files['witnessPhoto'] ? req.files['witnessPhoto'][0].filename : null;

        // Parse organs if it's coming as a JSON string from form-data
        const parsedOrgans = typeof organs === 'string' ? JSON.parse(organs) : organs;

        const newDonor = new donorModel({
            userId: req.userId,
            firstName, lastName, email, phone, dob, gender,
            bloodGroup, address, city, state,
            organs: parsedOrgans,
            photo,
            witnessName, witnessRelation,
            witnessPhoto,
            hospitalName,
            doctorInCharge
        });

        await newDonor.save();

        let updatedUser = null;
        // Update user model profile picture if photo is provided
        if (photo) {
            const userModel = require('../models/userModel');
            updatedUser = await userModel.findByIdAndUpdate(req.userId, { profilePic: photo }, { new: true });
        }

        res.status(201).json({
            message: "Donor registration submitted successfully",
            donor: newDonor,
            user: updatedUser
        });
    } catch (error) {
        console.error("Donor Registration Error:", error);
        res.status(500).json({ message: "Error occurred in the server" });
    }
};

exports.getAllDonors = async (req, res) => {
    try {
        const donors = await donorModel.find().populate('userId', 'fullName email');
        res.status(200).json(donors);
    } catch (error) {
        console.error("Get Donors Error:", error);
        res.status(500).json({ message: "Error occurred in the server" });
    }
};

exports.getDonorByUserId = async (req, res) => {
    try {
        const donor = await donorModel.findOne({ userId: req.params.userId });
        res.status(200).json(donor);
    } catch (error) {
        res.status(500).json({ message: "Error occurred in the server" });
    }
};

exports.getApprovedDonors = async (req, res) => {
    try {
        const donors = await donorModel.find({ status: 'approved' });
        res.status(200).json(donors);
    } catch (error) {
        console.error("Get Approved Donors Error:", error);
        res.status(500).json({ message: "Error occurred in the server" });
    }
};
