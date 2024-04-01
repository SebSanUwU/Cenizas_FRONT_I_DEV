import { gameStats } from 'src/app/schemas/gameStats' 

export interface UserJson {
    id : number;
    nickname : string;
    mail: string;
    game_stats: gameStats,
    friends : [string],
    rooms : [number]
}