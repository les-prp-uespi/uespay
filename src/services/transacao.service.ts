import { users } from "../data/users";
import { registrarTransacao } from "./firefly.service";

const transacoes: any[] = [];

export async function getHistorico(userId: string) {
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error("Usuário não encontrado");
    
    const historico = transacoes.filter(t => 
        t.fromUserId === userId || t.toUserId === userId
    );
    
    return historico;
}

export async function pagarRefeicao(userId: string, valor: number, senha: string) {
    const user = users.find(u => u.id === userId);
    
    if (!user) throw new Error("Usuário não encontrado");
    if (user.senha !== senha) throw new Error("Senha inválida");
    if (user.saldo < valor) throw new Error("Saldo insuficiente");
    
    user.saldo -= valor;
    
    const transacao = {
        id: Date.now().toString(),
        tipo: "REFEICAO",
        fromUserId: userId,
        valor: valor,
        data: new Date(),
        descricao: "Pagamento de refeição"
    };
    
    transacoes.push(transacao);
    await registrarTransacao(transacao);
    
    return { 
        mensagem: "Pagamento realizado com sucesso!", 
        saldoRestante: user.saldo 
    };
}

export async function transferir(fromUserId: string, toUserId: string, valor: number, senha: string) {
    const remetente = users.find(u => u.id === fromUserId);
    const destinatario = users.find(u => u.id === toUserId);
    
    if (!remetente) throw new Error("Remetente não encontrado");
    if (!destinatario) throw new Error("Destinatário não encontrado");
    if (remetente.senha !== senha) throw new Error("Senha inválida");
    if (remetente.saldo < valor) throw new Error("Saldo insuficiente");
    if (valor <= 0) throw new Error("Valor inválido");
    
    remetente.saldo -= valor;
    destinatario.saldo += valor;
    
    const transacao = {
        id: Date.now().toString(),
        tipo: "TRANSFERENCIA",
        fromUserId: fromUserId,
        toUserId: toUserId,
        valor: valor,
        data: new Date(),
        descricao: `Transferência para ${destinatario.nome}`
    };
    
    transacoes.push(transacao);
    await registrarTransacao(transacao);
    
    return { 
        mensagem: "Transferência realizada com sucesso!", 
        saldoRestante: remetente.saldo 
    };
}