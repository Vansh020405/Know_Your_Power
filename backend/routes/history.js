import express from 'express';
import jwt from 'jsonwebtoken';
import History from '../models/History.js';

const router = express.Router();

// Middleware for token verification
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
};

// @route   POST api/history
// @desc    Add an item to history
// @access  Private
router.post('/', auth, async (req, res) => {
    const { feature, itemId, summaryText } = req.body;

    try {
        const newHistory = new History({
            userId: req.user.id,
            feature,
            itemId,
            summaryText
        });

        const savedHistory = await newHistory.save();
        res.json(savedHistory);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/history
// @desc    Get all history for user, most recent first
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const history = await History.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;
