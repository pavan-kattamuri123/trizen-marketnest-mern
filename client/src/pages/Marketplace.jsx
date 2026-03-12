import React, { useState, useEffect } from 'react';
import api from '../utils/axiosInstance';
import { Search } from 'lucide-react';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Shirts', 'Pants', 'Shoes', 'Accessories'];

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/products?pageNumber=${page}&keyword=${keyword}&category=${category}`);
      setProducts(data.products);
      setPages(data.pages);
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [page, category]); // Removed keyword so it doesn't search on every keystroke, handled by form submit

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchProducts();
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Discover Fashion</h1>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <button type="submit" className="hidden">Search</button>
        </form>
        
        <select 
          className="border rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-white"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No products found matching your criteria.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 xl:aspect-w-7 xl:aspect-h-8 object-cover h-64">
                <img 
                  src={product.images[0] || 'https://via.placeholder.com/300?text=No+Image'} 
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:opacity-75"
                />
              </div>
              <div className="p-4">
                <div className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wider">{product.category}</div>
                <h3 className="text-lg font-medium text-gray-900 truncate">{product.name}</h3>
                <p className="mt-1 text-gray-500 text-sm line-clamp-2">{product.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                  <span className="text-sm text-gray-500">By {product.brand?.name || 'Unknown User'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center mt-10 gap-2">
          {[...Array(pages).keys()].map(x => (
            <button
              key={x + 1}
              onClick={() => setPage(x + 1)}
              className={`w-10 h-10 rounded-full font-medium ${page === x + 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}
            >
              {x + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
