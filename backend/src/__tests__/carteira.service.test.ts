import { describe, it, expect, beforeEach, vi } from "vitest";
import { resetarUsuarios, buscarUsuarioPorId, adicionarUsuario } from "../data/users";

// Variável para simular o saldo na blockchain durante os testes
let mockSaldoBlockchain = 0;

// Mock do firefly.service para não depender do FireFly rodando
vi.mock("../services/firefly.service", () => ({
    mintarTokens: vi.fn().mockImplementation(async (valor) => { mockSaldoBlockchain += valor; }),
    transferirTokens: vi.fn().mockImplementation(async (valor) => { mockSaldoBlockchain -= valor; }),
    registrarTransferencia: vi.fn().mockImplementation(async (data) => { mockSaldoBlockchain -= data.valor; }),
    consultarSaldoBlockchain: vi.fn().mockImplementation(async () => mockSaldoBlockchain)
}));

import {
    consultarSaldo,
    adicionarSaldo,
    pagarRefeicao,
    transferir,
    getHistorico,
    resetarTransacoes
} from "../services/carteira.service";
import { transferirTokens } from "../services/firefly.service";

describe("Carteira Service", () => {
    beforeEach(() => {
        resetarUsuarios();
        resetarTransacoes();
        mockSaldoBlockchain = 0; // Resetar saldo do mock
        
        // Adiciona um segundo usuário para testes de transferência
        adicionarUsuario({
            nome: "Usuario 2",
            email: "user2@aluno.uespi.br",
            senha: "1234"
        }); // O ID gerado será "2"
    });

    // ─── Consulta de Saldo ─────────────────────────────────────

    describe("consultarSaldo", () => {
        it("deve retornar saldo de usuário existente", async () => {
            mockSaldoBlockchain = 120.5;
            const saldo = await consultarSaldo("1");
            expect(saldo).toBe(120.5);
        });

        it("deve lançar erro para usuário inexistente", async () => {
            await expect(consultarSaldo("999")).rejects.toThrow("Usuário não encontrado");
        });
    });

    // ─── Recarga (adicionarSaldo) ──────────────────────────────

    describe("adicionarSaldo", () => {
        it("deve incrementar o saldo do usuário", async () => {
            const resultado = await adicionarSaldo("1", 50);

            expect(resultado.mensagem).toContain("sucesso");
            expect(resultado.saldoRestante).toBe(50);
        });

        it("deve rejeitar valor zero ou negativo", async () => {
            await expect(adicionarSaldo("1", 0)).rejects.toThrow("positivo");
            await expect(adicionarSaldo("1", -10)).rejects.toThrow("positivo");
        });

        it("deve registrar no histórico", async () => {
            await adicionarSaldo("1", 100);
            const historico = getHistorico("1");

            expect(historico).toHaveLength(1);
            expect(historico[0].tipo).toBe("RECARGA");
            expect(historico[0].valor).toBe(100);
        });
    });

    // ─── Pagamento de Refeição ─────────────────────────────────

    describe("pagarRefeicao", () => {
        it("deve processar pagamento com senha correta", async () => {
            await adicionarSaldo("1", 100);
            const resultado = await pagarRefeicao("1", 15, "1234");

            expect(resultado.mensagem).toContain("sucesso");
            expect(resultado.saldoRestante).toBe(85);
        });

        it("deve rejeitar senha incorreta", async () => {
            await adicionarSaldo("1", 100);
            await expect(pagarRefeicao("1", 15, "errada")).rejects.toThrow("Senha inválida");
        });

        it("deve rejeitar quando saldo insuficiente", async () => {
            await expect(pagarRefeicao("1", 50, "1234")).rejects.toThrow("Saldo insuficiente");
        });

        it("deve registrar no histórico como REFEICAO", async () => {
            await adicionarSaldo("1", 100);
            await pagarRefeicao("1", 15, "1234");

            const historico = getHistorico("1");
            const refeicao = historico.find(t => t.tipo === "REFEICAO");

            expect(refeicao).toBeDefined();
            expect(refeicao!.valor).toBe(15);
        });
    });

    // ─── Transferência P2P ─────────────────────────────────────

    describe("transferir", () => {
        it("deve debitar remetente", async () => {
            await adicionarSaldo("1", 100);
            const resultado = await transferir("1", "2", 40, "1234");

            expect(resultado.saldoRestante).toBe(60);
        });

        it("deve rejeitar senha incorreta", async () => {
            await adicionarSaldo("1", 100);
            await expect(transferir("1", "2", 40, "errada")).rejects.toThrow("Senha inválida");
        });

        it("deve rejeitar quando saldo insuficiente", async () => {
            await expect(transferir("1", "2", 50, "1234")).rejects.toThrow("Saldo insuficiente");
        });

        it("deve registrar no histórico de ambos os usuários", async () => {
            await adicionarSaldo("1", 100);
            await transferir("1", "2", 40, "1234");

            const historicoRemetente = getHistorico("1");
            const historicoDestinatario = getHistorico("2");

            const transferencia1 = historicoRemetente.find(t => t.tipo === "TRANSFERENCIA");
            const transferencia2 = historicoDestinatario.find(t => t.tipo === "TRANSFERENCIA");

            expect(transferencia1).toBeDefined();
            expect(transferencia2).toBeDefined();
            expect(transferencia1!.id).toBe(transferencia2!.id);
        });
    });
});
