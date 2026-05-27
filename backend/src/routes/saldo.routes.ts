import { Router } from "express";
import type { Request, Response } from "express";
import { consultarSaldo, adicionarSaldo, debitarSaldo } from "../services/carteira.service";

const router = Router();

router.get("/:id/saldo", async (req: Request<{ id: string }>, res: Response) => {
    try {
        const saldo = await consultarSaldo(req.params.id);
        res.json({ saldo });
    } catch (error) {
        res.status(400).json({ erro: error instanceof Error ? error.message : String(error) });
    }
});

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