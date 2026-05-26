import express from "express";
import cors from "cors";
import "dotenv/config";
import saldoRoutes from "./routes/saldo.routes";
import transacoesRoutes from "./routes/transacoes.routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/saldo", saldoRoutes);
app.use("/api/transacoes", transacoesRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});