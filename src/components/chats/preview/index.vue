<template>
	<div class="chatsPreview" :class="{ minimized, active }">
		<div class="work">
			<div class="previewWrapper">
				<div class="iconWrapper">
					<chatIcon
						:m_chat="m_chat"
						v-if="!dummy"
						:chat="chat"
						:key="key"
						:dontuseslides="true"
					/>
					<div v-else class="dummyicon loadinggradient"></div>
				</div>

				<div class="infoWrapper">
					<div class="summaryLine" v-if="!dummy && ready">
						<div class="caption flexBlock">
							<chatName :preview="true" :chat="chat" :m_chat="m_chat" />
							<div class="roomMuted" v-if="roomMuted">
								<i class="fas fa-bell-slash"></i>
							</div>
						</div>

						<div class="time">
							<chatTime :chat="chat" :m_chat="m_chat" />
						</div>
					</div>

					<div class="eventsLine maxwidth" v-if="!dummy && ready">
						<eventsEvent
							:event="matrixevent"
							:chat="m_chat"
							:preview="true"
							v-if="event"
						/>
					</div>

					<div class="eventsLine" v-if="dummy">
						<div class="dummyline loadinggradient"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass">
.minimized
  &.active
    .previewWrapper

    .dummyline
      height: 44px
      opacity: 0.3

    .dummyicon
      width: 44px
      height: 44px
      opacity: 0.3

.previewWrapper
  cursor: pointer
  display: flex
  align-items: center
  padding: 10px 0


  .dummyline
    margin-top: $r / 2
    height: 22px
    border-radius: 5px
    +transition(0.3s)

  .dummyicon
    width: 22px
    height: 22px
    border-radius: 50%
    margin: 0 auto
    +transition(0.3s)

  .iconWrapper
    width: 44px
    display: flex
    align-items: center
    min-width: 44px

    /deep/
    .oneuser
      i
        font-size: 0.7em

  .infoWrapper
    padding-left: $r
    flex-grow: 1
    overflow: hidden
    text-overflow: ellipsis
    min-height: 50px

.emptyEvent
  span
    color: srgb(--color-good)
    font-size: 0.8em

.eventsLine
  position: relative
  /*&.maxwidth
    overflow: hidden
    max-width: 80%*/



  .roomMuted
    position: absolute
    right: 8px
    top: 0

    i
      color: srgb(--neutral-grad-3)

  /deep/ .previewMessage
    max-width: 90%
    overflow: hidden
    text-overflow: ellipsis

  /deep/ .deletedMessage
    text-align: left
    font-size: 0.9em


  /deep/ span
    color: srgb(--neutral-grad-4)
    opacity: 0.8
    font-size: 0.9em
    overflow: hidden
    white-space: nowrap
    text-overflow: ellipsis

.roomMuted
  position: relative
  top: -3px
  left: 6px

  i
    font-size: 0.7em

.summaryLine
  display: flex
  min-height: 25px

  .time
    padding-top: 0.25em
    opacity: 0.3
    font-weight: 500
    text-align: right
    white-space: nowrap
    text-overflow: ellipsis
    padding-right: $r

    /deep/ span
      font-size: 0.8em
      display: block


  .caption
    flex-grow: 1
    display: flex
    align-items: center

    /deep/ span
      font-size: 1em
      overflow: hidden
      white-space: nowrap
      text-overflow: ellipsis
      font-weight: 500
      display: inline-block
      max-width: 190px
</style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
