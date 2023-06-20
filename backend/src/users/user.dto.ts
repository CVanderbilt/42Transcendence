import { User } from "./user.interface";

export class UserDto {    
    id: string
    email: string
    login42: string
    username: string
    victories: number;
    defeats: number;
    achievements: string;
    createdAt: Date
    image: Uint8Array;
    isBanned: boolean;
    role: string;
    position: number;
    score: number;

    constructor(user: User) {
        this.id = user.id
        this.email = user.email
        this.login42 = user.login42
        this.username = user.username
        this.victories = user.victories;
        this.defeats = user.defeats;
        this.achievements = user.achievements;
        this.createdAt = user.createdAt
        this.image = user.image;
        this.isBanned = user.isBanned;
        this.role = user.role;
        this.position = user.position;
        this.score = user.score ?? 0;
    }
}