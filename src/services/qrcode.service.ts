export async function processarQRCode(dadosQR: string) {
    try {
        const dados = JSON.parse(dadosQR);
        
        if (!dados.tipo) {
            throw new Error("QR Code inválido");
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
    } catch (error) {
        throw new Error("Erro ao processar QR Code");
    }
}