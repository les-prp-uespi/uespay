import { Router } from "express";
import type { Request, Response } from "express";
import { getHistorico, pagarRefeicao, transferir } from "../services/transacao.service";
import { processarQRCode } from "../services/qrcode.service";

const router = Router();

router.get("/:userId/historico", (req: Request<{ userId: string }>, res: Response) => {
    try {
        const historico = getHistorico(req.params.userId);
        res.json({ historico });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        res.status(400).json({ erro: message });
    }
});

router.post("/processar-qrcode", async (req: Request, res: Response) => {
    try {
        const { qrCodeData, userId, senha } = req.body;

        if (!qrCodeData || !userId || !senha) {
            res.status(400).json({ erro: "qrCodeData, userId e senha são obrigatórios" });
            return;
        }

        const dadosQR = processarQRCode(qrCodeData);

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

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        res.status(400).json({ erro: message });
    }
});

export default router;