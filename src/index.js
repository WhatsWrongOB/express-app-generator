#!/usr/bin/env node

import inquirer from "inquirer";
import fs from "fs";
import chalk from "chalk";
import { execSync } from "child_process";

const questions = [
  {
    type: "input",
    name: "appName",
    message: "Enter your express project name:",
    default: "server",
  },
  {
    type: "list",
    name: "language",
    message: "Which language you want to use?",
    choices: ["Javascript", "Typescript"],
    default: "Javascript",
  },
  {
    type: "input",
    name: "portNo",
    message: "Please specify the port number:",
    default: 3000,
  },
  {
    type: "confirm",
    name: "useCors",
    message: "Do you want to enable CORS?",
    default: true,
  },
  {
    type: "confirm",
    name: "useEnvFile",
    message: "Do you want to use an .env file?",
    default: true,
  },
  {
    type: "confirm",
    name: "usegitIgnore",
    message: "Do you want to use a .gitignore file?",
    default: true,
  },
  {
    type: "confirm",
    name: "useDocker",
    message: "Do you want to use Docker for deployment?",
    default: true,
  },
];

function getLatestVersion(packageName) {
  try {
    return execSync(`npm show ${packageName} version`).toString().trim();
  } catch (error) {
    console.error(`Error fetching version for ${packageName}:`, error);
    return null;
  }
}

function createProjectDirectories(projectDir) {
  const dirs = [
    `${projectDir}/src`,
    `${projectDir}/src/routes`,
    `${projectDir}/src/controllers`,
    `${projectDir}/src/middlewares`,
    `${projectDir}/src/utils`,
    `${projectDir}/src/config`,
  ];
  dirs.forEach((dir) => fs.mkdirSync(dir, { recursive: true }));
}

function createPackageJson(projectDir, projectName, answers) {
  const dependencies = {
    express: getLatestVersion("express"),
  };

  const devDependencies = {
    nodemon: getLatestVersion("nodemon"),
    ...(answers.useEnvFile && { dotenv: getLatestVersion("dotenv") }),
    ...(answers.useCors && { cors: getLatestVersion("cors") }),
    ...(answers.language === "Typescript" && {
      typescript: getLatestVersion("typescript"),
      "@types/node": getLatestVersion("@types/node"),
      "@types/express": getLatestVersion("@types/express"),
      "@types/cors": getLatestVersion("@types/cors"),
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
    author: "Your Name ...",
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

  if (answers.useEnvFile) {
    importLines.push(`import dotenv from 'dotenv';`);
    middlewareLines.push(`dotenv.config();`);
    const envFileContent = `
PORT=${answers.portNo};`.trim();
    fs.writeFileSync(`${projectDir}/.env`, envFileContent);
  }

  const content = `
${importLines.join("\n")}
${middlewareLines.join("\n")}

const port = process.env.PORT || ${answers.portNo};
app.listen(port, () => {
    console.log(\`🚀 Express running → On http://localhost:\${port} 🔥\`);
});`.trim();

  fs.writeFileSync(
    `${projectDir}/src/index.${
      answers.language === "Typescript" ? "ts" : "js"
    }`,
    content,
    "utf8"
  );
}

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

function createGitIgnore(projectDir, answers) {
  const gitIgnoreContent = `
node_modules
${answers.useEnvFile ? `.env` : ""}
dist`.trim();
  fs.writeFileSync(`${projectDir}/.gitignore`, gitIgnoreContent.trim(), "utf8");
}

function createDockerFile(projectDir, portNo) {
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
EXPOSE ${portNo}

# Start the application.
CMD [ "npm", "run", "dev" ]
`.trim();

  fs.writeFileSync(`${projectDir}/Dockerfile`, dockerFileContent, "utf8");
}

function createDockerIgnoreFile(projectDir, useEnvFile) {
  const dockerComposeContent = `
node_modules
${useEnvFile ? ".env" : ""}
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
    createProjectDirectories(projectDir);
    createPackageJson(projectDir, projectName, answers);
    createIndexFile(projectDir, answers);

    if (answers.language === "Typescript") {
      createTsConfig(projectDir);
    }

    if (answers.usegitIgnore) {
      createGitIgnore(projectDir, answers);
    }

    if (answers.useDocker) {
      createDockerFile(projectDir, answers.portNo);
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
