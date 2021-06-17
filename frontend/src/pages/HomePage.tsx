/* eslint-disable import/no-anonymous-default-export */
import React, { useState, useEffect, Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import { Routes } from '../routes/routes'

// pages
import Presentation from './Presentation'
import ProductSuites from './productSuites'
import SummaryPage from './summary'
import App from '../App'

// // components
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Preloader from '../components/Preloader'
import APIViewer from './apiViewer'

// tslint:disable: jsx-no-lambda
export const RouteWithLoader = ({ component, ...rest }) => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Route
      {...rest}
      render={(props) => (
        <>
          {' '}
          <Preloader show={loaded ? false : true} /> <Component {...props} />{' '}
        </>
      )}
    />
  )
}

const RouteWithSidebar = ({ component, ...rest }) => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const localStorageIsSettingsVisible = () => {
    return localStorage.getItem('settingsVisible') === 'false' ? false : true
  }

  const [showSettings, setShowSettings] = useState(localStorageIsSettingsVisible)

  const toggleSettings = () => {
    setShowSettings(!showSettings)
    localStorage.setItem('settingsVisible', String(!showSettings))
  }

  return (
    <Route
      {...rest}
      render={(props) => (
        <>
          <Preloader show={loaded ? false : true} />
          <Sidebar />

          <main className="content">
            <Navbar />
            <Component {...props} />
            {/* <Footer toggleSettings={toggleSettings} showSettings={showSettings} /> */}
            <Footer toggleSettings={toggleSettings} showSettings={false} />
          </main>
        </>
      )}
    />
  )
}

export default () => (
  <Switch>
    <RouteWithLoader exact={true} path={Routes.Presentation.path} component={Presentation} />

    {/* pages */}
    <RouteWithSidebar exact={true} path={Routes.ProductSuites.path} component={ProductSuites} />
    <RouteWithSidebar exact={true} path={Routes.App.path} component={App} />
    <RouteWithSidebar path={Routes.APIViewer.path} component={APIViewer} />
    <RouteWithSidebar path={Routes.SummaryPage.path} component={SummaryPage} />
    {/* components */}

    {/* documentation */}

    {/* <Redirect to={Routes.NotFound.path} /> */}
  </Switch>
)
