var createHash = null;

var f = {};

f.sha224 = function (text) {
	if (!createHash) {
		createHash = require("create-hash");
	}

	var hash = createHash("sha224");
	hash.update(text);
	return hash.digest();
};

f.language = function () {
	var language;
	if (window.navigator.languages) {
		language = window.navigator.languages[0];
	} else {
		language = window.navigator.userLanguage || window.navigator.language;
	}

	return language;
};
f.deep = function (obj, key) {
	var _key = _.isArray(key) ? key : key.split(".");

	var tkey = _key[0];

	if (typeof obj == "undefined" || !obj) return undefined;

	if (typeof obj[tkey] != "undefined") {
		_key.splice(0, 1);

		if (_key.length === 0) {
			return obj[tkey];
		} else {
			return f.deep(obj[tkey], _key);
		}
	} else {
		return undefined;
	}
};

var renderFrameEqualizer = function (
	canvas,
	ctx,
	analyser,
	stop,
	colornumbers,
	offset
) {
	if (!colornumbers) {
		colornumbers = {
			r: 25,
			g: 250,
			b: 50,
		};
	}

	if (!offset) {
		offset = {
			x: 25,
			offset: [0, 0],
		};
	}

	var WIDTH = canvas.width;
	var HEIGHT = canvas.height;

	var bufferLength = analyser.frequencyBinCount;
	var dataArray = new Uint8Array(bufferLength);

	var barWidth = WIDTH / bufferLength / 2.5;
	var barHeight;

	var x = offset.x; // offset[0] -15;

	analyser.getByteFrequencyData(dataArray);

	ctx.clearRect(0, 0, WIDTH, HEIGHT);

	for (var i = 0; i < bufferLength; i++) {
		barHeight = dataArray[i];

		var r = barHeight + colornumbers.r * (i / bufferLength);
		var g = colornumbers.g * (i / bufferLength);
		var b = colornumbers.b;

		var opacity = -Math.abs(i - bufferLength / 2) / bufferLength + 1 / 2;

		if (i > offset.offset[0] && i < bufferLength - offset.offset[1]) {
			ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + opacity * 2 + ")";
			ctx.fillRect(
				x,
				HEIGHT / 2 - barHeight * opacity,
				barWidth,
				barHeight * opacity * 2
			);
		}

		x += barWidth + 1;
	}

	requestAnimationFrame(function () {
		if (stop()) {
			ctx.clearRect(0, 0, WIDTH, HEIGHT);

			return;
		}

		renderFrameEqualizer(canvas, ctx, analyser, stop, colornumbers, offset);
	});
};

