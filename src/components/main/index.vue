<template>
  <div class="main-wrapper" :class="{ minimized, active }">
    <div class="chat-container">
      <ContactsContainer v-if="page === 'contacts'" />
      <ChatsContainer v-if="page === 'chats'" />
      <SettingsContainer v-if="page === 'settings'" />
      <FooterChat />
    </div>
    <div v-if="showPage" class="chat-container-pages">
      <vue-page-transition name="fade-in-right" v-if="!mobile">
        <router-view></router-view>
      </vue-page-transition>
      <router-view v-else></router-view>

      <gallery
        v-if="gallery"
        :images="gallery.images"
        :index="gallery.index"
        @close="closeGallery"
      />
    </div>
    <div v-if="!showPage" class="chat-container-pages-empty">
      <i class="fas fa-comments"></i>
    </div>
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<style lang="scss">
.main-wrapper {
  display: flex;
  &.minimized {
    .headerSpacerWrapperOvf {
      background: transparent !important;
    }
  }
  .chat-container {
    width: 400px;
    height: 100%;
    position: relative;
    .menubgwrapper {
      display: none;
    }
    #wai-fixedmessageicon {
      display: none;
    }
    &-pages {
      position: relative;
      height: 100%;
      width: calc(100% - 400px);
      border-left: 1px solid rgb(235, 235, 240);
      #topheader.minimized.fix {
        left: -44px !important;
      }
      .minimized {
        .headerSpacerWrapper {
          left: -44px !important;
        }
      }
      .fixedOnPageTop {
        width: 100%;
      }
      &-empty {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: calc(100% - 400px);
        background: #f1f1f1;
        i {
          transform: scale(2);
          color: rgb(0, 164, 255);
        }
      }
      #wai-fixedmessageicon {
        &.active {
          .wrapper {
            position: fixed;
            right: 0;
            left: auto;
            width: calc(100vw - 400px) !important;
            transform: none;
          }
        }
      }
    }
  }
}
@media only screen and (max-width: 768px) {
  .main-wrapper {
    display: block;
    .chat-container {
      width: 100%;
      .fixedOnPageTop {
        width: 400px;
      }
      &-pages {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        z-index: 999;
        background: #fff;
        .fixedOnPageTop {
          width: 100%;
        }
        &-empty {
          display: none;
        }
        #wai-fixedmessageicon {
          &.active {
            .wrapper {
              position: fixed;
              right: 0;
              left: auto;
              width: 100vw !important;
              transform: none;
            }
          }
        }
      }
    }
  }
}
</style>
