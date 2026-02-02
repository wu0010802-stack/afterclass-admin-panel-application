
const Layout = () => import("@/layout/index.vue");

export default {
    path: "/registrations",
    name: "Registrations",
    component: Layout,
    redirect: "/registrations/index",
    meta: {
        title: "報名管理",
        icon: "ep/list",
        rank: 2
    },
    children: [
        {
            path: "/registrations/index",
            name: "RegistrationsList",
            component: () => import("@/views/registrations/index.vue"),
            meta: {
                title: "報名列表"
            }
        }
    ]
};
