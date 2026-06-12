const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Get Images from Cloudinary
// @route   GET /api/admin/cloudinary/images
// @access  Private/Admin
exports.getCloudinaryImages = async (req, res) => {
    try {
        const { folder, next_cursor } = req.query;
        // Search by folder ("Asset Folder" mode)
        // If folder is provided, use it. If not, default to 'mahalaxmi_tailoring' (or whatever root user uses via picker)
        // Note: 'mahalaxmi_tailoring' seems to be the root folder name in use.
        const folderQuery = folder || 'mahalaxmi_tailoring';

        console.log(`Cloudinary Search: folder:${folderQuery}`);

        let expression = `folder:${folderQuery}`; // Matches exact folder path

        const result = await cloudinary.search
            .expression(expression)
            .sort_by('created_at', 'desc')
            .max_results(50)
            .next_cursor(next_cursor)
            .execute();

        res.json({
            images: result.resources,
            next_cursor: result.next_cursor
        });
    } catch (error) {
        console.error("Cloudinary Error:", error);
        res.status(500).json({ message: 'Error fetching images from Cloudinary', error: error.message });
    }
};

// @desc    Get Folders
// @route   GET /api/admin/cloudinary/folders
exports.getCloudinaryFolders = async (req, res) => {
    try {
        const result = await cloudinary.api.root_folders();
        // Recurse or just show root? Admin API for subfolders exists too.
        // For now, let's just get subfolders of 'mahalaxmi_tailoring' if possible
        const { folder } = req.query;
        let subfolders;
        if (folder) {
            subfolders = await cloudinary.api.sub_folders(folder);
        } else {
            subfolders = await cloudinary.api.root_folders();
        }

        res.json(subfolders);
    } catch (error) {
        console.error("Cloudinary Folders Error:", error);
        res.status(500).json({ message: 'Error fetching folders' });
    }
};

// @desc    Upload Images to Cloudinary
// @route   POST /api/admin/cloudinary/upload
// @access  Private/Admin
exports.uploadImages = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const { folder } = req.body;
        const targetFolder = folder || 'mahalaxmi_tailoring';

        const uploadPromises = files.map(file => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: targetFolder,
                        resource_type: 'auto'
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(file.buffer);
            });
        });

        const results = await Promise.all(uploadPromises);

        // Format response to match what the frontend expects
        const images = results.map(img => ({
            public_id: img.public_id,
            secure_url: img.secure_url,
            created_at: img.created_at
        }));

        res.json({ images });

    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        res.status(500).json({ message: 'Error uploading images', error: error.message });
    }
};

