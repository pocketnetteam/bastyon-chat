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
				.filter((user) => user.membership !== "leave");
		},
		
		lists() {
			return this.allMembers.reduce((list, member) => {
					if (member.membership !== "ban") {
						list[`${ this.powerLevel.get(member) }s`].push(member);
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
