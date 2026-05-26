import { Router } from "express";
import type { Request, Response } from "express";
import { consultarSaldo, adicionarSaldo, debitarSaldo } from "../services/carteira.service";

const router = Router();

router.get("/:id/saldo", (req: Request<{ id: string }>, res: Response) => {
    try {
        const saldo = consultarSaldo(req.params.id);
        res.json({ saldo });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        res.status(400).json({ erro: message });
    }
});

router.post("/:id/recarga", async (req: Request<{ id: string }>, res: Response) => {
    try {
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
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        res.status(400).json({ erro: message });
    }
});

router.post("/:id/pagamento", async (req: Request<{ id: string }>, res: Response) => {
    try {
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
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        res.status(400).json({ erro: message });
    }
});

export default router;