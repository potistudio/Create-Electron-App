const childProcess = require ("node:child_process");
const path = require ("node:path");
const fsPromises = require ("node:fs/promises");
const Enquirer = require ("enquirer");

const templates = {
	"gitattributes": "# Auto detect text files and perform LF normalization\n* text=auto\n",
	"readme": (_name, _description) => { return `# ${_name || "{NAME}"}\n\n${_description || "{DESCRIPTION}"}\n`; },
	"ignore": {
		"Node.js": "Node",
		"Sass": "Sass"
	},
	"license": {
		"GPL 2.0": "gpl2",
		"MIT": "mit"
	},
	"package": (_name, _description, _version, _entry, _author, _license) => { return `{\n  "name": "${_name}",\n  "version": "${_version}"\n,  "description": "${_description}",\n  "main": "${_entry}",\n  "scripts": {\n    "test": "echo \\"Error: no test specified\\" && exit 1"\n  },\n  "keyword": [],\n  "author": "${_author}",\n  "license": "${_license}"\n}`;
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
			type: "multiselect",
			name: "ignore",
			message: "gitignore Template",
			choices: [
				"Node.js",
				"Sass"
			]
		},
		{
			type: "select",
			name: "license",
			message: "Choose A License",
			choices: [
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
	Enquirer.prompt (questions["projectInfo"])
		.then (_answer => {
			createApp(_answer["name"].split(" ").join("-"), _answer["description"], _answer["path"]);

			Enquirer.prompt ({ type: "confirm", name: "usegit", message: "Do You Use Git ?", initial: true })
				.then (_answer => {
					if (_answer["usegit"])
						Enquirer.prompt (questions["gitSettings"])
							.then (_answer => initGit (templates["ignore"][_answer["ignore"]], templates["license"][_answer["license"]]));
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
	initPackage();
}

/**
 * 
 * @param { string } ignore | gitignore File Name
 * @param { string } license | License File Name
 */
function initGit (_ignore, _license) {
	projectLicense = _license;

	childProcess.execSync ("git init " + projectPath);

	fsPromises.writeFile (path.join(projectPath, ".gitattributes"), templates["gitattributes"]);
	fsPromises.writeFile (path.join(projectPath, "README.md"), templates["readme"](projectName, projectDescription));

	fsPromises.copyFile (`./templates/gitignore/${_ignore}.gitignore`, path.join(projectPath, ".gitignore"));
	fsPromises.copyFile (`./templates/license/${_license}.txt`, path.join(projectPath, "LICENSE"));
}

function initPackage (_version, _entry, _author) {
	fsPromises.writeFile (path.join(projectPath, "package.json"), templates["package"](projectName.toLowerCase(), projectDescription, "1.0.0", "./index.js", "POTI-Studio", projectLicense));
}
