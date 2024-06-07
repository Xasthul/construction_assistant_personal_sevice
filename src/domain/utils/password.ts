import * as bcrypt from 'bcryptjs';

export async function generatePasswordHash (password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
}

export async function comparPasswordWithHash (password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}
