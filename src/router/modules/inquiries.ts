export default {
    path: "/inquiries",
    name: "Inquiries",
    redirect: "/inquiries/index",
    meta: {
        title: "家長提問",
        icon: "ep:chat-dot-round",
        rank: 4
    },
    children: [
        {
            path: "/inquiries/index",
            name: "InquiriesList",
            component: () => import("@/views/inquiries/index.vue"),
            meta: {
                title: "家長提問",
                showParent: true
            }
        }
    ]
} satisfies RouteConfigsTable;
