import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  border: 1px solid #ddd;
  padding: 1rem;
  width: 200px;
  text-align: center;
`;

const ProductCard = ({ image, title, price, seller, location }) => (
  <Card>
    <img src={image} alt={title} style={{ width: '100%', height: 'auto' }} />
    <h3>{title}</h3>
    <p>{price}</p>
    <p>{seller}, {location}</p>
    <button>Buy Now</button>
  </Card>
);

export default ProductCard;