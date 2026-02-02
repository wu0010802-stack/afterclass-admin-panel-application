
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/management",
  name: "Management",
  component: Layout,
  redirect: "/management/courses",
  meta: {
    title: "管理設定",
    icon: "ep/setting",
    rank: 3
  },
  children: [
    {
      path: "/management/courses",
      name: "CoursesList",
      component: () => import("@/views/courses/index.vue"),
      meta: {
        title: "課程管理",
        icon: "ep/collection"
      }
    },
    {
      path: "/management/classes",
      name: "ClassesList",
      component: () => import("@/views/classes/index.vue"),
      meta: {
        title: "班級管理",
        icon: "ep/school"
      }
    },
    {
      path: "/management/settings",
      name: "SystemSettings",
      component: () => import("@/views/settings/index.vue"),
      meta: {
        title: "報名時間設定",
        icon: "ep/timer"
      }
    }
  ]
} satisfies RouteConfigsTable;