var rand = function (min, max) {
	min = parseInt(min);
	max = parseInt(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

f.permutations = function (array, k) {
	k || (k = 1);

	var m = [];
	var combinations = [];
	var indices = [];
	var len = array.length;
	function run(level) {
		for (var i = 0; i < len; i++) {
			if (!indices[i]) {
				indices[i] = true;
				combinations[level] = array[i];
				if (level < k - 1) {
					run(level + 1, i + 1);
				} else {
					m.push([].concat(combinations));
				}
				indices[i] = false;
			}
		}
	}
	run(0);
	return m;
};

var copytext = function (text) {
	if (window.clipboardData && window.clipboardData.setData) {
		// IE specific code path to prevent textarea being shown while dialog is visible.
		return clipboardData.setData("Text", text);
	} else if (
		document.queryCommandSupported &&
		document.queryCommandSupported("copy")
	) {
		var textarea = document.createElement("textarea");
		textarea.textContent = text;
		textarea.style.position = "fixed"; // Prevent scrolling to bottom of page in MS Edge.
		document.body.appendChild(textarea);
		textarea.select();
		try {
			return document.execCommand("copy"); // Security exception may be thrown by some browsers.
		} catch (ex) {
			console.warn("Copy to clipboard failed.", ex);
			return false;
		} finally {
			document.body.removeChild(textarea);
		}
	}
};

var makeid = function (valid) {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}

	if (!valid) {
		return (
			s4() +
			s4() +
			"-" +
			s4() +
			"-" +
			s4() +
			"-" +
			s4() +
			"-" +
			s4() +
			s4() +
			s4()
		);
	}

	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

	for (var i = 0; i < 16; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
};
// roomalias

var flball = function (str) {
	//return flbb(str)

	if (!str || !str.split) return str;

	var exception = ["2ndEdison, 3dCarbon", "A-Pmcs"];
	var lower = [
		"TO",
		"K",
		"X",
		"10X",
		"THE",
		"AN",
		"AND",
		"OR",
		"AT",
		"BUT",
		"BY",
		"FOR",
		"IN",
		"OF",
		"OFF",
		"ON",
		"OUT",
		"PER",
		"UP",
		"VIA",
		"AS",
		"FOR",
	];
	var upper = [
		"2MCBL",
		"USA",
		"TONS",
		"BHCC",
		"LLC",
		"LTD",
		"1BWK",
		"AGMA",
		"VIII",
		"XIII",
		"BHCC",
	];
	var capital = [
		"LAS",
		"LAW",
		"SON",
		"DEE",
		"ST",
		"PET",
		"BIG",
		"WAY",
		"AIR",
		"ALL",
		"TOP",
		"JOY",
		"CO",
		"INC",
		"INC.",
		"AVE",
		"PAY",
		"ST.",
		"FOX",
		"CAR",
		"TAX",
		"DAY",
		"MAN",
		"CO.",
		"NEW",
	];
	var capitalReg = new RegExp(capital.join("|"));
	var upperReg = new RegExp(upper.join("|"));

	var nameArr = str.split(" ").map(function (word) {
		if (
			exception.some(function (w) {
				return w.toUpperCase() === word;
			})
		) {
			return exception.find(function (w) {
				return w.toUpperCase() === word;
			});
		}

		if (
			lower.some(function (w) {
				if (w === word) {
					return true;
				}
				var wArr = w.split(" ");
				for (var i = 0; i < wArr.length; i++) {
					if (
						/[0-9]/.test(wArr[i]) &&
						/ST|ND|RD|TH|K/.test(wArr[i + 1] + wArr[i + 2])
					) {
						return true;
					}
				}
				return false;
			})
		) {
			return word.toLowerCase();
		}

		if (capitalReg.test(word)) {
			return word[0] + word.slice(1).toLowerCase();
		}
		if (word.replace(/\(|\)/g, "").length <= 3 || upperReg.test(word)) {
			return word;
		}
		var wordCap = word.toLowerCase().replace(/[A-Za-z]/, function (l) {
			return l.toUpperCase();
		});
		var wordArr = [];
		wordArr.push(wordCap[0]);
		for (var i = 0; i < wordCap.length; i++) {
			if (
				wordCap[i + 1] &&
				(/\.|\/|[0-9]|\&|\-|\s/.test(wordCap[i]) ||
					(wordCap[i - 1] + wordCap[i]).toLowerCase() === "mc")
			) {
				wordArr.push(wordCap[i + 1].toUpperCase());
			} else if (wordCap[i + 1]) {
				wordArr.push(wordCap[i + 1]);
			}
		}
		return wordArr.join("");
	});

	return flb(nameArr.join(" "));
};

var flb = function (str) {
	return str[0].toUpperCase() + str.substr(1);
};

var flbs = function (str) {
	return str[0].toUpperCase() + str.substr(1).toLowerCase();
};

var flbb = function (str) {
	var s = str.split(" ");

	return _.map(s, function (s) {
		return flbs(s);
	}).join(" ");
};
var group = function (array, _function) {
	var group = {};

	_.each(array, function (el, i) {
		var index = _function(el, i);

		if (!index) return;

		if (!group[index]) group[index] = [];

		group[index].push(el);
	});

	return group;
};

var _scrollTop = function (scrollTop, el, time) {
	if (!el) el = $("body,html");

	if (!time) time = 200;

	el.animate({ scrollTop: scrollTop }, time);
};

var _scrollTo = function (to, el, time) {
	if (!to) to = $(this);

	var ofssetObj = to.offset();

	var offset = (to.height() - $(window).height()) / 2;

	if (ofssetObj) {
		var scrollTop = ofssetObj.top + offset;

		_scrollTop(scrollTop, el, time);
	}
};

var _scrollToTop = function (to, el, time, offset) {
	if (!to) to = $(this);

	if (!offset) offset = 0;

	var ofssetObj = to.offset();

	if (ofssetObj) {
		var scrollTop = ofssetObj.top + offset;

		_scrollTop(scrollTop, el, time);
	}
};

var _scrollToTopP = function (to, el, time, offset) {
	if (!to) to = $(this);

	if (!offset) offset = 0;

	var ofssetObj = to.position();

	if (ofssetObj) {
		var scrollTop = ofssetObj.top + offset;

		_scrollTop(scrollTop, el, time);
	}
};

var stringEq = function (s1, s2) {
	if (!s1) s1 = "";
	if (!s2) s2 = "";

	var bw = function (s) {
		return s.split(/[ \t\v\r\n\f,.]+/);
	};

	var hash = function (s) {
		var ps = bw(s).join(" ");

		return ps.toLowerCase().replace(/[^a-zа-я0-9&]*/g, "");
	};

	var makeTr = function (w) {
		var trs = {};

		var takeC = function (index) {
			var c;

			if (index < 0 || index >= w.length) c = "_";
			else c = w[index];

			return c;
		};

		for (var i = -1; i <= w.length; i++) {
			var tr = "";

			for (var j = i - 1; j <= i + 1; j++) {
				tr = tr + takeC(j);
			}

			trs[tr] = 1;
		}

		return trs;
	};

	var t1 = makeTr(hash(s1)),
		t2 = makeTr(hash(s2));

	var c = 0,
		m = Math.max(_.toArray(t1).length, _.toArray(t2).length);

	_.each(t1, function (t, index) {
		if (t2[index]) c++;
	});

	return c / m;
};

var pretry = function (_function, time, totaltime) {
	return new Promise((resolve, reject) => {
		retry(_function, resolve, time, totaltime);
	});
};

var retry = function (_function, clbk, time, totaltime) {
	if (_function()) {
		if (clbk) clbk();

		return;
	}

	if (!time) time = 20;

	var totalTimeCounter = 0;

	var interval = setInterval(function () {
		if (_function() || (totaltime && totaltime <= totalTimeCounter)) {
			clearInterval(interval);

			if (clbk) clbk();
		}

		totalTimeCounter += time;
	}, time);
};

var md5 = function (d) {
	var result = M(V(Y(X(d), 8 * d.length)));
	return result.toLowerCase();
};
function M(d) {
	for (var _, m = "0123456789ABCDEF", f = "", r = 0; r < d.length; r++)
		(_ = d.charCodeAt(r)), (f += m.charAt((_ >>> 4) & 15) + m.charAt(15 & _));
	return f;
}
function X(d) {
	for (var _ = Array(d.length >> 2), m = 0; m < _.length; m++) _[m] = 0;
	for (m = 0; m < 8 * d.length; m += 8)
		_[m >> 5] |= (255 & d.charCodeAt(m / 8)) << m % 32;
	return _;
}
function V(d) {
	for (var _ = "", m = 0; m < 32 * d.length; m += 8)
		_ += String.fromCharCode((d[m >> 5] >>> m % 32) & 255);
	return _;
}
function Y(d, _) {
	(d[_ >> 5] |= 128 << _ % 32), (d[14 + (((_ + 64) >>> 9) << 4)] = _);
	for (
		var m = 1732584193, f = -271733879, r = -1732584194, i = 271733878, n = 0;
		n < d.length;
		n += 16
	) {
		var h = m,
			t = f,
			g = r,
			e = i;
		(f = md5_ii(
			(f = md5_ii(
				(f = md5_ii(
					(f = md5_ii(
						(f = md5_hh(
							(f = md5_hh(
								(f = md5_hh(
									(f = md5_hh(
										(f = md5_gg(
											(f = md5_gg(
												(f = md5_gg(
													(f = md5_gg(
														(f = md5_ff(
															(f = md5_ff(
																(f = md5_ff(
																	(f = md5_ff(
																		f,
																		(r = md5_ff(
																			r,
																			(i = md5_ff(
																				i,
																				(m = md5_ff(
																					m,
																					f,
																					r,
																					i,
																					d[n + 0],
																					7,
																					-680876936
																				)),
																				f,
																				r,
																				d[n + 1],
																				12,
																				-389564586
																			)),
																			m,
																			f,
																			d[n + 2],
																			17,
																			606105819
																		)),
																		i,
																		m,
																		d[n + 3],
																		22,
																		-1044525330
																	)),
																	(r = md5_ff(
																		r,
																		(i = md5_ff(
																			i,
																			(m = md5_ff(
																				m,
																				f,
																				r,
																				i,
																				d[n + 4],
																				7,
																				-176418897
																			)),
																			f,
																			r,
																			d[n + 5],
																			12,
																			1200080426
																		)),
																		m,
																		f,
																		d[n + 6],
																		17,
																		-1473231341
																	)),
																	i,
																	m,
																	d[n + 7],
																	22,
																	-45705983
																)),
																(r = md5_ff(
																	r,
																	(i = md5_ff(
																		i,
																		(m = md5_ff(
																			m,
																			f,
																			r,
																			i,
																			d[n + 8],
																			7,
																			1770035416
																		)),
																		f,
																		r,
																		d[n + 9],
																		12,
																		-1958414417
																	)),
																	m,
																	f,
																	d[n + 10],
																	17,
																	-42063
																)),
																i,
																m,
																d[n + 11],
																22,
																-1990404162
															)),
															(r = md5_ff(
																r,
																(i = md5_ff(
																	i,
																	(m = md5_ff(
																		m,
																		f,
																		r,
																		i,
																		d[n + 12],
																		7,
																		1804603682
																	)),
																	f,
																	r,
																	d[n + 13],
																	12,
																	-40341101
																)),
																m,
																f,
																d[n + 14],
																17,
																-1502002290
															)),
															i,
															m,
															d[n + 15],
															22,
															1236535329
														)),
														(r = md5_gg(
															r,
															(i = md5_gg(
																i,
																(m = md5_gg(
																	m,
																	f,
																	r,
																	i,
																	d[n + 1],
																	5,
																	-165796510
																)),
																f,
																r,
																d[n + 6],
																9,
																-1069501632
															)),
															m,
															f,
															d[n + 11],
															14,
															643717713
														)),
														i,
														m,
														d[n + 0],
														20,
														-373897302
													)),
													(r = md5_gg(
														r,
														(i = md5_gg(
															i,
															(m = md5_gg(m, f, r, i, d[n + 5], 5, -701558691)),
															f,
															r,
															d[n + 10],
															9,
															38016083
														)),
														m,
														f,
														d[n + 15],
														14,
														-660478335
													)),
													i,
													m,
													d[n + 4],
													20,
													-405537848
												)),
												(r = md5_gg(
													r,
													(i = md5_gg(
														i,
														(m = md5_gg(m, f, r, i, d[n + 9], 5, 568446438)),
														f,
														r,
														d[n + 14],
														9,
														-1019803690
													)),
													m,
													f,
													d[n + 3],
													14,
													-187363961
												)),
												i,
												m,
												d[n + 8],
												20,
												1163531501
											)),
											(r = md5_gg(
												r,
												(i = md5_gg(
													i,
													(m = md5_gg(m, f, r, i, d[n + 13], 5, -1444681467)),
													f,
													r,
													d[n + 2],
													9,
													-51403784
												)),
												m,
												f,
												d[n + 7],
												14,
												1735328473
											)),
											i,
											m,
											d[n + 12],
											20,
											-1926607734
										)),
										(r = md5_hh(
											r,
											(i = md5_hh(
												i,
												(m = md5_hh(m, f, r, i, d[n + 5], 4, -378558)),
												f,
												r,
												d[n + 8],
												11,
												-2022574463
											)),
											m,
											f,
											d[n + 11],
											16,
											1839030562
										)),
										i,
										m,
										d[n + 14],
										23,
										-35309556
									)),
									(r = md5_hh(
										r,
										(i = md5_hh(
											i,
											(m = md5_hh(m, f, r, i, d[n + 1], 4, -1530992060)),
											f,
											r,
											d[n + 4],
											11,
											1272893353
										)),
										m,
										f,
										d[n + 7],
										16,
										-155497632
									)),
									i,
									m,
									d[n + 10],
									23,
									-1094730640
								)),
								(r = md5_hh(
									r,
									(i = md5_hh(
										i,
										(m = md5_hh(m, f, r, i, d[n + 13], 4, 681279174)),
										f,
										r,
										d[n + 0],
										11,
										-358537222
									)),
									m,
									f,
									d[n + 3],
									16,
									-722521979
								)),
								i,
								m,
								d[n + 6],
								23,
								76029189
							)),
							(r = md5_hh(
								r,
								(i = md5_hh(
									i,
									(m = md5_hh(m, f, r, i, d[n + 9], 4, -640364487)),
									f,
									r,
									d[n + 12],
									11,
									-421815835
								)),
								m,
								f,
								d[n + 15],
								16,
								530742520
							)),
							i,
							m,
							d[n + 2],
							23,
							-995338651
						)),
						(r = md5_ii(
							r,
							(i = md5_ii(
								i,
								(m = md5_ii(m, f, r, i, d[n + 0], 6, -198630844)),
								f,
								r,
								d[n + 7],
								10,
								1126891415
							)),
							m,
							f,
							d[n + 14],
							15,
							-1416354905
						)),
						i,
						m,
						d[n + 5],
						21,
						-57434055
					)),
					(r = md5_ii(
						r,
						(i = md5_ii(
							i,
							(m = md5_ii(m, f, r, i, d[n + 12], 6, 1700485571)),
							f,
							r,
							d[n + 3],
							10,
							-1894986606
						)),
						m,
						f,
						d[n + 10],
						15,
						-1051523
					)),
					i,
					m,
					d[n + 1],
					21,
					-2054922799
				)),
				(r = md5_ii(
					r,
					(i = md5_ii(
						i,
						(m = md5_ii(m, f, r, i, d[n + 8], 6, 1873313359)),
						f,
						r,
						d[n + 15],
						10,
						-30611744
					)),
					m,
					f,
					d[n + 6],
					15,
					-1560198380
				)),
				i,
				m,
				d[n + 13],
				21,
				1309151649
			)),
			(r = md5_ii(
				r,
				(i = md5_ii(
					i,
					(m = md5_ii(m, f, r, i, d[n + 4], 6, -145523070)),
					f,
					r,
					d[n + 11],
					10,
					-1120210379
				)),
				m,
				f,
				d[n + 2],
				15,
				718787259
			)),
			i,
			m,
			d[n + 9],
			21,
			-343485551
		)),
			(m = safe_add(m, h)),
			(f = safe_add(f, t)),
			(r = safe_add(r, g)),
			(i = safe_add(i, e));
	}
	return Array(m, f, r, i);
}
function md5_cmn(d, _, m, f, r, i) {
	return safe_add(bit_rol(safe_add(safe_add(_, d), safe_add(f, i)), r), m);
}
function md5_ff(d, _, m, f, r, i, n) {
	return md5_cmn((_ & m) | (~_ & f), d, _, r, i, n);
}
function md5_gg(d, _, m, f, r, i, n) {
	return md5_cmn((_ & f) | (m & ~f), d, _, r, i, n);
}
function md5_hh(d, _, m, f, r, i, n) {
	return md5_cmn(_ ^ m ^ f, d, _, r, i, n);
}
function md5_ii(d, _, m, f, r, i, n) {
	return md5_cmn(m ^ (_ | ~f), d, _, r, i, n);
}
function safe_add(d, _) {
	var m = (65535 & d) + (65535 & _);
	return (((d >> 16) + (_ >> 16) + (m >> 16)) << 16) | (65535 & m);
}
function bit_rol(d, _) {
	return (d << _) | (d >>> (32 - _));
}

var retryLazy = function (_function, clbk, time) {
	if (!time) time = 200;

	var f = function () {
		_function(function (result) {
			if (result) {
				if (clbk) clbk();
			} else {
				setTimeout(f, time);
			}
		});
	};

	f();
};

var isAndroid = function () {
	var ua = navigator.userAgent.toLowerCase();
	var isAndroid = ua.indexOf("android") > -1;

	if (isAndroid) {
		return true;
	}
};

var isMobile = function () {
	return $("html").hasClass("mobile");
};

var isTablet = function () {
	return $("html").hasClass("mobile") || $("html").hasClass("tablet");
};

var slowMade = function (_function, timer, time) {
	if (!time) time = 20;

	if (timer) clearTimeout(timer);

	timer = setTimeout(_function, time);

	return timer;
};

var rand = function (min, max) {
	min = parseInt(min);
	max = parseInt(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

var trim = function (s) {
	return rtrim(ltrim(s));
};

var ltrim = function (s) {
	return (s || "").replace(/^\s+/, "");
};

var rtrim = function (s) {
	return (s || "").replace(/\s+$/, "");
};

var ltrimrn = function (s) {
	return (s || "").replace(/^[\r\n\t ]+/, "");
};

var rtrimrn = function (s) {
	return (s || "").replace(/[\r\n\t ]+$/, "");
};

var trimrn = function (s) {
	return rtrimrn(ltrimrn(s));
};

var hexEncode = function (text) {
	var ch = 0;
	var result = "";
	for (var i = 0; i < text.length; i++) {
		ch = text.charCodeAt(i);
		if (ch > 0xff) ch -= 0x350;
		ch = ch.toString(16);
		while (ch.length < 2) ch = "0" + ch;
		result += ch;
	}
	return result;
};

var stringify = function (e) {
	if (!e) return null;

	if (e.toString) {
		var s = e.toString();

		if (s != "[object Object]") return s;
	}

	if (_.isObject(e)) return JSON.stringify(e);

	return e;
};

var hexstorage = {};

var hexDecode = function (hex) {
	if (hexstorage[hex]) return hexstorage[hex];

	var ch = 0;
	var result = "";
	for (var i = 2; i <= hex.length; i += 2) {
		ch = parseInt(hex.substring(i - 2, i), 16);
		if (ch >= 128) ch += 0x350;
		ch = String.fromCharCode("0x" + ch.toString(16));
		result += ch;
	}

	hexstorage[hex] = result;

	return result;
};
var imgDimensions = function (data) {
	let img = new Image();
	img.src = data.base64;
	data.width = img.width;
	data.height = img.height;
	return data;
};

var knsites = [
	"bastyon.com",
	"pocketnet.app",
	"zoom.us",
	"youtube",
	"facebook",
	"instagram",
	"vk.com",
	"twitter",
	"pinterest",
	"vimeo",
	"ask.fm",
	"change.org",
	"wikipedia",
	"livejournal",
	"linkedin",
	"myspace",
	"reddit",
	"tumblr",
	"ok.ru",
	"flickr",
	"google",
	"yandex",
	"yahoo",
	"bing",
	"gmail",
	"mail",
];

var knsite = function (url) {
	return _.find(knsites, function (u) {
		return url.indexOf(u) > -1;
	});
};

var getUrl = function (data) {
	/*if(!linkify){
        linkify = require('linkifyjs');
        linkify.registerCustomProtocol('pocketnet')
        linkify.registerCustomProtocol('bastyon')
    }*/

	var links = linkify.find(data);

	if (links.length) {
		return links[0].href;
	}
};
var getTxt = function (data) {
	return data.replace(
		/\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/g,
		""
	);
};
var getmatrixid = function (str) {
	return str?.split(":")[0]?.replace("@", "");
};
var getMatrixIdFull = function (id, domain) {
	id || (id = "");

	if (id.indexOf("@") == 0) return id;
	return "@" + id + ":" + domain;
};
var ObjDiff = function (x, y) {
	var target = {};
	var diffProps = Object.keys(x)
		.filter(function (i) {
			return x[i] !== y[i];
		})
		.map(function (j) {
			var obj = {};
			obj[j] = x[j];
			target = Object.assign(target, obj);
		});
	return target;
};
var filterByUserId = function (arr, data) {
	var a = arr.map(function (e) {
		return e.id;
	});
	var d = data.map(function (e) {
		return e.id;
	});

	var x = [];
	a.forEach(function (e) {
		x.push(data[d.indexOf(e)]);
	});

	return x;
};
var formatBytes = function (bytes, decimals = 2) {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

var poketnetUrlParser = function (url) {
	var newURL = new URL(url);
	return {
		post: newURL.searchParams.get("s"),
		user: newURL.pathname.replace("/", ""),
	};
};

// Takes a url and returns another one that fits into iframe
var videoUrlParser = function (url) {
	var youtube_host = ["www.youtube.com", "youtube.com", "youtu.be"];
	var vimeo_host = ["www.vimeo.com", "vimeo.com"];
	var peertube_host = ["peer.tube", "peertube.social"];

	var newURL = new URL(url);

	if (youtube_host.indexOf(newURL.hostname) > -1)
		return `https://www.youtube.com/embed/${newURL.searchParams.get("v")}`;
	if (vimeo_host.indexOf(newURL.hostname) > -1)
		return `https://player.vimeo.com/video${newURL.pathname}`;
	if (peertube_host.indexOf(newURL.hostname) > -1)
		return `https://pocketnetpeertube1.nohost.me/${newURL.pathname.replace(
			"watch",
			"embed"
		)}`;
};

// Cuts string if its length longer than 'lenght'
var textFormatter = function (text, length) {
	return text.slice(0, length) + `...`;
};

// takes a text and returns it without url in it
var urlSeparator = function (text) {
	var url = getUrl(text);
	return text.replace(url, "");
};

// takes a timestamp and turns it into a string like `Dec 25, 2000 at 2:15 PM`
var dateParser = function (data) {
	var parsedDate = new Date(data * 1000);

	var year = parsedDate.getFullYear();
	var month = parsedDate.getMonth();
	var day = parsedDate.getDate();

	var meridian = parsedDate.getHours() > 13 ? `PM` : `AM`;
	var hour =
		parsedDate.getHours() > 13
			? parsedDate.getHours() - 12
			: parsedDate.getHours();
	var minutes =
		parsedDate.getMinutes() < 10
			? `0${parsedDate.getMinutes()}`
			: parsedDate.getMinutes();

	var months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];

	return `${months[month]} ${day}, ${year} at ${hour}:${minutes} ${meridian}`;
};

// calculates rating and returns star icons
var setRating = function (total_score, votes) {
	var average_score = total_score / votes;

	var full_star = `<i class="fas fa-star"></i>`;
	var half_star = `<i class="fas fa-star-half-alt"></i>`;
	var emply_star = `<i class="far fa-star"></i>`;

	var rating = [``, ``, ``, ``, ``];

	if (total_score === 0) {
		return rating.map((item) => (item = emply_star));
	}

	return rating.map((item) => {
		if (average_score >= 1) {
			average_score--;
			return (item = full_star);
		}
		if (average_score < 1 && average_score >= 0.5) {
			average_score--;
			return (item = half_star);
		}
		if (average_score < 0.5) {
			average_score--;
			return (item = emply_star);
		}
	});
};

// Indicates whether an object is on at least 80% within viewport or not
var isVisible = function (element) {
	var topY = element.getBoundingClientRect().top;
	var bottomY = element.getBoundingClientRect().bottom;
	var window_height = document.documentElement.clientHeight;
	var elem_height = bottomY - topY;

	var isVisibleOnTop = bottomY >= elem_height * 0.8;
	var isVisibleOnbottom = bottomY <= window_height + elem_height * 0.2;

	if (isVisibleOnTop && isVisibleOnbottom) return true;
	else return false;
};
var _arrayBufferToBase64 = function (buffer) {
	var binary = "";
	var bytes = new Uint8Array(buffer);
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return window.btoa(binary);
};

var _base64ToArrayBuffer = function (base64) {
	var binary_string = window.atob(base64);
	var len = binary_string.length;
	var bytes = new Uint8Array(len);
	for (var i = 0; i < len; i++) {
		bytes[i] = binary_string.charCodeAt(i);
	}
	return bytes.buffer;
};

var Base64 = {
	// private property
	_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	// public method for encoding
	encode: function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		input = Base64._utf8_encode(input);

		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output =
				output +
				Base64._keyStr.charAt(enc1) +
				Base64._keyStr.charAt(enc2) +
				Base64._keyStr.charAt(enc3) +
				Base64._keyStr.charAt(enc4);
		}

		return output;
	},

	// public method for decoding
	decode: function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {
			enc1 = Base64._keyStr.indexOf(input.charAt(i++));
			enc2 = Base64._keyStr.indexOf(input.charAt(i++));
			enc3 = Base64._keyStr.indexOf(input.charAt(i++));
			enc4 = Base64._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}

		output = Base64._utf8_decode(output);

		return output;
	},

	// private method for UTF-8 encoding
	_utf8_encode: function (string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if (c > 127 && c < 2048) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}

		return utftext;
	},

	// private method for UTF-8 decoding
	_utf8_decode: function (utftext) {
		var string = "";
		var i = 0;
		var c = 0,
			c1 = 0,
			c2 = 0;

		while (i < utftext.length) {
			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if (c > 191 && c < 224) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(
					((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
				);
				i += 3;
			}
		}
		return string;
	},

	fromFile: (file) =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.readAsDataURL(file);
			reader.onloadend = () => resolve(reader.result);
			reader.onerror = (error) => reject(error);
		}),

	toFileFetch: function (base64) {
		return fetch(base64)
			.then((res) => {
				return res.blob();
			})
			.then((blob) => {
				return new (window.wFile || window.File)([blob], "File name", {
					type: "image/png",
				});
			});
	},

	toFile: function (base64) {
		try {
			var arr = base64.split(","),
				mime = arr[0].match(/:(.*?);/)[1],
				bstr = atob(arr[1]),
				n = bstr.length,
				u8arr = new Uint8Array(n);

			while (n--) {
				u8arr[n] = bstr.charCodeAt(n);
			}

			var file = new (window.wFile || window.File)([u8arr], "Filename", {
				type: mime,
			});

			return Promise.resolve(file);
		} catch (e) {
			return Promise.reject(e);
		}
	},
};

