<template>
	<div class="chatswrapper">
    <div class="simpleSearch">
      <simpleSearch :value="search" @search="searching"/>
    </div>

		<section
			v-for="(members, title) in lists"
      v-if="members.length"
			class="chats"
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
            'fa-user-times': title === 'banned'
          }"
        ></i>
				<span>{{ ucFirst($t(`caption.${ title }`)) }}</span>
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
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
