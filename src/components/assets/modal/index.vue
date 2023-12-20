<template>
	<transition name="fade">
		<div
			id="modal"
			:class="[
				pocketnet ? 'bin' : '',
				!pocketnet ? 'bout' : '',
				mclass || '',
				minimized ? 'minimized' : '',
				active ? 'active' : '',
				mobile ? 'mobile' : '',
			]"
		>
			<div class="modal-backdrop" @click="close">
				<div class="closecsscross"></div>
			</div>

			<div class="modal-wrapper">
				<swipable :directions="directions" @end="endswipe">
					<template v-slot:default>
						<div
							:class="
								'modal ' + (mclass == 'absoluteContent' ? '' : 'customscroll')
							"
							role="dialog"
							aria-labelledby="modalTitle"
							aria-describedby="modalDescription"
							v-scroll="scrolling"
						>
							<div class="modal-header">
								<div class="headerWrapper">
									<slot name="header"> </slot>
								</div>

								<div class="modal-close" @click="close">
									<i class="fas fa-times"></i>
								</div>
							</div>

							<div class="modal-body" id="modalDescription">
								<slot v-if="!module && !path" name="body" :scroll="scroll">
								</slot>
								<component
									@blockclose="setblockclose"
									v-if="module"
									:is="module"
									@close="close"
									:wnd="true"
									v-bind="data || {}"
									v-on="events"
									:scroll="scroll"
								/>
								<!--<component v-if="path" :is="bypath()" @close="close" :wnd="true" v-bind="data || {}" v-on="events" :scroll="scroll" />-->
							</div>

							<div class="modal-footer" v-if="displayFooter"></div>
						</div>
					</template>
				</swipable>
			</div>
		</div>
	</transition>
</template>

<script src="./index.js"></script>

<style lang="sass" src="./index.sass"></style>
