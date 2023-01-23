import { mapState } from "vuex";
import listPhoneContacts from "@/components/invite/listPhoneContacts/index.vue";
import f from "@/application/functions.js";
import listeners from "@/application/listeners";

export default {
	name: "inviteChoice",
	props: {},

	components: {
		listPhoneContacts,
	},

	data: function () {
		var domain = "pocketnet.app";
		var connectpart = "";

		if (f.deep(this, "core.user.userinfo.source.address")) {
			connectpart =
				"?connect=" + f.deep(this, "core.user.userinfo.source.address");
		}

		if (window.testpocketnet) domain = "test.pocketnet.app";
		if (window.pocketnetdomain) domain = window.pocketnetdomain;

		var link = "https://" + domain + "/welcome" + connectpart;

		var body = this.$i18n.t("caption.hasInvitedToJoin") + ": " + link;

		return {
			messageSubject: this.$i18n.t("caption.joinApp"),
			messageBody: body,
			socials: [
				{
					n: "SMS",
					i: "far fa-comment",
					t: "sms",
					c: "#143e50",
				},
				{
					n: "Email",
					i: "far fa-envelope",
					t: "email",
					c: "#f82a53",
				},
				{
					n: "Facebook",
					i: "fab fa-facebook-f",
					t: "facebook",
					c: "#3b5999",
					// Not working on iOS, so hide it
					hideOnIos: true,
				},
				{
					n: "Whatsapp",
					i: "fab fa-whatsapp",
					t: "whatsapp",
					c: "#075e54",
				},
				{
					n: "Telegram",
					i: "fab fa-telegram-plane",
					t: "telegram",
					c: "#0088cc",
					// Not working on iOS, so hide it
					hideOnIos: true,
				},
				{
					n: this.$i18n.t("caption.more"),
					i: "fas fa-ellipsis-h",
					t: "more",
					c: "rgb(112, 112, 112)",
				},
			],
			currentType: "sms",
			inputText: "",
			phoneContacts: [],
			displayedPhoneContacts: [],
			loading: false,
			focusListener: new listeners.focus(this.core),
			canGetContacts: false,
		};
	},

	mounted: function () {},

	created: function () {
		var self = this;
		// Listen for focus event
		this.focusListener.init();
		this.focusListener.clbks.resume.core = () => {
			setTimeout(function () {
				self.loadContacts();
			}, 0);
		};

		// Ask permission to access contacts
		if (window.ContactsX) {
			self.loading = true;
			window.ContactsX.requestPermission(
				function (res) {
					self.canGetContacts = res && res.read;
					self.loadContacts();
				},
				function (error) {
					console.error(error);
					self.loading = false;
				}
			);
		}
	},

	destroyed: function () {
		delete this.focusListener.clbks.resume.core;
	},

	watch: {},
	computed: mapState({
		auth: (state) => state.auth,

		...mapState([
			"contactsMap",
			"pocketnet",
			"minimized",
			"active",
			"unauthorized",
		]),
	}),
	methods: {
		back: function () {
			this.$router.go(-1);
		},
		openMore: function () {
			if (!window.plugins || !window.plugins.socialsharing) return;
			var socSharing = window.plugins.socialsharing;
			socSharing.share(this.messageBody, this.messageSubject);
		},
		loadContacts: function () {
			var self = this;
			if (!self.canGetContacts) {
				self.loading = false;
				return;
			}
			// If we got access to contacts, read them
			window.ContactsX.find(
				function (contacts) {
					self.phoneContacts = contacts;
					self.search(self.inputText);
					self.loading = false;
				},
				function (error) {
					console.error(error);
					self.loading = false;
				},
				{
					fields: {
						phoneNumbers: true,
						emails: true,
						photo: true,
					},
				}
			);
		},
		invitePhoneContact: function (phoneContact) {
			if (!window.plugins || !window.plugins.socialsharing) return;

			var socSharing = window.plugins.socialsharing,
				self = this;

			switch (this.currentType) {
				case "email":
					socSharing.canShareViaEmail(function () {
						// Sharing via email is possible
						socSharing.shareViaEmail(self.messageBody, self.messageSubject, [
							phoneContact.emails[0].value,
						]);
					});
					break;

				case "sms":
					socSharing.shareViaSMS(
						{
							//subject: self.messageSubject + ' ' + self.messageSubject,
							message: self.messageSubject + " " + self.messageBody,
							url: this.link,
						},
						phoneContact.phoneNumbers[0].value
					);
					break;

				default:
					break;
			}
		},
		search(text) {
			this.inputText = text;
			if (text.length >= 1 && text.length <= 2)
				this.displayedPhoneContacts = [];
			else if (text.length > 2) {
				this.displayedPhoneContacts = _.filter(
					this.phoneContacts,
					(phoneContact) => {
						var contactName =
							phoneContact.displayName +
							" " +
							phoneContact.firstName +
							" " +
							phoneContact.familyName;
						if (contactName.toLowerCase().match(text.toLowerCase()))
							return true;
					}
				);
			} else this.displayedPhoneContacts = this.phoneContacts;
		},
		isios() {
			return (
				typeof window != "undefined" &&
				window.cordova &&
				window.device &&
				deep(window, "device.platform") == "iOS"
			);
		},
	},
};
