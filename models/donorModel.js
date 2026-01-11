const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
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
    organs: {
        kidneys: { type: Boolean, default: false },
        liver: { type: Boolean, default: false },
        heart: { type: Boolean, default: false },
        lungs: { type: Boolean, default: false },
        pancreas: { type: Boolean, default: false },
        eyes: { type: Boolean, default: false },
    },
    hospitalName: { type: String, required: true },
    doctorInCharge: { type: String, required: true },
    photo: { type: String }, // Path to uploaded photo
    witnessName: { type: String, required: true },
    witnessRelation: { type: String, required: true },
    witnessPhoto: { type: String }, // Path to witness photo
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'approved', 'rejected']
    }
}, { timestamps: true });

const donorModel = mongoose.model('donors', donorSchema);

module.exports = donorModel;
