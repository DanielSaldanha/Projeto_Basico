import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
    url: redisUrl,
});

redisClient.on('error', (err) => {
    console.error('❌ Erro no cliente Redis:', err);
});

redisClient.on('connect', () => {
    console.log('🔌 Conectando ao Redis...');
});

redisClient.on('ready', () => {
    console.log('✅ Redis conectado com sucesso!');
});

export async function connectRedis(): Promise<void> {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
}

export async function disconnectRedis(): Promise<void> {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
}

export default redisClient;
