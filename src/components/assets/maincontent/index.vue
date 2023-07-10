<template>
	<div
		id="maincontent"
		@mouseenter="mouseenter"
		@mouseleave="mouseleave"
		:class="{
			bin: pocketnet,
			bout: !pocketnet,
			minimized,
			fix: pocketnet,
			active,
			unauthorized,
			modalShowed: modalShowed ? true : false,
			mobile,
		}"
	>
		<div class="headerSpacerWrapper">
			<div class="headerSpacerWrapperOvf">
				<div class="headerSpacer" ref="scrollable">
					<slot name="content"> &nbsp; </slot>
				</div>
			</div>

			<pmenu />

			<transition name="fademodal">
				<modal
					@close="closeModal"
					v-if="modalShowed && modalShowed.data && !hiddenInParent"
				>
					<template v-slot:header>{{ modalShowed.caption }}</template>

					<template v-slot:body>
						<div class="modalcommoncontent">
							<complain
								v-if="modalShowed.type == 'complain'"
								:p="modalShowed.data"
							/>
							<contact
								v-if="modalShowed.type == 'contact'"
								:contact="modalShowed.data.contact"
							/>
							<contacts
								v-if="modalShowed.type == 'showuserselect'"
								:users="modalShowed.data.users"
								:mode="`Select`"
								@close="closeModal"
								@select="
									(contact) => {
										modalShowed.data.userselected(contact);
										closeModal();
									}
								"
							/>
						</div>
					</template>

					<template v-slot:footer></template>
				</modal>
			</transition>

			<div
				class="expandp"
				v-if="!unauthorized && rbackexp"
				@click="setactive"
				@mousemove="effect"
			>
				<div class="etablew">
					<div class="etable table">
						<div><i class="fas fa-expand-arrows-alt"></i></div>
					</div>
				</div>
			</div>
		</div>

		<transition name="fade" v-if="iconshow">
			<fixedmessageicon />
		</transition>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
