#!/usr/bin/env node

import fs from "fs";
import chalk from "chalk";
import inquirer from "inquirer";
import questions from "./question.js";
import { execSync } from "child_process";

/**
 * Get the latest version of a package from npm.
 * @param {string} packageName -
 * @returns {string | null} -
 */
function getLatestVersion(packageName) {
  try {
    return execSync(`npm show ${packageName} version`).toString().trim();
  } catch (error) {
    console.error(`Error fetching version for ${packageName}:`, error);
    return null;
  }
}

/**
 * Create the project directory structure based on user input.
 * @param {string} projectDir
 * @param {object} answers
 * @returns {void}
 */
function createProjectDirectories(projectDir, answers) {
  const dirs = [
    `${projectDir}/src`,
    `${projectDir}/src/routes`,
    `${projectDir}/src/controllers`,
    `${projectDir}/src/services`,
    `${projectDir}/src/middlewares`,
    `${projectDir}/src/models`,
    `${projectDir}/src/utils`,
    `${projectDir}/src/config`,
  ];
  if (answers.useGraphQL) {
    dirs.splice(1, 3);
    dirs.push(`${projectDir}/src/graphQL`);
    dirs.push(`${projectDir}/src/graphQL/schemas`);
    dirs.push(`${projectDir}/src/graphQL/resolvers`);
  }
  dirs.forEach((dir) => fs.mkdirSync(dir, { recursive: true }));
}

/**
 * Create the package.json file for the project with specified dependencies and scripts.
 * @param {string} projectDir
 * @param {string} projectName
 * @param {object} answers
 * @returns {void}
 */
function createPackageJson(projectDir, projectName, answers) {
  const dependencies = {
    express: getLatestVersion("express"),
    ...(answers.useEnvFile && { dotenv: getLatestVersion("dotenv") }),
    ...(answers.useCors && { cors: getLatestVersion("cors") }),
    ...(answers.useGraphQL && {
      graphql: getLatestVersion("graphql"),
      "apollo-server-express": getLatestVersion("apollo-server-express"),
    }),
  };

  const devDependencies = {
    nodemon: getLatestVersion("nodemon"),
    ...(answers.language === "Typescript" && {
      typescript: getLatestVersion("typescript"),
      "@types/node": getLatestVersion("@types/node"),
      "@types/express": getLatestVersion("@types/express"),
      ...(answers.useCors && {
        "@types/cors": getLatestVersion("@types/cors"),
      }),
      ...(answers.useGraphQL && {
        "@types/graphql": getLatestVersion("@types/graphql"),
      }),
    }),
  };

  const scripts = {
    start: `node ${
      answers.language === "Typescript" ? "dist/index.js" : "src/index.js"
    }`,
    dev:
      answers.language === "Typescript"
        ? `tsc --watch`
        : `nodemon src/index.js`,
  };

  if (answers.language === "Typescript") {
    scripts.build = `tsc`;
  }

  const packageJsonContent = {
    name: projectName.toLowerCase().replace(/ /g, "-"),
    version: "1.0.0",
    description: "A simple Express.js application generated by the CLI.",
    main: answers.language === "Typescript" ? `dist/index.js` : `src/index.js`,
    type: "module",
    scripts,
    license: "ISC",
    dependencies,
    devDependencies,
  };

  fs.writeFileSync(
    `${projectDir}/package.json`,
    JSON.stringify(packageJsonContent, null, 2),
    "utf8"
  );
}

/**
 * Create the main index file for the Express.js application.
 * @param {string} projectDir
 * @param {object} answers
 * @returns {void}
 */
