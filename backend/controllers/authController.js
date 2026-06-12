const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Generate Access Token (Short-lived: 15m)
const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '15m',
    });
};

// Generate Refresh Token (Long-lived: 7d)
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refreshSecret123', {
        expiresIn: '7d',
    });
};

// Cookie Options
const cookieOptions = {
    httpOnly: true,
    secure: true, // Always secure for Vercel/Render
    sameSite: 'None', // Always none for Cross-Site
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const sendEmail = require('../utils/sendEmail');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        if (user) {
            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            // Send Refresh Token in Cookie
            res.cookie('jwt', refreshToken, cookieOptions);

            const { getEmailTemplate } = require('../utils/emailTemplates');

            // Send Welcome Email
            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Welcome to Mahalaxmi Tailors',
                    message: `Hi ${user.firstName}, welcome to Mahalaxmi Tailors! We're excited to have you on board.`,
                    html: getEmailTemplate(
                        `Welcome, ${user.firstName}!`,
                        `<p>Thank you for creating an account with Mahalaxmi Tailors.</p>
                         <p>We specialize in custom stitching, Rajlaxmi designs, and royal Mastani drapes.</p>
                         <p>Explore our latest collections or request a custom design today.</p>`
                    )
                });
            } catch (emailError) {
                console.error('Welcome email failed:', emailError);
            }

            res.status(201).json({
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: accessToken, // Frontend API token
                refreshToken: refreshToken, // Fallback for localStorage
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            // Send Refresh Token in Cookie
            res.cookie('jwt', refreshToken, cookieOptions);

            res.json({
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: accessToken,
                refreshToken: refreshToken,
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public (Validates Cookie or Body)
exports.refresh = async (req, res) => {
    const cookies = req.cookies;
    console.log('DEBUG: Refresh Route Hit');
    console.log('DEBUG: Body Refresh Token:', req.body.refreshToken ? 'Present' : 'Missing');
    console.log('DEBUG: Cookies:', cookies ? Object.keys(cookies) : 'None');
    console.log('DEBUG: Cookie JWT:', cookies?.jwt ? 'Present' : 'Missing');

    let refreshToken = cookies?.jwt;

    // Fallback: Check body if cookie is missing
    if (!refreshToken && req.body.refreshToken) {
        console.log('DEBUG: Using Refresh Token from Body fallback');
        refreshToken = req.body.refreshToken;
    }

    if (!refreshToken) return res.status(401).json({ message: 'Unauthorized - No Refresh Token' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refreshSecret123');

        // Find user
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const accessToken = generateAccessToken(user._id);

        res.json({ token: accessToken });
    } catch (err) {
        return res.status(403).json({ message: 'Forbidden' });
    }
};

// @desc    Logout User
// @route   POST /api/auth/logout
// @access  Public
exports.logout = (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); // No content

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });
    res.json({ message: 'Cookie cleared' });
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.firstName = req.body.firstName || user.firstName;
            user.lastName = req.body.lastName || user.lastName;
            user.phone = req.body.phone || user.phone;

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                token: generateAccessToken(updatedUser._id)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    res.json(req.user);
};
