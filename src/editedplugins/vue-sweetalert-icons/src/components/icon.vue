<template>
    <div class="sa" :style="cssVars">
        <div class="sa-error" v-if="isIcon('error')">
            <div class="sa-error-x">
                <div class="sa-error-left"></div>
                <div class="sa-error-right"></div>
            </div>
            <div class="sa-error-placeholder"></div>
            <div class="sa-error-fix"></div>
        </div>

        <div class="sa-warning" v-else-if="isIcon('warning')">
            <div class="sa-warning-body"></div>
            <div class="sa-warning-dot"></div>
        </div>

        <div class="sa-info" v-else-if="isIcon('info')">
            <div class="sa-info-body"></div>
            <div class="sa-info-dot"></div>
        </div>

        <div class="sa-loading" v-else-if="isIcon('loading')">
            <div class="sa-loading-body"></div>
        </div>

        <div class="sa-success" v-else>
            <div class="sa-success-tip"></div>
            <div class="sa-success-long"></div>
            <div class="sa-success-placeholder"></div>
            <div class="sa-success-fix"></div>
        </div>
    </div>

</template>

<script>
    import validateColor from "validate-color";
    import convertColor from "color";
    const availableIcons = ['success', 'warning', 'error', 'info', 'loading'];
    const iconColors = {
        success: "#007d09",
        warning: "#ff7800",
        error: "#ff007e",
        info: "#0600ff",
        loading: "#0600ff"
    };


    export default {
        name: 'sweetalert-icon',

        props: {
            icon: {
                type: String,
                default: 'success',
                validator: (value) => {
                    return availableIcons.indexOf(value) !== -1;
                }
            },
            color: {
                type: String,
                validator: validateColor
            }
        },

        computed: {
            cssVars() {
                const outputColor = validateColor(this.color) 
                        ? this.color 
                        : iconColors[this.icon];
                return {
                    "--icon-color": outputColor,
                    "--icon-color-alpha": convertColor(outputColor).alpha(0.25)
                };
            }
        },

        methods: {
            isIcon(icon) {
                return icon === this.icon;
            }
        }
    }
</script>

<style scoped lang="sass">
/**
     * Credits
     *
     * @link https://sweetalert.js.org/
     * @link https://vuejsfeed.com/blog/codepen-collection-sweetalert-icons-with-animations
    */

$icon-color: var(--icon-color)
$icon-color-alpha: var(--icon-color-alpha)
body
        // Background used as an overlay for certain animations.
        // Should be set to the same colour as the background of your containing element.
        // If unsure, leave as transparent.
        --sweetalert-icons-animation-background: transparent

