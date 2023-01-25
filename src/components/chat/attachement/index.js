import { mapState } from "vuex";
import f from "@/application/functions";
export default {
	name: "chatAttachement",
	props: {
		attachement: Object,
	},

	data: function () {
		return {
			loading: false,

			ext: {
				pdf: "far fa-file-pdf",
				custom: "far fa-file",
			},
		};
	},

	created: () => {},

	watch: {
		//$route: 'getdata'
	},
	computed: mapState({
		auth: (state) => state.auth,
		extension: function () {
			if (!f.deep(this, "attachement.info.name")) return "custom";

			var name = f.deep(this, "attachement.info.name");
			var name = name.split(".");
			var ext = name[name.length - 1].toLowerCase();

			return ext;
		},
		humanReadableSize() {
			if (!f.deep(this, "attachement.info.size")) return "";

			return f.formatBytes(this.attachement.info.size);
		},

		fileicon: function () {
			var ext = this.extension;

			return this.ext[ext] || this.ext["custom"];
		},
	}),

	methods: {
		cancel: function () {
			this.$emit("cancel");
		},
	},
};
