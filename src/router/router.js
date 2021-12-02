import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

import contacts from '@/views/contacts'
import contact from '@/views/contact'
import pageinvite from '@/views/invite'

const router = new Router({
    routes: [
        /*{
            path: '/',
            name: 'contacts',
            component: ContactList
        },
        {
            path: '/contact',
            name: 'contact',
            component: ContactList,
            props: true
        },*/

        {
            path: '/contacts',
            name: 'contacts',
            component: contacts
        },
        {
            path: '/contact',
            name: 'contact',
            component: contact
        },
        {
            path: '/chats',
            name: 'chats',
            component: () => import ('@/views/chats')
        },
        {
            path: '/chat',
            name: 'chat',
            component: () => import ('@/views/chat')
        },
        {
            path: '/publicPreview',
            name: 'publicPreview',
            component: () => import ('@/views/publicPreview')
        },
        {
            path: '/chatSettings',
            name: 'chatSettings',
            component: () => import ('@/views/chatSettings')
        },
        {
            path: '/chatInfo',
            name: 'chatInfo',
            component: () => import ('@/views/chatinfo')
        },
        {
            path: '/teamRoom',
            name: 'teamRoom',
            component: () => import ('@/views/teamroom')
        },
        {
            path: '/settings',
            name: 'settings',
            component: () => import ('@/views/settings')
        },

        {
            path: '/invite',
            name: 'invite',
            component: pageinvite
        },

        /*{
            path: '/chat',
            name: 'chat',
            component: UserChat,
            props: true
        }*/
    ],
    mode: document.getElementById('automomous') ? 'history' : 'abstract',
    /*scrollBehavior(to, from, savedPosition) {
        return { x: 0, y: 0 }
    }*/
})


export default router