.sa
  width: 140px
  height: 140px
  padding: 26px
  margin: auto

  /* Loading Icon */
  &-loading
    border-radius: 50%
    border: 4px solid $icon-color-alpha
    box-sizing: content-box
    height: 80px
    left: -4px
    position: relative
    top: -4px
    width: 80px
    z-index: 2
    border-top: 4px solid $icon-color
    animation: animateLoadingSpin 0.75s infinite

  /* Error Icon */
  &-error
    border-radius: 50%
    border: 4px solid $icon-color
    box-sizing: content-box
    height: 80px
    padding: 0
    position: relative
    width: 80px
    animation: animateErrorIcon .5s
    &:after,
    &:before
      content: ''
      height: 120px
      position: absolute
      transform: rotate(45deg)
      width: 60px
    &:before
      border-radius: 40px 0 0 40px
      width: 26px
      height: 80px
      top: -17px
      left: 5px
      transform-origin: 60px 60px
      transform: rotate(-45deg)
    &:after
      border-radius: 0 120px 120px 0
      left: 30px
      top: -11px
      transform-origin: 0 60px
      transform: rotate(-45deg)
      animation: rotatePlaceholder 4.25s ease-in
    &-x
      display: block
      position: relative
      z-index: 2
    &-placeholder
      border-radius: 50%
      border: 4px solid $icon-color-alpha
      box-sizing: content-box
      height: 80px
      left: -4px
      position: absolute
      top: -4px
      width: 80px
      z-index: 2
    &-fix
      height: 90px
      left: 28px
      position: absolute
      top: 8px
      transform: rotate(-45deg)
      width: 5px
      z-index: 1
    &-left,
    &-right
      border-radius: 2px
      display: block
      height: 5px
      position: absolute
      z-index: 2
      background-color: $icon-color
      top: 37px
      width: 47px
    &-left
      left: 17px
      transform: rotate(45deg)
      animation: animateXLeft .75s
    &-right
      right: 16px
      transform: rotate(-45deg)
      animation: animateXRight .75s

  /* Warning Icon */
  &-warning
    border-radius: 50%
    border: 4px solid $icon-color
    box-sizing: content-box
    height: 80px
    padding: 0
    position: relative
    width: 80px
    animation: scaleWarning 0.75s infinite alternate
    &:after,
    &:before
      content: ''
      border-radius: 50%
      height: 100%
      position: absolute
      width: 100%
    &:before
      display: inline-block
      opacity: 0
      animation: pulseWarning 2s linear infinite
    &:after
      display: block
      z-index: 1
    &-body
      background-color: $icon-color
      border-radius: 2px
      height: 47px
      left: 50%
      margin-left: -2px
      position: absolute
      top: 10px
      width: 5px
      z-index: 2
      animation: pulseWarningIns 0.75s infinite alternate
    &-dot
      background-color: $icon-color
      border-radius: 50%
      bottom: 10px
      height: 7px
      left: 50%
      margin-left: -3px
      position: absolute
      width: 7px
      z-index: 2
      animation: pulseWarningIns 0.75s infinite alternate

  /* Info Icon */
  &-info
    border-radius: 50%
    border: 4px solid $icon-color
    box-sizing: content-box
    height: 80px
    padding: 0
    position: relative
    width: 80px
    animation: scaleInfo 0.75s infinite alternate
    &:after,
    &:before
      content: ''
      border-radius: 50%
      height: 100%
      position: absolute
      width: 100%
    &:before
      display: inline-block
      opacity: 0
      animation: pulseInfo 2s linear infinite
    &:after
      display: block
      z-index: 1
    &-body
      background-color: $icon-color
      border-radius: 2px
      height: 47px
      left: 50%
      margin-left: -2px
      position: absolute
      top: 10px
      width: 5px
      z-index: 2
      animation: pulseInfoIns 0.75s infinite alternate
    &-dot
      background-color: $icon-color
      border-radius: 50%
      bottom: 10px
      height: 7px
      left: 50%
      margin-left: -3px
      position: absolute
      width: 7px
      z-index: 2
      animation: pulseInfoIns 0.75s infinite alternate

  /* Success Icon */
  &-success
    border-radius: 50%
    border: 4px solid $icon-color
    box-sizing: content-box
    height: 80px
    padding: 0
    position: relative
    width: 80px
    background-color: var(--sweetalert-icons-animation-background)
    &:after,
    &:before
      background-color: var(--sweetalert-icons-animation-background)
      content: ''
      height: 120px
      position: absolute
      transform: rotate(45deg)
      width: 60px
    &:before
      border-radius: 40px 0 0 40px
      width: 26px
      height: 80px
      top: -17px
      left: 5px
      transform-origin: 60px 60px
      transform: rotate(-45deg)
    &:after
      border-radius: 0 120px 120px 0
      left: 30px
      top: -11px
      transform-origin: 0 60px
      transform: rotate(-45deg)
      animation: rotatePlaceholder 4.25s ease-in
    &-placeholder
      border-radius: 50%
      border: 4px solid $icon-color-alpha
      box-sizing: content-box
      height: 80px
      left: -4px
      position: absolute
      top: -4px
      width: 80px
      z-index: 2
    &-fix
      background-color: var(--sweetalert-icons-animation-background)
      height: 90px
      left: 28px
      position: absolute
      top: 8px
      transform: rotate(-45deg)
      width: 5px
      z-index: 1
    &-tip,
    &-long
      background-color: $icon-color
      border-radius: 2px
      height: 5px
      position: absolute
      z-index: 2
    &-tip
      left: 14px
      top: 46px
      transform: rotate(45deg)
      width: 25px
      animation: animateSuccessTip .75s
    &-long
      right: 8px
      top: 38px
      transform: rotate(-45deg)
      width: 47px
      animation: animateSuccessLong .75s

    /* Success keyframes */
@keyframes animateSuccessTip
  0%,
  54%
    width: 0
    left: 1px
    top: 19px
  70%
    width: 50px
    left: -8px
    top: 37px
  84%
    width: 17px
    left: 21px
    top: 48px
  100%
    width: 25px
    left: 14px
    top: 45px
@keyframes animateSuccessLong
  0%,
  65%
    width: 0
    right: 46px
    top: 54px
  84%
    width: 55px
    right: 0
    top: 35px
  100%
    width: 47px
    right: 8px
    top: 38px
@keyframes rotatePlaceholder
  0%,
  5%
    transform: rotate(-45deg)
  100%,
  12%
    transform: rotate(-405deg)

    /* Warning keyframes */
@keyframes scaleWarning
  0%
    transform: scale(1)
  30%
    transform: scale(1.02)
  100%
    transform: scale(1)
@keyframes pulseWarning
  0%
    transform: scale(1)
    opacity: 0.5
  30%
    transform: scale(1)
    opacity: 0.5
  100%
    background-color: $icon-color
    transform: scale(2)
    opacity: 0
@keyframes pulseWarningIns
  0%
    filter: brightness(1.2)
  100%
    filter: brightness(1)

    /* Info keyframes */
@keyframes scaleInfo
  0%
    transform: scale(1)
  30%
    transform: scale(1.02)
  100%
    transform: scale(1)
@keyframes pulseInfo
  0%
    transform: scale(1)
    opacity: 0.5
  30%
    transform: scale(1)
    opacity: 0.5
  100%
    background-color: $icon-color
    transform: scale(2)
    opacity: 0
@keyframes pulseInfoIns
  0%
    background-color: $icon-color
  100%
    background-color: $icon-color

    /* Error icon keyframes */
@keyframes animateErrorIcon
  0%
    transform: rotateX(100deg)
    opacity: 0
  100%
    transform: rotateX(0deg)
    opacity: 1
@keyframes animateXLeft
  0%,
  65%
    left: 82px
    top: 95px
    width: 0
  84%
    left: 14px
    top: 33px
    width: 47px
  100%
    left: 17px
    top: 37px
    width: 47px
@keyframes animateXRight
  0%,
  65%
    right: 82px
    top: 95px
    width: 0
  84%
    right: 14px
    top: 33px
    width: 47px
  100%
    right: 16px
    top: 37px
    width: 47px

    /* Loading keyframes */
@keyframes animateLoadingSpin
  0%
    transform: rotate(-45deg)
  100%
    transform: rotate(-405deg)
</style>
