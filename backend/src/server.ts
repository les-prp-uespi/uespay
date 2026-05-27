import express from "express";
import cors from "cors";
import "dotenv/config";
import saldoRoutes from "./routes/saldo.routes";
import transacoesRoutes from "./routes/transacoes.routes";
import usuariosRoutes from "./routes/usuarios.routes";
import { errorHandler } from "./middlewares/error.middleware";
import { inicializarTokenPool } from "./services/firefly.service";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/saldo", saldoRoutes);
app.use("/api/transacoes", transacoesRoutes);

// Middleware de erro global (deve ficar APÓS todas as rotas)
app.use(errorHandler);

app.listen(PORT, async () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    await inicializarTokenPool();
});