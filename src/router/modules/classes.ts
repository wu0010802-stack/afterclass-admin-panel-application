
const Layout = () => import("@/layout/index.vue");

export default {
    path: "/classes",
    name: "Classes",
    component: Layout,
    redirect: "/classes/list",
    meta: {
        title: "班級管理",
        icon: "ep/school",
        rank: 3
    },
    children: [
        {
            path: "/classes/list",
            name: "ClassesList",
            component: () => import("@/views/classes/index.vue"),
            meta: {
                title: "班級管理",
                showParent: true
            }
        }
    ]
} satisfies RouteConfigsTable;
