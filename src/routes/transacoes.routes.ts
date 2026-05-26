import { Router } from "express";
import type { Request, Response } from "express";
import { getHistorico, pagarRefeicao, transferir } from "../services/carteira.service";
import { processarQRCode } from "../services/qrcode.service";

const router = Router();

router.get("/:userId/historico", (req: Request<{ userId: string }>, res: Response) => {
    const historico = getHistorico(req.params.userId);
    res.json({ historico });
});

router.post("/processar-qrcode", async (req: Request, res: Response) => {
    const { qrCodeData, userId, senha } = req.body;

    if (!qrCodeData || !userId || !senha) {
        res.status(400).json({ erro: "qrCodeData, userId e senha são obrigatórios" });
        return;
    }

    if (typeof qrCodeData !== "string") {
        res.status(400).json({ erro: "qrCodeData deve ser uma string JSON" });
        return;
    }

    if (typeof userId !== "string" || typeof senha !== "string") {
        res.status(400).json({ erro: "userId e senha devem ser strings" });
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
});

export default router;