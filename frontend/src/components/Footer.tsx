import React from 'react'
// import moment from "moment-timezone";
import { Row, Col } from '@themesberg/react-bootstrap'

const Footer = (props) => {

  return (
    <div className="footer">
      <footer className="footer-tsmc section py-5">
        <Row>
          <Col xs={12} lg={12} className="mb-4 mb-lg-0">
            <p className="mb-0 text-center text-xl-center">
              Copyright© Taiwan Semiconductor Manufacturing Company Limited 2021, All Rights
              Reserved. Version:1.0.0
            </p>
          </Col>
        </Row>
      </footer>
    </div>
  )
}
export default Footer
