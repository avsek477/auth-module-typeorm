import { PrimaryGeneratedColumn, Entity, Column, CreateDateColumn, UpdateDateColumn, VersionColumn, Unique, BeforeInsert } from "typeorm";
import { PasswordManager } from "../services/password";

@Entity()
@Unique(["id", "email"])
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column()
    email!: string;

    @Column({select: false})
    password!: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt:Date;

    @VersionColumn()
    version: number;

    @BeforeInsert()
    async hashPassword() {
        this.password = await PasswordManager.toHash(this.password);
    }

    async comparePassword(attempt: string) {
        return await PasswordManager.compare(this.password, attempt);
    }
}