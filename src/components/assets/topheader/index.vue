<template>
  <div id="topheader" class="fixedOnPageTop" @mouseleave="mouseleave" :class="{'bin' : pocketnet, 'bout' : !pocketnet, minimized, fix : pocketnet, active}">
  
    <div class="topheader ">
      <div class="work">
        <div class="headerLine">
          <div class="leftIcon icon" @mouseenter="mouseenter">
            <slot name="left">
              &nbsp;
            </slot> 
          </div>

          <div class="leftaddIcon iconsmall">
            <slot name="leftadd">
              &nbsp;
            </slot> 
          </div>

          <div class="infoPart" @mouseenter="mouseenter">
            <div>
              <slot name="info">
                &nbsp;
              </slot>
            </div>
          </div>

          <div class="rightaddIcons iconsmall">
            <slot name="rightadd">
              &nbsp;
            </slot>
          </div>

          <div class="rightIcons icon">
            <slot name="right">
              &nbsp;
            </slot>
          </div>
        </div>
        <slot name="additional">
        </slot>
      </div>
    </div>
  
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
<style lang="scss" scoped>
  @media only screen and (min-width: 768px) {
    .fixedOnPageTop {
      width: 40%;
      max-width: 400px;
    }
  }
</style>