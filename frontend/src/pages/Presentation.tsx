import React, { useState, useEffect} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { faBootstrap, faSass } from '@fortawesome/free-brands-svg-icons'
import { faNetworkWired, faDigitalTachograph } from '@fortawesome/free-solid-svg-icons'

import { Col, Row, Image, Button, Container, Navbar, Nav } from '@themesberg/react-bootstrap'
import { Link } from 'react-router-dom'
// import { HashLink } from 'react-router-hash-link';

import { Routes } from '../routes/routes'
import TsmcLogo from '../assets/img//Tsmc.svg.png'
import { useCookies } from 'react-cookie'

function Presentation() {
  const [cookiesUser, setCookieUser, removeCookieUser] = useCookies(['user'])
  useEffect(() => {
    if(cookiesUser["user"] === undefined)
    {
      //window.location.href = 'https://www.tsmc.com/'
      console.log('Login')
    }
  }, [])
  return (
    <>
      <Navbar
        variant="dark"
        expand="lg"
        bg="dark"
        className="navbar-transparent navbar-theme-primary sticky-top"
      >
        <Container className="position-relative justify-content-between px-3">
          <Navbar.Brand as={Link} to="#home" className="me-lg-3 d-flex align-items-center">
            <Image src={TsmcLogo} />
            <span className="ms-2 brand-text d-none d-md-inline">Product X</span>
          </Navbar.Brand>

          <div className="d-flex align-items-center">
            <Navbar.Collapse id="navbar-default-primary">
              <Nav className="navbar-nav-hover align-items-lg-center">
                <Nav.Link as={Link} to={Routes.SummaryPage.path}>
                  Summary
                </Nav.Link>
                <Nav.Link as={Link} to={Routes.MyEventPage.path}>
                  Dashboard
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </div>
        </Container>
      </Navbar>
      <section
        className="section-header overflow-hidden pt-5 pt-lg-8 pb-12 pb-lg-10 bg-primary text-white"
        id="home"
      >
        <Container>
          <Row>
            <Col xs={12} className="text-center">
              <h1 className="fw-bolder text-secondary">Event Driven Data Platform</h1>
              <p className="text-muted fw-light mb-5 h5">AsyncAPI Portal and tutorial document</p>
              <div className="d-flex align-items-center justify-content-center">
                <Button
                  variant="secondary"
                  as={Link}
                  to={Routes.MyEventPage.path}
                  className="text-dark me-3"
                >
                  Go to Platform
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="d-none d-sm-inline ms-1" />
                </Button>
                <Button variant="outline-secondary" className=" me-3">
                  document
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="d-none d-sm-inline ms-1" />
                </Button>
              </div>
            </Col>
          </Row>
          <figure className="position-absolute bottom-0 left-0 w-100 d-none d-md-block mb-n2">
            <svg className="fill-soft" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3000 185.4">
              <path d="M3000,0v185.4H0V0c496.4,115.6,996.4,173.4,1500,173.4S2503.6,115.6,3000,0z" />
            </svg>
          </figure>
        </Container>
      </section>
      <div className="section pt-6">
        <Container className="mt-n7 mt-lg-n6 z-2">
          <Row className="justify-content-center mt-5 mt-lg-6">
            <Col xs={6} md={3} className="text-center mb-4">
              <div className="icon icon-shape icon-lg bg-white shadow-lg border-light rounded-circle mb-4">
                <FontAwesomeIcon icon={faNetworkWired} className="text-secondary" />
              </div>
              <h3 className="fw-bolder">NATS</h3>
              <p className="text-gray">Modern distributed systems</p>
            </Col>
            <Col xs={6} md={3} className="text-center mb-4">
              <div className="icon icon-shape icon-lg bg-white shadow-lg border-light rounded-circle mb-4">
                <FontAwesomeIcon icon={faDigitalTachograph} className="text-secondary" />
              </div>
              <h3 className="fw-bolder">MERN</h3>
              <p className="text-gray">Modern web development tech stack</p>
            </Col>
            <Col xs={6} md={3} className="text-center">
              <div className="icon icon-shape icon-lg bg-white shadow-lg border-light rounded-circle mb-4">
                <FontAwesomeIcon icon={faSass} className="text-secondary" />
              </div>
              <h3 className="fw-bolder">Workflow</h3>
              <p className="text-gray">Sass & react-app</p>
            </Col>
            <Col xs={6} md={3} className="text-center">
              <div className="icon icon-shape icon-lg bg-white shadow-lg border-light rounded-circle mb-4">
                <FontAwesomeIcon color="secondary" icon={faBootstrap} className="text-secondary" />
              </div>
              <h3 className="fw-bolder">Bootstrap 5</h3>
              <p className="text-gray">CSS Framework</p>
            </Col>
          </Row>
        </Container>
      </div>

      <footer className="footer mt-6 bg-dark text-white">
        <Container>
          <Row>
            <Col className="mb-md-2 pt-2">
              <Image
                src={TsmcLogo}
                height={35}
                className="d-block mx-auto mb-3"
                alt="Themesberg Logo"
              />
              <div
                className="d-flex text-center justify-content-center align-items-center"
                role="contentinfo"
              >
                <p className="font-weight-normal font-small mb-0">
                  Copyright© Taiwan Semiconductor Manufacturing Company Limited 2021, All Rights
                  Reserved. Version:1.0.0
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </>
  )
}

export default Presentation