f.copyArrayBuffer = function (src) {
	var dst = new ArrayBuffer(src.byteLength);
	new Uint8Array(dst).set(new Uint8Array(src));
	return dst;
};

f.readFile = function (file) {
	let reader = new FileReader();

	reader.readAsArrayBuffer(file);

	return new Promise((resolve, reject) => {
		reader.onload = function () {
			resolve(reader.result);
		};

		reader.onerror = function () {
			reject(reader.error);
		};
	});
};

f.fetchLocal = function (url) {
	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();

		xhr.onload = function () {
			var type = xhr.getResponseHeader("content-type");

			resolve({
				data: new Blob([xhr.response], { type: type, name: "file" }),
			});

			// resolve()
		};

		xhr.onerror = function (e) {
			console.error(e, url);
			reject(new TypeError("Local request failed"));
		};

		xhr.open("GET", url);
		xhr.responseType = "arraybuffer";
		xhr.send(null);
	});
};

f.superXSS = function(str, p){

	var l = str.length;

	var nstr = filterXSS(str, p)

	if(!nstr.length || l == nstr.length){
		return nstr
	}
	else{
		return f.superXSS(nstr, p)
	}

}

f.saveFileCordova = function (file, name, clbk, todownloads) {
	var storageLocation = "";

	switch (device.platform) {
		case "Android":
			storageLocation = "file:///storage/emulated/0/"; //LocalFileSystem.PERSISTENT
			break;
		case "iOS":
			storageLocation = cordova.file.cacheDirectory;
			break;
	}

	var onsuccess = function (fileSystem) {
		fileSystem.getDirectory(
			"Download",
			{ exclusive: false },
			function (directory) {
				directory.getFile(
					name,
					{ create: true, exclusive: false },
					function (entry) {
						// After you save the file, you can access it with this URL
						var myFileUrl = entry.toURL();

						entry.createWriter(
							function (writer) {
								writer.onwriteend = function (evt) {
									//sitemessage("File " + name + " successfully downloaded");

									if (window.galleryRefresh) {
										window.galleryRefresh.refresh(
											myFileUrl,
											function (msg) {},
											function (err) {}
										);
									}

									if (clbk)
										clbk({
											name,
											url: myFileUrl,
										});
								};

								writer.onerror = function (e) {
									if (clbk) clbk(null, e);
								};

								// Write to the file
								writer.seek(0);

								writer.write(file);
							},
							function (error) {
								/*dialog({
                        html : "Error: Could not create file writer, " + error.code,
                        class : "one"
                    })*/

								if (clbk) clbk(null, error);
							}
						);
					},
					function (error) {
						/*dialog({
                    html : "Error: Could not create file, " + error.code,
                    class : "one"
                })*/

						if (clbk) clbk(null, error);
					}
				);
			}
		);
	};

	var onerror = function (evt) {
		if (clbk) clbk(null, evt);
	};

	if (todownloads) {
		window.requestFileSystem(
			LocalFileSystem.PERSISTENT,
			0,
			function (fileSystem) {
				onsuccess(fileSystem.root);
			},
			onerror
		);
	} else {
		window.resolveLocalFileSystemURL(storageLocation, onsuccess, onerror);
	}
};

