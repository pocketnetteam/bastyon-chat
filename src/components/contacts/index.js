import { mapState } from "vuex";
import list from "@/components/contacts/list/index.vue";
import preview from "@/components/contacts/preview/index.vue";
import contact from "@/components/contact/index.vue";

export default {
	name: "contacts",
	props: {
		mode: {
			type: String,
			default: function () {
				return "";
			},
		},

		chatRoomId: String, //
	},

	components: {
		list,
		contact,
		preview,
	},

	data: function () {
		return {
			loading: false,
			searching: false,
			fromSearch: [],
			inputText: "",
			groupContacts: [],
			groupName: "",
			contact: {},
			selected: {},
		};
	},

	mounted: function () {
		if (this.mode && this.mode != "page") {
			//$(this.$el).find('input').focus()
		}
	},

	created: function () {},
	watch: {},
	computed: mapState({
		auth: (state) => state.auth,
		window: function () {
			return window;
		},

		users: function () {
			var c = {
				contacts: [],
				search: [],
			};

			c.contacts = _.filter(this.contactsMap, (contact) => {
				if (
					!this.inputText ||
					contact.name.toLowerCase().match(this.inputText.toLowerCase())
				)
					return true;
			});

			c.search = _.filter(this.fromSearch, (contact, index) => {
				return !this.contactsMap[contact.id];
			});

			return c;
		},

		...mapState([
			"contactsMap",
			"pocketnet",
			"minimized",
			"active",
			"unauthorized",
		]),

		usersinfo: function () {
			return this.$store.state.users;
		},

		u: function () {
			return this.$route.query.u;
		},

		selectedlength: function () {
			return _.toArray(this.selected).length;
		},

		contactsListFiltered() {
			var arr = [];
			var contacts = this.contactsMap;
			var text = this.inputText;
			_.each(contacts, function (key, value) {
				key.selected = false;
				arr.push(key);
			});
			return arr.filter(function (contact) {
				return contact.name.match(text);
			});
		},

		gName: function () {
			var name = this.groupName;
			return name.replace(/ /g, "_");
		},
	}),
	methods: {
		select: function (u) {
			this.$emit("select", u);
		},

		toggleUser: function (id) {
			if (!this.selected[id]) {
				if (this.selectedlength >= 20) {
					this.$store.commit("icon", {
						icon: "warning",
						message:
							"At the moment, you can add no more than 10 users to the chat",
					});

					return;
				}

				this.$set(this.selected, id, id);
			} else this.$delete(this.selected, id);

			this.$emit("selectedUsers", this.selected);
		},

		/*chat: function () {

      this.core.mtrx.kit.tetatetid(this.usersinfo[this.directcontact], this.core.user.userinfo)

    },*/

		search(text) {
			this.inputText = text || "";
			this.searching = true;

			if (!this.inputText) {
				this.fromSearch = [];
			} else {
				this.core.user
					.searchContacts(this.inputText)
					.then((users) => {
						this.fromSearch = _.filter(users || [], (u) => {
							return u.id != this.core.user.userinfo.id;
						});
					})
					.finally(() => {
						this.searching = false;
					});
			}
		},

		invitepnt() {
			this.core.invitepnt();
		},

		inviteUserAction(users) {
			var client = this.core.mtrx.client;
			var roomID = this.chatRoomId;
			var self = this;

			_.each(users, (id) => {
				var matrixID = "@" + `${id}` + ":" + self.core.domain;

				client.invite(roomID, matrixID).then((r) => {});
			});

			this.$emit("closeModal", false);
		},
	},
};
