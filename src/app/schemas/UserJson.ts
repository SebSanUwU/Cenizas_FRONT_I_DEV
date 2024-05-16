import { GameStats } from 'src/app/schemas/gameStats' 
import { FriendRequest } from './FriendRequest';

export interface UserJson {
    id : number;
    nickname : string;
    mail: string;
    game_stats: GameStats,
    friends : [string],
    rooms : [number],
    friendRequest:FriendRequest
}