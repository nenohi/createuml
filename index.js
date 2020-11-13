const fs = require("fs");
const readline = require("readline");
const xml2json = require("xml2json");
var filepath
if (process.argv.length > 2) {
	filepath = process.argv[2];
} else {
	process.exit(1);
}
var filedirsp = filepath.split('\\');
var filedir = "";
for (var i = 0; i < filedirsp.length - 1; i++) {
	filedir = filedir + filedirsp[i] + '\\';
}
var text = "@startuml\nfolder " + filedirsp[filedirsp.length - 2] + "{\n";
var project = /^Project\(.+?\) = \"(.+?)\", \"(.+?)\"/;
var projects = new Array();
var xaml = new Array();
var strfile = new Array();
loadsln()
function loadsln() {
	const streampro1 = fs.createReadStream(filepath);
	const readerpro1 = readline.createInterface({ input: streampro1 });
	readerpro1.on("line", (data) => {
		if (data.match(project)) {
			var name = data.match(project)
			projects.push(name[2]);
			var str = fs.readFileSync(filedir + name[2], "utf-8",);
			var dom = xml2json.toJson(str);
			var json = JSON.parse(dom);
			xaml.push(json);
			strfile.push(str);
		}
	}).on("close", () => {
		sortingxml()
	})
}

function sortingxml() {
	if (!fs.existsSync("outputpu")) {
		fs.mkdirSync("outputpu")
	}
	for (var i = 0; i < xaml.length; i++) {
		if (!fs.existsSync("outputpu\\" + filedirsp[filedirsp.length - 2] + "\\" + projects[i].split('\\')[0])) {
			fs.mkdirSync("outputpu\\" + filedirsp[filedirsp.length - 2] + "\\" + projects[i].split('\\')[0], { recursive: true })
		}
		var folder = projects[i].split("\\")[0];
		if (xaml[i].Project.ItemGroup == undefined) continue;
		xaml[i].Project.ItemGroup.forEach(element => {
			for (elm in element) {
				if (elm.match("Reference")) continue;
				if (element[elm].length == undefined) {
					if (element[elm].Include == undefined) continue;
					var folsp = element[elm].Include.split(/(\\|\/)/);
					var fol = folsp.slice(0, folsp.length - 2)
					if (!fs.existsSync("outputpu\\" + filedirsp[filedirsp.length - 2] + "\\" + projects[i].split('\\')[0] + "\\" + fol)) {
						fs.mkdirSync("outputpu\\" + filedirsp[filedirsp.length - 2] + "\\" + projects[i].split('\\')[0] + "\\" + fol, { recursive: true })
					}
					var fileex = element[elm].Include.split(".");
					if (fileex[fileex.length - 1] == "cs") {
						addclass(filedir + folder + "\\" + element[elm].Include, projects[i].split('\\')[0], inc.Include)
					}
				} else {
					element[elm].forEach(inc => {
						if (inc.Include != undefined) {

							var folsp = inc.Include.split("\\");
							var fol = folsp.slice(0, folsp.length - 1)
							if (!fs.existsSync("outputpu\\" + filedirsp[filedirsp.length - 2] + "\\" + projects[i].split('\\')[0] + "\\" + fol)) {
								fs.mkdirSync("outputpu\\" + filedirsp[filedirsp.length - 2] + "\\" + projects[i].split('\\')[0] + "\\" + fol, { recursive: true })
							}
							var fileex = inc.Include.split(".");
							if (fileex[fileex.length - 1] == "cs") {
								addclass(filedir + folder + "\\" + inc.Include, projects[i].split('\\')[0], inc.Include)
							};
						}
					})
				}
			}
		});
	}
}

function addclass(filepath, projectname, includefile) {
	var filedirspt = filepath.split('\\');
	var filedir = "";
	for (var i = 0; i < filedirspt.length - 1; i++) {
		filedir = filedir + filedirspt[i] + '\\';
	}
	var streampro1 = fs.createReadStream(filepath);
	var readerpro1 = readline.createInterface({ input: streampro1 });
	var classflag = false;
	//var classtext = "";
	var classtext = "@startuml \n folder " + filedirspt[filedirspt.length - 1] + "{\n";
	readerpro1.on("line", (data) => {
		if (data.match(/class (.+?)$/)) {
			var d = data.match(/class (.+?): (.+?)$/);
			if (d == null || d == undefined) {
				d = data.match(/class (.+?)$/)
			}
			if (classflag) {
				classtext += "\n}\n"
			}
			classtext += "class " + d[1] + "{\n";
			classflag = true;
		} else if (data.match(/(public|private|protected|package private) (.+?)\{(.+?)$/)) {
			var d = data.match(/(public|private|protected|package private) (.+?)\{(.+?)$/);
			if (d[1] == "public") {
				classtext += "\t+";
			} else if (d[1] == "private") {
				classtext += "\t-";
			} else if (d[1] == "protected") {
				classtext += "\t#";
			} else if (d[1] == "package private") {
				classtext += "\t~";
			}
			classtext += d[2] + "\n";
		} else if (data.match(/(public|private|protected|package private) (.+?) \=\> (.+?)$/)) {
			var d = data.match(/(public|private|protected|package private) (.+?) \=\> (.+?)$/);
			if (d[1] == "public") {
				classtext += "\t+";
			} else if (d[1] == "private") {
				classtext += "\t-";
			} else if (d[1] == "protected") {
				classtext += "\t#";
			} else if (d[1] == "package private") {
				classtext += "\t~";
			}
			classtext += d[2] + "\n";
		} else if (data.match(/(public|private|protected|package private) (.+?) \= (.+?)$/)) {
			var d = data.match(/(public|private|protected|package private) (.+?) \= (.+?)$/);
			if (d[1] == "public") {
				classtext += "\t+";
			} else if (d[1] == "private") {
				classtext += "\t-";
			} else if (d[1] == "protected") {
				classtext += "\t#";
			} else if (d[1] == "package private") {
				classtext += "\t~";
			}
			classtext += d[2] + "\n";
		} else if (data.match(/(public|private|protected) (.+?)$/)) {
			var d = data.match(/(public|private|protected|package private) (.+?)$/);
			if (d[1] == "public") {
				classtext += "\t+";
			} else if (d[1] == "private") {
				classtext += "\t-";
			} else if (d[1] == "protected") {
				classtext += "\t#";
			} else if (d[1] == "package private") {
				classtext += "\t~";
			}
			classtext += d[2] + "\n";
		}
	}).on("close", () => {

		if (classflag) {
			fs.writeFileSync("outputpu\\" + filedirsp[filedirsp.length - 2] + "\\" + projectname + "\\" + includefile + ".pu", classtext + "}\n}\n@enduml");
		} else {
			fs.writeFileSync("outputpu\\" + filedirsp[filedirsp.length - 2] + "\\" + projectname + "\\" + includefile + ".pu", classtext + "}\n@enduml");
		}
	})
}
