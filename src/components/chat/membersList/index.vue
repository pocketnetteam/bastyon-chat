<template>
	<div class="chatswrapper">
    <div class="simpleSearch">
      <simpleSearch :value="search" @search="searching"/>
    </div>

		<template
      v-for="(members, title) in lists"
      
    >
      <section
        class="chats"
        v-if="members.length"
        :key="members"
      >
        <!--Title-->
        <div
          class="section-title"
          :class="`section-${ title }`"
          @click.prevent="toggleCollapsible($event)"
        >
          <i
            class="icon fa"
            :class="{
              'fa-video': title === 'administrators',
              'fa-user-shield': title === 'moderators',
              'fa-user-friends': title === 'participants',
              'fa-user-slash': title === 'banned'
            }"
          ></i>
          <span>
            {{ ucFirst($t(`caption.${ title }`)) }}
            <sup v-if="members.length > 1">({{ members.length }})</sup>
          </span>
          <span class="toggle">
            <i class="fa fa-angle-up"></i>
          </span>
        </div>

        <div class="collapsible">
          <members
            :membersList="members"
            :allMembers="allMembers"
            :roles="false"
            @admin="adminActions.toggleModerStatus"
            @ban="adminActions.toggleBanStatus"
          />
        </div>
      </section>
    </template>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
