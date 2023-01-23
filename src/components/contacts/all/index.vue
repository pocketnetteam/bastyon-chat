<template>
	<div class="chatswrapper">
		<section
			v-for="{items, section} in filteredLists"
			v-if="items.length"
			class="chats"
		>
			<!--Title-->
			<div class="section-title">
				<span>{{ $t(`caption.${section.key}`) }}</span>
			</div>

			<!--Item-->
			<div
				v-for="item in items"
				:key="item.roomId || item.id"
				class="card-content"
				@click="itemClick(item, section)"
			>
				<!--Render room-->
				<previewRoom v-if="section.view == 'room'" :chat="item" class="room" />
				<previewRoom v-if="section.view == 'roomWithMessage'" :chat="item.chat" :messages="item.messages" class="room" />

				<!--Render contact-->
				<previewContact v-if="section.view == 'contact'" :contact="item" :mode="mode" class="contact" />
			</div>
		</section>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
