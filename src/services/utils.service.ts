export async function comRetry<T>(
    operacao: () => Promise<T>,
    maxTentativas = 3
): Promise<T> {
    for (let tentativa = 0; ; tentativa++) {
        try {
            return await operacao();
        } catch (erro) {
            if (tentativa >= maxTentativas - 1) {
                throw erro;
            }

            const espera = 1000 * 2 ** tentativa;
            await new Promise(resolve => setTimeout(resolve, espera));
        }
    }
}