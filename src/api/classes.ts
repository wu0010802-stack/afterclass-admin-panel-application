
import { http } from "@/utils/http";

export const getClasses = () => {
  return http.request("get", "/admin/classes");
};

export const createClass = (data: { name: string }) => {
  return http.request("post", "/admin/class", { data });
};

export const updateClass = (id: number, data: { name: string }) => {
  return http.request("put", `/admin/class/${id}`, { data });
};

export const deleteClass = (id: number) => {
  return http.request("delete", `/admin/class/${id}`);
};
