/**
 * Camada de dados — Usuário (simulação em memória).
 *
 * Contém 1 usuário para o MVP. O saldo é consultado
 * diretamente na blockchain via FireFly.
 */

import type { User } from "../types";

// ─── Dados Iniciais ────────────────────────────────────────────

const dadosIniciais: User[] = [
    {
        id: "1",
        nome: "Ana Carolina Sousa",
        email: "ana.sousa@aluno.uespi.br",
        senha: "1234" // TODO: hash com bcrypt/argon2 em produção
    }
];

// ─── Store em Memória ──────────────────────────────────────────

export const users: User[] = [...dadosIniciais];

// ─── Funções Utilitárias ───────────────────────────────────────

/**
 * Busca um usuário pelo ID.
 * Retorna `undefined` se não encontrado.
 */
export function buscarUsuarioPorId(id: string): User | undefined {
    return users.find((u) => u.id === id);
}

/**
 * Busca um usuário pelo e-mail.
 * Retorna `undefined` se não encontrado.
 */
export function buscarUsuarioPorEmail(email: string): User | undefined {
    return users.find((u) => u.email === email);
}

/**
 * Adiciona um novo usuário ao store.
 * Gera um ID sequencial baseado no maior ID existente.
 * Retorna o usuário criado com o ID atribuído.
 */
export function adicionarUsuario(dados: Omit<User, "id">): User {
    const maiorId = users.reduce(
        (max, u) => Math.max(max, parseInt(u.id, 10)),
        0
    );

    const novoUsuario: User = {
        id: (maiorId + 1).toString(),
        ...dados
    };

    users.push(novoUsuario);
    return novoUsuario;
}

/**
 * Retorna todos os usuários cadastrados.
 */
export function listarUsuarios(): User[] {
    return users;
}

/**
 * Reseta o store para os dados iniciais.
 * Útil para testes.
 */
export function resetarUsuarios(): void {
    users.length = 0;
    users.push(...dadosIniciais.map((u) => ({ ...u })));
}