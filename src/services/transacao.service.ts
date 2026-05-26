import { users } from "../data/users";
import { registrarTransacao } from "./firefly.service";
import type { Transacao, RespostaTransacao } from "../types";

/** Armazena o histórico de transações em memória (mock). */
const transacoes: Transacao[] = [];

/**
 * Retorna o histórico de transações de um usuário.
 */
export function getHistorico(userId: string): Transacao[] {
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error("Usuário não encontrado");

    return transacoes.filter(t =>
        t.fromUserId === userId || t.toUserId === userId
    );
}

/**
 * Processa o pagamento de uma refeição no RU.
 * Valida senha e saldo antes de debitar.
 */
export async function pagarRefeicao(
    userId: string,
    valor: number,
    senha: string
): Promise<RespostaTransacao> {
    const user = users.find(u => u.id === userId);

    if (!user) throw new Error("Usuário não encontrado");
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
        descricao: "Pagamento de refeição"
    };

    transacoes.push(transacao);
    await registrarTransacao({
        tipo: "REFEICAO",
        fromUserId: userId,
        valor
    });

    return {
        mensagem: "Pagamento realizado com sucesso!",
        saldoRestante: user.saldo
    };
}

/**
 * Realiza uma transferência entre dois usuários.
 * Valida senha, saldo e existência dos dois usuários.
 */
export async function transferir(
    fromUserId: string,
    toUserId: string,
    valor: number,
    senha: string
): Promise<RespostaTransacao> {
    const remetente = users.find((u) => u.id === fromUserId);
    const destinatario = users.find((u) => u.id === toUserId);

    if (!remetente) throw new Error("Remetente não encontrado");
    if (!destinatario) throw new Error("Destinatário não encontrado");
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
    await registrarTransacao({
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