
const Layout = () => import("@/layout/index.vue");

export default {
    path: "/settings",
    name: "Settings",
    component: Layout,
    redirect: "/settings/index",
    meta: {
        title: "報名時間設定",
        icon: "ep/timer",
        rank: 4
    },
    children: [
        {
            path: "/settings/index",
            name: "SystemSettings",
            component: () => import("@/views/settings/index.vue"),
            meta: {
                title: "報名時間設定"
            }
        }
    ]
} satisfies RouteConfigsTable;
