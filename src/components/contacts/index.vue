<template>
  <div
    id="contacts"
    :class="{
      bin: pocketnet,
      bout: !pocketnet,
      minimized,
      fix: pocketnet,
      active,
    }"
  >
    <div v-if="!unauthorized">
      <div class="work" v-if="mode === 'Contacts' && window.cordova">
        <div class="inviteUserDiv">
          <router-link
            to="/invite"
            tag="button"
            class="inviteButton"
            v-bind:class="{ colored: true }"
          >
            <span>{{ $i18n.t("caption.inviteFriend") }}</span>
            <i class="fas fa-address-card"></i
          ></router-link>
        </div>
      </div>

      <div class="work" v-if="mode === 'Contacts' && !window.cordova">
        <div class="inviteUserDiv">
          <button
            class="inviteButton"
            @click="invitepnt"
            v-bind:class="{ colored: true }"
          >
            <span>{{ $i18n.t("caption.inviteFriend") }}</span>
            <i class="fas fa-address-card"></i>
          </button>
        </div>
      </div>

      <div class="namebuttoncreate">
        <div class="" v-if="mode === 'Selectmany' && selectedlength">
          <div class="work">
            <div class="groupList">
              <div class="groupCaption">
                <span class="label">Selected ({{ selectedlength }})</span>
              </div>
            </div>

            <div class="participants">
              <div v-for="v in selected" :key="v.id || v" class="groupListName">
                <preview :contact="usersinfo[v.id || v]" mode="mini" />

                <i
                  class="far fa-times-circle"
                  @click="toggleUser(v)"
                  v-if="!v.id"
                ></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="work searchWrapperEA">
        <search @search="search" :minimize="minimized" />
      </div>

      <div class="work">
        <div class="titleContacts" v-if="users.contacts.length !== 0">
          <span>{{ $t("caption.contacts") }}</span>
        </div>
        <list
          @toggleUser="toggleUser"
          @select="select"
          :mode="mode"
          :selected="selected"
          :users="users.contacts"
          :title="'Contacts'"
        />
      </div>

      <div class="work">
        <div
          class="titleContacts empty"
          v-if="
            users.contacts.length === 0 && !searching && !loading && !inputText
          "
        >
          <span>{{ $t("caption.contactsempty") }}</span>
        </div>
      </div>

      <div
        class="searchResult"
        v-if="
          inputText.length &&
          (searching || users.contacts.length === 0 || users.search.length)
        "
      >
        <div class="work">
          <div class="titleSearchResult" v-if="users.search.length !== 0">
            <span>{{ $t("caption.searchResult") }}</span>
          </div>
          <list
            @toggleUser="toggleUser"
            @select="select"
            :mode="mode"
            :selected="selected"
            :users="users.search"
            v-if="users.search.length"
            :title="'Search results'"
          />
        </div>

        <div
          class="noSearchResult"
          v-if="
            inputText.length >= 3 &&
            !users.search.length &&
            !loading &&
            !searching
          "
        >
          <span>{{ $t("caption.queryNoResults") }}</span>
          <i class="fas fa-search"></i>
        </div>

        <div class="searching" v-if="searching">
          <div class="linepreloaderWrapper">
            <linepreloader />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="dmdv"></div>
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
