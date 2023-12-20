var parser = require("gitignore-parser"),
	fs = require("fs");

var _ = require("underscore");
var path = require("path");

var clear = true;

var thm = function () {
	var self = this;
	var themes = ["white", "black", "classic"];
	var removetheme = { classic: true };
	var ignore = parser.compile(fs.readFileSync(".gitignore", "utf8"));
	var added = {};
	const THEMESBEGIN = "<!-- THEMES BEGIN -->";
	const THEMESEND = "<!-- THEMES END -->";

	var hash = function (str) {
		return str.replace(/[^a-zA-Z0-9:]+/g, "");
	};

	var walk = function (dir, actions, done) {
		if (!actions) actions = {};

		fs.readdir(dir, function (err, list) {
			list = list.filter(ignore.accepts);

			if (err) return done(err);

			var i = 0;

			(function next() {
				var file = list[i++];

				if (!file) return done(null);

				file = path.resolve(dir, file);

				fs.stat(file, function (err, stat) {
					if (stat && stat.isDirectory()) {
						if (actions.directory) actions.directory(file);

						walk(file, actions, function (err, res) {
							next();
						});
					} else {
						if (actions.file) actions.file(file, next);
					}
				});
			})();
		});
	};

	var createThemeData = function (filedata, theme) {
		var nd = filedata.replace(/\$color-/g, "$" + theme + "-" + "color-");
		nd = nd.replace(/theme_template/g, "theme_" + theme);

		nd = nd.replace(/\n/g, "\n\t");
		nd = '@at-root #matrix-root[theme="' + theme + '"] \n\t' + nd;

		return nd;
	};

	var clearThemeFilesAll = function (dirname) {
		if (clearThemeFiles(dirname)) clearThemeFiles(themesPath(dirname));

		if (fs.existsSync(themesPath(dirname))) {
			try {
				fs.rmdirSync(themesPath(dirname));
			} catch (e) {}
		}
	};

	var clearThemeFiles = function (dirname) {
		if (!fs.existsSync(dirname)) return;

		var filenameth = path.join(dirname, "theme_template.sass");

		if (fs.existsSync(filenameth)) {
			fs.unlinkSync(filenameth);
		}

		var filenameth2 = path.join(dirname, "theme_template_notrewrite.sass");

		if (!fs.existsSync(filenameth2)) {
			_.each(themes, function (theme) {
				var filename = path.join(dirname, "theme_" + theme + ".sass");

				if (fs.existsSync(filename)) {
					fs.unlinkSync(filename);
				}
			});

			return true;
		}

		return false;
	};

	var createThemeFiles = function (file) {
		fs.readFile(file, { encoding: "utf-8" }, function (err, data) {
			if (!err) {
				createThemesFolder(path.dirname(file));

				_.each(themes, function (theme) {
					if (removetheme[theme]) return;

					var themedata = createThemeData(data, theme);

					var dirname = path.dirname(file);

					var filename = path.join(
						themesPath(dirname),
						"theme_" + theme + ".sass"
					);

					var options = {};

					if (file.indexOf("notrewrite") > -1) {
						options.flag = "wx";
					} else {
						options.flag = "w";
					}

					fs.writeFile(filename, themedata, options, function (err) {
						/*if(err) {
                            return console.log(err);
                        }*/
					});
				});
			} else {
				console.log(err);
			}
		});
	};

	var clearThemeUsage = function (data, file) {
		var ndata = data.replace(
			new RegExp(THEMESBEGIN + "[^~]*?" + THEMESEND),
			THEMESBEGIN + "\n" + THEMESEND
		);

		return ndata;
	};

	var changeThemeUsage = function (data, file) {
		var scoped = " ";

		if (
			data.indexOf('<style scoped lang="sass" src="./index.scss"></style>') > -1
		)
			scoped = " scoped ";

		var themestring = _.reduce(
			themes,
			function (s, th) {
				if (removetheme[th]) return s;

				return (
					s +
					"<style" +
					scoped +
					'lang="sass" src="./themes/theme_' +
					th +
					'.sass"></style>\n'
				);
			},
			""
		);

		var ndata = data.replace(
			new RegExp(THEMESBEGIN + "[^~]*" + THEMESEND),
			THEMESBEGIN + "\n" + themestring + THEMESEND
		);

		return ndata;
	};

	var clearThemeUsageFile = function (file, clbk) {
		fs.readFile(file, { encoding: "utf-8" }, function (err, data) {
			if (!err) {
				if (data.indexOf(THEMESBEGIN) == -1) return;

				var ndata = clearThemeUsage(data, file);

				fs.writeFile(file, ndata, function (err) {
					if (clbk) clbk();
				});
			} else {
				console.log(err);

				if (clbk) clbk();
			}
		});
	};

	var changeThemeUsageFile = function (file) {
		var dirname = path.dirname(file);

		if (added[dirname]) {
			fs.readFile(file, { encoding: "utf-8" }, function (err, data) {
				if (!err) {
					if (data.indexOf(THEMESBEGIN) == -1) return;

					var ndata = changeThemeUsage(data, file);

					fs.writeFile(file, ndata, function (err) {});
				} else {
					console.log(err);
				}
			});
		}
	};

	var themesPath = function (dirname) {
		return path.join(dirname, "themes");
	};

	var createThemesFolder = function (dirname) {
		var f = themesPath(dirname);

		if (!fs.existsSync(f)) {
			try {
				fs.mkdirSync(f);
			} catch (e) {
				console.log(e);
			}
		}
	};

	var divideIndexSass = function (file, clbk) {
		if (file.indexOf("index.scss") > -1) {
			fs.readFile(file, { encoding: "utf-8" }, function (err, data) {
				if (!err) {
					var strings = data.split("\n");

					var indexStrings = _.filter(strings, function (s) {
						if (s) return true;
					});

					var colorStrings = _.filter(strings, function (s) {
						if (
							s.indexOf("color") > -1 ||
							s.indexOf("@media") > -1 ||
							s.indexOf("animation") > -1 ||
							s.indexOf("background") > -1 ||
							s.indexOf(":") == -1 ||
							hash(s).indexOf(":") == 0 ||
							s.indexOf("transparent") > -1 ||
							(s.indexOf("border") > -1 && s.indexOf("border-radius") == -1)
						)
							return true;
					});

					console.log("colorStrings.length", colorStrings.length);

					if (colorStrings.length && indexStrings.length) {
						var dirname = path.dirname(file);

						added[dirname] = true;

						var filename = path.join(dirname, "theme_template.sass");

						fs.writeFile(filename, colorStrings.join("\n"), function (err) {
							if (clbk) clbk();
						});
					} else {
						if (clbk) clbk();
					}
				} else {
					console.log(err);
				}
			});
		} else {
		}
	};

	self.run = function () {
		walk(
			process.env.INIT_CWD,
			{
				file: function (file, next) {
					if (file.indexOf("index.scss") > -1) {
						clearThemeFilesAll(path.dirname(file));

						if (!clear) divideIndexSass(file, next);
						else {
							if (next) next();
						}
					} else {
						if (next) next();
					}
				},

				directory: function (directory) {},
			},
			function (err, results) {
				walk(
					process.env.INIT_CWD,
					{
						file: function (file, next) {
							if (file.indexOf("themes.js") > -1) {
							} else {
								if (file.indexOf("theme_template") > -1) {
									createThemeFiles(file);
								}

								if (file.indexOf("index.vue" > -1)) {
									clearThemeUsageFile(file, function () {
										if (!clear) changeThemeUsageFile(file);
									});
								}
							}

							if (next) next();
						},

						directory: function (directory) {},
					},
					function (err, results) {
						if (err) throw err;

						console.log("END");
					}
				);
			}
		);
	};

	return self;
};

var t = new thm();

t.run();