function createIndexFile(projectDir, answers) {
  const importLines = [`import express from 'express';`];
  const middlewareLines = [
    `const app = express();`,
    `app.use(express.json());`,
  ];

  if (answers.useCors) {
    importLines.push(`import cors from 'cors';`);
    middlewareLines.push(`app.use(cors({ origin: '*', credentials: true }));`);
  }

  if (answers.useGraphQL) {
    if (answers.language === "Javascript") {
      importLines.push(`import { ApolloServer } from "apollo-server-express";`);
    }
    if (answers.language === "Typescript") {
      importLines.push(
        `import {ApolloServer, gql } from "apollo-server-express";`
      );
    }
  }

  if (answers.useEnvFile) {
    importLines.push(`import dotenv from 'dotenv';`);
    middlewareLines.push(`dotenv.config();`);
    const envFileContent = `PORT=3000`.trim();
    fs.writeFileSync(`${projectDir}/.env`, envFileContent);
  }

  const graphqlServerSetup = `
const typeDefs = ${answers.language === "Typescript" ? "gql`" : "`"}
  type Query {
    getResponse: String
  }
${answers.language === "Typescript" ? "`;" : "`;"}

const resolvers = {
  Query: {
    getResponse: () => "Happy Coding 🚀",
  },
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

await apolloServer.start();
apolloServer.applyMiddleware({ app });
`;

  const content = `
${importLines.join("\n")}

${middlewareLines.join("\n")}

${
  answers.useGraphQL
    ? ""
    : `app.use("/", (req, res) => {
    res.send("Happy Coding 🚀");
});`
}

${answers.useGraphQL ? graphqlServerSetup : ""}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(\`Express running → On http://localhost:\${port}${
      answers.useGraphQL ? `/graphql` : ""
    } 🚀\`); 
});
`.trim();

  fs.writeFileSync(
    `${projectDir}/src/index.${
      answers.language === "Typescript" ? "ts" : "js"
    }`,
    content,
    "utf8"
  );
}

/**
 * Create the tsconfig.json file for the TypeScript project.
 * @param {string} projectDir
 * @returns {void}
 */
function createTsConfig(projectDir) {
  const tsConfigContent = `
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
`.trim();

  fs.writeFileSync(`${projectDir}/tsconfig.json`, tsConfigContent, "utf8");
}

/**
 * Create a .gitignore file for the project.
 * @param {string} projectDir
 * @param {object} answers
 * @returns {void}
 */
function createGitIgnore(projectDir, answers) {
  const gitIgnoreContent = `
node_modules
${answers.useEnvFile ? `.env` : ""}
dist`.trim();
  fs.writeFileSync(`${projectDir}/.gitignore`, gitIgnoreContent.trim(), "utf8");
}

/**
 * Create a Dockerfile for the project.
 * @param {string} projectDir
 * @returns {void}
 */
function createDockerFile(projectDir) {
  const dockerFileContent = `
# Use the official Node.js image.
FROM node:18

# Set the working directory.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application code.
COPY . .

# Expose the application port.
EXPOSE 3000  # Set static port

# Start the application.
CMD [ "npm", "run", "dev" ]
`.trim();

  fs.writeFileSync(`${projectDir}/Dockerfile`, dockerFileContent, "utf8");
}

/**
 * Create a .dockerignore file for the project.
 * @param {string} projectDir
 * @param {boolean} useEnvFile
 * @returns {void}
 */
function createDockerIgnoreFile(projectDir, useEnvFile) {
  const dockerComposeContent = `
node_modules
npm-debug.log
Dockerfile
.dockerignore
${useEnvFile ? ".env" : ""}
dist
`.trim();

  fs.writeFileSync(`${projectDir}/.dockerignore`, dockerComposeContent, "utf8");
}

async function createApp() {
  console.log("\n");

  console.log(
    chalk.magentaBright(
      chalk.italic("Welcome to the Express.js project generator! 🚀")
    )
  );
  console.log("\n");

  const answers = await inquirer.prompt(questions);

  const projectName = answers.appName;
  const projectDir = `./${projectName}`;

  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir);
    createProjectDirectories(projectDir, answers);
    createPackageJson(projectDir, projectName, answers);
    createIndexFile(projectDir, answers);

    if (answers.language === "Typescript") {
      createTsConfig(projectDir);
    }

    if (answers.usegitIgnore) {
      createGitIgnore(projectDir, answers);
    }

    if (answers.useDocker) {
      createDockerFile(projectDir);
      createDockerIgnoreFile(projectDir, answers.useEnvFile);
    }
  }

  console.log("\n");
  console.log(
    chalk.bgWhite(
      chalk.black(` 🎉 Project '${projectName}' created successfully! 🎉 `)
    )
  );
  console.log("\n");
  console.log(chalk.magentaBright(chalk.italic("Next Steps:")));
  console.log(chalk.bold(`-> cd ${projectName}`));
  console.log(chalk.bold("-> npm install"));
  console.log(chalk.bold("-> npm start"));

  console.log("\n");

  console.log(
    chalk.bgBlueBright(chalk.italic("CLI Developed by OB 🔥, Happy Coding 🎉"))
  );

  console.log("\n");
}

createApp();
