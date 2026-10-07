import express, {Request, Response} from "express";

const app = express();
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor ativo na porta ${PORT}`);
});

app.get("/", (req: Request, res: Response) => {
    res.send("Hello world!");
});



app.use(express.json());