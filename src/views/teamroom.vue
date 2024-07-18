<template>
	<div class="page chats">
		<topheader class="topheader">
			<template v-slot:left>
				<backButton action="chats" />
			</template>
			<template v-slot:info>
				<span class="nameline">Bastyon</span>
			</template>
		</topheader>

		<maincontent>
			<template v-slot:content>
				<div
					v-for="message in pocketteammessages"
					:key="message.id"
					class="messageRow"
				>
					<div class="logo"></div>

					<div class="maxcontent">
						<div class="messageText">
							<div class="sendername">
								<span>Bastyon</span>
							</div>
							<div class="msgtext">
								<div v-html="message.text"></div>
							</div>
						</div>
					</div>
				</div>
			</template>
		</maincontent>
	</div>
</template>

<style scoped lang="sass">

.topheader
    top: 0
    z-index: 999

.logo
    background-image: url(https://pocketnet.app/img/logo20.svg)
    background-size: cover
    background-position: center center
    background-repeat: no-repeat
    height: 30px
    width: 30px
    margin-left: .25em

::v-deep .messageRow
  display: flex
  align-items: flex-end
  overflow: hidden
  padding: .5em 0

  .mt
    margin-top: 1em

  .mb
    margin-bottom: 1em

  .maxcontent
    max-width: 85%

  &.allscreen
    flex-wrap : wrap

  .metaMsg
    width : 100%

  .sendername
    order: 3
    opacity: 0.6
    overflow: hidden
    font-size: 0.7em

  .messageText
    margin-left: $r
    background: $color-bg-bright
    color: #fff
    padding: $r 1.5 * $r
    padding-top : $r
    border-radius: 2 * $r
    white-space: normal

    .msgtext
        text-align: left
</style>

<script>
import topheader from "@/components/assets/topheader/index.vue";
import { mapState } from "vuex";
export default {
	name: "teamroom",
	components: {
		topheader,
	},

	props: {},

	data: function () {
		return {};
	},

	computed: mapState({
		pocketnet: (state) => state.pocketnet,
		minimized: (state) => state.minimized,
		pocketteammessages: (state) => state.pocketteammessages,
	}),

	methods: {},

	mounted() {},
};
</script>
