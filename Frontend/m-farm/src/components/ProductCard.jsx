import React from 'react';

// ProductCard.jsx
const ProductCard = ({ product, addToCart }) => (
  <div className="card h-100 shadow-sm border-0">
    <img src={product.image} className="card-img-top" alt={product.title} style={{ height: '200px', objectFit: 'cover' }} />
    <div className="card-body">
      <h5 className="card-title fw-semibold text-dark">{product.title}</h5>
      <p className="card-text text-muted">KES {product.price}</p>
      <p className="card-text text-muted">{product.seller}, {product.location}</p>
      <button className="btn btn-success w-100 shadow-sm" onClick={() => addToCart(product)}>
        Add to Cart
      </button>
    </div>
  </div>
);

export default ProductCard;