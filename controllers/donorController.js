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

        // Check if donor already exists
        const existingDonor = await donorModel.findOne({ userId: req.userId });
        if (existingDonor) {
            return res.status(409).json({ message: "You are already registered as a donor" });
        }

        const files = req.files || {};
        const photo = files['photo'] ? files['photo'][0].filename : null;
        const witnessPhoto = files['witnessPhoto'] ? files['witnessPhoto'][0].filename : null;

        if (!photo || !witnessPhoto) {
            return res.status(400).json({ message: "Both profile photo and witness photo are required" });
        }

        // Parse organs if it's coming as a JSON string from form-data
        let parsedOrgans = organs;
        try {
            if (typeof organs === 'string') {
                parsedOrgans = JSON.parse(organs);
            }
        } catch (e) {
            console.error("Error parsing organs JSON:", e);
            return res.status(400).json({ message: "Invalid organs data format" });
        }

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
            try {
                const userModel = require('../models/userModel');
                updatedUser = await userModel.findByIdAndUpdate(req.userId, { profilePic: photo, role: 'donor' }, { new: true, runValidators: true });
            } catch (userError) {
                console.error("User Update Error during Donor Registration:", userError);
                // We don't fail the request here, as the donor record is already created.
                // However, the frontend might depend on the updated user object.
            }
        }

        res.status(201).json({
            message: "Donor registration submitted successfully",
            donor: newDonor,
            user: updatedUser
        });
    } catch (error) {
        console.error("Donor Registration Error:", error);
        if (error.code === 11000) {
            return res.status(409).json({ message: "Duplicate entry found. You might already be registered." });
        }
        res.status(500).json({ message: `Registration failed: ${error.message}` });
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
