import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

import contact from "@/views/contact";
import pageinvite from "@/views/invite";

const router = new Router({
  routes: [
    {
      path: "/contacts",
      name: "contacts",
      component: () => import("@/views/contacts"),
    },
    {
      path: "/contact",
      name: "contact",
      component: contact,
    },
    {
      path: "/chat",
      name: "chat",
      component: () => import("@/views/chat"),
    },
    {
      path: "/publicPreview",
      name: "publicPreview",
      component: () => import("@/views/publicPreview"),
    },
    {
      path: "/chatSettings",
      name: "chatSettings",
      component: () => import("@/views/chatSettings"),
    },
    {
      path: "/chatInfo",
      name: "chatInfo",
      component: () => import("@/views/chatinfo"),
    },
    {
      path: "/teamRoom",
      name: "teamRoom",
      component: () => import("@/views/teamroom"),
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("@/views/settings"),
    },

    {
      path: "/invite",
      name: "invite",
      component: pageinvite,
    },
  ],

  mode: document.getElementById("automomous") ? "history" : "abstract",
});

export default router;
