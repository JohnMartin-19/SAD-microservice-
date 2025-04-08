import React from 'react';

const ProductCard = ({ image, title, price, seller, location }) => (
  <div className="card h-100 shadow-sm border-0">
    <img
      src={image}
      className="card-img-top"
      alt={title}
      style={{ height: '200px', objectFit: 'cover' }}
    />
    <div className="card-body">
      <h5 className="card-title fw-semibold text-dark">{title}</h5>
      <p className="card-text text-muted">{price}</p>
      <p className="card-text text-muted">
        {seller}, {location}
      </p>
      <button className="btn btn-success w-100 shadow-sm">Buy Now</button>
    </div>
  </div>
);

export default ProductCard;