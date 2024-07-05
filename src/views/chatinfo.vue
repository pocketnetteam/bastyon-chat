<template>
	<div class="page chatInfo" :class={openInviteModal}>
		<topheader class="topheader" v-if="chat" :chat="chat" />

		<maincontent>
			<template v-slot:content>
				<chatInfo v-if="chat" :chat="chat" @addMember="addMemberModal"/>
				<transition name="fademodal">
					<modal @close="closeModal" v-if="openInviteModal && !hiddenInParent">
						<template v-slot:header>
							<span>{{ $t("caption.inviteUser") }}</span>
						</template>
						<template v-slot:body>
							<invite
								:chatRoomId="chat.roomId"
								@completed="closeContactModal"
							/>
						</template>
						<template v-slot:footer></template>
					</modal>
				</transition>
			</template>
		</maincontent>

		
	</div>
</template>

<style scoped lang="sass">

.topheader
  top: 0
  z-index: 999

.openInviteModal
  ::v-deep #maincontent

    .headerSpacer,
    .headerSpacerWrapper
      overflow: visible !important
    .headerSpacerWrapperOvf
      overflow: visible !important


.openInviteModal.minimized.active
  ::v-deep #maincontent
    .desktopList
      display: none
</style>

<script>
import topheader from "@/components/chatInfo/topheader/index.vue";
import chatInfo from "@/components/chatInfo/index.vue";
import { mapState } from "vuex";
import contact from "@/components/contact/index.vue";
import invite from "@/components/chat/invite/index.vue";
export default {
	name: "chatinfo",
	data: function () {
		return {
			openInviteModal : false
		};
	},
	components: {
		topheader,
		contact,
		chatInfo,
		invite
	},

	computed: mapState({
		pocketnet: (state) => state.pocketnet,
		minimized: (state) => state.minimized,
		hiddenInParent: (state) => state.hiddenInParent,
		u() {
			return this.$route.query.u;
		},

		chat() {
			var id = this.$route.query.id;
			return this.$store.state.chatsMap[id];
		},
	}),
	methods: {
		closeModal() {
			this.openInviteModal = false;
		},

		closeContactModal(value) {
			this.openInviteModal = false;
		},
		addMemberModal(value) {
			this.openInviteModal = true;
		},
	},
};
</script>
