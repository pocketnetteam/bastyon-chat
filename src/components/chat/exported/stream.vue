<template>
	<div id="chatExported" :class="style || ''">
    <div class="topheader">
      <div class="row">
        <span>
          <template v-if="!showMembers">Stream chat</template>
          <template v-else>Members list</template>
        </span>
        <div class="buttons">
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
      <div class="row" v-if="/*!showMembers*/false">
        <div class="buttons chat-filter">
          <button
            class="button"
            :class="{ active: filterType === 'text' }"
            @click="filterMessages($event, 'text')"
          >Chat</button>
          <button
            class="button"
            :class="{ active: filterType === 'donations' }"
            @click="filterMessages($event, 'donations')"
          >Donations</button>
        </div>
      </div>
    </div>
		<transition>
      <chat :chat="chat" :style="style" :filterType="filterType" v-if="!showMembers" />
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

  props: {
    chat: Object,
    style: String
  },

	data() {
		return {
      filterType: "text",
      showMembers: false
		}
	},

  computed: mapState({
    auth: (state) => state.auth
  }),

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
