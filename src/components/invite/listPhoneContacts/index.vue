<template>
  <div v-if="contacts.length !== 0">

    <div v-if="showTitle" class="titleContacts">
      <span>{{ $i18n.t("caption.phoneContacts") }}</span>
    </div>

    <div v-for="phoneContact in contacts" :key="phoneContact.id" class="phoneContact">

      <img v-if="phoneContact.photo" :src="'data:image/jpeg;base64,' + phoneContact.photo" width="42" height="44" class="contactProfilePicture" />
      <i v-else class="fas fa-user-circle"></i>

      <div class="phoneContactInfo">
        <span v-if="phoneContact.displayName && phoneContact.displayName.length > 0">{{ phoneContact.displayName }}</span>
        <span v-else-if="phoneContact.firstName || phoneContact.familyName">{{ phoneContact.firstName }} {{ phoneContact.familyName }}</span>
        <span class="subLabel" v-if="type == 'email'">{{ phoneContact.emails[0].value }}</span>
        <span class="subLabel" v-if="type == 'sms'">{{ phoneContact.phoneNumbers[0].value }}</span>
      </div>
      <button class="button small rounded" @click="invitePhoneContact(phoneContact)">
        {{ $i18n.t("caption.invite") }}
      </button>
    </div>

  </div>
</template>


<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

