
const Layout = () => import("@/layout/index.vue");

export default {
    path: "/classes",
    component: Layout,
    children: [
        {
            path: "",
            name: "ClassesList",
            component: () => import("@/views/classes/index.vue"),
            meta: {
                title: "班級管理",
                icon: "ep/school",
                rank: 3
            }
        }
    ]
} satisfies RouteConfigsTable;
