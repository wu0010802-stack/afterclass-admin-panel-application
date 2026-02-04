
const Layout = () => import("@/layout/index.vue");

export default {
    path: "/classes",
    name: "Classes",
    component: Layout,
    redirect: "/classes/index",
    meta: {
        title: "班級管理",
        icon: "ep/school",
        rank: 3
    },
    children: [
        {
            path: "/classes/index",
            name: "ClassesList",
            component: () => import("@/views/classes/index.vue"),
            meta: {
                title: "班級管理",
                icon: "ep/school"
            }
        }
    ]
} satisfies RouteConfigsTable;
