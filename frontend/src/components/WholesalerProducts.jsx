import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Image as ImageIcon, CheckCircle2, XCircle, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8080/api/products/active';
const ORDER_API_URL = 'http://localhost:8080/api/orders';
const BACKEND_URL = 'http://localhost:8080';

export default function WholesalerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('products'); // 'products', 'details', 'cart'
  const [placingOrder, setPlacingOrder] = useState(false);
  
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.productName.toLowerCase().includes(search.toLowerCase()) || 
                        p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const categories = ['Under Garments', 'T-Shirts', 'Shirts', 'Lower', 'Other'];

  const addToCart = (product, qty) => {
    if (qty > product.stockQuantity) {
      alert(`Cannot add more than available stock (${product.stockQuantity})`);
      return;
    }
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + qty;
        if(newQty > product.stockQuantity) {
            alert(`Cannot add more than available stock (${product.stockQuantity})`);
            return prevCart;
        }
        return prevCart.map(item => 
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        return [...prevCart, { product, quantity: qty }];
      }
    });
    alert('Added to cart!');
    setView('products');
  };

  const updateCartQty = (productId, delta) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (newQty > item.product.stockQuantity) {
          alert(`Cannot add more than available stock (${item.product.stockQuantity})`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.wholesalePrice * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (!user || !user.token) {
      alert('You must be logged in to place an order.');
      navigate('/');
      return;
    }
    
    setPlacingOrder(true);
    
    const orderItems = cart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }));
    
    try {
      const res = await fetch(ORDER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ items: orderItems })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to place order');
      
      alert('Order placed successfully!');
      setCart([]);
      setView('products');
      fetchProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (view === 'cart') {
    return (
      <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button 
            onClick={() => setView('products')} 
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <ArrowLeft size={16} /> Continue Shopping
          </button>
          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', margin: 0 }}>Shopping Cart</h2>
        </div>

        {cart.length === 0 ? (
          <div className="content-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <ShoppingCart size={48} color="#cbd5e1" style={{ marginBottom: '1rem', margin: '0 auto' }} />
            <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>Your cart is empty</h3>
            <p style={{ color: '#64748b', margin: 0 }}>Browse the products catalog to add items to your cart.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div className="content-card" style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', textAlign: 'left', fontSize: '0.85rem' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Product</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Price</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Quantity</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Subtotal</th>
                      <th style={{ padding: '0.75rem 1rem' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {item.product.imageUrl ? (
                             <img src={`${BACKEND_URL}${item.product.imageUrl}`} alt="" style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }} />
                          ) : (
                             <div style={{ width: '42px', height: '42px', background: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                               <ImageIcon size={20} color="#cbd5e1" />
                             </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{item.product.productName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SKU: {item.product.sku}</div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>₹{item.product.wholesalePrice.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <button onClick={() => updateCartQty(item.product.id, -1)} style={{ padding: '0.25rem 0.4rem', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}><Minus size={14}/></button>
                            <span style={{ fontWeight: 600, width: '24px', textAlign: 'center' }}>{item.quantity}</span>
                            <button onClick={() => updateCartQty(item.product.id, 1)} style={{ padding: '0.25rem 0.4rem', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}><Plus size={14}/></button>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>₹{(item.product.wholesalePrice * item.quantity).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '1rem' }}>
                          <button onClick={() => removeFromCart(item.product.id)} style={{ padding: '0.4rem', background: '#fef2f2', color: '#ef4444', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="content-card" style={{ height: 'fit-content' }}>
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1.15rem', color: '#0f172a' }}>Order Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                <span>Wholesaler</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{user?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                <span>Shop</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{user?.shopName || 'N/A'}</span>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', margin: '1rem 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                <span>Total Amount</span>
                <span style={{ color: '#2563eb' }}>₹{getCartTotal().toLocaleString('en-IN')}</span>
              </div>
              
              <button 
                className="btn-primary" 
                onClick={placeOrder} 
                disabled={placingOrder}
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
              >
                {placingOrder ? 'Placing Order...' : 'Place Order Now'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'details' && selectedProduct) {
    return (
      <div className="fade-in">
        <button 
          onClick={() => setView('products')} 
          style={{ marginBottom: '1.25rem', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <ArrowLeft size={16} /> Back to Products
        </button>
        
        <div className="content-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {selectedProduct.imageUrl ? (
              <img src={`${BACKEND_URL}${selectedProduct.imageUrl}`} alt={selectedProduct.productName} style={{ width: '100%', maxWidth: '380px', borderRadius: '10px', objectFit: 'contain', maxHeight: '350px' }} />
            ) : (
              <div style={{ width: '100%', height: '300px', background: '#f8fafc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                <ImageIcon size={64} color="#cbd5e1" />
              </div>
            )}
          </div>
          
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: '#0f172a', fontWeight: 700 }}>{selectedProduct.productName}</h2>
            <div style={{ display: 'flex', gap: '0.75rem', color: '#64748b', marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem' }}>SKU: <strong>{selectedProduct.sku}</strong></span>
              <span style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500 }}>{selectedProduct.category}</span>
            </div>
            
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Wholesale Price</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                ₹{selectedProduct.wholesalePrice.toLocaleString('en-IN')} <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 500 }}>/ {selectedProduct.unit}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Availability</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: selectedProduct.stockQuantity > 0 ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: '0.95rem' }}>
                  {selectedProduct.stockQuantity > 0 ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  {selectedProduct.stockQuantity > 0 ? `In Stock (${selectedProduct.stockQuantity})` : 'Out of Stock'}
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#0f172a' }}>Product Description</h3>
              <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '0.925rem' }}>{selectedProduct.description || 'No description provided.'}</p>
            </div>
            
            <div style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {selectedProduct.stockQuantity > 0 ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '0.5rem', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: 'pointer' }}><Minus size={18}/></button>
                    <input 
                      type="number" 
                      value={quantity} 
                      onChange={e => setQuantity(Math.min(selectedProduct.stockQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
                      style={{ width: '60px', textAlign: 'center', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600 }}
                    />
                    <button onClick={() => setQuantity(Math.min(selectedProduct.stockQuantity, quantity + 1))} style={{ padding: '0.5rem', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: 'pointer' }}><Plus size={18}/></button>
                  </div>
                  <button className="btn-primary" onClick={() => addToCart(selectedProduct, quantity)} style={{ width: 'auto', margin: 0, padding: '0.65rem 1.5rem' }}>
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                </>
              ) : (
                <button className="btn-primary" disabled style={{ width: 'auto', margin: 0 }}>
                  Out of Stock
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Products Catalog</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Explore available items and place wholesale orders</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setView('cart')} 
          style={{ width: 'auto', margin: 0, padding: '0.55rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}
        >
          <ShoppingCart size={18} />
          <span>Cart</span>
          {cart.length > 0 && (
            <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', borderRadius: '999px', fontSize: '0.75rem', padding: '0.1rem 0.45rem', fontWeight: 'bold' }}>
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </span>
          )}
        </button>
      </div>
      
      <div className="content-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
            <input 
              type="text" className="form-input" placeholder="Search by product name or SKU..."
              style={{ paddingLeft: '2.5rem' }} value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="form-input" style={{ width: 'auto', minWidth: '180px' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>No products found matching your criteria.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
          {filteredProducts.map(p => (
            <div key={p.id} className="content-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', margin: 0 }} onClick={() => { setSelectedProduct(p); setQuantity(1); setView('details'); }}>
              <div style={{ height: '180px', width: '100%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #e2e8f0' }}>
                {p.imageUrl ? (
                  <img src={`${BACKEND_URL}${p.imageUrl}`} alt={p.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ImageIcon size={44} color="#cbd5e1" />
                )}
              </div>
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.productName}</h3>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.75rem', flex: 1 }}>
                  <span>{p.category}</span> • <span style={{ fontFamily: 'monospace' }}>{p.sku}</span>
                </div>
                
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>₹{p.wholesalePrice.toLocaleString('en-IN')} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>/ {p.unit}</span></div>
                    <span style={{ fontSize: '0.75rem', color: p.stockQuantity > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                      {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : 'Out of Stock'}
                    </span>
                  </div>
                  <button className="btn-primary" style={{ width: '100%', margin: 0, padding: '0.55rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }} onClick={(e) => { e.stopPropagation(); setSelectedProduct(p); setQuantity(1); setView('details'); }}>
                    <ShoppingCart size={15} /> View &amp; Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
