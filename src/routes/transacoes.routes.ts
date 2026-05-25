import { Router } from "express";
import { getHistorico, pagarRefeicao, transferir } from "../services/transacao.service";
import { processarQRCode } from "../services/qrcode.service";

const router = Router();
//historico de transacoes
router.get("/:userId/historico", async (req, res) => {
    try {
        const historico = await getHistorico(req.params.userId);
        res.json({ historico });
    } catch (error: any) {
        res.status(400).json({ erro: error.message });
    }
});
//processamento do qr code
router.post("/processar-qrcode", async (req, res) => {
    try {
        const { qrCodeData, userId, senha } = req.body;
        
        if (!qrCodeData || !userId || !senha) {
            return res.status(400).json({ erro: "qrCodeData, userId e senha são obrigatórios" });
        }
        
        const dadosQR = await processarQRCode(qrCodeData);
        
        if (dadosQR.tipo === "REFEICAO") {
            const resultado = await pagarRefeicao(userId, dadosQR.valor, senha);
            res.json(resultado);
        } 
        else if (dadosQR.tipo === "TRANSFERENCIA") {
            const resultado = await transferir(userId, dadosQR.toUserId, dadosQR.valor, senha);
            res.json(resultado);
        }
        else {
            res.status(400).json({ erro: "Tipo de QR Code não suportado" });
        }
        
    } catch (error: any) {
        res.status(400).json({ erro: error.message });
    }
});

export default router;