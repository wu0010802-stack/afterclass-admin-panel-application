
const Layout = () => import("@/layout/index.vue");

export default {
    path: "/courses",
    component: Layout,
    children: [
        {
            path: "",
            name: "CoursesList",
            component: () => import("@/views/courses/index.vue"),
            meta: {
                title: "課程管理",
                icon: "ep/collection",
                rank: 2
            }
        }
    ]
} satisfies RouteConfigsTable;
