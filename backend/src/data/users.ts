/**
 * Camada de dados — Usuários e Carteiras (simulação em memória).
 *
 * Contém 10 usuários variados para
 * permitir demonstrações de diferentes cenários no MVP.
 */

import type { User } from "../types";

// ─── Dados Iniciais ────────────────────────────────────────────

const dadosIniciais: User[] = [
    {
        id: "1",
        nome: "Ana Carolina Sousa",
        email: "ana.sousa@aluno.uespi.br",
        saldo: 0.00,
        senha: "1234" // TODO(security): hash com bcrypt/argon2 em produção
    },
    {
        id: "2",
        nome: "Lucas Oliveira Santos",
        email: "lucas.santos@aluno.uespi.br",
        saldo: 120.50,
        senha: "1234"
    },
    {
        id: "3",
        nome: "Maria Eduarda Lima",
        email: "maria.lima@aluno.uespi.br",
        saldo: 30.00,
        senha: "1234"
    },
    {
        id: "4",
        nome: "Pedro Henrique Costa",
        email: "pedro.costa@aluno.uespi.br",
        saldo: 0,
        senha: "1234"
    },
    {
        id: "5",
        nome: "Juliana Ferreira Alves",
        email: "juliana.alves@aluno.uespi.br",
        saldo: 95.00,
        senha: "1234"
    },
    {
        id: "6",
        nome: "Rafael Mendes Silva",
        email: "rafael.silva@aluno.uespi.br",
        saldo: 150.00,
        senha: "1234"
    },
    {
        id: "7",
        nome: "Camila Rodrigues Araújo",
        email: "camila.araujo@aluno.uespi.br",
        saldo: 42.75,
        senha: "1234"
    },
    {
        id: "8",
        nome: "Thiago Barbosa Nunes",
        email: "thiago.nunes@aluno.uespi.br",
        saldo: 10.00,
        senha: "1234"
    },
    {
        id: "9",
        nome: "Prof. Alcemir Rodrigues",
        email: "alcemir.rodrigues@uespi.br",
        saldo: 200.00,
        senha: "1234"
    },
    {
        id: "10",
        nome: "Restaurante Universitário",
        email: "ru@uespi.br",
        saldo: 0,
        senha: "admin1234"
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
 * Útil para o seed script e testes.
 */
export function resetarUsuarios(): void {
    users.length = 0;
    users.push(...dadosIniciais.map((u) => ({ ...u })));
}