
const Layout = () => import("@/layout/index.vue");

export default {
    path: "/courses",
    component: Layout,
    meta: {
        rank: 2
    },
    children: [
        {
            path: "",
            name: "CoursesList",
            component: () => import("@/views/courses/index.vue"),
            meta: {
                title: "課程管理",
                icon: "ep/collection"
            }
        }
    ]
} satisfies RouteConfigsTable;
