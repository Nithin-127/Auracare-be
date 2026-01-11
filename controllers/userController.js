const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.registerUser = async (req, res) => {
    const { fullName, email, password, role, adminCode } = req.body;

    try {
        if (!fullName || !email || !password || !role) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        // Admin verification - Now disabled via registration
        if (role === 'admin') {
            return res.status(403).json({ message: "Admin registration is not allowed" });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        const newUser = new userModel({ fullName, email, password, role });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Error occurred in the server" });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Please enter email and password" });
        }

        if (email === "admin@gmail.com" && password === "admin") {
            let user = await userModel.findOne({ email: "admin@gmail.com" });
            if (!user) {
                user = new userModel({
                    fullName: "Admin",
                    email: "admin@gmail.com",
                    password: "admin",
                    role: "admin"
                });
                await user.save();
            }

            const payload = {
                userId: user._id,
                email: user.email,
                role: user.role
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET);

            return res.status(200).json({
                message: "Login successful",
                token,
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                    profilePic: user.profilePic,
                    isPremium: user.isPremium
                }
            });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No such user found" });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        const payload = {
            userId: user._id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET);

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                profilePic: user.profilePic,
                isPremium: user.isPremium
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Error occurred in the server" });
    }
};

exports.googleLogin = async (req, res) => {
    const { token, role } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let user = await userModel.findOne({ email });

        if (user) {
            // User exists - Login
            const userRole = user.role;
            const token = jwt.sign({ userId: user._id, email: user.email, role: userRole }, process.env.JWT_SECRET);

            return res.status(200).json({
                message: "Login successful",
                token,
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: userRole,
                    profilePic: user.profilePic,
                    isPremium: user.isPremium
                }
            });
        } else {
            // User does not exist - Register
            if (!role) {
                return res.status(400).json({ message: "Please select a role to register with Google" });
            }

            if (role === 'admin') {
                return res.status(403).json({ message: "Admin registration is not allowed" });
            }

            const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

            user = new userModel({
                fullName: name,
                email,
                password,
                role,
                profilePic: picture
            });
            await user.save();

            const jwtToken = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET);

            res.status(201).json({
                message: "Registration successful",
                token: jwtToken,
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                    profilePic: user.profilePic,
                    isPremium: user.isPremium
                }
            });
        }

    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(500).json({ message: "Google Login failed" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { fullName, password } = req.body;
        const profilePic = req.file ? req.file.filename : undefined;
        const userId = req.params.id;

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (password) updateData.password = password;
        if (profilePic) updateData.profilePic = profilePic;

        const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true });
        res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Error occurred in the server" });
    }
};
