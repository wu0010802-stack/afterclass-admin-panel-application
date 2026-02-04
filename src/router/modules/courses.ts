
const Layout = () => import("@/layout/index.vue");

export default {
    path: "/courses",
    name: "Courses",
    component: Layout,
    redirect: "/courses/list",
    meta: {
        title: "課程管理",
        icon: "ep/collection",
        rank: 2
    },
    children: [
        {
            path: "/courses/list",
            name: "CoursesList",
            component: () => import("@/views/courses/index.vue"),
            meta: {
                title: "課程管理",
                showParent: true
            }
        }
    ]
} satisfies RouteConfigsTable;
