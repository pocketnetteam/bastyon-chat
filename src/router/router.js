import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

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
			component: () => import("@/views/contact"),
		},
		{
			path: "/chats",
			name: "chats",
			component: () => import("@/views/chats"),
			children: [
				{
					path: "/chat",
					name: "chat",
					component: () => import("@/views/chat"),
				},
				{
					path: "",
					name: "chatPrompt",
					component: () => import("@/views/chatPrompt"),
				},
			],
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
			component: () => import("@/views/invite"),
		},
	],

	mode: document.getElementById("automomous") ? "history" : "abstract",

	/*scrollBehavior(to, from, savedPosition) {

		console.log('to.name' , to.name,savedPosition )

		if (savedPosition && to.name == 'chats') {
			console.log('savedPosition', savedPosition)
			return savedPosition
		} else {
			return { top: 0 }
		}
	}*/
});

export default router;
