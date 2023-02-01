export enum GameType {
    Duel = 'duel',
    Championship = 'Championship',
    Other = 'other'
}

export interface Game {
    id?: number
    name: string
    type: GameType
}