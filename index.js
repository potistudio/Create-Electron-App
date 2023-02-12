const childProcess = require ("node:child_process");
const path = require ("node:path");
const fsPromises = require ("node:fs/promises");

const Enquirer = require ("enquirer");

const templates = {
	"gitattributes": "# Auto detect text files and perform LF normalization\n* text=auto\n",
	"readme": (_name, _desc) => { return `# ${_name}\n\n${_desc}\n`; }
};

const question = [
	{
		type: "input",
		name: "name",
		message: "Project Name (This Name will also be Repository Name)"
	},
	{
		type: "input",
		name: "description",
		message: "Project Description"
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
let projectName = "";
let projectDesc = "";

Enquirer.prompt (question)
	.then (answer => createApp(answer));

function createApp (_answer) {
	projectName = _answer["name"];
	projectDesc = _answer["description"];

	if (path.isAbsolute(_answer["path"]))
		projectPath = _answer["path"];
	else // is relative
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
	childProcess.execSync ("git init " + projectPath);

	fsPromises.writeFile (path.join(projectPath, ".gitattributes"), templates["gitattributes"]);
	fsPromises.writeFile (path.join(projectPath, "README.md"), templates["readme"](projectName, projectDesc));
}