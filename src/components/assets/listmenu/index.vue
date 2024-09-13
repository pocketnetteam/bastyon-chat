<template>
	<div class="listmenu">
		<list :items="items" @click="click">
			<template v-slot:default="slotProps">
				<slot :item="slotProps.item" :index="slotProps.i">
					<button
						class="menuitem"
						@click="
							slotProps.item.onClick
								? slotProps.item.onClick(slotProps.item)
								: null
						"
						:class="slotProps.item.class || ''"
					>
						<i :class="slotProps.item.icon" />
						<span>{{ $t(slotProps.item.text) }}</span>
					</button>
				</slot>
			</template>
		</list>
	</div>
</template>

<style scoped lang="sass">
.menuitem
    width: 100%
    display: flex
    padding : 2 * $r
    align-items: center
    background: srgb(--neutral-grad-0)
    color : srgb(--neutral-grad-4)
    margin-bottom: $r
    border-radius: 22px

    &.good
        color : srgb(--color-good)
    &.bad
        color : srgb(--color-bad)
    i
        width: 33px
        text-align: center
        margin-right: $r

::v-deep
    .simplelist
        .item
            &:nth-last-child(1)
                .menuitem
                    margin-bottom : 0


@media (pointer:fine)
    .menuitem
        cursor: pointer
        +transition(0.3s)

        &:hover
            background: srgb(--neutral-grad-1)
</style>

<script>
import { mapState } from "vuex";

export default {
	name: "listmenu",
	props: {
		items: Array,
		close: Function,
		onlyimit: Boolean
	},
	computed: mapState({
		auth: state => state.auth
	}),

	methods: {
		click: function (item) {
			if (this.onlyimit) {
				this.$emit("click", item);

				return;
			}

			if (item.action) {
				if (typeof item.action == "function") {
					item.action();
				} else {
					this.$emit("action", item.action);
				}
			}

			if (this.close) this.close();
			else this.$emit("close");
		}
	}
};
</script>
