import FireFly from "@hyperledger/firefly-sdk";
import type { FireFlyPayload } from "../types";

const FIREFLY_URL = process.env.FIREFLY_URL || "http://localhost:5000";
const FIREFLY_NAMESPACE = process.env.FIREFLY_NAMESPACE || "default";

const TOKEN_POOL = "uespay-credits";

/**
 * Fator de escala ERC-20 (18 casas decimais).
 * 1 crédito UesPay = 1 * 10^18 na camada blockchain.
 */
const ESCALA = BigInt("1000000000000000000"); // 10^18

/**
 * Endereço do Restaurante Universitário (RU) na blockchain.
 * Em produção, o RU seria um membro FireFly separado.
 */
const ENDERECO_RU = "0x0000000000000000000000000000000000000001";

const firefly = new FireFly({
    host: FIREFLY_URL,
    namespace: FIREFLY_NAMESPACE
});

/** Converte valor inteiro para escala ERC-20 (18 decimais). */
function escalar(valor: number): string {
    return (BigInt(Math.round(valor)) * ESCALA).toString();
}

/**
 * Inicializa o Token Pool no FireFly se ainda não existir.
 * Deve ser chamado uma vez na inicialização do servidor.
 */
export async function inicializarTokenPool(): Promise<void> {
    try {
        const pools = await firefly.getTokenPools();
        const poolExiste = pools.some(p => p.name === TOKEN_POOL);

        if (!poolExiste) {
            await firefly.createTokenPool({
                name: TOKEN_POOL,
                type: "fungible"
            });
            console.log(`[FireFly] Token pool "${TOKEN_POOL}" criado com sucesso`);
        } else {
            console.log(`[FireFly] Token pool "${TOKEN_POOL}" já existe`);
        }
    } catch (error) {
        console.warn("[FireFly] Não foi possível inicializar token pool (FireFly offline?):",
            error instanceof Error ? error.message : error
        );
    }
}

/**
 * Emite (mint) novos tokens para representar uma recarga de créditos.
 * Representa a universidade emitindo créditos para o aluno.
 */
export async function mintarTokens(valor: number): Promise<void> {
    try {
        await firefly.mintTokens({
            pool: TOKEN_POOL,
            amount: escalar(valor)
        });
    } catch (error) {
        console.error("[FireFly] Erro ao mintar tokens:", error);
    }
}

/**
 * Transfere tokens do aluno para o RU (pagamento de refeição).
 * Os tokens saem da chave do nó e vão para o endereço do RU,
 * registrando o pagamento na blockchain.
 */
export async function transferirParaRU(valor: number): Promise<void> {
    try {
        await firefly.transferTokens({
            pool: TOKEN_POOL,
            amount: escalar(valor),
            to: ENDERECO_RU
        });
    } catch (error) {
        console.error("[FireFly] Erro ao transferir tokens para o RU:", error);
    }
}

/**
 * Registra uma transferência P2P via broadcast no blockchain.
 * Como ambos os usuários estão no mesmo nó do MVP, o broadcast
 * garante o registro imutável dos detalhes da operação.
 */
export async function registrarTransferencia(data: FireFlyPayload): Promise<void> {
    try {
        await firefly.sendBroadcast({
            header: {
                topics: ["uespay-transferencias"]
            },
            data: [
                {
                    value: data
                }
            ]
        });
    } catch (error) {
        console.error("[FireFly] Erro ao registrar transferência:", error);
    }
}