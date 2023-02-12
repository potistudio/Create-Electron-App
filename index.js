const Enquirer = require ("enquirer");

const question = [
	{
		type: "input",
		name: "directory",
		message: "Where is Your Project Directory ?",
		initial: "./"
	},
	{
		type: "confirm",
		name: "usegit",
		message: "Do You Use Git ?",
		initial: true
	},
	{
		type: "multiselect",
		name: "packages",
		choices: [
			{ name: "git", value: "Git" },
			{ name: "electron", value: "Electron" },
			{ name: "typescript", value: "TypeScript" },
			{ name: "sass", value: "Sass" },
			{ name: "prettier", value: "Prettier" },
			{ name: "eslint", value: "ESLint" }
		]
	}
];

Enquirer.prompt (question)
	.then (answer => createApp(answer));

function createApp (_answer) {
	for (let i = 0; _answer["packages"].length; i++) {
		switch (_answer["packages"][i]) {
			case "git":
				console.log ("Initialze Git Repository");
				break;

			case "electron":
				console.log ("Import Electron");
				break;

			case "typescript":
				console.log ("Initialize TypeScript");
				break;

			case "sass":
				console.log ("Initialize Sass");
				break;

			case "prettier":
				console.log ("Initialize Prettier");
				break;

			case "eslint":
				console.log ("Initialize ESLint");
				break;

			default:
				return;
		}
	}
}