<template>
	<div id="dummypreviews">
		<!--    <div v-for="va in a">-->
		<!--      <div class="messagesLine" v-if="messagesPreview">-->
		<!--        <div class="circlePreview loadinggradient" v-if="va % 2 === 0">-->

		<!--        </div>-->
		<!--        <div class="messageLine loadinggradient" :style="{width: '1' + va + '0px'}" v-if="va % 2 === 0">-->

		<!--        </div>-->

		<!--        <div class="myMessageLine loadinggradient" :style="{width: '1' + va + '0px'}" v-else></div>-->
		<!--      </div>-->
		<!--    </div>-->
		<preview :dummy="true" v-for="va in a" :key="va.id" />
	</div>
</template>

<style scoped lang="sass">

::v-deep
  .infoWrapper
    display: flex
    align-items: center
    .eventsLine
      width: 100%
</style>

<script>
import { mapState } from "vuex";
import preview from "@/components/chats/preview/index.vue";

export default {
	name: "dummypreviews",
	data: () => {
		return {
			messagesPreview: false,
		};
	},
	props: {
		data: Object,
	},
	components: {
		preview,
	},

	computed: mapState({
		auth: (state) => state.auth,
		a: function () {
			if (this.messagesPreview) {
				return [1];
			} else {
				return [1, 2, 3, 4, 5, 6];
			}
		},
	}),

	methods: {},
};
</script>
