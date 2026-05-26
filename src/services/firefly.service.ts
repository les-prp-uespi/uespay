import axios from "axios";
import type { FireFlyPayload } from "../types";

const firefly = axios.create({
    baseURL: process.env.FIREFLY_URL ?? ""
});

/**
 * Registra uma transação no Hyperledger FireFly via broadcast.
 * Em caso de falha na comunicação, loga o erro mas não impede
 * o fluxo principal (o saldo já foi atualizado localmente).
 */
export async function registrarTransacao(data: FireFlyPayload): Promise<void> {
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
        console.error("Erro ao registrar transação no FireFly:", error);
    }
}