import React from 'react';
import styled from 'styled-components';

const SidebarWrapper = styled.aside`
  width: 200px;
  padding: 1rem;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Sidebar = () => (
  <SidebarWrapper>
    <h3>Filters</h3>
    <select>
      <option>Category</option>
      <option>Crops</option>
      <option>Livestock</option>
    </select>
    <select>
      <option>Region</option>
      <option>Nakuru</option>
      <option>Nairobi</option>
    </select>
    <h3>Cart</h3>
    <p>Items: 0</p>
  </SidebarWrapper>
);

export default Sidebar;