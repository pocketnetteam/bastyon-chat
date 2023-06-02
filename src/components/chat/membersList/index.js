import f from "@/application/functions.js";
import members from "@/components/chatInfo/info/members/index.vue";

export default {
	name: "membersList",

	components: {
		members,
	},
	
	inject: [
		"powerLevel",
		"adminActions"
	],

	props: {
		chat: Object,
		mode: {
			default: "",
			type: String,
		},
		
	},

	data: function () {
		return {
			search: "",
			loading: false
		};
	},
	
	computed: {
		m_chat() {
			return this.core.mtrx.client.getRoom(this.chat.roomId);
		},

		allMembers() {
			return this.core.mtrx
				.chatUsers(this.chat.roomId)
				.filter(member => {
					if (this.search) {
						const user = this.getMember(member);
						return user?.name.toLowerCase().includes(this.search.toLowerCase());
					} else {
						return true;
					}
				});
		},
		
		lists() {
			return this.allMembers.reduce((list, member) => {
					const rank = this.powerLevel.get(member);

					if (member.membership !== "ban") {
						list[`${ rank }s`].push(member);
					} else {
						list.banned.push(member);
					}
					
					return list;
				}, {
					administrators: [],
					moderators: [],
					participants: [],
					banned: []
				});
		}
	},
	
	methods: {
		getMember(member) {
			return this.m_chat.getMember(
				member.userId.includes("@") ? member.userId : f.getMatrixIdFull(member.userId, this.core.domain)
			);
		},

		searching(text) {
			this.search = text;
		},
		
		toggleCollapsible(e) {
			e.currentTarget.classList.toggle('collapsed');
		},
		
		ucFirst(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}
	}
};