function iOS() {
	return (
		[
			"iPad Simulator",
			"iPhone Simulator",
			"iPod Simulator",
			"iPad",
			"iPhone",
			"iPod",
		].includes(navigator.platform) ||
		// iPad on iOS 13 detection
		(navigator.userAgent.includes("Mac") && "ontouchend" in document)
	);
}

f.isios = function () {
	return (
		(window.cordova &&
			window.device &&
			deep(window, "device.platform") == "iOS") ||
		iOS()
	);
};

f.now = function (date) {
	var now = date || new Date();
	var UTCseconds = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
	var d = new Date(UTCseconds);
	d.toString();

	return d;
};

f.date = {
	addseconds: function (now, seconds) {
		if (!now) now = new Date();

		var ntime = now.getTime() + seconds * 1000;
		var d = new Date(ntime);

		return d;
	},
};

f.getservers = function (arr, mult, address) {
	if (!arr.length) return [];

	mult || (mult = 1);

	if (mult > arr.length) mult = arr.length;

	var mutations = f.permutations(arr, mult);

	var index = f.helpers.base58.decode(address) % mutations.length;

	return mutations[index];
};

f.helpers = {
	base58: {
		ALPHABET: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
		ALPHABET_MAP: {},
		i: 0,

		encode(buffer) {
			const { ALPHABET, ALPHABET_MAP } = this;
			let { i } = this;

			if (!Object.keys(ALPHABET_MAP).length) {
				while (i < ALPHABET.length) {
					ALPHABET_MAP[ALPHABET.charAt(i)] = i;
					i++;
				}
			}

			var carry, digits, j;
			if (buffer.length === 0) {
				return "";
			}
			i = void 0;
			j = void 0;
			digits = [0];
			i = 0;
			while (i < buffer.length) {
				j = 0;
				while (j < digits.length) {
					digits[j] <<= 8;
					j++;
				}
				digits[0] += buffer[i];
				carry = 0;
				j = 0;
				while (j < digits.length) {
					digits[j] += carry;
					carry = (digits[j] / 58) | 0;
					digits[j] %= 58;
					++j;
				}
				while (carry) {
					digits.push(carry % 58);
					carry = (carry / 58) | 0;
				}
				i++;
			}
			i = 0;
			while (buffer[i] === 0 && i < buffer.length - 1) {
				digits.push(0);
				i++;
			}
			return digits
				.reverse()
				.map(function (digit) {
					return ALPHABET[digit];
				})
				.join("");
		},

		decode(string) {
			const { ALPHABET, ALPHABET_MAP } = this;
			let { i } = this;

			if (!Object.keys(ALPHABET_MAP).length) {
				while (i < ALPHABET.length) {
					ALPHABET_MAP[ALPHABET.charAt(i)] = i;
					i++;
				}
			}

			var bytes, c, carry, j;
			if (string.length === 0) {
				return new (
					typeof Uint8Array !== "undefined" && Uint8Array !== null
						? Uint8Array
						: Buffer
				)(0);
			}
			i = void 0;
			j = void 0;
			bytes = [0];
			i = 0;
			while (i < string.length) {
				c = string[i];
				if (!(c in ALPHABET_MAP)) {
					throw (
						"Base58.decode received unacceptable input. Character '" +
						c +
						"' is not in the Base58 alphabet."
					);
				}
				j = 0;
				while (j < bytes.length) {
					bytes[j] *= 58;
					j++;
				}
				bytes[0] += ALPHABET_MAP[c];
				carry = 0;
				j = 0;
				while (j < bytes.length) {
					bytes[j] += carry;
					carry = bytes[j] >> 8;
					bytes[j] &= 0xff;
					++j;
				}
				while (carry) {
					bytes.push(carry & 0xff);
					carry >>= 8;
				}
				i++;
			}
			i = 0;
			while (string[i] === "1" && i < string.length - 1) {
				bytes.push(0);
				i++;
			}

			const outputArray = new Uint8Array(bytes.reverse());

			let buffer = Buffer.from(outputArray);
			return buffer.readUIntBE(0, outputArray.length);
		},
	},
};

