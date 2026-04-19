const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    if (typeof window !== "undefined") {
        return `http://${window.location.hostname}:3001`;
    }

    return "http://localhost:3001";
};

export const api = async(url, method = 'GET',body=null)=>{
    const BASE_URL = getBaseUrl();
    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${BASE_URL}${url}`,{
            method,
            headers:{
                'Content-Type':'application/json',
                Authorization: token ? `Bearer ${token}` : "",
            },
            body: body ? JSON.stringify(body) : null,
        });

        const contentType = res.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
            ? await res.json()
            : await res.text();

        if (!res.ok) {
            const message =
                typeof data === "string"
                    ? data
                    : data?.message || "Request failed";
            throw new Error(message);
        }

        return data;
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error("Cannot reach backend server. Make sure it is running on http://localhost:3001.");
        }

        throw error;
    }
}
