import React, { useState } from 'react'
import SimpleBar from 'simplebar-react'
import { useLocation } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faListAlt, faSignOutAlt, faTable, faTimes } from '@fortawesome/free-solid-svg-icons'
import { Nav, Badge, Image, Button, Navbar } from '@themesberg/react-bootstrap'
import { Link } from 'react-router-dom'

import { Routes } from '../routes/routes'
import TsmcLogo from '../assets/img//Tsmc.svg.png'

import ProfilePicture from '../assets/img/team/profile-picture-3.jpg'

const Sidebar = (props = {}) => {
  const location = useLocation()
  const { pathname } = location
  const [show, setShow] = useState(false)
  const showClass = show ? 'show' : ''

  const onCollapse = () => setShow(!show)

  const NavItem = (props) => {
    const {
      title,
      link,
      external,
      target,
      icon,
      image,
      badgeText,
      badgeBg = 'secondary',
      badgeColor = 'primary',
    } = props
    const classNames = badgeText
      ? 'd-flex justify-content-start align-items-center justify-content-between'
      : ''
    const navItemClassName = link === pathname ? 'active' : ''
    const linkProps: any = external ? { href: link } : { as: Link, to: link }

    return (
      <Nav.Item className={navItemClassName} onClick={() => setShow(false)}>
        <Nav.Link {...linkProps} target={target} className={classNames}>
          <span>
            {icon ? (
              <span className="sidebar-icon">
                <FontAwesomeIcon icon={icon} />{' '}
              </span>
            ) : null}
            {image ? (
              <Image src={image} width={28} height={20} className="sidebar-icon svg-icon" />
            ) : null}

            <span className="sidebar-text">{title}</span>
          </span>
          {badgeText ? (
            <Badge pill bg={badgeBg} text={badgeColor} className="badge-md notification-count ms-2">
              {badgeText}
            </Badge>
          ) : null}
        </Nav.Link>
      </Nav.Item>
    )
  }

  return (
    <>
      <Navbar
        expand={false}
        collapseOnSelect
        variant="dark"
        className="navbar-theme-primary px-4 d-md-none"
      >
        <Navbar.Toggle as={Button} aria-controls="main-navbar" onClick={onCollapse}>
          <span className="navbar-toggler-icon" />
        </Navbar.Toggle>
      </Navbar>
      <CSSTransition timeout={300} in={show} classNames="sidebar-transition">
        <SimpleBar className={`collapse ${showClass} sidebar d-md-block bg-primary text-white`}>
          <div className="sidebar-inner px-4 pt-3">
            <div className="user-card d-flex d-md-none align-items-center justify-content-between justify-content-md-center pb-4">
              <div className="d-flex align-items-center">
                <div className="user-avatar lg-avatar me-4">
                  <Image
                    src={ProfilePicture}
                    className="card-img-top rounded-circle border-white"
                  />
                </div>
                <div className="d-block">
                  <h6>Hi, Jane</h6>
                  <Button
                    // as={Link}
                    variant="secondary"
                    size="sm"
                    // to={Routes.Signin.path}
                    className="text-dark"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Sign Out
                  </Button>
                </div>
              </div>
              <Nav.Link className="collapse-close d-md-none" onClick={onCollapse}>
                <FontAwesomeIcon icon={faTimes} />
              </Nav.Link>
            </div>
            <Nav className="flex-column pt-3 pt-md-0">
              <NavItem title="Product X" link={Routes.Presentation.path} image={TsmcLogo} />
              <NavItem title="Summary" link={Routes.SummaryPage.path} icon={faTable} />
              <NavItem title="My Events" link={Routes.MyEventPage.path} icon={faListAlt} />
            </Nav>
          </div>
        </SimpleBar>
      </CSSTransition>
    </>
  )
}
export default Sidebar
