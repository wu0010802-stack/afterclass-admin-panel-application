
import { http } from "@/utils/http";

export const getStats = () => {
    return http.request("get", "/admin/stats");
};
