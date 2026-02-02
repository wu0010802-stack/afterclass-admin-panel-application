
import { http } from "@/utils/http";

export const getCourses = () => {
    return http.request("get", "/admin/courses");
};

export const createCourse = (data: object) => {
    return http.request("post", "/admin/course", { data });
};

export const updateCourse = (id: number, data: object) => {
    return http.request("put", `/admin/course/${id}`, { data });
};

export const deleteCourse = (id: number) => {
    return http.request("delete", `/admin/course/${id}`);
};

export const getCourseVideos = () => {
    return http.request("get", "/api/course-videos");
};
