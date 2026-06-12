import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, X, Save, Image as ImageIcon } from 'lucide-react';
import CloudinaryImagePicker from '../components/Common/CloudinaryImagePicker';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // Fetch categories for dropdown
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showImagePicker, setShowImagePicker] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        description: '',
        images: '', // Comma separated for now or single url
        fabricOptions: ''
    });

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching products", error);
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category: product.category?._id || product.category,
            price: product.price,
            description: product.description,
            images: product.images?.map(i => i.url).join(', '),
            fabricOptions: product.fabricOptions?.join(', ')
        });
        setShowModal(true);
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setFormData({ name: '', category: '', price: '', description: '', images: '', fabricOptions: '' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Construct payload
        const payload = {
            ...formData,
            images: formData.images.split(',').map(url => url.trim()).filter(url => url !== '').map(url => ({ url })),
            fabricOptions: formData.fabricOptions.split(',').map(f => f.trim()).filter(f => f !== '')
        };

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (editingProduct) {
                await api.put(`/products/${editingProduct._id}`, payload, config);
            } else {
                await api.post(`/products`, payload, config);
            }
            setShowModal(false);
            fetchProducts();
            alert("Product saved successfully!");
        } catch (error) {
            console.error("Error saving product", error);
            const msg = error.response?.data?.message || "Failed to save product.";
            alert(msg);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this product?")) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.delete(`/products/${id}`, config);
            fetchProducts();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-gray-800">Design Catalog</h1>
                <button
                    onClick={handleAddNew}
                    className="bg-brand-maroon text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-900 transition"
                >
                    <Plus size={18} /> Add New Design
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Image</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map(product => (
                            <tr key={product._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                        <img src={product.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                <td className="px-6 py-4 text-gray-500">{product.category?.name || 'N/A'}</td>
                                <td className="px-6 py-4">₹{product.price}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleEdit(product)} className="text-blue-600 hover:bg-blue-50 p-2 rounded transition mr-2"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:bg-red-50 p-2 rounded transition"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit/Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-brand-maroon">{editingProduct ? 'Edit Design' : 'Add New Design'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Design Name</label>
                                <input type="text" required className="w-full p-2 border rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                    <input type="number" required className="w-full p-2 border rounded-lg" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        required
                                        className="w-full p-2 border rounded-lg"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea className="w-full p-2 border rounded-lg" rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs (comma separated)</label>
                                <div className="flex gap-2">
                                    <input type="text" className="w-full p-2 border rounded-lg" value={formData.images} onChange={e => setFormData({ ...formData, images: e.target.value })} />
                                    <button
                                        type="button"
                                        onClick={() => setShowImagePicker(true)}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition"
                                        title="Select from Cloudinary"
                                    >
                                        <ImageIcon size={20} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fabric Options (comma separated)</label>
                                <input type="text" className="w-full p-2 border rounded-lg" value={formData.fabricOptions} onChange={e => setFormData({ ...formData, fabricOptions: e.target.value })} />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-brand-maroon text-white rounded-lg hover:bg-red-900 font-medium">Save Design</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cloudinary Picker */}
            {showImagePicker && (
                <CloudinaryImagePicker
                    multiple={true}
                    onClose={() => setShowImagePicker(false)}
                    onSelect={(urls) => {
                        const newImages = urls.join(', ');
                        setFormData(prev => ({
                            ...prev,
                            images: prev.images ? `${prev.images}, ${newImages}` : newImages
                        }));
                    }}
                />
            )}
        </div>
    );
};

export default AdminProducts;
