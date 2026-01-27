<template>
	<div class="membersList" v-if="membersList">
		<div
			class="roomMember"
			:class="user.membership"
			v-for="user in membersList"
			:key="user.userId"
		>
			<div class="leftWrapper" @click="openUserPage(user)">
				<div class="avatarNameWrapper">
					<userpic :userinfo="getUserInfo(user)" :status="user.membership" />
				</div>
				<div class="nameRole">
					<span class="name">{{ getUserInfo(user).name || "" }}</span>

					<span class="memberRole" v-if="roles && user.powerLevel">{{
						$t("caption." + role(user))
					}}</span>
				</div>
			</div>

			<div v-if="menu(user).length">
				<div class="rightWrapper">
					<i @click="e => setmenu(user)" class="fas fa-ellipsis-h setmenu"></i>
					<!--<dropdownMenu
						@itemClicked="menuItemClickHandler"
						ref="dropdownMenu"
						:menuItems="menu(user)"
						:rowObject="{ user: user, index: index }"
						icon="fas fa-ellipsis-h"
					/>-->
				</div>
			</div>
		</div>
	</div>

	<div class="empty" v-else>
		<span>List Empty</span>
	</div>
</template>
<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
