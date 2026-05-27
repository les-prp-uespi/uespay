/**
 * Rotas de cadastro e listagem de usuários.
 *
 * GET  /api/usuarios      → Lista todos os usuários (sem expor senha)
 * GET  /api/usuarios/:id   → Busca um usuário por ID (sem expor senha)
 * POST /api/usuarios       → Cadastra um novo usuário
 */

import { Router } from "express";
import type { Request, Response } from "express";
import {
    listarUsuarios,
    buscarUsuarioPorId,
    buscarUsuarioPorEmail,
    adicionarUsuario
} from "../data/users";

const router = Router();

/**
 * Remove o campo `senha` antes de enviar ao cliente.
 * Evita expor dados sensíveis nas respostas da API.
 */
function sanitizarUsuario(user: { id: string; nome: string; email: string; senha: string }) {
    const { senha: _, ...usuarioSemSenha } = user;
    return usuarioSemSenha;
}

// ─── GET /api/usuarios ─────────────────────────────────────────

router.get("/", (_req: Request, res: Response) => {
    const usuarios = listarUsuarios().map(sanitizarUsuario);
    res.json({ usuarios, total: usuarios.length });
});

// ─── GET /api/usuarios/:id ─────────────────────────────────────

router.get("/:id", (req: Request<{ id: string }>, res: Response) => {
    const usuario = buscarUsuarioPorId(req.params.id);

    if (!usuario) {
        res.status(404).json({ erro: "Usuário não encontrado" });
        return;
    }

    res.json(sanitizarUsuario(usuario));
});

// ─── POST /api/usuarios ────────────────────────────────────────

router.post("/", (req: Request, res: Response) => {
    const { nome, email, senha } = req.body;

    // --- Validação de entrada ---

    if (!nome || typeof nome !== "string") {
        res.status(400).json({ erro: "Campo 'nome' é obrigatório e deve ser uma string" });
        return;
    }

    const nomeTrimmed = nome.trim();
    if (nomeTrimmed.length < 3 || nomeTrimmed.length > 100) {
        res.status(400).json({ erro: "Campo 'nome' deve ter entre 3 e 100 caracteres" });
        return;
    }

    if (!email || typeof email !== "string") {
        res.status(400).json({ erro: "Campo 'email' é obrigatório e deve ser uma string" });
        return;
    }

    // Validação simples de formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        res.status(400).json({ erro: "Campo 'email' deve ter um formato válido" });
        return;
    }

    // Verificar unicidade do e-mail
    if (buscarUsuarioPorEmail(email.trim())) {
        res.status(409).json({ erro: "Já existe um usuário cadastrado com este e-mail" });
        return;
    }

    if (!senha || typeof senha !== "string") {
        res.status(400).json({ erro: "Campo 'senha' é obrigatório e deve ser uma string" });
        return;
    }

    if (senha.length < 4) {
        // TODO(security): em produção, exigir mínimo de 8 caracteres e validação de força
        res.status(400).json({ erro: "Campo 'senha' deve ter no mínimo 4 caracteres" });
        return;
    }

    // --- Criação do usuário ---
    // TODO(security): senha armazenada em texto plano — usar bcrypt/argon2 em produção

    const novoUsuario = adicionarUsuario({
        nome: nomeTrimmed,
        email: email.trim().toLowerCase(),
        senha
    });

    res.status(201).json({
        mensagem: "Usuário cadastrado com sucesso!",
        usuario: sanitizarUsuario(novoUsuario)
    });
});

export default router;
