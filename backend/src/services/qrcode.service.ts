import type { QRCodeData } from "../types";

/**
 * Processa e valida os dados recebidos de um QR Code.
 * Espera receber uma string JSON com o formato definido em QRCodeData.
 */
export function processarQRCode(dadosQR: string): QRCodeData {
    let dados: QRCodeData;

    try {
        dados = JSON.parse(dadosQR);
    } catch {
        throw new Error("QR Code inválido: formato JSON inválido");
    }

    if (!dados.tipo) {
        throw new Error("QR Code inválido: campo 'tipo' ausente");
    }

    if (dados.tipo !== "REFEICAO" && dados.tipo !== "TRANSFERENCIA") {
        throw new Error("Tipo de operação não suportada");
    }

    if (dados.tipo === "REFEICAO" && !dados.valor) {
        throw new Error("QR Code de refeição deve conter o valor");
    }

    if (dados.tipo === "TRANSFERENCIA" && (!dados.toUserId || !dados.valor)) {
        throw new Error("QR Code de transferência deve conter destino e valor");
    }

    return dados;
}