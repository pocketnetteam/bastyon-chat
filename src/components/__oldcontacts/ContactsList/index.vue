<template>
  <div class='contact-list'>
    <h1>{{ $t("caption.contactsList") }}</h1>
    <ContactUser
        v-for="room in rooms"
        :key="room.id"
        :rooms_data="room"
        @to-contact-info="toContactInfo(room)"
    />
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
