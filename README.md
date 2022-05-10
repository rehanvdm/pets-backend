# Backend

This project consists of a single API Lambda function deployed to AWS that can be accessed using the Function URL(FURL).
The AWS CDK has been used to define the IaC and the Lambda is written in TS.
It has two endpoints:
- Get all pets
- Get a pet by ID

A pre-build step uses the OpenAPI spec (`src/openapi/openapi.yaml`) to generate TS types to be used at compile time. 
It also uses the Open API spec to generate JS validation functions using the AJV standalone method that can be used at runtime.
This is how we validate both the input and output of our API and make it the source of truth for our API.

Deployment is done manually using the JS GULP script in this project. This project does it manually to keep it brief, but ideally you do
this in your pipeline. After the CDK is deployed (with the `cdk_deploy` command), it publishes the API SDK as an NPM package to GitHub.
The published NPM package version is the same as the OpenAPI spec version and will only
be published if the version is more than the current version.

> You can use the GULP plugin for your IDE to debug and run the `gulpfile.js` that is used as the build script.
You can also run the scripts via`npm run <TASK>`  for your convenience.

## Configuring

1. Replace the values if you want to do deploy to AWS and publish the API as an SDK in the `gulpfile.js` on lines 45-52:
- `<YOUR AWS PROFILE NAME TO USE FOR DEPLOYMENTS>`
- `<AWS REGION TO DEPLOY IN>`
- `<AWS ACCOUNT ID TO DEPLOY IN>`
- `<HTTPS URL OF THE EXISTING EMPTY GITHUB REPO TO STORE THE API SDK ENDING IN .git>` example https://github.com/rehanvdm/pets-api.git
- `<SDK PACKAGE NAME AS IN THE package.json>` must start with @, example @rehanvdm/pets-api
- `<SDK PACKAGE REPO AS IN THE package.json>` example git://github.com/rehanvdm/pets-api.git

## Running locally

Useful commands:

- `npm run build_types` - Takes the OpenAPI spec and creates TS types to be used at compile time as well as 
   JS validation functions to be used at runtime.
- `npm run watch_types` - Watches the OpenAPI spec at `src/openapi/openapi.yaml` and if they change, it runs the `build_types`
   command above.
- `npm run build_lambdas` - Does the TS => JS transpolation and then copies the `src` files to the `dist` folder.
- `npm run test` - Runs the `test/api.js` file that contains basic Mocha & Chai tests that first transpiles the TS to JS with the same ESBuild function that
   is used for deployments in the GULP file. Then it passes an event and context to the function to test it locally.

## Publishing the package

1. Create a [Personal Access Token(PAT) on GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-token)
   so that we can write the SDK API NPM package. You need to assign the flowing permissions:
   - `write:packages` Upload packages to the GitHub Package Registry
2. Make a copy of the `.npmrc.example` file and replace:
   -`<YOUR PERSONAL ACCESS TOKEN HERE>` with your GitHub Personal Access Token (PAT) that you obtained above
   -`<YOUR GITHUB PROFILE OR ORGANIZATION NAME>` with your GutHub username of where the package is installed

## Running on AWS

Deploys a Lambda + FURL on AWS.

- `npm run cdk_diff` - Runs `build_types` and `build_lambdas`, then the `cdk diff` command.
- `npm run cdk_deploy` - Runs `build_types` and `build_lambdas`, then the `cdk deploy` command. After that it runs the
    `generate_and_push_api_sdk` command to do the API SDK generation and package publishing logic.
- `npm run cdk_hotswap` - Runs `build_types` and `build_lambdas`, then the `cdk deploy --hotswap` command.

After you deployed, you will be given the Function URL. You will have to update the API URL in the frontend repository
with this value.

## Using the NPM package

See the frontend docs here: [https://github.com/rehanvdm/pets-frontend](https://github.com/rehanvdm/pets-frontend)


