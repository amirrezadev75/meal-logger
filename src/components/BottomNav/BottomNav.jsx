import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { BsHouse, BsCalendar3, BsPerson } from 'react-icons/bs';
import './BottomNav.css';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bottom-nav-container">
      <Container fluid>
        <Row className="text-center bottom-nav-row">
          <Col 
            className={`nav-item-box ${isActive('/') ? 'active' : ''}`}
            onClick={() => handleNavigation('/')}
          >
            <BsHouse size={22} />
            <span className="nav-label">Home</span>
          </Col>
          <Col className="nav-item-box">
            <BsCalendar3 size={22} />
            <span className="nav-label">Journal</span>
          </Col>
          <Col className="nav-item-box">
            <BsPerson size={22} />
            <span className="nav-label">Profile</span>
          </Col>
        </Row>
      </Container>
    </nav>
  );
};

export default BottomNav;