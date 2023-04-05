<template>
	<div class="page chat" :class="{ mobile }">
		<topheader
			:key="k"
			class="topheader"
			v-show="!hideHeader || !ios"
			:u="u"
			:chat="chat"
			:search="search"
			:focusedevent="focusedevent"
			:process="processid"
			:searchresults="processresult"
			@searching="searching"
			@addMember="addMemberModal"
			@tosearchevent="tosearchevent"
		/>

		<maincontent>
			<template v-slot:content>
				<chat
					ref="chat"
					@sending="sending"
					@newchat="newchat"
					:u="u"
					:chat="chat"
					:toevent="toevent"
					:key="k"
					:search="search"
					:searchresults="processresult"
					@removeBrokenRoom="creatorLeft"
					@getEvents="eventsRoom"
					@menuIsVisible="menuIsVisibleHandler"
					@toeventscrolled="toeventscrolled"
				/>
			</template>
		</maincontent>

		<modal @close="closeModal" v-if="openInviteModal">
			<template v-slot:header>
				<span>{{ $t("caption.inviteUser") }}</span>
			</template>
			<template v-slot:body>
				<contacts
					:mode="`inviteUsers`"
					:chatRoomId="chat.roomId"
					@closeModal="closeContactModal"
				/>
			</template>
			<template v-slot:footer></template>
		</modal>
	</div>
</template>

<style scoped lang="sass">

.topheader
  width: 100%
  top: 0
  z-index: 999

.aboutContact
  position: absolute
  left: 0
  right: 0
  top: 100px
  bottom: 0
  z-index: 999
  background: $color-applebuttontext

.chat.mobile
  /deep/ #maincontent
    .headerSpacerWrapper
      bottom: 0
      overflow: visible

    .headerSpacerWrapperOvf
      overflow: visible
</style>

<script>
import chat from "@/components/chat/index.vue";
import topheader from "@/components/chat/topheader/index.vue";
import contacts from "@/components/contacts/index.vue";
import { mapState } from "vuex";
import f from "@/application/functions";

export default {
	name: "pagechat",
	components: {
		chat,
		topheader,
		contacts,
	},
	data: () => {
		return {
			events: [],
			openInviteModal: false,
			brokenRoom: false,
			hideHeader: false,
			hastoeventscrolled : false,
			hasprocesscleared : false,
			searchchanged : undefined,
			process : null,
			processresult : null,
			focusedevent : null
		};
	},

	computed: {
		u() {
			return this.$route.query.u;
		},
		chat() {
			var id = this.$route.query.id;

			return this.$store.state.chatsMap[id];
		},

		k() {
			return this.u + this.$route.query.id;
		},

		processid(){
			return this.hasprocesscleared ? null : this.$route.query.process;
		},

		search(){
			return (typeof this.searchchanged == 'undefined' ? this.$route.query.search : this.searchchanged) || "";
		},

		toevent(){
			return this.hastoeventscrolled ? null : this.$route.query.toevent;
		},

		ios() {
			return f.isios();
		},

		...mapState({
			pocketnet: (state) => state.pocketnet,
			minimized: (state) => state.minimized,
			mobile: (state) => state.mobile,
		}),
	},

	mounted() {
		setTimeout(() => {
			if (!this.leaveIfBroken()) {
			}
		}, 2000);

		//setTimeout(() => {
			if(this.toevent){

			}
		//}, 300)
	},
	beforeDestroy : function(){
		if(this.process) this.process.stop()
	},
	watch : {
		search : {
			immediate : true,
			handler : function(){
				pretry(() => {
					return this.chat;
				}).then(() => {
					this.searchingProcess()
				})
				
			}
		},
	},
	methods: {
		tosearchevent(event){
			this.focusedevent = event

			this.$refs['chat'].scrollToEvent(event)
		},
		searchingProcess(){
			if (this.search.length > 1 && this.chat){

				this.processresult = null

				if (this.process){
					this.process.updateText(this.search)
					return 
				}


				this.process = this.core.mtrx.searchEngine.execute(this.search, [this.chat], ({results}) => {

					return false

				}, {
					chat : (result) => {
						this.processresult = result.results[this.chat.roomId] || null

						if(!this.processresult) return

						if(!this.focusedevent && this.processresult[0]){

							if (this.toevent){

								var e = _.find(this.processresult, (e) => {
									return e.event.event_id == this.toevent
								})

								if (e){
									this.toeventscrolled()
									this.tosearchevent(e)
								}

								
							}
							else{
								this.tosearchevent(this.processresult[0])
							}

							
						}
					}
				})

				this.process.execute().catch(e => {
					console.error(e)
				})

			}

			else{
				if(this.process) this.process.stop()

				this.processresult = null
				this.focusedevent = null

				this.processcleared()
			}
		},
		searching(txt){
			this.searchchanged = txt
		},
		processcleared(){
			this.hasprocesscleared = true
		},
		toeventscrolled(){
			this.hastoeventscrolled = true
		},
		creatorLeft(val) {
			this.brokenRoom = val;
		},
		closeModal() {
			this.openInviteModal = false;
		},

		closeContactModal(value) {
			this.openInviteModal = value;
		},
		addMemberModal(value) {
			this.openInviteModal = value;
		},
		newchat(_chat) {},
		sending() {},
		eventsRoom(data) {
			this.events = data;
		},
		menuIsVisibleHandler(isVisible) {
			this.hideHeader = isVisible;
		},

		leaveIfBroken() {
			if (this.brokenRoom) {
				this.core.mtrx.client.leave(from.query.id).then((r) => {
					this.core.mtrx.client
						.forget(from.query.id, true)
						.then((r) => {
							return r;
						})
						.then((r) => {
							this.$store.commit("DELETE_ROOM", from.query.id);
						});
				});

				return true;
			} else {
				return false;
			}
		},
	},
};
</script>
