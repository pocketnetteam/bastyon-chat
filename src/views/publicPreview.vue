<template>
	<div class="page chat">
		<topheader class="topheader">
			<template v-slot:left>
				<backButton action="chats" />
			</template>

			<template v-slot:info>
				<span class="nameline">{{ $t("caption.publicRoomTitle") }}</span>
			</template>
		</topheader>

		<maincontent>
			<template v-slot:content>
				<publicroom v-if="id" :id="id" />
			</template>
		</maincontent>
	</div>
</template>

<script>
import { mapState } from "vuex";
import topheader from "@/components/assets/topheader/index.vue";
import publicroom from "@/components/chat/publicroom/index.vue";

export default {
	name: "publicPreview",
	data: function () {
		return {
			room: {},
		};
	},
	components: {
		topheader,
		publicroom,
	},
	computed: mapState({
		active: (state) => state.active,
		pocketnet: (state) => state.pocketnet,
		minimized: (state) => state.minimized,
		id: function () {
			return this.$route.query.id;
		},
	}),
	methods: {
		joinRoom() {
			this.core.mtrx.client.joinRoom(this.room[0].room_id).then((r) => {
				this.$router.push("/chat?id=" + this.room[0].room_id).catch((e) => {});
			});
		},
	},

	destroyed() {
		this.$store.commit("blockactive", { value: false, item: "publicPreview" });
	},

	mounted() {
		this.$store.commit("active", true);
		this.$store.commit("blockactive", { value: true, item: "publicPreview" });
		this.$store.commit("JOINROOM", null);
	},
};
</script>
