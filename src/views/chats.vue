<template>
	<div
		class="page chats"
		style="display: flex"
		:data-viewtype="viewType"
		:data-is-opened-chat="isOpenedChat"
		:class="{
			pocketnet,
			mobile,
			minimized,
			active,
			newChat,
		}"
	>
		<div id="ChatList">
			<topheader class="topheader" :share="share" @newchat="newchat" />
			<maincontent ref="maincontent" :rbackexp="true">
				<template v-slot:content>
					<list
						:share="share"
						:activeRoomId="activeRoomId"
						@scrolltop="scrolltop"
						:processid="processid"
					/>
					<transition name="fademodal">
						<modal @close="closeNewChat" v-if="newChat && !hiddenInParent">
							<template v-slot:header>{{ $t("caption.newChat") }}</template>
							<template v-slot:body>
								<chatcreate @completed="chatcreated" />
							</template>
							<template v-slot:footer></template>
						</modal>
					</transition>
				</template>
			</maincontent>
		</div>
		<div id="ChatContent">
			<transition name="fade">
				<router-view :key="activeRoomId" />
			</transition>
		</div>
	</div>
</template>

<style lang="sass">
$is-opened-chat: '.chats[data-is-opened-chat="true"]'

.chats[data-viewType="split"]
  .eventsflex, .noswipepnt .work
    @media (min-width: $break_xl)
      max-width: 50vw !important

  .joinAction
      position: sticky
      bottom: 0

  .chat-topheader
    @media(min-width: $break_md)
      .leftIcon
        display: none
      .work
        margin: 0
        max-width: 100%

  #ChatList
    #wai-fixedmessageicon
      @media(min-width: $break_md)
        display: none !important

    position: relative
    height: 100vh
    border-right: 1px solid srgb(--neutral-grad-0)
    width: var(--chat-list-width)
    min-width: var(--chat-list-width)
    max-width: var(--chat-list-width)
    @media(max-width: $break_md)
      --chat-list-width: 100%
    @media (min-width: $break_md)
      --chat-list-width: 34vw
    @media (min-width: $break_xl)
      --chat-list-width: 25vw

  #ChatContent
    position: relative
    width: 100%
    @media(max-width: $break_md)
      display: none
      position: absolute
      top: 0
      right: 0
      z-index: 999
      left: 0
      bottom: 0

@mixin showChatContent()
  #ChatContent
    display: block
  #ChatList
    display: none

.chats[data-viewType="single"]
  #SelectChatPrompt
    display: none
  &#{$is-opened-chat}
    @include showChatContent()

#{$is-opened-chat}
  @media(max-width: $break_md)
    @include showChatContent()
</style>

<style scoped lang="sass">
.fade-enter-active
  transition: opacity 0.25s

.fade-enter, .fade-leave-to
  opacity: 0

.topheader
  top: 0
  z-index: 999

.newChat
  ::v-deep #maincontent

    .headerSpacer,
    .headerSpacerWrapper
      overflow: visible !important
    .headerSpacerWrapperOvf
      overflow: visible !important

.newChat.minimized.active
  ::v-deep #maincontent
    .desktopList
      display: none
</style>

<script>
import list from "@/components/chats/list/index.vue";
import topheader from "@/components/chats/topheader/index.vue";
import { mapState } from "vuex";
import contacts from "@/components/contacts/index.vue";
import chatcreate from "@/components/chat/create/index.vue";

export default {
	name: "pagechats",
	components: {
		list,
		topheader,
		contacts,
		chatcreate,
	},

	props: {
		share: Object,
	},
	data: function () {
		return {
			newChat: false,
		};
	},
	computed: mapState({
		pocketnet: (state) => state.pocketnet,
		minimized: (state) => state.minimized,
		active: (state) => state.active,
		viewType: (state) => state.viewType,
		mobile: (state) => state.mobile,
		hiddenInParent: (state) => state.hiddenInParent,
		joinroom: (state) => state.joinroom,
		activeRoomId() {
			return this.$route.query.id;
		},
		isOpenedChat() {
			return !!this.activeRoomId;
		},
		processid() {
			return this.$route.query.process;
		},
	}),

	methods: {
		newchat: function () {
			this.newChat = true;
		},
		closeNewChat: function () {
			this.newChat = false;
		},
		chatcreated: function (chat) {
			this.$router
				.push({
					path: "chat",
					query: { id: chat.room_id },
				})
				.catch((e) => {});
		},

		scrolltop: function () {
			this.$refs["maincontent"].scroll(0);
		},
	},

	mounted() {
		if (this.joinroom) {
			this.$router.push("/publicPreview?id=" + this.joinroom);
			this.$store.commit("JOINROOM", null);
		}
	},
};
</script>