f.getCaretPosition = function (ctrl) {
	// IE < 9 Support
	if (document.selection) {
		ctrl.focus();
		var range = document.selection.createRange();
		var rangelen = range.text.length;
		range.moveStart("character", -ctrl.value.length);
		var start = range.text.length - rangelen;
		return {
			start: start,
			end: start + rangelen,
		};
	} // IE >=9 and other browsers
	else if (ctrl?.selectionStart || ctrl?.selectionStart === "0") {
		return {
			start: ctrl.selectionStart,
			end: ctrl.selectionEnd,
		};
	} else {
		return {
			start: 0,
			end: 0,
		};
	}
};

f.setCaretPosition = function (ctrl, start, end) {
	// IE >= 9 and other browsers
	if (ctrl.setSelectionRange) {
		ctrl.focus();
		ctrl.setSelectionRange(start, end);
	}
	// IE < 9
	else if (ctrl.createTextRange) {
		var range = ctrl.createTextRange();
		range.collapse(true);
		range.moveEnd("character", end);
		range.moveStart("character", start);
		range.select();
	}
};

f.processArray = function(array, fn) {
	var results = [];
	return array.reduce(function(p, item) {
		return p.then(function() {
			return fn(item).then(function(data) {
				results.push(data);
				return results;
			});
		});
	}, Promise.resolve());
}


