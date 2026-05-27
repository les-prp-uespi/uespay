import type { Request, Response, NextFunction } from "express";

/**
 * Middleware de erro global.
 * Captura erros lançados em qualquer rota e retorna
 * uma resposta JSON padronizada.
 */
export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    console.error(`[ERRO] ${err.message}`);

    res.status(400).json({
        erro: err.message || "Erro interno do servidor"
    });
}
