const childProcess = require ("node:child_process");
const path = require ("node:path");
const fsPromises = require ("node:fs/promises");
const Enquirer = require ("enquirer");

const templates = {
	"gitattributes": `# Auto detect text files and perform LF normalization\n* text=auto\n`,
	"readme": (_name, _description) => { return `# ${_name}\n\n${_description}\n`; },
	"gitignore": {
		"None": null,
		"Node.js": "Node",
		"Sass": "Sass"
	},
	"license": {
		"None": null,
		"GPL 2.0": "gpl2",
		"MIT": "mit"
	},
	"package": (_name, _description, _version, _entry, _author, _license) => { return `{\n  "name": "${_name}",\n  "version": "${_version}",\n  "description": "${_description}",\n  "main": "${_entry}",\n  "scripts": {\n    "test": "echo \\"Error: no test specified\\" && exit 1"\n  },\n  "keyword": [],\n  "author": "${_author}",\n  "license": "${_license}"\n}`;
}
};

const questions = {
	"projectInfo": [
		{
			type: "input",
			name: "name",
			message: "Project Name"
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
		}
	],
	"gitSettings": [
		{
			type: "confirm",
			name: "createReadme",
			message: "Create README.md",
			initial: true
		},
		{
			type: "select",
			name: "ignore",
			message: "Choose a Gitignore Template",
			choices: [
				"None",
				"Node.js",
				"Sass"
			]
		},
		{
			type: "select",
			name: "license",
			message: "Choose a License",
			choices: [
				"None",
				"GPL 2.0",
				"MIT"
			]
		}
	]
};

let projectPath = "";
let projectName = "";
let projectDescription = "";
let projectLicense = "";

// Create Prompts and Execute Each Processes
!function main() {
	Enquirer.prompt (questions["projectInfo"]) // Project Info
		.then (_answer => {
			createApp (_answer["name"].split(" ").join("-"), _answer["description"], _answer["path"]); // Create App

			Enquirer.prompt ({ type: "confirm", name: "usegit", message: "Use Git ?", initial: true }) // is Using Git ?
				.then (_answer => {
					if (_answer["usegit"])
						Enquirer.prompt (questions["gitSettings"]) // Git Settings Prompt
							.then (_answer =>
								initGit (_answer["createReadme"], _answer["ignore"], _answer["license"])); // Git Initialize
				});
		});
}();

function createApp (_name, _description, _path) {
	projectName = _name;
	projectDescription = _description;

	if (path.isAbsolute(_path))
		projectPath = _path;
	else
		projectPath = path.join (process.cwd(), _path);
	
	projectPath = path.join (projectPath, _name);

	fsPromises.mkdir (projectPath);
	initPackage(); // TODO
}

/**
 * @param { boolean } createReadme | Wheather to Create README.md
 * @param { string } ignore | Readable gitignore Name. For Example, "Node.js", "Unity". If This is null, It will not Create a .gitignore File.
 * @param { string } license | Readable License Name. For Example, "GPL 2.0", "MIT". If This is null, It will not Create a LICENSE File.
 */
function initGit (_createReadme, _ignore, _license) {
	projectLicense = _license;

	let ignoreFileName = templates["gitignore"][_ignore];
	let licenseFileName = templates["license"][_license];

	// git init
	childProcess.exec ("git init " + projectPath);

	// .gitattribute
	fsPromises.writeFile (path.join(projectPath, ".gitattributes"), templates["gitattributes"]);

	// README.md
	if (_createReadme)
		fsPromises.writeFile (path.join(projectPath, "README.md"), templates["readme"](projectName, projectDescription));

	// .gitignore
	if (ignoreFileName != null)
		fsPromises.copyFile (`./templates/gitignore/${ignoreFileName}.gitignore`, path.join(projectPath, ".gitignore"));
	
	// LICENSE
	if (licenseFileName != null)
		fsPromises.copyFile (`./templates/license/${licenseFileName}.txt`, path.join(projectPath, "LICENSE"));
}

function initPackage (_version, _entry, _author) {
	fsPromises.writeFile (path.join(projectPath, "package.json"), templates["package"](projectName.toLowerCase(), projectDescription, "1.0.0", "./index.js", "POTI-Studio", projectLicense));
}
