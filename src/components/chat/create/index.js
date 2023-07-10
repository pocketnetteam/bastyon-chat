import { mapState } from "vuex";
import contacts from "@/components/contacts/index.vue";

export default {
	name: "chatcreate",
	props: {},

	components: {
		contacts,
	},

	data: function () {
		return {
			loading: false,

			types: {
				privategroup: {
					id: "privategroup",
					icon: "fas fa-user-friends",
					value: "private",
				},

				publicgroup: {
					id: "publicgroup",
					icon: "fas fa-users",
					value: "public",
				},
			},

			type: null,

			groupName: "",

			selected: {},
		};
	},

	created: () => {},

	watch: {
		//$route: 'getdata'
	},
	computed: mapState({
		auth: (state) => state.auth,

		cancomplete: function () {
			if (!this.type) return false;

			if (this.type.id == "privategroup") {
				return this.selectedLength > 1;
			}

			if (this.type.id == "publicgroup") {
				if (this.groupName) return true;

				return false;
			}
		},

		selectedLength: function () {
			return _.toArray(this.selected).length;
		},
	}),

	methods: {
		unselecttype: function () {
			this.type = null;
			this.selected = {};
		},

		selecttype: function (id) {
			this.type = this.types[id];
			this.selected = {};
		},
		selectedUsers: function (u) {
			this.selected = u;
		},
		selectoneuser: function (u) {
			var tetatetid = this.core.mtrx.kit.tetatetid(u, this.core.user.userinfo);

			this.$router.push("chat?id=" + tetatetid + "&u=" + u.id).catch((e) => {});
		},

		complete() {
			this.createGroupAction(this.selected)
				.then((chat) => {
					this.$emit("completed", chat);

					this.$store.commit("icon", {
						icon: "success",
						message: "",
					});
				})
				.catch((e) => {
					var text = "An unexpected error occurred";

					if (e == "cantcomplete")
						text = "Please enter a group name and add chat members";

					this.$store.commit("icon", {
						icon: "error",
						message: text,
					});
				});
		},

		createGroupAction(users) {
			if (!this.cancomplete) {
				return Promise.reject("cantcomplete");
			}

			if (!this.type) {
				return Promise.reject("type");
			}

			if (_.isEmpty(users)) {
				return Promise.reject("users");
			}

			const data = this.core.mtrx.kit.groupIdLight(users);

			this.$store.state.globalpreloader = true;

			return this.core.mtrx.client
				.createRoom({
					//room_alias_name: '#' + data.hash,
					visibility: this.type.value, // this.selectedValue === 'Private' ? 'private' : 'public',
					invite: data.idForInviting,
					name: "@" + (this.groupName ? this.groupName : "New Room"),

					initial_state: [
						{
							type: "m.room.guest_access",
							state_key: "",
							content: {
								guest_access: "can_join",
							},
						},
					],
				})
				.then((chat) => {
					return chat;
				})
				.catch((e) => {
					this.$store.state.globalpreloader = false;

					return Promise.reject(e);
				});
		},
	},
};
