import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res)
{
  if (req.method === 'POST') {
        const { email, password } = req.body;
        const user= await prisma.user.findUnique({
            where: { email },
        });

        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });
            res.status(200).json({ token });
            
        }   else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } 
    else {
        res.status(405).json({ message: 'Method not allowed' });

    }

}