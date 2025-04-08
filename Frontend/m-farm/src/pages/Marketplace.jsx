import React, { useState } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import Sidebar from '../components/Sidebar';

const Main = styled.div`
  display: flex;
  padding: 2rem;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  flex-grow: 1;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
`;

const Marketplace = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const products = [
    { image: 'https://via.placeholder.com/200?text=Tomatoes', title: 'Fresh Tomatoes - 10kg', price: 'KES 500', seller: 'John', location: 'Nakuru' },
    { image: 'https://via.placeholder.com/200?text=Maize', title: 'Maize - 20kg', price: 'KES 800', seller: 'Mary', location: 'Nairobi' },
  ];

  return (
    <>
      <Header isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
      <SearchBar placeholder="Search by crop, location, or price" />
      <Main>
        <Sidebar />
        <Grid>
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </Grid>
      </Main>
      <Footer />
    </>
  );
};

export default Marketplace;