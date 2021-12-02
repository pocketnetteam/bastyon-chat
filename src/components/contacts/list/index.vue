<template>
  <div class='contactList' :class="{minimized}">

    <RecycleScroller page-mode
                     class="scroller"
                     :items="users"
                     :item-size="60"
                     key-field="id"
                     v-slot="{ item }"
    >
      <div class="previewWrapper minimizeex">

        <div class="previewContact" v-if="mode === 'Contacts' || mode === 'Select'" @click="navigateToProfile(item.id, item)">
          
          <preview
              :contact="item"
              :mode="mode"
          />

        </div>

        <div @click="toggleUser(item)"
             v-if="mode === 'Selectmany'" class="previewBox">
          <div class="previewContactSelect">
            <preview :mode="mode" :contact="item"/>
          </div>

          <div class="checkBox">
            <i class="far fa-check-circle" v-if="selected[item.id]"></i>
            <i class="far fa-circle" v-if="!selected[item.id]"></i>
          </div>

        </div>

      </div>
    </RecycleScroller>



  </div>
</template>


<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

