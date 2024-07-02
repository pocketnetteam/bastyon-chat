<template>
	<div class="request">
		<img src="../img/request.png" class="image" alt="request" />
		<div class="title">{{ $t("caption.requestCallAccess") }}</div>
		<div class="description">
			<div>{{ $t("caption.callAccessWarning") }}</div>
		</div>
		<div class="options">
			<button @click="prohibit" class="btn bad">
				{{ $t("caption.prohibit") }}
			</button>
			<button @click="allow" class="btn ok">{{ $t("caption.allow") }}</button>
		</div>
	</div>
</template>

<script>
export default {
	name: "request",
	props: {
		event: {
			type: Object,
		},
	},
	methods: {
		allow() {
			this.core.mtrx.client.sendStateEvent(
				this.event.event.room_id,
				"m.room.callsEnabled",
				{ enabled: true },
				this.core.user.userinfo.id
			);
			this.core.mtrx.client.sendStateEvent(
				this.event.event.room_id,
				"m.room.request_calls_access",
				{ accepted: true }
			);
			this.core.store.dispatch("FETCH_EVENTS");
		},
		prohibit() {
			this.core.mtrx.client.sendStateEvent(
				this.event.event.room_id,
				"m.room.callsEnabled",
				{ enabled: false },
				this.core.user.userinfo.id
			);
			this.core.mtrx.client.sendStateEvent(
				this.event.event.room_id,
				"m.room.request_calls_access",
				{ accepted: false }
			);
			this.core.store.dispatch("FETCH_EVENTS");
		},
	},
};
</script>

<style scoped lang="sass">
.request
  width: 100%
  display: flex
  justify-content: center
  align-items: center
  flex-direction: column
  background-color: srgb(--background-secondary-theme)
  margin: 0 10px
  border-radius: 12px
  padding: 1em

  border: solid srgb(--neutral-grad-1) 1px

  .image
    width: 100%

  .title
    font-size: 1.2em
    font-weight: 500
    text-align: left
    margin: 1em 0
  .description
    text-align: left
    color: rgba(242, 153, 74, 1)
    margin: 0.6em 0
    font-size: 0.8em
    width: 100%
    i
      margin: 5px
      color: srgb(--color-star-yellow)
      font-size: 2.1em
  .options
    display: flex
    justify-content: space-evenly
    width: 100%
    max-width: 350px
    .btn
      background: srgb(--color-bg-ac-bright)
      color: srgb(--text-on-bg-ac-color)
      border: 1px solid srgb(--color-bg-ac-bright)
      padding: 0.5em 2em
      font-size: 0.8em
      text-align: center
      font-weight: 600
      border-radius: 8px
      -moz-transition: 0.3s
      -o-transition: 0.3s
      -webkit-transition: 0.3s
      transition: 0.3s
      cursor: pointer
      margin: 1em 0 0
      width: 130px
      max-width: 40%
      &.ok
      &.bad
        background-color: rgba(235, 87, 87, 1)
        border-color: rgba(235, 87, 87, 1)
        @media (pointer: fine)
          &:hover
            background: transparent
            color: rgba(235, 87, 87, 1)
      @media (pointer: fine)
        &:hover
          background: transparent
          color: srgb(--color-bg-ac-bright)
</style>
