<template>
	<div class="list">
		<div :class="simplelistClass" ref="simplelist" v-if="transition">
			<transition-group :name="transition" tag="div">
				<div
					class="item"
					v-touch:touchhold="(e) => touchhold(item, e)"
					:key="item.id || item.ID || i + 1"
					:data-index="i"
					v-for="(item, i) in readyItems"
					@click="(e) => click(item)"
				>
					<slot :item="item" :index="i">
						{{ item.value }}
					</slot>
				</div>
			</transition-group>
		</div>

		<div :class="simplelistClass" ref="simplelist" v-else>
			<div
				class="item"
				v-touch:touchhold="(e) => touchhold(item, e)"
				:key="item.id || item.ID || i + 1"
				:data-index="i"
				v-for="(item, i) in readyItems"
				@click="(e) => click(item)"
			>
				<slot :item="item" :index="i">
					{{ item.value }}
				</slot>
			</div>
		</div>
	</div>
</template>

<script src="./index.js"></script>

<style scoped lang="sass" src="./index.sass"></style>
