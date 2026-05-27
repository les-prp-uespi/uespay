/**
 * Seed Script — Simulação de Usuários e Carteiras UesPay
 *
 * Popula o sistema com dados iniciais e exibe um relatório
 * de todos os usuários e seus saldos no console.
 *
 * Uso: npm run seed
 */

import "dotenv/config";
import { resetarUsuarios, listarUsuarios } from "../data/users";
import { consultarSaldo } from "../services/carteira.service";
import { consultarSaldoRUBlockchain } from "../services/firefly.service";

// ─── Constantes de formatação ──────────────────────────────────

const SEPARADOR = "═".repeat(62);
const LINHA = "─".repeat(62);

function formatarMoeda(valor: number): string {
    return `R$ ${valor.toFixed(2).padStart(7)}`;
}

// ─── Execução ──────────────────────────────────────────────────

async function executarSeed(): Promise<void> {
    console.log();
    console.log(SEPARADOR);
    console.log("  🎓  UesPay — Seed de Usuários e Carteiras");
    console.log(SEPARADOR);
    console.log();

    // 1. Resetar dados para o estado inicial
    resetarUsuarios();
    const usuarios = listarUsuarios();

    console.log(`  ✅ ${usuarios.length} usuários carregados com sucesso!`);
    console.log();

    // 2. Exibir relatório
    console.log(LINHA);
    console.log(
        "  ID".padEnd(6) +
        "Nome".padEnd(30) +
        "Saldo".padStart(12) +
        "  E-mail"
    );
    console.log(LINHA);

    let saldoTotal = 0;
    let semSaldo = 0;

    for (const user of usuarios) {
        let saldo = 0;
        try {
            saldo = await consultarSaldo(user.id);
        } catch (e) {
            // Ignora erro caso FireFly esteja offline
        }

        if (saldo === 0) semSaldo++;
        saldoTotal += saldo;
        
        console.log(
            `  ${user.id.padEnd(4)}` +
            `${user.nome.padEnd(30)}` +
            `${formatarMoeda(saldo)}` +
            `  ${user.email}`
        );
    }

    console.log(LINHA);
    console.log(`  ${"TOTAL".padEnd(34)}${formatarMoeda(saldoTotal)}`);
    console.log(LINHA);
    
    let saldoRU = 0;
    try {
        saldoRU = await consultarSaldoRUBlockchain();
    } catch(e) {}

    console.log();
    console.log("  🏢 Entidades (Recebimentos):");
    console.log(`     • Restaurante Universitário: ${formatarMoeda(saldoRU)}`);
    console.log();
    console.log("  📋 Resumo:");
    console.log(`     • Alunos:    ${usuarios.filter(u => u.email.includes("@aluno")).length}`);
    console.log(`     • Outros:    ${usuarios.filter(u => !u.email.includes("@aluno")).length}`);
    console.log(`     • Sem saldo: ${semSaldo}`);
    console.log();
    console.log("  🚀 Pronto para demonstração!");
    console.log(SEPARADOR);
    console.log();
}

executarSeed().catch(console.error);
