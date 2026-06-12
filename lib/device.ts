export const getDeviceId = () => {
    if (typeof window === "undefined") return "";

    let id = localStorage.getItem("device-id");

    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("device-id", id);
    }

    return id;
};