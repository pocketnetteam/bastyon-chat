<template>
  <div @click.stop class="outer-div" :class="{'bin' : pocketnet, 'bout' : !pocketnet, minimized, active, mobile}">

    
        <div
          v-if="menuIsVisible && !hiddenInParent"
            class="dropdown"
            :class="{visible: menuIsVisible}"
        >
          <div class="backgr" @click="hidePopup()"></div>
          <div class="menuwrapper" v-click-outside="hidePopup" >

            <simpleMenu :items="menuItems">
              
                <template v-slot:default="slotProps">
                  <slot v-bind:item="slotProps.item">
                    <div class="menu-item" @click="menuItemClick(slotProps.item)">
                      <div class="iconWrapper">
                        <i v-if="slotProps.item.icon" :class="slotProps.item.icon"></i>
                      </div>

                      <div class="title">
                        {{ slotProps.item.title }}
                      </div>
                      
                    </div>
                  </slot>
                </template>

            </simpleMenu>


            <div class="cancelWrapper">
              <div class="menu-item" @click="hidePopup()">
                <div class="iconWrapper">
                </div>
                <div class="title">{{ $t("cancel") }}</div>
              </div>
            </div>
          </div>

        </div>

      <div class="dropDownIcon" @click="onClickHandler">
        <i :class="'icon ' + (icon || 'fas fa-ellipsis-h')"></i>
      </div>

    </div>
  
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->





















