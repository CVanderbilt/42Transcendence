import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { GameType } from "./games.interface";

@Entity('game')
export class GameEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    type: GameType
}