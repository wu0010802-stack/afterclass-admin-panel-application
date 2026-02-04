
const Layout = () => import("@/layout/index.vue");

export default {
    path: "/courses",
    name: "Courses",
    component: Layout,
    redirect: "/courses/index",
    meta: {
        title: "課程管理",
        icon: "ep/collection",
        rank: 1
    },
    children: [
        {
            path: "/courses/index",
            name: "CoursesList",
            component: () => import("@/views/courses/index.vue"),
            meta: {
                title: "課程管理",
                icon: "ep/collection"
            }
        }
    ]
} satisfies RouteConfigsTable;
