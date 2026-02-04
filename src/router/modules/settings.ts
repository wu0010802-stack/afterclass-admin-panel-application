
const Layout = () => import("@/layout/index.vue");

export default {
    path: "/settings",
    name: "Settings",
    component: Layout,
    redirect: "/settings/registration-time",
    meta: {
        title: "報名時間設定",
        icon: "ep/timer",
        rank: 4
    },
    children: [
        {
            path: "/settings/registration-time",
            name: "SystemSettings",
            component: () => import("@/views/settings/index.vue"),
            meta: {
                title: "報名時間設定",
                showParent: true
            }
        }
    ]
} satisfies RouteConfigsTable;
