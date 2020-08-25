import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError } from '@tmavisek/common';
import { getRepository } from "typeorm";
import { User } from "../entities/User";
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post(
    '/api/users/sign-up',
    [
        body('name')
            .trim()
            .isLength({ min: 1, max: 50})
            .withMessage('Name must be valid'),
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .isLength({ min: 4, max: 20})
            .withMessage('Password must be between 4 and 20 characters')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { name, email, password } = req.body;
        const userRepository = getRepository(User);
        const existingUser = await userRepository.findOne({ email });

        if (existingUser) {
            throw new BadRequestError('Email in use.');
        }
        const user = new User();
        user.name = name;
        user.email = email;
        user.password = password;

        await userRepository.save(user);
        delete user.password;

        //Generate JWT
        const userJwt = jwt.sign({
            id: user.id,
            name: user.name,
            email: user.email
        }, process.env.JWT_KEY!);

        //Store it on session object
        req.session = {
            jwt: userJwt
        };

        res.status(201).send(user);
    }
)

export { router as signUpRouter };