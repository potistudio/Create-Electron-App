const childProcess = require ("node:child_process");
const path = require ("node:path");
const fsPromises = require ("node:fs/promises");

const Enquirer = require ("enquirer");

const templates = {
	"gitattributes": "# Auto detect text files and perform LF normalization\n* text=auto\n"
};

const question = [
	{
		type: "input",
		name: "name",
		message: "Project Name (This Name will also be Repository Name)"
	},
	{
		type: "input",
		name: "path",
		message: "Where is Your Local Path ?",
		initial: "./"
	},
	{
		type: "confirm",
		name: "usegit",
		message: "Do You Use Git ?",
		initial: true
	},
	// {
	// 	type: "multiselect",
	// 	name: "packages",
	// 	choices: [
		// 		{ name: "electron", value: "Electron" },
		// 		{ name: "typescript", value: "TypeScript" },
		// 		{ name: "sass", value: "Sass" },
		// 		{ name: "prettier", value: "Prettier" },
		// 		{ name: "eslint", value: "ESLint" }
		// 	]
	// }
];

let projectPath = "";

Enquirer.prompt (question)
	.then (answer => createApp(answer));

function createApp (_answer) {
	if (path.isAbsolute(_answer["path"]))
		projectPath = _answer["path"];
	else
		projectPath = path.join (process.cwd(), _answer["path"]);
	
	projectPath = path.join (projectPath, _answer["name"]);

	if (_answer["usegit"])
		initGit();

	// for (let i = 0; _answer["packages"].length; i++) {
	// 	switch (_answer["packages"][i]) {
	// 		case "electron":
	// 			console.log ("Import Electron");
	// 			break;

	// 		case "typescript":
	// 			console.log ("Initialize TypeScript");
	// 			break;

	// 		case "sass":
	// 			console.log ("Initialize Sass");
	// 			break;

	// 		case "prettier":
	// 			console.log ("Initialize Prettier");
	// 			break;

	// 		case "eslint":
	// 			console.log ("Initialize ESLint");
	// 			break;

	// 		default:
	// 			return;
	// 	}
	// }
}

function initGit() {
	childProcess.execSync ("git init " + projectPath); // Init git

	fsPromises.writeFile (path.join(projectPath, ".gitattributes"), templates["gitattributes"]);
}