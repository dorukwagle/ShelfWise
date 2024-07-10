import { hash, compare } from 'bcryptjs';

const hashPassword = async (plainTextPassword: string) => await hash(plainTextPassword, 10);
const comparePassword = async (plainTextPassword: string, hash: string) => await compare(plainTextPassword, hash);

export { hashPassword, comparePassword };