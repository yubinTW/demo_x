This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) template.

Create project with
```
npx create-react-app my-app --template redux-typescript
```

Install package.json dependencies by
```
npm install
```


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).



## Cypress

Run specific spec file
```
npx cypress run --spec "cypress/integration/mp-spec.js
```

```
npx cypress run --browser chrome
```
Open test panel
```
npm cypress open
```

### asyncapi viewer component
https://github.com/asyncapi/asyncapi-react#development

## Cypress code coverage install
### Install
```
npm i -D @cypress/instrument-cra
npm i @cypress/code-coverage nyc istanbul-lib-coverage
```
### Modify package.json
```
{
  "scripts": {
    "start-dev": "react-scripts -r @cypress/instrument-cra start"
  }
}
```
Then can use:
```
npm run start-dev
```
to run script

### Modify Cypress file
Add to your cypress/support/index.js file plugin's commands
```
import '@cypress/code-coverage/support'
```

Register tasks in your cypress/plugins/index.js file
```
module.exports = (on, config) => {
  require('@cypress/code-coverage/task')(on, config)

  // add other tasks to be registered here

  // IMPORTANT to return the config object
  // with the any changed environment variables
  return config
}
```
### Run start & test
```
npm run start-dev
npx cypress run
```

### Open code coverage 
```
open coverage/lcov-report/index.html
or
npx nyc report --reporter=text-summary
```

### Reference
https://www.cypress.io/blog/2019/09/05/cypress-code-coverage-for-create-react-app-v3/
https://github.com/cypress-io/code-coverage
