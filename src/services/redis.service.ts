import redisClient from "../configs/redis/redis"

export async function credit(user: string): Promise<number | null> {
    try {
        const amount = await redisClient.get(user);
        if (amount === null) {
            await redisClient.set(user + " credit", 1, { EX: 500 })
            return 1
        }
        else {
            const nowCredit = amount.trim();
            const newCredit = Number(nowCredit) + 1
            await redisClient.set(user + " credit", newCredit, { EX: 500 })
            return Number(nowCredit);
        }
    } catch (err) { throw new Error("Erro ao tentar verificar credito " + err) }

}