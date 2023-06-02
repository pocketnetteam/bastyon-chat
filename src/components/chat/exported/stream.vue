<template>
	<div id="chatExported" :class="style || ''">
		<div class="topheader">
			<div class="row">
				<span>
					<template v-if="!showMembers">{{ $t(`caption.streamChat`) }}</template>
					<template v-else>{{ $t(`caption.membersList`) }}</template>
				</span>
				<div class="buttons" v-if="!userBanned?.value">
					<button
						class="button"
						@click="toggleMembers"
					>
						<i
							class="fa"
							:class="{ 'fa-user-friends': !showMembers, 'fa-comment': showMembers }"
						></i>
					</button>
				</div>
			</div>
			<div class="row" v-if="!showMembers && !userBanned?.value">
				<div class="buttons chat-filter">
					<button
						v-for="{ name, filter } in chatFilter"
						:key="name"
						class="button"
						:class="{ active: filterType === filter }"
						@click="filterMessages($event, filter)"
					>{{ $t("button." + name) }}</button>
				</div>
			</div>
		</div>
		<transition>
			<chat :chat="chat" :style="style" :filterType.sync="filterType" v-if="!showMembers" />
			<membersList :chat="chat" v-else />
		</transition>

		<pmenu />
	</div>
</template>

<style scoped lang="sass" src="./stream.sass"></style>

<script>
import { mapState } from "vuex";
import chat from "../index.vue";
import membersList from "../membersList/index.vue";
import pmenu from "@/components/assets/pmenu/index.vue";

export default {
	name: "stream",

	components: {
		chat,
		membersList,
		pmenu
	},

	inject: ["userBanned"],
	
	props: {
		chat: Object,
		style: String
	},

	data() {
		return {
			showMembers: false,
			filterType: "text",
			chatFilter: [
				{ name: "chat", filter: "text" },
				{ name: "donations", filter: "donate" }
			]
		}
	},

	computed: {
		...mapState({
			auth: (state) => state.auth
		})
	},

	methods: {
		filterMessages(e, type) {
			this.filterType = type;
		},

		toggleMembers() {
			this.showMembers = !this.showMembers;
		}
	}
};
</script>
