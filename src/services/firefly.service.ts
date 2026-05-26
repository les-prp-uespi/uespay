import FireFly from "@hyperledger/firefly-sdk";
import type { FireFlyPayload } from "../types";

const FIREFLY_URL = process.env.FIREFLY_URL || "http://localhost:5000";
const FIREFLY_NAMESPACE = process.env.FIREFLY_NAMESPACE || "default";

const firefly = new FireFly({
    host: FIREFLY_URL,
    namespace: FIREFLY_NAMESPACE
});

/**
 * Registra uma transação no Hyperledger FireFly via broadcast.
 * Cada transação é transmitida a todos os membros da rede,
 * criando um registro imutável no blockchain para auditoria.
 *
 * Em caso de falha na comunicação com o FireFly, o erro é
 * logado mas não impede o fluxo principal da aplicação.
 */
export async function registrarTransacao(data: FireFlyPayload): Promise<void> {
    try {
        await firefly.sendBroadcast({
            header: {
                topics: ["uespay"]
            },
            data: [
                {
                    value: data
                }
            ]
        });
    } catch (error) {
        console.error("Erro ao registrar transação no FireFly:", error);
    }
}