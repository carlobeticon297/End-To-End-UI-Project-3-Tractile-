# Tracktile Frontend

![Tracktile Frontend](https://i.imgur.com/5LQu3qF.png)

This repository contains the React-based frontend for the Tracktile platform, allowing users to interact with our services.

# Environments

| Name        | URL                              | Description                                                                                                               |
| ----------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Next        | next-app.dev.tracktile.io        | New features are merged here to build up our next release                                                                 |
| Pre-Release | pre-release-app.dev.tracktile.io | When we reach our merge cutoff in our release cycle, work in Next is promoted to Pre-Release for pre-release QA to occur. |
| Production  | app.tracktile.io                 | Our live production environment where releases are released to every release cycle, and after pre-release QA occurs.      |

# Getting Started

These instructions will guide you through setting up and running the frontend application locally for development. By default, the frontend will connect to our hosted backend environment for convenience. If you wish to run the entire stack locally, including the backend, please refer to the [Tracktile Backend](https://gitlab.com/sharokenstudio/tracktile/backend) repository.

## Prerequisites

Before getting started, make sure you have the following software installed:

- [Node.js](https://nodejs.org/en/)
- [pnpm](https://pnpm.io/)

### Installing

To install the project dependencies, run the following command:

```sh
pnpm install
```

### Configuration

This repository includes an `.env.example` file with some default settings. Copy this file to `.env`:

```sh
cp .env.example .env
```

You can use the `APP_API_URL` variable in the `.env` file to switch between the hosted development backend and your local development backend if running.

### Web

To start the application in the web environment, use the following command:

```sh
pnpm start:web
```

### Android

#### Local Development Builds

To build development APKs locally (rather than using the expo build servers), you'll need Java and the Android SDK installed on your system.

Add the following lines to your `.bashrc`, `.zsrc`, or the appropriate shell configuration file for your environment:

```sh
export ANDROID_HOME=~/Library/Android/sdk
export ANDROID_SDK_ROOT=~/Library/Android/sdk
export ANDROID_AVD_HOME=~/.android/avd
export PATH="/usr/lib/jvm/java/bin:/Users/jarred/Library/Android/sdk/platform-tools:/Users/jarred/Library/Python/3.8/bin:/opt/homebrew/bin:/usr/local/homebrew/bin:/home/jarred/bin:/$PATH"
```

**Note:** You need to update the `PATH` string to reference the proper Android SDK location for **your user**.

Create an Expo account and request the administrator to add you to EAS. Once you have been invited and accepted the invite, run this command.

```
eas login
```

After running this command, you will be prompted to enter your Expo account username and password.

Next, you can build a development APK locally:

```sh
pnpm build:android-dev-client
```

After the build is complete, you can install the APK on a connected Android device or emulator using the following command. Please replace 'example.apk' with the filename of the generated APK.

```sh
adb install example.apk
```

Finally, start the local development server. The application will run in the installed development environment:

```sh
pnpm start:android
```

## Built With

The Tracktile Frontend is built with the following technologies:

- [React](https://reactjs.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [React Hook Form](https://react-hook-form.com/)
- [React Query](https://react-query.tanstack.com/)
- [AWS CDK](https://github.com/aws/aws-cdk)

## Performance Monitoring

We use [react-scan](https://github.com/jaredh159/react-scan) to monitor the performance of the application.

To enable react-scan, set the `EXPO_PUBLIC_APP_ENABLE_REACT_SCAN` environment variable to `true` in your `.env` file.

`react-scan` is currently only supported on the web platform. [Full React Native support is coming soon.](https://github.com/aidenybai/react-scan/pull/23)

## Versioning

We use [Semantic Versioning (SemVer)](http://semver.org/) for versioning. For the available versions, see the [tags on this repository](https://gitlab.com/sharokenstudio/tracktile/frontend/-/tags).

# Cypress Testing Setup Guide

This guide will walk you through setting up Cypress for testing the Frontend directory.

## Prerequisites

Before getting started, make sure you have Node.js and yarn installed on your machine.

## Installation

1. Navigate to the Frontend directory of your project.

2. Install dependencies by running the following command: `pnpm install`

3. Set up the `.env` file for specifying the `EXPO_PUBLIC_APP_ENV` environment variable, which will determine the `baseUrl` for your application.
   Ensure to check the `cypress.config.ts` file for reference. You can also use your local url as the baseUrl as long as your local url is running, replace
   the `baseUrl` in `cypress.config.ts`.

## Running Tests

### Open Tests in Cypress GUI

To open the tests in the Cypress Test Runner GUI, use the following command:
`pnpm cypress open`
This will open the Cypress Test Runner, allowing you to interactively run tests.

### Run Tests Headlessly

To run all tests headlessly (in the background), use the following command:

`pnpm cypress run`

## Additional Notes

---
