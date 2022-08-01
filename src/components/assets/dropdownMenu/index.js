import simpleMenu from "@/components/assets/simpleMenu/simpleMenu.vue";
import { mapState } from "vuex";
export default {
  name: "dropdownMenu",
  props: {
    menuItems: {
      type: Array,
      required: true,
    },

    rowObject: {
      type: Object,
    },

    icon: String,
  },

  components: {
    simpleMenu,
  },

  data: function () {
    return {
      loading: false,
      menuIsVisible: false,
    };
  },

  watch: {
    menuIsVisible: function (newValue) {
      this.$emit("menuIsVisible", newValue);
    },
  },

  computed: {
    dropdownWidthInner() {
      return this.dropdownWidth;
    },

    ...mapState({
      pocketnet: (state) => state.pocketnet,
      minimized: (state) => state.minimized,
      mobile: (state) => state.mobile,
      active: (state) => state.active,
      hiddenInParent: (state) => state.hiddenInParent,
    }),
  },

  methods: {
    menuItemClick(item) {
      this.$emit("itemClicked", item, this.rowObject, {
        hidePopup: this.hidePopup,
        showPopup: this.showPopup,
      });
    },
    onClickHandler() {
      this.menuIsVisible = !this.menuIsVisible;
    },
    hidePopup() {
      this.menuIsVisible = false;
    },
    showPopup() {
      this.menuIsVisible = true;
    },
  },
};
