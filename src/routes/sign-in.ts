import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError } from '@tmavisek/common';
import { getRepository } from 'typeorm';
import { User } from '../entities/User';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post(
    '/api/users/sign-in',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must enter a password')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const userRepository = getRepository(User);
        const existingUser = await userRepository.createQueryBuilder("user")
            .where("user.email = :email")
            .addSelect("user.password")
            .setParameters({ email })
            .getOne();
        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }
        if (!await existingUser.comparePassword(password)) {
            throw new BadRequestError('Invalid credentials');
        }

        //Generate JWT
        const userJwt = jwt.sign({
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email
        }, process.env.JWT_KEY!);

        //Store it on session object
        req.session = {
            jwt: userJwt
        };

        delete existingUser.password;
        res.status(200).send(existingUser);
    }
);

export { router as signInRouter };