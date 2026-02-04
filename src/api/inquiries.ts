
import { http } from "@/utils/http";

export const getInquiries = () => {
    return http.request("get", "/admin/inquiries");
};

export const markInquiryRead = (id: number) => {
    return http.request("put", `/admin/inquiry/${id}/read`);
};

export const deleteInquiry = (id: number) => {
    return http.request("delete", `/admin/inquiry/${id}`);
};

export const getRegistrationChanges = () => {
    return http.request("get", "/admin/registration-changes");
};
