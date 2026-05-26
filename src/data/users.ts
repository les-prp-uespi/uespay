import type { User } from "../types";

export const users: User[] = [
    {
        id: "1",
        nome: "Maria",
        saldo: 50,
        senha: "123" // TODO: fazer hash antes de colocar em produção
    },
    {
        id: "2",
        nome: "Pedro",
        saldo: 30,
        senha: "1234" 
    }
];