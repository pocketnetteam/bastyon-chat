<template>
	<div class="msgtext">
		<template v-for="(chunk, index) in chunks">
			<label class="likelink" v-if="chunk.id" @click="show(chunk)"
				>@{{ chunk.name }}</label
			>
			<label v-else v-html="echotext(chunk)"></label>
		</template>
	</div>
</template>

<script>
import f from "@/application/functions";

export default {
	name: "IncomingMessage",
	props: {
		message: {
			type: String,
			default: "",
		},
		markedText: String,
	},
	data() {
		return {
			user_id: /\w{68}:/,
			userCall: /@\w{68}:\w{1,50}(?=\s)/g,
			userPublicCall: /@\w{68}:\w{1,70}:\w{1,70}:\w{1,70}:\w{1,50}(?=\s)/g,
			userUnrecognizedCall: /@[\w:]+:\w{1,50}(?=\s)/g,
		};
	},
	computed: {
		chunks: function () {
			if (this.message.indexOf("@") == -1) return [this.message];

			let userCallRegex;

			if (this.userCall.test(this.message)) {
				userCallRegex = this.userCall;
			} else if (this.userPublicCall.test(this.message)) {
				userCallRegex = this.userPublicCall;
			} else {
				userCallRegex = this.userUnrecognizedCall;
			}

			var c = this.message.split(userCallRegex);
			var us = Array.from(this.message.matchAll(userCallRegex), (m) => m[0]);

			var r = [];

			_.each(c, function (v, i) {
				r.push(v);

				if (us[i]) {
					var ch = us[i].replace("@", "").split(":");

					ch.length == 2
						? r.push({
								id: ch[0],
								name: ch[1],
						  })
						: r.push(us[i]);
				}
			});

			return _.filter(r, (r) => {
				return r;
			});
		},
	},

	methods: {
		echotext: function (chunk) {
			var text = f.superXSS(chunk);

			if (typeof joypixels != "undefined") {
				text = joypixels.toImage(text);
			}

			return text;
		},

		show: function (chunk) {
			this.core.mtrx.kit.usersInfoById(chunk.id).then((r) => {
				core.mtrx.opencontact(r);
			});
		},
	},
};
</script>

<style lang="sass" scoped>
label
	cursor: pointer
	display: inline

.likelink
	text-decoration: underline
	cursor: pointer
</style>
