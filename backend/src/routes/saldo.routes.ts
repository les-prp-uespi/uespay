import { Router } from "express";
import type { Request, Response } from "express";
import { consultarSaldo, adicionarSaldo, debitarSaldo } from "../services/carteira.service";

const router = Router();

/**
 * @swagger
 * /api/saldo/{id}/saldo:
 *   get:
 *     summary: Consulta o saldo
 *     description: Consulta o saldo da carteira do usuário.
 *     tags: [Saldo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Saldo consultado com sucesso
 *       400:
 *         description: Erro ao consultar o saldo
 */
router.get("/:id/saldo", async (req: Request<{ id: string }>, res: Response) => {
    try {
        const saldo = await consultarSaldo(req.params.id);
        res.json({ saldo });
    } catch (error) {
        res.status(400).json({ erro: error instanceof Error ? error.message : String(error) });
    }
});

/**
 * @swagger
 * /api/saldo/{id}/recarga:
 *   post:
 *     summary: Adiciona saldo
 *     description: Recarrega o saldo da carteira do usuário.
 *     tags: [Saldo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - valor
 *             properties:
 *               valor:
 *                 type: number
 *     responses:
 *       200:
 *         description: Saldo adicionado com sucesso
 *       400:
 *         description: Erro de validação ou processamento
 */
router.post("/:id/recarga", async (req: Request<{ id: string }>, res: Response) => {
    const { valor } = req.body;

    if (valor === undefined || valor === null) {
        res.status(400).json({ erro: "Campo 'valor' é obrigatório" });
        return;
    }

    if (typeof valor !== "number" || isNaN(valor)) {
        res.status(400).json({ erro: "Campo 'valor' deve ser um número válido" });
        return;
    }

    const resultado = await adicionarSaldo(req.params.id, valor);
    res.json(resultado);
});

/**
 * @swagger
 * /api/saldo/{id}/pagamento:
 *   post:
 *     summary: Debita saldo
 *     description: Realiza um pagamento debitando o saldo da carteira do usuário.
 *     tags: [Saldo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - valor
 *             properties:
 *               valor:
 *                 type: number
 *     responses:
 *       200:
 *         description: Pagamento realizado com sucesso
 *       400:
 *         description: Erro de validação ou processamento
 */
router.post("/:id/pagamento", async (req: Request<{ id: string }>, res: Response) => {
    const { valor } = req.body;

    if (valor === undefined || valor === null) {
        res.status(400).json({ erro: "Campo 'valor' é obrigatório" });
        return;
    }

    if (typeof valor !== "number" || isNaN(valor)) {
        res.status(400).json({ erro: "Campo 'valor' deve ser um número válido" });
        return;
    }

    const resultado = await debitarSaldo(req.params.id, valor);
    res.json(resultado);
});

export default router;