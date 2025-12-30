import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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

// @route   POST api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', async (req, res) => {
    console.log('📝 Signup Request Received:', req.body);
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        console.log(`✅ SUCCESSFULLY UPDATED: User ${user.email} created in MongoDB.`);

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Update last login
        user.lastLoginAt = Date.now();
        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/saved-situations
// @desc    Get all saved situations
// @access  Private
router.get('/saved-situations', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('savedSituations');
        res.json(user.savedSituations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/saved-situations
// @desc    Save a situation
// @access  Private
router.post('/saved-situations', auth, async (req, res) => {
    try {
        const { ruleId, title, verdict, summary } = req.body;
        const user = await User.findById(req.user.id);

        // Check if already saved
        if (user.savedSituations.some(s => s.ruleId === ruleId)) {
            return res.status(400).json({ msg: 'Situation already saved' });
        }

        user.savedSituations.unshift({ ruleId, title, verdict, summary });
        await user.save();
        res.json(user.savedSituations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/auth/saved-situations/:ruleId
// @desc    Remove a saved situation
// @access  Private
router.delete('/saved-situations/:ruleId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.savedSituations = user.savedSituations.filter(
            s => s.ruleId !== req.params.ruleId
        );
        await user.save();
        res.json(user.savedSituations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;
