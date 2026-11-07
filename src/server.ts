import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import router from './routes/route';
import { connectRedis } from './configs/redis/redis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(router);

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'API rodando com TypeScript!' });
});

async function bootstrap() {
    try {
        await connectRedis();
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Falha ao iniciar o servidor:', error);
        process.exit(1);
    }
}

bootstrap();