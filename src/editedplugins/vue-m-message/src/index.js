import Message from "./message.js";
import MessageComponent from "./mmessage.vue";
import "./asd.css";

Message.install = function (Vue, options) {
  if (options && options.name) {
    Vue.prototype[`$${options.name}`] = Message;
  } else {
    Vue.prototype.$message = Message;
  }
};

export const MMessage = MessageComponent;
export default Message;
