import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;

export async function generateToken(userId: string, email: string): Promise<string | null> {
    const token = jwt.sign(
        { userId: userId, email: email }, // dados que ficam no token (NÃO coloque senha!)
        SECRET,
        { expiresIn: "1h" } // expiração
    );
    return token
}

export async function verifyToken(token: string): Promise<string> {
    try {
        const decoded = jwt.verify(token, SECRET) as jwt.JwtPayload;// o "as jwt.JwtPayload" faz o "decoded" conseguir ter userId e email
        return decoded.email
    } catch (err) {
        throw new Error("Erro ao tentar verificar token" + err)
    }
}
