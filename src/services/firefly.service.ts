import axios from "axios";

const firefly = axios.create({
    baseURL: process.env.FIREFLY_URL ?? ""
});

export async function registrarTransacao(data: any) {
    try {
        await firefly.post("/api/v1/messages/broadcast", {
            header: {
                topics: ["uespay"]
            },
            data: [
                {
                    value: JSON.stringify(data)
                }
            ]
        });
    } catch (error) {
        console.log("Erro FireFly:", error);
    }
}