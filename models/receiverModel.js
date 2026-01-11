const mongoose = require('mongoose');

const receiverSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: String, required: true },
    gender: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    organNeeded: { type: String, required: true },
    urgency: {
        type: String,
        required: true,
        enum: ['low', 'moderate', 'high', 'critical']
    },
    hospitalName: { type: String, required: true },
    doctorInCharge: { type: String, required: true },
    photo: { type: String },
    identityCard: { type: String }, // Path to ID card file
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'approved', 'rejected']
    }
}, { timestamps: true });

const receiverModel = mongoose.model('receivers', receiverSchema);

module.exports = receiverModel;
