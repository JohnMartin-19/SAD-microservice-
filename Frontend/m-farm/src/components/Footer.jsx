import React from 'react';
import styled from 'styled-components';


const FooterWrapper = styled.footer`
  background-color: #1a1a1a;
  color: #fff;
  padding: 3rem 0;
`;

const FooterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const FooterColumn = styled.div`
  flex: 1;
  min-width: 200px;
  margin-bottom: 2rem;

  h3 {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      margin-bottom: 0.5rem;

      a {
        color: #ccc;
        text-decoration: none;
        transition: color 0.3s ease;

        &:hover {
          color: #2e7d32; /*
        }
      }
    }
  }

  p {
    color: #ccc; /* Ensure About Us text matches other columns */
  }
`;

const Bottom = styled.div`
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #333;
  margin-top: 2rem;

  p {
    margin: 0;
    font-size: 0.9rem;
    color: #ccc;
  }
`;

const Footer = () => (
  <FooterWrapper>
    <FooterContainer>
      <FooterColumn>
        <h3>Follow Us</h3>
        <ul>
          {/* Changed <a> to <span> since they don't have real links yet */}
          <li><span>Facebook</span></li>
          <li><span>Twitter</span></li>
          <li><span>Instagram</span></li>
          <li><span>YouTube</span></li>
        </ul>
      </FooterColumn>
      <FooterColumn>
        <h3>Contact Us</h3>
        <ul>
          <li>Email: info@m-farm.agro</li>
          <li>Phone: +254768171426</li>
          <li>Address: Gilgil, Nakuru City, Kenya</li>
        </ul>
      </FooterColumn>
      <FooterColumn>
        <h3>Quick Links</h3>
        <ul>
          {/* Changed <a> to <span> since they don't have real links yet */}
          <li><span>Upcoming Farmers Events</span></li>
          <li><span>Blog</span></li>
          <li><span>FAQs</span></li>
          <li><span>Privacy Policy</span></li>
        </ul>
      </FooterColumn>
      <FooterColumn>
        <h3>About Us</h3>
        <p>
          We are dedicated to bringing the best services to our esteemed customers as well as farmers using our digital platform. In partnership with the Small and Medium farmers, we are able to bring these services at their fingertips. Making agriculture better for Kenya and EA at large.
        </p>
      </FooterColumn>
    </FooterContainer>
    <Bottom>
      <p>© 2025 M-FARM. All rights reserved.</p>
    </Bottom>
  </FooterWrapper>
);

export default Footer;