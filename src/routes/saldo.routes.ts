import { Router } from "express";

import {
    consultarSaldo,
    adicionarSaldo,
    debitarSaldo
} from "../services/saldo.service";

const router = Router();

router.get("/:id/saldo", async (req, res) => {
    try {
        const saldo = await consultarSaldo(req.params.id);

        res.json({ saldo });
    } catch (error: any) {
        res.status(400).json({
            error: error.message
        });
    }
});

router.post("/:id/recarga", async (req, res) => {
    try {
        const user = await adicionarSaldo(
            req.params.id,
            req.body.valor
        );

        res.json(user);
    } catch (error: any) {
        res.status(400).json({
            error: error.message
        });
    }
});

router.post("/:id/pagamento", async (req, res) => {
    try {
        const user = await debitarSaldo(
            req.params.id,
            req.body.valor
        );

        res.json(user);
    } catch (error: any) {
        res.status(400).json({
            error: error.message
        });
    }
});

export default router;