f.bw = function (s) {
    return s.split(/[ \t\v\r\n\f,.]+/)
}

f.stringComparison = function (s1, s2, p = 0.5) {

    var w1 = f.bw(s1),
        w2 = f.bw(s2)

    return _.filter(w1, function (w) {

        return _.find(w2, function (ww) {

            return f.wordComparison(w, ww) > p
        })
    }).length > 0 ? true : false

}

f.wordComparison = function (s1, s2) {

    if (!s1) s1 = ''
    if (!s2) s2 = ''


    var hash = function (s) {

        var ps = _.sortBy(f.bw(s), function (w) {
            return w.length
        }).join(' ')



        return ps.toLowerCase().replace(/[^\p{L}\p{N}\p{Z}]/gu, '')
    }

    var makeTr = function (w) {
        var trs = {};

        var takeC = function (index) {
            var c;

            if (index < 0 || index >= w.length) c = "_";

            else c = w[index];

            return c;
        }

        for (var i = -1; i <= w.length; i++) {

            var tr = "";

            for (var j = i - 1; j <= i + 1; j++) {
                tr = tr + takeC(j);
            }


            trs[tr] = 1;
        }

        return trs;
    }


    var t1 = makeTr(hash(s1)),
        t2 = makeTr(hash(s2));


    var c = 0,
        m = Math.max(_.toArray(t1).length, _.toArray(t2).length)

    _.each(t1, function (t, index) {

        if (t2[index]) c++;

    })

    return c / m;


}

