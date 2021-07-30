import React, { useState, useEffect, Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import { Routes } from '../routes/routes'

// pages
import Presentation from './Presentation'
import SummaryPage from './summary'
import MyEventPage from './myEvent'

// // components
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Preloader from '../components/Preloader'
import APIViewer from './apiViewer'

export const RouteWithLoader = ({ component: Component, ...rest }) => {
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
          <Preloader show={loaded ? false : true} /> <Component {...props} />
        </>
      )}
    />
  )
}

const RouteWithSidebar = ({ component: Component, ...rest }) => {
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
    localStorage.setItem('settingsVisible', String(!showSettings)) //m
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
          </main>
          <Footer toggleSettings={toggleSettings} showSettings={false} />
        </>
      )}
    />
  )
}

const HomePage = () => (
  <Switch>
    <RouteWithLoader exact path={Routes.Presentation.path} component={Presentation} />

    <RouteWithSidebar path={Routes.APIViewer.path} component={APIViewer} />
    <RouteWithSidebar path={Routes.SummaryPage.path} component={SummaryPage} />
    <RouteWithSidebar path={Routes.MyEventPage.path} component={MyEventPage} />
  </Switch>
)
export default HomePage
