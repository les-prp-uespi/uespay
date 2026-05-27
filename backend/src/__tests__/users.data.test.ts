import { describe, it, expect, beforeEach } from "vitest";
import {
    listarUsuarios,
    buscarUsuarioPorId,
    buscarUsuarioPorEmail,
    adicionarUsuario,
    resetarUsuarios
} from "../data/users";

describe("Data Layer — Usuários", () => {
    beforeEach(() => {
        resetarUsuarios();
    });

    describe("listarUsuarios", () => {
        it("deve retornar 10 usuários iniciais", () => {
            const usuarios = listarUsuarios();
            expect(usuarios).toHaveLength(10);
        });

        it("todos os usuários devem ter id, nome, email e saldo", () => {
            const usuarios = listarUsuarios();
            for (const user of usuarios) {
                expect(user.id).toBeDefined();
                expect(user.nome).toBeDefined();
                expect(user.email).toBeDefined();
                expect(typeof user.saldo).toBe("number");
            }
        });
    });

    describe("buscarUsuarioPorId", () => {
        it("deve encontrar usuário existente", () => {
            const user = buscarUsuarioPorId("1");
            expect(user).toBeDefined();
            expect(user!.id).toBe("1");
        });

        it("deve retornar undefined para ID inexistente", () => {
            const user = buscarUsuarioPorId("999");
            expect(user).toBeUndefined();
        });
    });

    describe("buscarUsuarioPorEmail", () => {
        it("deve encontrar usuário por email", () => {
            const user = buscarUsuarioPorEmail("ana.sousa@aluno.uespi.br");
            expect(user).toBeDefined();
            expect(user!.nome).toBe("Ana Carolina Sousa");
        });

        it("deve retornar undefined para email inexistente", () => {
            const user = buscarUsuarioPorEmail("naoexiste@uespi.br");
            expect(user).toBeUndefined();
        });
    });

    describe("adicionarUsuario", () => {
        it("deve criar usuário com ID sequencial", () => {
            const novo = adicionarUsuario({
                nome: "Teste Silva",
                email: "teste@aluno.uespi.br",
                saldo: 0,
                senha: "1234"
            });

            expect(novo.id).toBe("11");
            expect(novo.nome).toBe("Teste Silva");
            expect(listarUsuarios()).toHaveLength(11);
        });

        it("novo usuário deve ser encontrável por ID", () => {
            const novo = adicionarUsuario({
                nome: "Novo Aluno",
                email: "novo@aluno.uespi.br",
                saldo: 50,
                senha: "abcd"
            });

            const encontrado = buscarUsuarioPorId(novo.id);
            expect(encontrado).toBeDefined();
            expect(encontrado!.email).toBe("novo@aluno.uespi.br");
        });
    });

    describe("resetarUsuarios", () => {
        it("deve restaurar dados iniciais após modificações", () => {
            adicionarUsuario({
                nome: "Extra",
                email: "extra@uespi.br",
                saldo: 0,
                senha: "1234"
            });

            expect(listarUsuarios()).toHaveLength(11);

            resetarUsuarios();

            expect(listarUsuarios()).toHaveLength(10);
        });

        it("deve restaurar saldos originais", () => {
            const user = buscarUsuarioPorId("1")!;
            user.saldo = 999;

            resetarUsuarios();

            const restaurado = buscarUsuarioPorId("1")!;
            expect(restaurado.saldo).toBe(0);
        });
    });
});
