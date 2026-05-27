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

/** Converte valor em escala ERC-20 de volta para número legível. */
function desescalar(valorEscalado: string): number {
    return Number(BigInt(valorEscalado) / ESCALA);
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
 * Consulta o saldo real de tokens na blockchain.
 * Retorna o valor em créditos UesPay (já desescalado de 18 decimais).
 * Lança erro se o FireFly estiver offline.
 */
export async function consultarSaldoBlockchain(): Promise<number> {
    try {
        // Primeiro precisamos do UUID do pool, pois getTokenBalances usa UUID
        const pools = await firefly.getTokenPools();
        const poolId = pools.find(p => p.name === TOKEN_POOL)?.id;

        if (!poolId) {
            return 0; // Pool não existe ainda
        }

        const balances = await firefly.getTokenBalances({ pool: poolId });

        if (!balances || balances.length === 0) {
            return 0;
        }

        // Filtra o saldo da chave default do nó (exclui endereço do RU)
        const saldoAluno = balances.find(
            (b) => b.key && b.key !== ENDERECO_RU
        );

        if (!saldoAluno || !saldoAluno.balance) {
            return 0;
        }

        return desescalar(saldoAluno.balance);
    } catch (error) {
        throw new Error(
            "Não foi possível consultar saldo: FireFly está offline. Inicie o FireFly com 'ff start uespay'."
        );
    }
}

/**
 * Consulta o saldo do Restaurante Universitário (RU) na blockchain.
 */
export async function consultarSaldoRUBlockchain(): Promise<number> {
    try {
        const pools = await firefly.getTokenPools();
        const poolId = pools.find(p => p.name === TOKEN_POOL)?.id;

        if (!poolId) return 0;

        const balances = await firefly.getTokenBalances({ pool: poolId });

        if (!balances || balances.length === 0) return 0;

        const saldoRU = balances.find((b) => b.key === ENDERECO_RU);

        if (!saldoRU || !saldoRU.balance) return 0;

        return desescalar(saldoRU.balance);
    } catch (error) {
        return 0;
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
        }, { confirm: true });
    } catch (error) {
        throw new Error(
            "Não foi possível realizar recarga: FireFly está offline. Inicie o FireFly com 'ff start uespay'."
        );
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
        }, { confirm: true });
    } catch (error) {
        throw new Error(
            "Não foi possível realizar pagamento: FireFly está offline. Inicie o FireFly com 'ff start uespay'."
        );
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
        }, { confirm: true });
    } catch (error) {
        throw new Error(
            "Não foi possível registrar transferência: FireFly está offline. Inicie o FireFly com 'ff start uespay'."
        );
    }
}