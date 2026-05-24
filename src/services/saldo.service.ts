import { users } from "../data/users";
import { registrarTransacao } from "./firefly.service";

export async function consultarSaldo(userId: string) {
    const user = users.find(u => u.id === userId);

    if (!user) {
        throw new Error("Usuário não encontrado");
    }

    return user.saldo;
}

export async function adicionarSaldo(
    userId: string,
    valor: number
) {
    const user = users.find(u => u.id === userId);

    if (!user) {
        throw new Error("Usuário não encontrado");
    }

    user.saldo += valor;

    await registrarTransacao({
        tipo: "RECARGA",
        userId,
        valor
    });

    return user;
}

export async function debitarSaldo(
    userId: string,
    valor: number
) {
    const user = users.find(u => u.id === userId);

    if (!user) {
        throw new Error("Usuário não encontrado");
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