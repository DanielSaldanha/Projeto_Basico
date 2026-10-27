import OpenAI from 'openai';
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.error('Erro: defina OPENAI_API_KEY no arquivo .env.');
    process.exit(1);
}

const client = new OpenAI({ apiKey });

export default client