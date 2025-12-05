<template>
	<div
		class="chats-list"
		:class="{
			bin: pocketnet,
			bout: !pocketnet,
			minimized,
			fix: pocketnet,
			active,
			empty,
		}"
	>
		<div v-if="!unauthorized">
			<div class="searchWrapperEA" v-if="!minimized || active">
				<simpleSearch :value="globalsearch" @search="searchall" />
			</div>

			<!--<teamroom
				v-if="!matches.value && this.chats.length <= 2 && chatsready === true"
				@click="openTeamRoom"
			></teamroom>-->

			<div class="listChatLoading" v-if="chatsready !== true">
				<dummypreviews />
			</div>

			<div class="Swipes" v-else>
				<div class="desktopList">
					<!--v-if="showchatslist"-->

					<div class="chatswrapper" v-if="!globalsearch">
						<!--<transition-group name="list">
							<div
								v-for="item in chats"
								:key="item.key"
								@click="(e) => itemClick(item)"
							>
								<preview :chat="item" />
							</div>
						</transition-group>-->

						<RecycleScroller
							page-mode
							class="scroller"
							:items="chats"
							:item-size="pocketnet ? 60 : 70"
							keyField="key"
							:buffer="400"
							@update="onScrollerResize"
							ref="scroller"
						>
							<template v-slot="{ item }">
								<div
									class="card-content"
									:class="[activeRoomId === item.roomId && 'active']"
									:chatkey="item.key"
									@click="(e) => itemClick(item)"
								>
									<preview :chat="item" />
								</div>
							</template>
						</RecycleScroller>
					</div>
					<div v-else class="searchresults">
						<AllContacts
							:chats="chats"
							:search="globalsearch"
							@clearsearch="() => searchall('')"
						/>
					</div>
				</div>
			</div>
		</div>

		<div v-else class="dmdv"></div>
	</div>
</template>
<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
<!--<style src="vue-swipe-actions/dist/vue-swipe-actions.css"></style>-->

<!-- THEMES BEGIN -->
<!-- THEMES END -->

<style lang="sass">
.card-content
  .chatGroupIcon img
    width: 100% !important
</style>