f.clientsearch = function (value, arr, exe) {
    var txt = value
    var ctxt = txt.toLowerCase().replace(/[^\p{L}\p{N}\p{Z}]/gu, '')

    return _.filter(arr, function (obj) {

        var txtf = obj

        if (_.isObject(txtf)) {

            if (!exe) return

            txtf = exe(txtf)
        }

        if (!txtf) return

        var stext = txtf

        var ctext = stext.toLowerCase().replace(/[^\p{L}\p{N}\p{Z}]/gu, '')

        if ((ctext && ctext.indexOf(ctxt) > -1) || f.stringComparison(txt, stext, 0.9)) return true
    })
}

f.ObjDiff = ObjDiff;
f._arrayBufferToBase64 = _arrayBufferToBase64;
f._base64ToArrayBuffer = _base64ToArrayBuffer;
f.Base64 = Base64;
f.getmatrixid = getmatrixid;
f.getMatrixIdFull = getMatrixIdFull;
f.formatBytes = formatBytes;
f.filterByUserId = filterByUserId;
f.trim = trim;
f.isAndroid = isAndroid;
f.isMobile = isMobile;
f.isTablet = isTablet;
f.rand = rand;
f.group = group;
f.flball = flball;
f.flb = flb;
f.flbs = flbs;
f.flbb = flbb;
f.makeid = makeid;
f.scrollTo = _scrollTo;
f.stringEq = stringEq;
f.pretry = pretry;
f.retry = retry;
f.retryLazy = retryLazy;
f.slowMade = slowMade;
f.renderFrameEqualizer = renderFrameEqualizer;
f.hexEncode = hexEncode;
f.hexDecode = hexDecode;
f.imgDimensions = imgDimensions;
f.getUrl = getUrl;
f.getTxt = getTxt;
f.poketnetUrlParser = poketnetUrlParser;
f.textFormatter = textFormatter;
f.urlSeparator = urlSeparator;
f.dateParser = dateParser;
f.setRating = setRating;
f.videoUrlParser = videoUrlParser;
f.isVisible = isVisible;
f.copytext = copytext;
f.md5 = md5;
f.knsite = knsite;
f.stringify = stringify;
export default f;
