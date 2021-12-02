import _ from "underscore";

export default {
  name: "listPhoneContacts",

  props: {
    phoneContacts: Array,
    showTitle: Boolean,
    type: String
  },

 

  methods: {
    invitePhoneContact : function(phoneContact){
      this.$emit('invitePhoneContact', phoneContact);
    }
  },

  computed: {

    contacts : function(){
      switch (this.type) {

        case 'email':
          return _.filter(this.phoneContacts, (phoneContact) => {
            if(phoneContact.emails && phoneContact.emails.length >= 1) return true
          });
          break;

        case 'sms':
          return _.filter(this.phoneContacts, (phoneContact) => {
            if(phoneContact.phoneNumbers && phoneContact.phoneNumbers.length >= 1) return true
          });
          break;

        default:
          return this.phoneContacts;

      }
    },

  },
}