import { describe, it, expect } from "vitest";
import { processarQRCode } from "../services/qrcode.service";

describe("QR Code Service", () => {
    // ─── QR Code de Refeição ───────────────────────────────────

    describe("QR Code de refeição", () => {
        it("deve processar QR Code de refeição válido", () => {
            const qr = JSON.stringify({ tipo: "REFEICAO", valor: 8.5 });
            const resultado = processarQRCode(qr);

            expect(resultado.tipo).toBe("REFEICAO");
            expect(resultado.valor).toBe(8.5);
        });

        it("deve rejeitar QR Code de refeição sem valor", () => {
            const qr = JSON.stringify({ tipo: "REFEICAO" });
            expect(() => processarQRCode(qr)).toThrow("valor");
        });
    });

    // ─── QR Code de Transferência ──────────────────────────────

    describe("QR Code de transferência", () => {
        it("deve processar QR Code de transferência válido", () => {
            const qr = JSON.stringify({ tipo: "TRANSFERENCIA", toUserId: "2", valor: 25 });
            const resultado = processarQRCode(qr);

            expect(resultado.tipo).toBe("TRANSFERENCIA");
            if (resultado.tipo === "TRANSFERENCIA") {
                expect(resultado.toUserId).toBe("2");
                expect(resultado.valor).toBe(25);
            }
        });

        it("deve rejeitar transferência sem destinatário", () => {
            const qr = JSON.stringify({ tipo: "TRANSFERENCIA", valor: 25 });
            expect(() => processarQRCode(qr)).toThrow("destino");
        });

        it("deve rejeitar transferência sem valor", () => {
            const qr = JSON.stringify({ tipo: "TRANSFERENCIA", toUserId: "2" });
            expect(() => processarQRCode(qr)).toThrow("destino");
        });
    });

    // ─── Validações Gerais ─────────────────────────────────────

    describe("validações gerais", () => {
        it("deve rejeitar JSON inválido", () => {
            expect(() => processarQRCode("isso-nao-e-json")).toThrow("JSON inválido");
        });

        it("deve rejeitar QR Code sem campo tipo", () => {
            const qr = JSON.stringify({ valor: 10 });
            expect(() => processarQRCode(qr)).toThrow("tipo");
        });

        it("deve rejeitar tipo de operação desconhecido", () => {
            const qr = JSON.stringify({ tipo: "DESCONHECIDO", valor: 10 });
            expect(() => processarQRCode(qr)).toThrow("não suportada");
        });
    });
});
