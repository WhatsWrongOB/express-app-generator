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
      default: false,
    },
  ];

  export default questions