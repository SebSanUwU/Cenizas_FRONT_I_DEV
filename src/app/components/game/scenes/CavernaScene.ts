import { ScoreBoard } from '../objects/scoreBoard';
import { DesertScene } from './DesertScene';

enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
};

export class CavernaScene extends DesertScene {
    protected override startx!: number;
    protected override starty: number = 191;
    protected pointsInitial!: number;

    constructor(key: string, socket: any, code: string) {
        super(key, socket, code);
    }

    override init(data: any) {
        this.socket.connect();
        this.code = data.code;
        this.cantidadVida = data.cantidadVida;
        this.heartsGroup = data.heartsGroup;
        this.pointsInitial = data.score;
        this.socket.emit('joinRoom', this.code);
        this.socket.off('initialCoordinates');
        this.socket.off('firstPlayer');
        this.socket.off('playerNumber');
        this.socket.off('goToCave');
        this.socket.off('goToDesert');

        this.socket.id = data.socketId;
        this.myNumber = data.myNumber;

        this.socket.on('connect', () => {
            if (this.socket.id) {
                this.playerId = this.socket.id;
                this.getTurn(this.myNumber); 
            } 
        });   
        
        this.socket.on('playerDisconnected', (playerId: string) => {
            const disconnectedPlayerSprite = this.otherSprites[playerId];
            if (disconnectedPlayerSprite) {
                disconnectedPlayerSprite.destroy(); 
                delete this.otherSprites[playerId]; 
            }
        });
    }

    override preload() {
        super.preload();
        this.load.tilemapTiledJSON('caverna', 'assets/backgrounds/caverna.json');
        this.load.image('caverna', 'assets/backgrounds/caverna.png');
        this.load.audio('cavernaMusic', 'assets/music/cavernaMusic.ogg');
        this.load.spritesheet("Skeleton", "assets/characters/Skeleton.png", {
            frameWidth: 64,
            frameHeight: 64
        });
    }

    override create() {
        let caverna;
        const music = this.sound.add('cavernaMusic', { loop: true });
        const { width, height } = this.sys.game.canvas;
        music.play();

        super.create_mapa(width, height + 380, 'caverna', 'caverna', 'caverna', ['Capa de patrones 1'],caverna);
        super.create_player(width, height + 380,this.startx, this.starty, 'player');
        super.createLifeBar(this.cantidadVida/this.golpePorCorazon);
        super.create_remote_players();
        this.scoreText = new ScoreBoard(this);
        this.scoreText.incrementScore(this.pointsInitial);
        this.createGameOver();
        this.cameras.main.setAlpha(0);

        this.tweens.add({
            targets: this.cameras.main,
            alpha: 1,
            duration: 2000,
            onComplete: () => {}
        });
    }

    protected override getTurn(myNumber: number) {
        switch (myNumber) {
            case 1:
                this.startx = 470.87098553608377;
                break;
            case 2:
                this.startx = 500.87098553608377;
                break;
            case 3:
                this.startx = 530.87098553608377;
                break;
            case 4:
                this.startx = 560.87098553608377;
                break;
            default:
                this.startx = 170; 
                break;
        }
    } 

}   