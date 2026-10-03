import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';

const API_URL = 'http://localhost:8080/api/products';
const BACKEND_URL = 'http://localhost:8080';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // list, add, edit, view
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [notification, setNotification] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    productName: '', sku: '', category: '', description: '', 
    purchasePrice: '', wholesalePrice: '', stockQuantity: '', 
    unit: '', status: 'Active'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (view === 'list') {
      fetchProducts();
    }
  }, [view]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      showNotification('error', 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = view === 'edit' ? `${API_URL}/${selectedProduct.id}` : API_URL;
    const method = view === 'edit' ? 'PUT' : 'POST';

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }

    try {
      const response = await fetch(url, {
        method,
        body: formDataToSend
      });
      if (!response.ok) throw new Error('Failed to save');
      
      showNotification('success', `Product ${view === 'edit' ? 'updated' : 'added'} successfully!`);
      setView('list');
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete');
        showNotification('success', 'Product deleted successfully');
        fetchProducts();
      } catch (err) {
        showNotification('error', err.message);
      }
    }
  };

  const handleToggleStatus = async (p) => {
    const newStatus = p.status === 'Active' ? 'Inactive' : 'Active';
    const formDataToSend = new FormData();
    formDataToSend.append('productName', p.productName);
    formDataToSend.append('sku', p.sku);
    formDataToSend.append('category', p.category);
    formDataToSend.append('description', p.description);
    formDataToSend.append('purchasePrice', p.purchasePrice);
    formDataToSend.append('wholesalePrice', p.wholesalePrice);
    formDataToSend.append('stockQuantity', p.stockQuantity);
    formDataToSend.append('unit', p.unit);
    formDataToSend.append('status', newStatus);

    try {
      const response = await fetch(`${API_URL}/${p.id}`, {
        method: 'PUT',
        body: formDataToSend
      });
      if (!response.ok) throw new Error('Failed to update status');
      showNotification('success', `Product is now ${newStatus}`);
      fetchProducts();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const openAdd = () => {
    setFormData({
      productName: '', sku: '', category: 'Under Garments', description: '', 
      purchasePrice: '', wholesalePrice: '', stockQuantity: '', 
      unit: 'Piece', status: 'Active'
    });
    setImageFile(null);
    setImagePreview(null);
    setView('add');
  };

  const openEdit = (p) => {
    setSelectedProduct(p);
    setFormData({
      productName: p.productName, sku: p.sku, category: p.category, description: p.description, 
      purchasePrice: p.purchasePrice, wholesalePrice: p.wholesalePrice, stockQuantity: p.stockQuantity, 
      unit: p.unit, status: p.status
    });
    setImageFile(null);
    setImagePreview(p.imageUrl ? BACKEND_URL + p.imageUrl : null);
    setView('edit');
  };

  const openView = (p) => {
    setSelectedProduct(p);
    setView('view');
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.productName.toLowerCase().includes(search.toLowerCase()) || 
                        p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'All' || p.category === filterCategory;
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const categories = ['Under Garments', 'T-Shirts', 'Shirts', 'Lower', 'Other'];

  return (
    <div className="fade-in">
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
          padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem',
          backgroundColor: notification.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: notification.type === 'error' ? '#ef4444' : '#10b981',
          border: `1px solid ${notification.type === 'error' ? '#f87171' : '#6ee7b7'}`,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}>
          {notification.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle2 size={20}/>}
          <span style={{ fontWeight: 500 }}>{notification.message}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Products</h1>
        {view === 'list' && (
          <button className="btn-primary" onClick={openAdd} style={{ width: 'auto', margin: 0, padding: '0.75rem 1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Plus size={18} /> Add Product
          </button>
        )}
        {view !== 'list' && (
          <button className="btn-primary" onClick={() => setView('list')} style={{ width: 'auto', margin: 0, backgroundColor: '#64748b' }}>
            Back to List
          </button>
        )}
      </div>

      {view === 'list' && (
        <div className="content-card">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
              <input 
                type="text" className="form-input" placeholder="Search by product name or SKU..."
                style={{ paddingLeft: '2.5rem' }} value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="form-input" style={{ width: '180px' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="form-input" style={{ width: '180px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No products found.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.875rem' }}>
                    <th style={{ padding: '1rem', width: '60px' }}>Image</th>
                    <th style={{ padding: '1rem' }}>Product Info</th>
                    <th style={{ padding: '1rem' }}>Category</th>
                    <th style={{ padding: '1rem' }}>Wholesale Price</th>
                    <th style={{ padding: '1rem' }}>Stock</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1rem' }}>
                        {p.imageUrl ? (
                          <img src={`${BACKEND_URL}${p.imageUrl}`} alt={p.productName} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon size={20} color="#cbd5e1" />
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600 }}>{p.productName}</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>SKU: {p.sku}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ fontSize: '0.875rem', background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{p.category}</span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>
                        ₹{p.wholesalePrice}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ color: p.stockQuantity > 10 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                          {p.stockQuantity} {p.unit}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button 
                          onClick={() => handleToggleStatus(p)}
                          style={{ 
                            padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                            backgroundColor: p.status === 'Active' ? '#dcfce7' : '#f1f5f9',
                            color: p.status === 'Active' ? '#166534' : '#475569'
                          }}>
                          {p.status}
                        </button>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => openView(p)} style={{ padding: '0.5rem', background: '#f1f5f9', color: '#3b82f6', borderRadius: '6px' }} title="View"><Eye size={16}/></button>
                          <button onClick={() => openEdit(p)} style={{ padding: '0.5rem', background: '#f1f5f9', color: '#f59e0b', borderRadius: '6px' }} title="Edit"><Edit size={16}/></button>
                          <button onClick={() => handleDelete(p.id)} style={{ padding: '0.5rem', background: '#fef2f2', color: '#ef4444', borderRadius: '6px' }} title="Delete"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {(view === 'add' || view === 'edit') && (
        <div className="content-card">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{view === 'add' ? 'Add New Product' : 'Edit Product'}</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Product Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  ) : (
                    <div style={{ width: '100px', height: '100px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon size={32} color="#cbd5e1" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="form-input" style={{ flex: 1 }} />
                </div>
              </div>

              <div className="form-group"><label className="form-label">Product Name *</label><input required name="productName" value={formData.productName} onChange={handleInputChange} type="text" className="form-input"/></div>
              <div className="form-group"><label className="form-label">Product Code / SKU *</label><input required name="sku" value={formData.sku} onChange={handleInputChange} type="text" className="form-input"/></div>
              
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="form-input" required>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="form-input">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} className="form-input" rows="3"></textarea></div>
              
              <div className="form-group"><label className="form-label">Purchase Price (₹) *</label><input required name="purchasePrice" value={formData.purchasePrice} onChange={handleInputChange} type="number" step="0.01" className="form-input"/></div>
              <div className="form-group"><label className="form-label">Wholesale Price (₹) *</label><input required name="wholesalePrice" value={formData.wholesalePrice} onChange={handleInputChange} type="number" step="0.01" className="form-input"/></div>
              
              <div className="form-group"><label className="form-label">Stock Quantity *</label><input required name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} type="number" className="form-input"/></div>
              <div className="form-group">
                <label className="form-label">Unit *</label>
                <select name="unit" value={formData.unit} onChange={handleInputChange} className="form-input" required>
                  <option value="Piece">Piece</option>
                  <option value="Pack">Pack</option>
                  <option value="Box">Box</option>
                  <option value="Dozen">Dozen</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className="btn-primary" style={{ width: 'auto', margin: 0, padding: '0.75rem 2rem' }}>Save Product</button>
              <button type="button" className="btn-primary" onClick={() => setView('list')} style={{ width: 'auto', margin: 0, padding: '0.75rem 2rem', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #cbd5e1' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {view === 'view' && selectedProduct && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          <div className="content-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {selectedProduct.imageUrl ? (
              <img src={`${BACKEND_URL}${selectedProduct.imageUrl}`} alt={selectedProduct.productName} style={{ width: '100%', maxWidth: '300px', borderRadius: '8px', objectFit: 'contain' }} />
            ) : (
              <div style={{ width: '100%', height: '300px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon size={64} color="#cbd5e1" />
              </div>
            )}
            <div style={{ marginTop: '1.5rem', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Status</span>
                <span style={{ fontWeight: 600, color: selectedProduct.status === 'Active' ? '#10b981' : '#ef4444' }}>{selectedProduct.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Stock</span>
                <span style={{ fontWeight: 600 }}>{selectedProduct.stockQuantity} {selectedProduct.unit}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Added On</span>
                <span style={{ fontWeight: 500 }}>{new Date(selectedProduct.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="content-card">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{selectedProduct.productName}</h2>
            <div style={{ color: '#64748b', marginBottom: '1.5rem' }}>SKU: {selectedProduct.sku} | Category: <span style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{selectedProduct.category}</span></div>
            
            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Wholesale Price</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>₹{selectedProduct.wholesalePrice} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>/ {selectedProduct.unit}</span></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Purchase Price</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#475569' }}>₹{selectedProduct.purchasePrice}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem', fontWeight: 600 }}>Description</h3>
              <p style={{ color: '#475569', lineHeight: 1.6 }}>{selectedProduct.description || 'No description provided.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
