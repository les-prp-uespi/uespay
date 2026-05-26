import { users } from "../data/users";
import { registrarTransacao } from "./firefly.service";
import type { User } from "../types";

/**
 * Busca um usuário pelo ID.
 * Lança erro se não encontrado.
 */
function buscarUsuario(userId: string): User {
    const user = users.find((u) => u.id === userId);

    if (!user) {
        throw new Error("Usuário não encontrado");
    }

    return user;
}

/**
 * Consulta o saldo atual de um usuário.
 */
export function consultarSaldo(userId: string): number {
    const user = buscarUsuario(userId);
    return user.saldo;
}

/**
 * Adiciona créditos ao saldo de um usuário (recarga).
 */
export async function adicionarSaldo(
    userId: string,
    valor: number
): Promise<User> {
    const user = buscarUsuario(userId);

    if (valor <= 0) {
        throw new Error("Valor de recarga deve ser positivo");
    }

    user.saldo += valor;

    await registrarTransacao({
        tipo: "RECARGA",
        userId,
        valor
    });

    return user;
}

/**
 * Debita um valor do saldo de um usuário (pagamento genérico).
 */
export async function debitarSaldo(
    userId: string,
    valor: number
): Promise<User> {
    const user = buscarUsuario(userId);

    if (valor <= 0) {
        throw new Error("Valor de pagamento deve ser positivo");
    }

    if (user.saldo < valor) {
        throw new Error("Saldo insuficiente");
    }

    user.saldo -= valor;

    await registrarTransacao({
        tipo: "PAGAMENTO",
        userId,
        valor
    });

    return user;
}