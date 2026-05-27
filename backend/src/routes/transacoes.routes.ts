import { Router } from "express";
import type { Request, Response } from "express";
import { getHistorico, pagarRefeicao, transferir } from "../services/carteira.service";
import { processarQRCode } from "../services/qrcode.service";

const router = Router();

/**
 * @swagger
 * /api/transacoes/{userId}/historico:
 *   get:
 *     summary: Histórico de transações
 *     description: Retorna o histórico de transações de um usuário.
 *     tags: [Transações]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Histórico retornado com sucesso
 */
router.get("/:userId/historico", (req: Request<{ userId: string }>, res: Response) => {
    const historico = getHistorico(req.params.userId);
    res.json({ historico });
});

/**
 * @swagger
 * /api/transacoes/processar-qrcode:
 *   post:
 *     summary: Processa um QR Code
 *     description: Realiza o pagamento de uma refeição ou transferência lendo os dados de um QR Code.
 *     tags: [Transações]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrCodeData
 *               - userId
 *               - senha
 *             properties:
 *               qrCodeData:
 *                 type: string
 *                 description: Dados do QR Code em JSON stringificado
 *               userId:
 *                 type: string
 *                 description: ID do usuário que está realizando a transação
 *               senha:
 *                 type: string
 *                 description: Senha do usuário
 *     responses:
 *       200:
 *         description: Transação realizada com sucesso
 *       400:
 *         description: Erro de validação ou de processamento
 */
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