import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    feature: {
        type: String,
        required: true,
        enum: ['authority', 'eligibility', 'document']
    },
    itemId: { // questionId or schemeId
        type: String,
        required: true
    },
    summaryText: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('History', HistorySchema);
