import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLoginAt: {
        type: Date
    },
    savedSituations: [{
        ruleId: { type: String, required: true },
        title: { type: String, required: true },
        verdict: { type: String, required: true }, // CAN, CANNOT, DEPENDS
        date: { type: Date, default: Date.now },
        summary: String // Optional: brief summary for display
    }]
});

export default mongoose.model('User', UserSchema);
