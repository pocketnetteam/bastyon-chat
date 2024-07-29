<template>
	<div
		id="events"
		:data-chat-input-embedded="hasInputChatEmbedded"
		class="maskedtop"
		:class="{
			mobile,
			ios,
			menuOpen,
			imagesList: this.scrollType === 'custom' ? 'imagesList' : '',
		}"
	>
		<div
			class="eventsflex"
			@wheel="mousewheel"
			ref="container"
			@scroll="dscroll"
			:class="{ mobile, ios, menuOpen }"
		>
			<div class="ewr">
				<div
					class="eventWrapper"
					:class="{ fromsearch: eventinsearchresult(event) }"
					v-for="(event, i) in events"
					:key="event.event.event_id"
					:event="event.event.event_id"
					:ref="event.event.event_id"
				>
					<eventsEvent
						:event="event"
						:prevevent="events[i + 1]"
						:galleryData="events"
						:chat="chat"
						:timeline="timeline"
						:multiSelect="multiSelect"
						:selectedMessages="selectedMessages"
						@showMultiSelect="showMultiSelect"
						@selectMessage="selectMessage"
						@removeMessage="removeMessage"
						@openImageEvent="(e) => galleryOpen(e)"
						@removeEvent="(e) => removeEvent(event)"
						@editing="(text) => editingEvent({ event, text })"
						@reply="(e) => replyEvent({ event })"
						@mounted="emounted"
						@menuIsVisible="menuIsVisibleHandler"
						@toreference="toreference"
					/>
				</div>
			</div>

			<div class="preloadingWrapper" v-if="loading">
				<linepreloader />
			</div>
		</div>

		<transition name="fade">
			<div class="scrollbottom" v-show="scrollbottomshow" @click="scrolldown">
				<i class="fas fa-chevron-down"></i>
			</div>
		</transition>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
