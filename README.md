# Express Application Generator

![Node.js](https://img.shields.io/badge/Node.js-v18.0.0-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-v5.2.0-blue) ![GraphQL](https://img.shields.io/badge/GraphQL-v16.6.0-e10098) ![License](https://img.shields.io/badge/License-MIT-yellow.svg)

Welcome to the **Express Application Generator**! This CLI tool allows you to quickly scaffold a new Express.js application with customizable options. Whether you're starting a new project or want to save time on boilerplate code, this generator will help you set up your application in just a few minutes.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration Options](#configuration-options)
- [Directory Structure](#directory-structure)
- [Next Steps](#next-steps)
- [Contributing](#contributing)
- [License](#license)

## Features

- **✨ Customizable Project Name**: Specify your application name during setup to personalize your project.
- **🔤 TypeScript Support**: Scaffold your application using TypeScript for enhanced type safety and a better development experience, allowing for better error detection during development.
- **📊 GraphQL Support**: Easily enable GraphQL in your backend, allowing clients to specify exactly what data they need, improving the efficiency of your APIs.
- **🌐 CORS Support**: Quickly enable Cross-Origin Resource Sharing (CORS) to facilitate requests from different origins and ensure your API is accessible.
- **📦 Environment Variables**: Automatically set up a `.env` file for managing environment variables, helping you keep sensitive information secure and easily configurable.
- **🗂️ Git Ignore**: Generate a `.gitignore` file to exclude unnecessary files from version control, keeping your repository clean.

## Installation

You can use the generator without installing it globally by using `npx`:

```bash
npx create-ob-app
