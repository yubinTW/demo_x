import React, { useState, useEffect } from 'react';
import { Route, Switch } from "react-router-dom";
import { Routes } from "../routes";

// pages
import Presentation from "./Presentation";
import ProductSuites from "../routes/productSuites";
import App from "../App";




// // components
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Preloader from "../components/Preloader";



const RouteWithLoader = ({ component: Component, ...rest }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Route {...rest} render={props => (<> <Preloader show={loaded ? false : true} /> <Component {...props} /> </>)} />
  );
};

const RouteWithSidebar = ({ component: Component, ...rest }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const localStorageIsSettingsVisible = () => {
    return localStorage.getItem('settingsVisible') === 'false' ? false : true
  }

  const [showSettings, setShowSettings] = useState(localStorageIsSettingsVisible);

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    localStorage.setItem('settingsVisible', !showSettings);
  }

  return (
    <Route {...rest} render={props => (
      <>
        {/* <Preloader show={loaded ? false : true} /> */}
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
  );
};

export default () => (
  <Switch>
    <RouteWithLoader exact path={Routes.Presentation.path} component={Presentation} />


    {/* pages */}
    <RouteWithSidebar exact path={Routes.ProductSuites.path} component={ProductSuites} />
    <RouteWithSidebar exact path={Routes.App.path} component={App} />


    {/* components */}


    {/* documentation */}


    {/* <Redirect to={Routes.NotFound.path} /> */}
  </Switch>
);
