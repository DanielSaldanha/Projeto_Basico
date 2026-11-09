import redisClient from "../configs/redis/redis"

const CREDIT_TTL_SECONDS = 500;

export async function credit(user: string): Promise<number | null> {
    try {
        const key = `credits:${user}`;
        const amount = await redisClient.get(key);
        if (amount === null) {
            await redisClient.set(key, 1, { EX: CREDIT_TTL_SECONDS })
            return 1
        }
        else {
            const nowCredit = amount.trim();
            const newCredit = Number(nowCredit) + 1
            await redisClient.set(key, newCredit, { EX: CREDIT_TTL_SECONDS })
            return Number(newCredit);
        }
    } catch (err) { throw new Error("Erro ao tentar verificar credito " + err) }

}

export async function credit_withAtomicity(user: string): Promise<number> {
    try {
        const key = `credits:${user}`;
        // incr incrementa +1 atomicamente. Se a chave não existir, o Redis cria com valor 1.
        const currentUsage = await redisClient.incr(key);
        // Se acabou de ser criada (valor 1), define o tempo de expiração (TTL)
        if (currentUsage === 1) {
            await redisClient.expire(key, CREDIT_TTL_SECONDS);
        }
        return currentUsage;
    } catch (err) {
        throw new Error("Erro ao tentar atualizar crédito: " + err);
    }
}
// Função utilitária opcional para apenas consultar sem gastar crédito
export async function getCredit(user: string): Promise<number> {
    const key = `credits:${user}`;
    const amount = await redisClient.get(key);
    return amount ? Number(amount) : 0;
}