import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './index.css'

import { store } from './app/store'
import { Provider } from 'react-redux'
import * as serviceWorker from './serviceWorker'

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import HomePage from './pages/HomePage'

// core styles
import './scss/volt.scss'
// vendor styles
import '@fortawesome/fontawesome-free/css/all.css'

import { MockServer } from './service/MockServer'
import {createServer, Response, Server} from 'miragejs'

/*
// @ts-ignore
if (window.Cypress) {
  // mirage cypress server
  let cyServer = new Server({
    routes() {
      ["get", "put", "patch", "post", "delete"].forEach(method => {
        this[method]("/*", (schema, request) => {
          // @ts-ignore
          return window.handleFromCypress(request);
        });
      });
    }
  });
  cyServer.logging = false;
} else if (!process.env.REACT_APP_PROXY) {
  // mirage dev server
  const environment = process.env.NODE_ENV
  MockServer({ environment })
}*/

const environment = process.env.NODE_ENV
console.log(environment)
if (environment !== 'production') {
  MockServer({ environment })
}

// const routes = [
//   {
//     path: "/",
//     exact: true,
//     component: App
//   },
//   {
//     path: "/product-suite",
//     component: ProductSuites
//   },
//   {
//     path: "/create-api",
//     component: CreateAPI
//   }
// ];
// function RouteWithSubRoutes(route: any) {
//   return (
//     <Route
//       path={route.path}
//       render={props => (
//         // pass the sub-routes down to keep nesting
//         <route.component {...props} routes={route.routes} />
//       )}
//     />
//   );
// }
// ReactDOM.render(
//   <React.StrictMode>
//     <Provider store={store}>
//       <div className="indexPage">
//         <div className="header">
//           <HeaderBar />
//         </div>
//         <div className="inner_page">
//             <Router>
//               <Switch>
//                   {routes.map((route, i) => (
//                     <RouteWithSubRoutes key={i} {...route} />
//                   ))}
//                 </Switch>
//             </Router>
//           </div>
//     </div>
//     </Provider>
//   </React.StrictMode>,
//   document.getElementById('root')
// );
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <HomePage />
      </Router>
    </Provider>
  </React.StrictMode>,

  document.getElementById('root')
)
// import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'

// import App from './App';
// import ProductSuites from './routes/productSuites'
// import CreateAPI from './routes/createAPI'
// import HeaderBar from './component/headerBar'
// import APIViewer from './routes/apiViewer'

// ReactDOM.render(
//   <React.StrictMode>
//     <Provider store={store}>
//       <div className="indexPage">
//         <div className="header">
//           <HeaderBar />
//         </div>
//         <div className="inner_page">
//             <Router>
//               <Switch>
//                   <Route exact path="/" component={App} ></Route>
//                   <Route exact path="/product-suite" component={ProductSuites} ></Route>

//                   <Route exact path="/create-api" component={CreateAPI} ></Route>
//                   <Route path="/api-viewer/:id" component={APIViewer}></Route>
//               </Switch>
//             </Router>
//           </div>
//     </div>
//     </Provider>
//   </React.StrictMode>,
//   document.getElementById('root')
// )

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
