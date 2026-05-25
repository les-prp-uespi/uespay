import express from "express";
import "dotenv/config";
import saldoRoutes from "./routes/saldo.routes";
import transacoesRoutes from "./routes/transacoes.routes";


const app = express();

app.use(express.json());

app.use("/api/saldo", saldoRoutes);

app.use("/api/transacoes", transacoesRoutes);

app.listen(3000, () => {
    console.log(`Servidor rodando na porta 3000`);
});