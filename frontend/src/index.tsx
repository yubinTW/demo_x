import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { store } from './app/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';

import {BrowserRouter as Router,Switch, Route} from 'react-router-dom';

import App from './App';
import ProductSuites from './routes/productSuites';
import CreateAPI from './routes/createAPI';
import HeaderBar from './component/headerBar';
import APIViewer from './routes/apiViewer';

const routes = [
  {
    path: "/",
    exact: true,
    component: App
  },
  {
    path: "/product-suite",
    exact:true,
    component: ProductSuites
  },
  {
    path: "/create-api",
    exact: true,
    component: CreateAPI
  },
  {
    path: "/api-viewer",
    exact: true,
    component: APIViewer
  }
];
const RouteWithSubRoutes = (route: any) =>{
  return (
    <Route
      path={route.path}
      render={props => (
        // pass the sub-routes down to keep nesting
        <route.component {...props} routes={route.routes} />
      )}
    />
  );
}
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <div className="indexPage">
        <div className="header">
          <HeaderBar />
        </div>
        <div className="inner_page">
            <Router>
              <Switch>
                  {routes.map((route, i) => (
                    <RouteWithSubRoutes key={i} {...route} />
                  ))}
                </Switch>
            </Router>
          </div>
    </div>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
