/**
 * Tipos e interfaces do domínio UesPay.
 *
 * Centraliza todas as definições de tipo usadas pela API,
 * garantindo consistência entre rotas, services e data layer.
 */

// ─── Usuário / Carteira ────────────────────────────────────────

export interface User {
    id: string;
    nome: string;
    email: string;
    saldo: number;
    senha: string; // TODO: substituir por hash (bcrypt) antes de produção
}

// ─── Transações ────────────────────────────────────────────────

export type TipoTransacao = "RECARGA" | "PAGAMENTO" | "REFEICAO" | "TRANSFERENCIA";

export interface Transacao {
    id: string;
    tipo: TipoTransacao;
    fromUserId: string;
    toUserId?: string;
    valor: number;
    data: Date;
    descricao: string;
}

// ─── QR Code ───────────────────────────────────────────────────

export type TipoQRCode = "REFEICAO" | "TRANSFERENCIA";

export interface QRCodeRefeicao {
    tipo: "REFEICAO";
    valor: number;
}

export interface QRCodeTransferencia {
    tipo: "TRANSFERENCIA";
    toUserId: string;
    valor: number;
}

export type QRCodeData = QRCodeRefeicao | QRCodeTransferencia;

// ─── Respostas da API ──────────────────────────────────────────

export interface RespostaTransacao {
    mensagem: string;
    saldoRestante: number;
}

export interface RespostaErro {
    erro: string;
}

// ─── FireFly ───────────────────────────────────────────────────

export interface FireFlyPayload {
    tipo: TipoTransacao;
    userId?: string;
    fromUserId?: string;
    toUserId?: string;
    valor: number;
}
