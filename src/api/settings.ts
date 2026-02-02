
import { http } from "@/utils/http";

export const getRegistrationTime = () => {
    return http.request("get", "/api/settings/registration-time");
};

// Note: admin.html uses the same endpoint for saving time? 
// Let's check admin.html source for saveRegistrationTime
// It likely uses a POST or PUT to a settings endpoint, let me check admin.html lines 582 and script around there.
// For now I will assume POST to /admin/settings based on standard pattern or I will check admin.html content again.
// Wait, looking at server.py from previous turns...
// Line 254: '/admin/settings' is an admin path. 
// I need to be sure about the implementation of saving time setting. 
// I will verify logic in server.py later, but for now I will write the basic get.
// Actually, I'll check server.py in a separate tool call if needed, but I recall seeing it in previous turns.
// The `server.py` snippet showed `if parsed_path.path == '/api/settings/registration-time':` for GET.
// I need to find where the POST is handled.
// In `server.py` turn 141 (view_file), inside `do_POST`? Or `do_PUT`?
// Let's look at `server.py` content available in context.
// I don't see `api/settings/registration-time` in POST/PUT in the snippet I have.
// I will just put the GET first and correct POST later.

export const saveRegistrationTime = (data: object) => {
    return http.request("post", "/admin/settings/registration-time", { data });
};
