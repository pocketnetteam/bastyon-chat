<template>
	<div
		class="swipable"
		:style="styles"
		v-touch:start="startHandler"
		v-touch:moving="movingHandler"
		v-touch:end="endHandler"
	>
		<slot />
	</div>
</template>

<style scoped lang="sass">
.swipable
	touch-action: manipulation
</style>

<script>
import { mapState } from "vuex";

import f from "@/application/functions";

var directiontoprop = function (direction, value) {
	if (direction == "top") return "y";
	if (direction == "bottom") return "y";
	if (direction == "left") return "x";
	if (direction == "right") return "x";
};

var calcPoint = function (touches) {
	var touch = touches[0];

	return {
		x: touch.pageX || touch.clientX,
		y: touch.pageY || touch.clientY,
	};
};

var calcDirection = function (point1, point2) {
	var dx = point2.x - point1.x;
	var dy = point2.y - point1.y;

	if (!dx && !dy) return null;

	var fs = Math.abs(dx) > Math.abs(dy);

	if (fs) {
		if (dx > 0) return { dir: "right", distance: dx };
		return { dir: "left", distance: -dx };
	} else {
		if (dy > 0) return { dir: "bottom", distance: dy };
		return { dir: "top", distance: -dy };
	}
};

export default {
	name: "swipable",
	props: {
		directions: {
			type: Object,
			default: () => {
				return {};
			},
		},
	},

	data: function () {
		return {
			needclear: false,
			mainDirection: null,
			startPoint: {},
			ms: false,
			successSwipe: false,
			styles: {},
			lastDir: null,
		};
	},

	computed: mapState({
		auth: (state) => state.auth,
		throttle: function () {
			return f.isios() ? 0 : 50;
		},

		transitionstr: function () {
			return this.throttle ? "" + this.throttle + "ms linear" : "none";
		},
	}),

	methods: {
		apply: function (direction, value) {
			if (!this.directions) return;

			var dir = this.directions[direction];

			if (dir && dir.clbk) {
				dir.clbk(value, dir);
			}
		},

		set: function (direction, value) {
			var prop = directiontoprop(direction);

			if (direction == "top" || direction == "left") {
				value = -value;
			}

			/*if(p.directions[direction] && p.directions[direction].basevalue) value = value + p.directions[direction].basevalue()*/

			if (!value) value = 0;

			value = value.toFixed(0);

			var style = {};

			if (prop == "x") {
				style["transform"] = "translate3d(" + value + "px, 0, 0)";
			}

			if (prop == "y") {
				style["transform"] = "translate3d(0, " + value + "px, 0)";
			}

			if (!this.ms) {
				style["-moz-transition"] = this.transitionstr;
				style["-o-transition"] = this.transitionstr;
				style["-webkit-transition"] = this.transitionstr;
				style["transition"] = this.transitionstr;
				style["-webkit-overflow-scrolling"] = "touch";
			}

			this.apply(direction, value);

			_.each(style, (s, i) => {
				this.$set(this.styles, i, s);
			});

			this.ms = true;
			this.needclear = true;
		},

		clear: function () {
			if (this.needclear) {
				//var __el = p.transformel || p.el

				this.styles = {
					transform: "",
					"-webkit-overflow-scrolling": "",
					"-moz-transition": this.transitionstr,
					"-o-transition": this.transitionstr,
					"-webkit-transition": this.transitionstr,
					transition: this.transitionstr,
				};

				setTimeout(() => {
					this.styles = {
						transform: "",
						"-webkit-overflow-scrolling": "",
						"-moz-transition": "",
						"-o-transition": "",
						"-webkit-transition": "",
						transition: "",
					};
				}, 100);
			}

			_.each(this.directions, (d) => {
				this.apply(d.direction, 0);
			});

			this.ms = false;
			this.needclear = false;
			this.successSwipe = false;
			this.lastDir = null;
			this.mainDirection = null;
			this.startPoint = {};

			this.$emit("clear");
		},

		stopEvent: function (e) {
			if (e.cancelable !== false && e.changedTouches.length > 1) {
				e.stopPropagation();
				e.preventDefault();
			}

			return false;
		},

		swipeStatus: function (e, phase, direction, distance) {
			if (!this.directions) return;

			if (
				this.mainDirection &&
				this.mainDirection.direction != direction &&
				phase == "move"
			) {
				phase = "cancel";
				direction = this.mainDirection.direction;
			}

			if (phase == "cancel" || phase == "end") {
				if (this.mainDirection) {
					if (phase == "end" && this.mainDirection.direction) {
						if (
							!this.mainDirection.distance ||
							this.mainDirection.distance < distance
						) {
							this.$emit("end", direction);
						}
					}
				}
				this.clear();

				return;
			}

			if (!direction) return;

			if (!this.directions[direction]) {
				return;
			}

			var dir = this.directions[direction];

			if ((dir.constraints && !dir.constraints(e)) || dir.disabled) {
				if (this.mainDirection) {
					this.mainDirection = null;
					this.clear();
				}

				return this.stopEvent(e);
			}

			if (phase == "start") {
				this.mainDirection = null;
			}

			if (phase == "move") {
				if (distance > (dir.trueshold || 30)) {
					this.mainDirection = dir;

					//this.applyDirection(this.mainDirection, distance, e)

					this.set(this.mainDirection.direction, distance);
				}

				this.stopEvent(e);

				return true;
			}
		},

		validateDefaultEvent: function (e) {
			var me = false,
				another = false,
				br = false;

			var path = e.path;

			if (!e.path && e.composedPath) path = e.composedPath();

			if (!path) return true;

			_.find(path, (el) => {
				me = this.$el == el;
				another =
					el.classList && el.classList.contains("swipable") && this.$el != el;
				br = el.classList && el.classList.contains("notswipable");

				if (me || another || br) return true;
			});

			return me && !br ? true : false;
		},

		movingHandler: function (e) {
			if (!this.validateDefaultEvent(e)) return;
			if (!e.touches || !e.touches.length) return;

			var phase = "move";

			var point = calcPoint(e.touches);

			var dir = calcDirection(this.startPoint, point);

			this.lastDir = dir;

			if (!dir) return;

			this.swipeStatus(e, phase, dir.dir, dir.distance);
		},

		startHandler: function (e) {
			if (!this.validateDefaultEvent(e)) return;
			if (!e.touches || !e.touches.length) return;

			var phase = "start";

			this.startPoint = calcPoint(e.touches);

			this.swipeStatus(e, phase);

			this.$emit("starttouch");
		},

		endHandler: function (e) {
			if (!this.validateDefaultEvent(e)) return;

			var phase = "end";

			if (!this.lastDir) return;

			this.swipeStatus(e, phase, this.lastDir.dir, this.lastDir.distance);

			this.$emit("endtouch");
		},
	},
};
</script>
