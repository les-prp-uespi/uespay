import { users } from "../data/users";
import { mintarTokens, transferirParaRU, registrarTransferencia } from "./firefly.service";
import type { Transacao, RespostaTransacao } from "../types";

/** Armazena o histórico de transações em memória (mock). */
const transacoes: Transacao[] = [];

/**
 * Busca um usuário pelo ID.
 * Lança erro se não encontrado.
 */
function buscarUsuario(userId: string) {
    const user = users.find((u) => u.id === userId);
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
 * Adiciona créditos ao saldo de um usuário (recarga).
 * Emite (mint) tokens no blockchain para representar os novos créditos.
 */
export async function adicionarSaldo(
    userId: string,
    valor: number
): Promise<RespostaTransacao> {
    const user = buscarUsuario(userId);

    if (valor <= 0) {
        throw new Error("Valor de recarga deve ser positivo");
    }

    user.saldo += valor;

    const transacao: Transacao = {
        id: Date.now().toString(),
        tipo: "RECARGA",
        fromUserId: userId,
        valor,
        data: new Date(),
        descricao: "Recarga de créditos"
    };

    transacoes.push(transacao);
    await mintarTokens(valor);

    return {
        mensagem: "Recarga realizada com sucesso!",
        saldoRestante: user.saldo
    };
}

/**
 * Debita um valor do saldo de um usuário (pagamento genérico).
 * Transfere tokens para o serviço correspondente no blockchain.
 */
export async function debitarSaldo(
    userId: string,
    valor: number
): Promise<RespostaTransacao> {
    const user = buscarUsuario(userId);

    if (valor <= 0) {
        throw new Error("Valor de pagamento deve ser positivo");
    }

    if (user.saldo < valor) {
        throw new Error("Saldo insuficiente");
    }

    user.saldo -= valor;

    const transacao: Transacao = {
        id: Date.now().toString(),
        tipo: "PAGAMENTO",
        fromUserId: userId,
        valor,
        data: new Date(),
        descricao: "Pagamento de serviço"
    };

    transacoes.push(transacao);
    await transferirParaRU(valor);

    return {
        mensagem: "Pagamento realizado com sucesso!",
        saldoRestante: user.saldo
    };
}

/**
 * Consulta o saldo atual de um usuário.
 */
export function consultarSaldo(userId: string): number {
    const user = buscarUsuario(userId);
    return user.saldo;
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
    if (user.saldo < valor) throw new Error("Saldo insuficiente");

    user.saldo -= valor;

    const transacao: Transacao = {
        id: Date.now().toString(),
        tipo: "REFEICAO",
        fromUserId: userId,
        valor,
        data: new Date(),
        descricao: "Pagamento de refeição no RU"
    };

    transacoes.push(transacao);
    await transferirParaRU(valor);

    return {
        mensagem: "Pagamento realizado com sucesso!",
        saldoRestante: user.saldo
    };
}

/**
 * Realiza uma transferência entre dois usuários.
 * Registra via broadcast no blockchain (ambos no mesmo nó no MVP).
 */
export async function transferir(
    fromUserId: string,
    toUserId: string,
    valor: number,
    senha: string
): Promise<RespostaTransacao> {
    const remetente = buscarUsuario(fromUserId);
    const destinatario = buscarUsuario(toUserId);

    if (remetente.senha !== senha) throw new Error("Senha inválida");
    if (valor <= 0) throw new Error("Valor deve ser positivo");
    if (remetente.saldo < valor) throw new Error("Saldo insuficiente");

    remetente.saldo -= valor;
    destinatario.saldo += valor;

    const transacao: Transacao = {
        id: Date.now().toString(),
        tipo: "TRANSFERENCIA",
        fromUserId,
        toUserId,
        valor,
        data: new Date(),
        descricao: `Transferência para ${destinatario.nome}`
    };

    transacoes.push(transacao);
    await registrarTransferencia({
        tipo: "TRANSFERENCIA",
        fromUserId,
        toUserId,
        valor
    });

    return {
        mensagem: "Transferência realizada com sucesso!",
        saldoRestante: remetente.saldo
    };
}
