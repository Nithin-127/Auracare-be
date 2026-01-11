const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'accepted', 'rejected']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const requests = mongoose.model('requests', requestSchema);
module.exports = requests;
