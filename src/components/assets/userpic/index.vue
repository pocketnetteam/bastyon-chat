<template functional>
	<div class="userpic">
		<div class="userpicSquareWrapper">
			<div class="userpicSquareInnerWrapper" :class="props.status">
				<bgimage v-if="props.image" :src="props.image" />

				<template v-else>

					<bgimage v-if="props.userinfo.image" :src="props.userinfo.image" />

					<div
						v-if="
							!props.userinfo.image &&
							props.userinfo.name &&
							props.status != 'blocked' &&
							props.status != 'invite' &&
							props.status != 'ban'
						"
						class="charAvatar"
					>
						<span>{{ props.userinfo.name.charAt(0) }}</span>
					</div>

					<div class="statusIcon" v-if="props.status == 'blocked' || props.status == 'ban' || props.status == 'invite'">
						<i
							v-if="props.status == 'blocked' || props.status == 'ban'"
							class="fas fa-ban"
						></i>
						<i v-if="props.status == 'invite'" class="fas fa-user-plus"></i>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
