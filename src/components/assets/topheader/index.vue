<template>
  <div id="topheader" class="fixedOnPageTop" @mouseleave="mouseleave" :class="{'bin' : pocketnet, 'bout' : !pocketnet, 'minimized': minimized, fix : pocketnet, active}">
  
    <div class="topheader ">
      <div class="work">
        <div class="headerLine">
        
          <div v-if="!pocketnet" class="user-pic-fixed-custom" style="position: fixed; top: 4px; left: 10px; z-index: 9999999999; width: 55px; height: 55px; border-radius: 50%;">
            <img :src="activeuser.image" style="width: 45px; height: 45px; border-radius: 50%;" />
          </div>

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





















