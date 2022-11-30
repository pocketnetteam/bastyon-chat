<template>
  <div class="call">
    <div class="call-icon"><i class="fas fa-phone"></i></div>
    <div class="call-info">
      <div class="call-info_title">Входящий звонок</div>
      <div class="call-info_duration">1 min</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Call",
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
    height: 60px;

    padding: 8px 24px 8px 8px;
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
      width: 44px;
      height: 44px;
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