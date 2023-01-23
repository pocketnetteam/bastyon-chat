<template>
	<div class="unauthorized" v-if="unauthorized">
		<div class="captionWrapper">
			<span>{{ $i18n.t("caption.accNotFound") }}</span>
		</div>
	</div>

	<div
		id="invite"
		v-else
		:class="{
			bin: pocketnet,
			bout: !pocketnet,
			minimized,
			fix: pocketnet,
			active,
		}"
	>
		<div class="work">
			<!-- Share buttons -->
			<!-- <div class="shareButtonsWrapper" v-if="!currentType">
        <template v-for="social in socials">
          <div v-if="!isios() || social.hideOnIos != true" :key="social.t" class="shareButton" @click="share(social)">
            <button :class="'socialsharebtn s_' + social.t" :data-type="social.t" :style="'background:' + social.c">
              <i :class="social.i"></i>
            </button>
            <span class="label">
              {{ social.n }}
            </span>
          </div>
        </template>
      </div> -->

			<!-- <div v-else> -->

			<div v-id="currentType == 'sms' || currentType == 'email'">
				<!-- Search input -->
				<search @search="search" :minimize="minimized" />
				<!-- Contacts list -->
				<listPhoneContacts
					@invitePhoneContact="invitePhoneContact"
					:phoneContacts="displayedPhoneContacts"
					:type="currentType"
				/>
			</div>

			<!-- Spinner -->
			<div class="searching" v-if="currentType && loading">
				<div class="linepreloaderWrapper">
					<linepreloader />
				</div>
			</div>

			<!-- No results message -->
			<div
				class="noSearchResult"
				v-if="
					inputText.length >= 3 && !displayedPhoneContacts.length && !loading
				"
			>
				<span>{{ $i18n.t("caption.queryNoResults") }}</span>
				<i class="fas fa-search"></i>
			</div>

			<!-- Need more characters message -->
			<div
				class="noSearchResult"
				v-if="inputText.length >= 1 && inputText.length <= 2 && !loading"
			>
				<span>{{ $i18n.t("caption.needMoreCharacters") }}</span>
				<i class="fas fa-search"></i>
			</div>

			<!-- Need more characters message -->
			<div
				class="noSearchResult"
				v-if="!displayedPhoneContacts.length && !loading"
			>
				<span>{{ $i18n.t("caption.emptyContactList") }}</span>
			</div>

			<!-- </div> -->
		</div>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
