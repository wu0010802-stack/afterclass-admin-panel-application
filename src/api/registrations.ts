
import { http } from "@/utils/http";

export const getRegistrations = () => {
    return http.request("get", "/admin/registrations");
};

export const getRegistrationDetail = (id: number) => {
    return http.request("get", `/admin/registration/${id}`);
};

export const deleteRegistration = (id: number) => {
    return http.request("delete", `/admin/registration/${id}`);
};

export const deleteWaitlist = (id: number) => {
    return http.request("delete", `/admin/waitlist/${id}`);
};

export const updateRemark = (id: number, data: { remark: string }) => {
    return http.request("put", `/admin/registration/${id}/remark`, { data });
};

export const togglePayment = (id: number, data: { paid: boolean }) => {
    return http.request("put", `/admin/registration/${id}/payment`, { data });
};
