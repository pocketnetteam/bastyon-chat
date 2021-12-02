export default {
    name: 'simpleInput',
    props: {
        inputType: {
            type: String,
            default: this.$i18n.t("caption.text")
        },
        inputPlaceholder: {
            type: String,
            default: this.$i18n.t("caption.placeholder")
        },
        inputInvalid: {
            type: Boolean,
            default: false
        },
        resetTrigger: {
            type: Boolean,
            default: false,
        },
        modelInputValue: {
            type: [String, null],
            default: null,
        },
    },
    data: function(){
        return {
            inputValue: null,
        }
    },
    computed: {
        inputInvalidInner() {
            return this.inputInvalid;
        }
    },
    watch: {
        inputValue() {
            this.$emit('onInputValueChange', this.inputValue);
        },
        resetTrigger() {
            this.inputValue = null;
        }
    },
    methods : {
        onFocusHandler() {
            this.$emit('onFocus');
        },
    },
}