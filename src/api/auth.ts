
import { http } from "@/utils/http";

export const getLogin = (data?: object) => {
    return http.request("post", "/admin/login", { data });
};
