import { Router } from "express";
import type { Request, Response } from "express";

import {
    consultarSaldo,
    adicionarSaldo,
    debitarSaldo
} from "../services/saldo.service";

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
        const user = await adicionarSaldo(
            req.params.id,
            req.body.valor
        );

        res.json(user);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        res.status(400).json({ erro: message });
    }
});

router.post("/:id/pagamento", async (req: Request<{ id: string }>, res: Response) => {
    try {
        const user = await debitarSaldo(
            req.params.id,
            req.body.valor
        );

        res.json(user);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        res.status(400).json({ erro: message });
    }
});

export default router;