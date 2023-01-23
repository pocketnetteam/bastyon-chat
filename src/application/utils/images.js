var EXIF = require("exif-js");

import f from "@/application/functions";

var Images = function () {
	var self = this;

	self.orientation = function (image, exif) {
		return new Promise((resolve, reject) => {
			if (!exif.orientation) {
				return resolve(image);
			}

			var img = new Image(),
				canvas = document.createElement("canvas"),
				ctx = canvas.getContext("2d");

			img.src = srcData;

			img.onload = function () {
				var width = img.width,
					height = img.height;

				// set proper canvas dimensions before transform & export
				if ($.inArray(exif.orientation, [5, 6, 7, 8]) > -1) {
					canvas.width = height;
					canvas.height = width;
				} else {
					canvas.width = width;
					canvas.height = height;
				}

				// transform context before drawing image
				switch (exif.orientation) {
					case 1:
						// normal
						ctx.drawImage(this, 0, 0, width, height);
						break;
					case 2:
						// flip horizontal
						ctx.translate(width, 0);
						ctx.scale(-1, 1);
						ctx.drawImage(this, 0, 0, width, height);
						break;
					case 3:
						// rotate 180
						ctx.translate(width, height);
						ctx.rotate(Math.PI);
						ctx.drawImage(this, 0, 0, width, height);
						break;
					case 4:
						// flip vertical
						ctx.translate(0, height);
						ctx.scale(1, -1);
						ctx.drawImage(this, 0, 0, width, height);
						break;
					case 5:
						// flip vertical, rotate 90 clockwise
						ctx.rotate(Math.PI / 2);
						ctx.scale(1, -1);
						ctx.drawImage(this, 0, 0, width, height);
						break;
					case 6:
						// rotate 90 clockwise
						ctx.rotate(Math.PI / 2);
						ctx.translate(0, -height);
						ctx.drawImage(this, 0, 0, width, height);
						break;
					case 7:
						// flip horizontal, rotate 90 counter clockwise
						ctx.rotate(Math.PI / 2);
						ctx.translate(width, -height);
						ctx.scale(-1, 1);
						ctx.drawImage(this, 0, 0, width, height);
						break;
					case 8:
						// rotate 90 counter clockwise
						ctx.rotate(-Math.PI / 2);
						ctx.translate(-width, 0);
						ctx.drawImage(this, 0, 0, width, height);
						break;
					default:
						// normal
						ctx.drawImage(this, 0, 0, width, height);
						return;
				}

				// Draw img into canvas
				// ctx.drawImage(img, 0, 0, width, height);

				var url = canvas.toDataURL("image/jpeg", 0.95);

				$(canvas).remove();

				resolve(url);
			};
		});
	};

	self.autorotation = function (file, base64) {
		return new Promise((resolve, reject) => {
			if (file && !f.isios()) {
				EXIF.getData(file, function () {
					var exif = EXIF.getAllTags(this);

					self.orientation(base64, exif).then((res) => {
						return resolve(res);
					});
				});
			} else {
				return resolve(base64);
			}
		});
	};

	self.srcToData = function (url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.onload = function () {
			var reader = new FileReader();
			reader.onloadend = function () {
				callback(reader.result);
			};
			reader.readAsDataURL(xhr.response);
		};

		xhr.onerror = function () {};

		xhr.open("GET", url);
		xhr.responseType = "blob";
		xhr.send();
	};

	self.resize = {
		fit: function (srcData, width, height, format, quality) {
			var imageObj = new Image(),
				canvas = document.createElement("canvas"),
				ctx = canvas.getContext("2d"),
				aspectRadio,
				newWidth,
				newHeight;

			imageObj.crossOrigin = "Anonymous";
			imageObj.src = srcData;

			format || (format = "image/jpeg");
			quality || (quality = 1);

			return new Promise((resolve, reject) => {
				imageObj.onload = function () {
					aspectRadio = imageObj.height / imageObj.width;
					newHeight = imageObj.height;
					newWidth = imageObj.width;

					if (newHeight <= height && newWidth <= width) {
					} else {
						if (newWidth > width) {
							newWidth = width;
							newHeight = width * aspectRadio;
						}

						if (newHeight > height) {
							newHeight = height;
							newWidth = newHeight / aspectRadio;
						}

						var c = Math.max(
							(newHeight - height) / newHeight,
							(newWidth - width) / newWidth
						);

						if (c > 0) {
							newHeight = newHeight * (c + 1);
							newWidth = newWidth * (c + 1);
						}
					}

					canvas.width = newWidth;
					canvas.height = newHeight;

					ctx.drawImage(imageObj, 0, 0, newWidth, newHeight);

					var url = canvas.toDataURL(format, quality);

					$(canvas).remove();

					resolve(url);
				};
			});
		},

		def: function (srcData, width, height, format, quality) {
			var imageObj = new Image(),
				canvas = document.createElement("canvas"),
				ctx = canvas.getContext("2d"),
				aspectRadio,
				newWidth,
				newHeight;

			imageObj.crossOrigin = "Anonymous";
			imageObj.src = srcData;

			format || (format = "image/jpeg");
			quality || (quality = 1);

			return new Promise((resolve, reject) => {
				imageObj.onload = function () {
					aspectRadio = imageObj.height / imageObj.width;
					newHeight = imageObj.height;
					newWidth = imageObj.width;

					if (newHeight <= height && newWidth <= width) {
					} else {
						if (newWidth > width) {
							newWidth = width;
							newHeight = width * aspectRadio;
						}

						if (newHeight > height) {
							newHeight = height;
							newWidth = newHeight / aspectRadio;
						}
					}

					canvas.width = newWidth;
					canvas.height = newHeight;

					ctx.drawImage(imageObj, 0, 0, newWidth, newHeight);

					var url = canvas.toDataURL(format, quality);

					$(canvas).remove();

					resolve(url);
				};
			});
		},
	};

	self.grayscaleImage = function (srcData, clbk) {
		var image = new Image();

		image.src = srcData;

		return new Promise((resolve, reject) => {
			image.onload = function () {
				var myCanvas = document.createElement("canvas");
				var myCanvasContext = myCanvas.getContext("2d");

				var imgWidth = image.width;
				var imgHeight = image.height;

				myCanvas.width = imgWidth;
				myCanvas.height = imgHeight;

				myCanvasContext.drawImage(image, 0, 0);

				var imageData = myCanvasContext.getImageData(0, 0, imgWidth, imgHeight);

				var j = 0,
					i = 0;

				for (i = 0; i < imageData.height; i++) {
					for (j = 0; j < imageData.width; j++) {
						var index = i * 4 * imageData.width + j * 4;
						var red = imageData.data[index];
						var green = imageData.data[index + 1];
						var blue = imageData.data[index + 2];
						var alpha = imageData.data[index + 3];
						var average = (3 * red + green + blue) / 3;

						imageData.data[index] = average;
						imageData.data[index + 1] = average;
						imageData.data[index + 2] = average;
						imageData.data[index + 3] = alpha;
					}
				}

				myCanvasContext.putImageData(
					imageData,
					0,
					0,
					0,
					0,
					imageData.width,
					imageData.height
				);

				resolve(myCanvas.toDataURL());
			};
		});
	};

	self.wh = function (base64) {
		const img = new Image();
		var imgInfo = {};

		return new Promise((resolve, reject) => {
			img.onload = function () {
				imgInfo.w = this.width;
				imgInfo.h = this.height;
				resolve(imgInfo);
			};

			img.onerror = function (e) {
				reject(e);
			};

			img.src = base64;
			//this.info = imgInfo
		});
	};

	return self;
};

export default Images;
