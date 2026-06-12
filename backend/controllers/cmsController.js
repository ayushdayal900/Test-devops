const CMS = require('../models/CMS');

// @desc    Get all CMS items by type
// @route   GET /api/cms/:type
// @access  Public
exports.getCMSItems = async (req, res) => {
    try {
        const { type } = req.params;
        const items = await CMS.find({ type, isActive: true }).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all CMS items (Admin)
// @route   GET /api/cms/admin/:type
// @access  Private/Admin
exports.getAdminCMSItems = async (req, res) => {
    try {
        const { type } = req.params;
        const items = await CMS.find({ type }).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create CMS item
// @route   POST /api/cms
// @access  Private/Admin
exports.createCMSItem = async (req, res) => {
    try {
        const item = await CMS.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update CMS item
// @route   PUT /api/cms/:id
// @access  Private/Admin
exports.updateCMSItem = async (req, res) => {
    try {
        const item = await CMS.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete CMS item
// @route   DELETE /api/cms/:id
// @access  Private/Admin
exports.deleteCMSItem = async (req, res) => {
    try {
        await CMS.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
