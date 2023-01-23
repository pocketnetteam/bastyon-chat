<template>
	<div class="chatswrapper">
		<section
			v-for="section in lists"
			v-if="getList(section).length"
			class="chats"
		>
			<!--Title-->
			<div class="section-title">
				<span>{{ $t(`caption.${section}`) }}</span>
			</div>

			<!--Item-->
			<div
				v-for="item in loadList(section)"
				:key="item.roomId || item.id"
				class="card-content"
				@click="itemClick(item)"
			>
				<!--Render room-->
				<previewRoom v-if="item.roomId" :chat="item" class="room" />

				<!--Render contact-->
				<previewContact v-else :contact="item" :mode="mode" class="contact" />
			</div>
		</section>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
