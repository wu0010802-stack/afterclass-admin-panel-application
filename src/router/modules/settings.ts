
const Layout = () => import("@/layout/index.vue");

export default {
    path: "/settings",
    component: Layout,
    children: [
        {
            path: "",
            name: "SystemSettings",
            component: () => import("@/views/settings/index.vue"),
            meta: {
                title: "報名時間設定",
                icon: "ep/timer",
                rank: 4
            }
        }
    ]
} satisfies RouteConfigsTable;
