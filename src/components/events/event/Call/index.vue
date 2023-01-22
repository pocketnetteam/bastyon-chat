<template>
  <div class="call" :class="{'bad': (this.getDescription() === 'ended' || this.getDescription() === 'reject') }">
    <div class="call-icon" :class="this.getDescription() === 'ended' ? 'ended' : ''"><i :class="this.getDescription() === 'reject' ? 'fas fa-phone-slash' : 'fas fa-phone' "></i></div>
    <div class="call-info">
      <div class="call-info_title">{{ $t(this.getDescription()) }}</div>
<!--      <div class="call-info_duration">1 min</div>-->
    </div>
  </div>
</template>

<script>
export default {
  name: "Call",
  props: {
    my: Boolean,
    event: Object,

  },
  methods: {
    getDescription: function (){
      let status

      if (this.event.event.type === 'm.call.invite') {
        status = this.my ? 'outgoingCall' : 'incomingCall'
      }

      if (this.event.event.type === 'm.call.hangup') {
        status = 'ended'
      }

      if (this.event.event.type === 'm.call.reject') {
        status = 'reject'
      }

      return status
    }
  }
}
</script>

<style lang="scss" scoped>
  .call {
    display: flex;
    align-items: center;
    width: 180px;
    height: 48px;
    padding: 4px 24px 4px 4px;
    border-radius: 12px;
    margin: 0 10px;
    background-color: srgba(--neutral-grad-1, 0.8);

    &.bad {
      .call {
        &-icon {
          color: rgba(235, 87, 87, 1);
        }

      }
    }
    &.my {
      background-color: srgb(--color-bg-ac-bright);
      color: srgb(--text-on-bg-ac-color);
      &.bad {
        background-color: rgba(235, 87, 87, 1)
      }
      .call {

        &-icon {
          background: rgba(0, 0, 0, 0.2);
          color: srgb(--text-on-bg-ac-color);
        }
      }
    }
    &-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
      background: rgba(0, 0, 0, 0.06);
      border-radius: 12px;
      margin-right: 8px;
      color: srgb(--color-bg-ac-bright);

      &.ended {
        i {
          transform: rotate(-135deg);
        }
      }
      i {
        transform: rotate(90deg);
      }
    }
    &-info {
      font-weight: 600;
      font-size: 14px;
      line-height: 16px;
      display: flex;
      flex-direction: column;
      &_title {

      }
      &_duration {

      }
    }
  }
</style>