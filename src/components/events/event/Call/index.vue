<template>
  <div class="call">
    <div class="call-icon"><i class="fas fa-phone"></i></div>
    <div class="call-info">
      <div class="call-info_title">{{my ? 'Outgoing ':'Incoming '}} call</div>
<!--      <div class="call-info_duration">1 min</div>-->
    </div>
  </div>
</template>

<script>
export default {
  name: "Call",
  props: {
    my: Boolean,
  },
  mounted() {
    // console.log('cl',this.core.mtrx.client)
  }
}
</script>

<style lang="scss" scoped>
  .call {
    display: flex;
    align-items: center;
    width: 265px;
    height: 48px;
    padding: 4px 24px 4px 4px;
    border-radius: 12px;
    margin: 0 10px;
    background-color: srgba(--neutral-grad-1, 0.8);

    &.my {
      background-color: srgb(--color-bg-ac-bright);
      color: srgb(--text-on-bg-ac-color);
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