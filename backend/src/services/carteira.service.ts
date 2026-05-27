import { buscarUsuarioPorId } from "../data/users";
import {
    mintarTokens,
    transferirTokens,
    registrarTransferencia,
    consultarSaldoBlockchain
} from "./firefly.service";
import type { Transacao, RespostaTransacao } from "../types";

/** Armazena o histórico de transações em memória (mock). */
const transacoes: Transacao[] = [];

/**
 * Limpa o histórico de transações em memória (útil para testes).
 */
export function resetarTransacoes() {
    transacoes.length = 0;
}

/**
 * Busca um usuário pelo ID.
 * Lança erro se não encontrado.
 */
function buscarUsuario(userId: string) {
    const user = buscarUsuarioPorId(userId);
    if (!user) throw new Error("Usuário não encontrado");
    return user;
}

/**
 * Retorna o histórico de transações de um usuário.
 */
export function getHistorico(userId: string): Transacao[] {
    buscarUsuario(userId);

    return transacoes.filter(t =>
        t.fromUserId === userId || t.toUserId === userId
    );
}

/**
 * Consulta o saldo atual de um usuário.
 * O saldo é obtido diretamente da blockchain (FireFly).
 */
export async function consultarSaldo(userId: string): Promise<number> {
    buscarUsuario(userId);
    return await consultarSaldoBlockchain();
}

/**
 * Adiciona créditos ao saldo de um usuário (recarga).
 * Emite (mint) tokens no blockchain para representar os novos créditos.
 */
export async function adicionarSaldo(
    userId: string,
    valor: number
): Promise<RespostaTransacao> {
    buscarUsuario(userId);

    if (valor <= 0) {
        throw new Error("Valor de recarga deve ser positivo");
    }

    await mintarTokens(valor);

    const saldoAtual = await consultarSaldoBlockchain();

    const transacao: Transacao = {
        id: Date.now().toString(),
        tipo: "RECARGA",
        fromUserId: userId,
        valor,
        data: new Date(),
        descricao: "Recarga de créditos"
    };

    transacoes.push(transacao);

    return {
        mensagem: "Recarga realizada com sucesso!",
        saldoRestante: saldoAtual
    };
}


/**
 * Processa o pagamento de uma refeição no RU.
 * Transfere tokens para o endereço do RU no blockchain.
 */
export async function pagarRefeicao(
    userId: string,
    valor: number,
    senha: string
): Promise<RespostaTransacao> {
    const user = buscarUsuario(userId);

    if (user.senha !== senha) throw new Error("Senha inválida");
    if (valor <= 0) throw new Error("Valor deve ser positivo");

    const saldoAtual = await consultarSaldoBlockchain();
    if (saldoAtual < valor) throw new Error("Saldo insuficiente");

    await transferirTokens(valor);

    const saldoFinal = await consultarSaldoBlockchain();

    const transacao: Transacao = {
        id: Date.now().toString(),
        tipo: "REFEICAO",
        fromUserId: userId,
        valor,
        data: new Date(),
        descricao: "Pagamento de refeição no RU"
    };

    transacoes.push(transacao);

    return {
        mensagem: "Pagamento realizado com sucesso!",
        saldoRestante: saldoFinal
    };
}

/**
 * Realiza uma transferência entre dois usuários.
 * Registra via broadcast no blockchain (ambos no mesmo nó no MVP).
 *
 * Nota: no MVP com 1 usuário, esta função não será usada no fluxo
 * principal, mas está preparada para expansão.
 */
export async function transferir(
    fromUserId: string,
    toUserId: string,
    valor: number,
    senha: string
): Promise<RespostaTransacao> {
    const remetente = buscarUsuario(fromUserId);
    buscarUsuario(toUserId);

    if (remetente.senha !== senha) throw new Error("Senha inválida");
    if (valor <= 0) throw new Error("Valor deve ser positivo");

    const saldoAtual = await consultarSaldoBlockchain();
    if (saldoAtual < valor) throw new Error("Saldo insuficiente");

    await registrarTransferencia({
        tipo: "TRANSFERENCIA",
        fromUserId,
        toUserId,
        valor
    });

    const saldoFinal = await consultarSaldoBlockchain();

    const transacao: Transacao = {
        id: Date.now().toString(),
        tipo: "TRANSFERENCIA",
        fromUserId,
        toUserId,
        valor,
        data: new Date(),
        descricao: `Transferência para usuário ${toUserId}`
    };

    transacoes.push(transacao);

    return {
        mensagem: "Transferência realizada com sucesso!",
        saldoRestante: saldoFinal
    };
}
