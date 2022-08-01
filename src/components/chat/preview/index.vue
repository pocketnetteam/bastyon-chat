<template>
  <div class="chatPreview">
    <div class="work">
      <div class="previewWrapper">
        <div class="users" v-if="users && users.length">
          <swiper class="swiper" :options="swiperOption">
            <template v-for="user in users">
              <swiper-slide v-if="!_.isEmpty(user)" :key="user.id">
                <div class="work">
                  <div
                    class="userinfoWrapper"
                    :class="{ filter: undefinedRoom }"
                  >
                    <userView :userinfo="user" v-if="user.name" />
                  </div>
                </div>
              </swiper-slide>
            </template>

            <div class="swiper-pagination" slot="pagination"></div>
          </swiper>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
