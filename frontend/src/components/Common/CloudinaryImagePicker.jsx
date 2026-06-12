import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Image as ImageIcon, Check, Folder, ChevronRight, Loader, X, ArrowLeft, UploadCloud } from 'lucide-react';

const CloudinaryImagePicker = ({ onSelect, onClose, multiple = false }) => {
    const [images, setImages] = useState([]);
    const [folders, setFolders] = useState([]);
    const [currentPath, setCurrentPath] = useState('mahalaxmi_tailoring');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [nextCursor, setNextCursor] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [pathHistory, setPathHistory] = useState(['mahalaxmi_tailoring']); // Stack for back navigation

    useEffect(() => {
        loadContent(currentPath);
    }, [currentPath]);

    const loadContent = async (path) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // 1. Fetch Folders
            // Note: Our backend endpoint /folders expects ?folder=xyz or defaults to root. 
            // If path is root, we call without folder param, else with folder param.
            // Cloudinary 'root_folders' API doesn't take prefix, but 'sub_folders' does.
            // My backend controller logic: if folder query param exists, calls sub_folders(folder), else root_folders().

            const folderRes = await api.get('/admin/cloudinary/folders', {
                ...config,
                params: { folder: path }
            });

            // 2. Fetch Images
            const imageRes = await api.get('/admin/cloudinary/images', {
                ...config,
                params: { folder: path }
            });

            setFolders(folderRes.data.folders || []); // Cloudinary returns { folders: [...] }
            setImages(imageRes.data.images);
            setNextCursor(imageRes.data.next_cursor);
            setLoading(false);

        } catch (error) {
            console.error("Error loading Cloudinary content:", error);
            // Fallback: maybe it's a leaf folder with no subfolders capability or error
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploading(true);
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));
        formData.append('folder', currentPath);

        try {
            const token = localStorage.getItem('token');
            const res = await api.post('/admin/cloudinary/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            // Auto-select uploaded images if in multiple mode
            if (multiple && res.data.images) {
                const newUrls = res.data.images.map(img => img.secure_url);
                setSelectedImages(prev => [...prev, ...newUrls]);
            }

            // Reload content to show new images
            loadContent(currentPath);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const loadMoreImages = async () => {
        if (!nextCursor) return;
        try {
            const token = localStorage.getItem('token');
            const res = await api.get('/admin/cloudinary/images', {
                headers: { Authorization: `Bearer ${token}` },
                params: { folder: currentPath, next_cursor: nextCursor }
            });
            setImages(prev => [...prev, ...res.data.images]);
            setNextCursor(res.data.next_cursor);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFolderClick = (folderName) => {
        const newPath = `${currentPath}/${folderName}`; // Cloudinary paths
        setPathHistory(prev => [...prev, newPath]);
        setCurrentPath(newPath);
    };

    const handleBack = () => {
        if (pathHistory.length > 1) {
            const newHistory = [...pathHistory];
            newHistory.pop(); // Remove current
            const prevPath = newHistory[newHistory.length - 1];
            setPathHistory(newHistory);
            setCurrentPath(prevPath);
        }
    };

    const handleImageClick = (img) => {
        const url = img.secure_url;
        if (multiple) {
            setSelectedImages(prev =>
                prev.includes(url) ? prev.filter(i => i !== url) : [...prev, url]
            );
        } else {
            onSelect([url]);
            onClose();
        }
    };

    const handleConfirm = () => {
        onSelect(selectedImages);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-xl flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-3">
                        {pathHistory.length > 1 && (
                            <button onClick={handleBack} className="p-2 hover:bg-gray-200 rounded-full transition">
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <div>
                            <h3 className="font-serif font-bold text-xl text-gray-800 flex items-center gap-2">
                                <ImageIcon size={20} className="text-brand-maroon" /> Media Library
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 truncate max-w-md">/{currentPath}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className={`cursor-pointer bg-brand-maroon text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-900 transition text-sm font-medium ${uploading ? 'opacity-70 cursor-wait' : ''}`}>
                            {uploading ? <Loader className="animate-spin" size={18} /> : <UploadCloud size={18} />}
                            <span>{uploading ? 'Uploading...' : 'Upload Images'}</span>
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleUpload}
                                accept="image/*"
                                disabled={uploading}
                            />
                        </label>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {loading && images.length === 0 && folders.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader className="animate-spin text-brand-maroon" size={32} />
                        </div>
                    ) : (
                        <>
                            {/* Folders Section */}
                            {folders.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Folders</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                        {folders.map(folder => (
                                            <div
                                                key={folder.path}
                                                onClick={() => handleFolderClick(folder.name)}
                                                className="bg-white p-4 rounded-lg border border-gray-200 hover:border-brand-maroon shadow-sm hover:shadow-md cursor-pointer flex flex-col items-center gap-2 transition"
                                            >
                                                <Folder size={32} className="text-brand-gold fill-brand-gold/10" />
                                                <span className="text-sm font-medium text-gray-700 truncate w-full text-center">{folder.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Images Section */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Images</h4>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                                    {images.map(img => (
                                        <div
                                            key={img.public_id}
                                            onClick={() => handleImageClick(img)}
                                            className={`group relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all bg-white shadow-sm
                                                ${(selectedImages.includes(img.secure_url)) ? 'border-brand-maroon ring-2 ring-brand-maroon/20' : 'border-gray-100 hover:border-gray-300'}
                                            `}
                                        >
                                            <img
                                                src={img.secure_url}
                                                alt={img.public_id}
                                                className="w-full h-full object-cover transition transform group-hover:scale-105"
                                                loading="lazy"
                                            />
                                            {/* Selection Overlay */}
                                            {(selectedImages.includes(img.secure_url)) && (
                                                <div className="absolute inset-0 bg-brand-maroon/20 flex items-center justify-center">
                                                    <div className="bg-brand-maroon text-white rounded-full p-1 shadow-sm">
                                                        <Check size={16} strokeWidth={3} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {images.length === 0 && (
                                    <p className="text-sm text-gray-400 italic">No images in this folder.</p>
                                )}
                            </div>
                        </>
                    )}

                    {nextCursor && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={loadMoreImages}
                                disabled={loading}
                                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 text-sm font-medium shadow-sm"
                            >
                                {loading ? 'Loading...' : 'Load More Images'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {multiple && (
                    <div className="p-4 border-t bg-white flex justify-between items-center">
                        <span className="text-sm text-gray-500">{selectedImages.length} images selected</span>
                        <div className="flex gap-2">
                            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button
                                onClick={handleConfirm}
                                disabled={selectedImages.length === 0}
                                className="px-6 py-2 bg-brand-maroon text-white rounded-lg hover:bg-red-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Insert Selected
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CloudinaryImagePicker;
