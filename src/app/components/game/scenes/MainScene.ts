import Phaser from 'phaser';
import { Socket } from 'socket.io-client';

export class MainScene extends Phaser.Scene {
    keys!: any;
    solidos!: any;
    protected code!: string;
    protected player!: Phaser.Physics.Matter.Sprite;
    protected isKnockedDown: boolean = false;
    protected isAttacking: boolean = false;
    protected lastDirection: string = "down";
    protected playerVelocity = new Phaser.Math.Vector2();
    protected startx!: number; 
    protected starty!: number;
    protected playerId!: string;
    protected myNumber!: number;
    protected socket!: Socket;
    protected otherSprites: { [playerId: string]: Phaser.Physics.Matter.Sprite } = {};
    protected barraVida!: Phaser.GameObjects.GameObject;
    mapa!: Phaser.Tilemaps.Tilemap;
    

    constructor(key: string, socket: any, code: string) {
        super({ key: key });
        this.socket = socket
        this.code = code;
    }

    init(data: any) {  
        this.socket.on('connect', () => {
            this.code = data.code;
            if (this.socket.id) {
                this.playerId = this.socket.id; 
                this.socket.on('initialCoordinates', ({ x, y }) => {
                    this.startx = x;    
                    this.starty = y;
                });
                
                this.socket.on('firstPlayer', (isFirstPlayer) => {
                    if (isFirstPlayer) {
                        this.enableStartButton();
                    }
                });

                this.socket.on('playerNumber', (myNumber, code) => {
                    this.myNumber = myNumber;
                    this.code = code;
                });

                this.socket.on('goToDesert', (data) => {
                    data.socketId = this.socket.id;
                    data.myNumber = this.myNumber;
                    data.code = this.code;
                    this.socket.off('updatePlayers');
                    this.tweens.add({
                        targets: this.cameras.main,
                        alpha: 0,
                        duration: 2000,
                        onComplete: () => {
                            this.scene.start('DesertScene',  data);
                            this.socket.disconnect()
                            this.scene.stop('MainScene');
                        }
                    });
                });

                this.socket.on('playerDisconnected', (playerId: string) => {
                    const disconnectedPlayerSprite = this.otherSprites[playerId];
                    if (disconnectedPlayerSprite) {
                        disconnectedPlayerSprite.destroy(); 
                        delete this.otherSprites[playerId]; 
                    }
                });
            } 
        });
    }

    preload() {
        this.load.spritesheet("player", "assets/characters/player.png", {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.tilemapTiledJSON('lobby', 'assets/backgrounds/mapa.json');
        this.load.image('space', 'assets/backgrounds/spaceShip.png');
        this.load.image('vida', 'assets/icons/barraVida.png');
        this.load.image('corazon', 'assets/icons/corazon.png');
        this.load.spritesheet("Llave" ,'assets/items/llave.png',{
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet("Herramienta" ,'assets/items/herramienta.png',{
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet("Metal" ,'assets/items/metal.png',{
            frameWidth: 32,
            frameHeight: 32
        });

    }

    create() {
        setTimeout(() => {
            const { width, height } = this.sys.game.canvas;
            let spaceShip;
            this.create_mapa(width, height, 'lobby', 'spaceShip', 'space', ['negro','subcapa','solidos'], spaceShip);
            this.create_animation();
            this.create_player(width, height, this.startx, this.starty, 'player');      
            this.create_remote_players();
        }, 1000);
    }

    protected create_mapa(width: number, height: number, key: string, tileImage: any, tileSet: any, layerNames: any, variableName: any) {
        // SonarCloud ignore start
        // @ts-ignore: La creación del mapa es necesaria de esta manera ya que la variable que se reasigna debe coincidir con el nombre del programa 'tilet'
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let mapa = this.make.tilemap({ key: key });
        variableName = mapa.addTilesetImage(tileImage, tileSet);
        // SonarCloud ignore end
        
        if (variableName !== null) {
            layerNames.forEach((layerName: string | number) => {
                const layer = mapa.createLayer(layerName, variableName);
                if (layer) {
                    layer.setCollisionByProperty({ pared: true });
                    this.matter.world.setBounds(0, 0, width, height);
                    this.matter.world.convertTilemapLayer(layer);
                }
            });
        } 
        this.mapa = mapa;
    }

    protected create_player(width: number, height: number, position_x: number, position_y: number, spray: string) {
        const newPositionX = position_x + Object.keys(this.otherSprites).length * 30;        
        this.player = this.matter.add.sprite(newPositionX, position_y, spray);
        this.player.setDisplaySize(70, 90);
        this.player.setRectangle(20, 35);
        this.player.setOrigin(0.5, 0.70);
        this.player.setFixedRotation();
        this.cameras.main.setBounds(0, 0, width, height);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.zoomTo(2.5);

        if (this.input?.keyboard) {
            this.keys = this.input.keyboard.addKeys({
                'up': Phaser.Input.Keyboard.KeyCodes.W,
                'down': Phaser.Input.Keyboard.KeyCodes.S,
                'left': Phaser.Input.Keyboard.KeyCodes.A,
                'right': Phaser.Input.Keyboard.KeyCodes.D,
                'space': Phaser.Input.Keyboard.KeyCodes.SPACE,
                's1': Phaser.Input.Keyboard.KeyCodes.ONE
            });
        }
    }

    protected create_remote_players() {
        this.socket.on('updatePlayers', (data) => {
            data.forEach((player: { id: string, posx: number, posy: number, velocityx: number, velocityy: number, animation: string, key: string }) => {
                if (player.id !== this.playerId) { 
                    const existingSprite = this.otherSprites[player.id]; 
                    if (existingSprite && existingSprite != this.player) {
                        existingSprite.setVelocity(player.velocityx, player.velocityy);
                    } else if(player.id != null){
                        const newSprite = this.matter.add.sprite(player.posx, player.posy, 'player');
                        newSprite.setDisplaySize(70, 90);
                        newSprite.setRectangle(20, 35);
                        newSprite.setOrigin(0.5, 0.70);
                        newSprite.setFixedRotation();
                        this.otherSprites[player.id] = newSprite;
                    }
                    this.validAnimations(player, existingSprite);
                }
            });

        },);
    }

    protected validAnimations(player: any, existingSprite: Phaser.Physics.Matter.Sprite) {
        if (existingSprite?.anims) {
            if (player.animation) {
                if(player.key === undefined || player.key === 'dead'){
                    existingSprite.setStatic(true)
                    existingSprite.anims.play('laying');
                    existingSprite.anims.stopAfterRepeat(0);
                    return;
                } else if (player.key === 'move_x' && player.velocityx < 0) {
                    existingSprite.setFlipX(true);
                    existingSprite.anims.play(player.animation, true);
                } else if(player.key === 'move_x' && player.velocityx > 0){
                    existingSprite.anims.play(player.animation, true);
                    existingSprite.setFlipX(false);
                } else{
                    existingSprite.anims.play(player.animation, true);
                }
            }
        }
    }
    
    protected create_animation() {
        this.anims.create({
            key: 'attack_down',
            frames: this.anims.generateFrameNumbers('player', { start: 36, end: 39 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'attack_right',
            frames: this.anims.generateFrameNumbers('player', { start: 42, end: 45 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'attack_left',
            frames: this.anims.generateFrameNumbers('player', { start: 42, end: 45 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'attack_up',
            frames: this.anims.generateFrameNumbers('player', { start: 48, end: 51 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'move_x',
            frames: this.anims.generateFrameNumbers('player', { start: 24, end: 29 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { start: 30, end: 35 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { start: 18, end: 23 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'stand_down',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'stand_up',
            frames: this.anims.generateFrameNumbers('player', { start: 12, end: 17 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'stand_left',
            frames: this.anims.generateFrameNumbers('player', { start: 6, end: 11 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'stand_right',
            frames: this.anims.generateFrameNumbers('player', { start: 6, end: 11 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'dead',
            frames: this.anims.generateFrameNumbers('player', { start: 54, end: 56 }),
            frameRate: 4,
            repeat: 0,
        });

        this.anims.create({
            key: 'laying',
            frames: this.anims.generateFrameNumbers('player', { start: 56, end: 56 }),
            frameRate: 4,
            repeat: 0
        })
    }

    override update() {  
        setTimeout(() => {
            if (this.keys?.up?.isUp && 
                this.keys?.down?.isUp && 
                this.keys?.left?.isUp && 
                this.keys?.right?.isUp && 
                this.keys?.space?.isUp && 
                !this.isKnockedDown) {
                this.player.anims.play('stand_' + this.lastDirection, true);
            }
           
    
            this.isAttacking = this.keys.space.isDown;
            if (this.player?.anims?.currentAnim) {
                if (this.player?.anims?.currentAnim.key == 'stand_' + this.lastDirection) {
                    // Intentionally empty
                }
            }
            this.movePlayer();
        }, 1000);
    
    }

    protected movePlayer() {
        if (!this.isKnockedDown) { //1
            if (this.isAttacking) { //2 
                this.playerVelocity.x = 0;
                this.playerVelocity.y = 0;
                this.player.anims.play('attack_' + this.lastDirection, true);
            }

            if (this.isAttacking) { //2
                this.playerVelocity.x = 0;
                this.playerVelocity.y = 0;
                this.player.anims.play('attack_' + this.lastDirection, true);
            } else { //1
                this.movePlayerInCascade();
            }
            if(this.player.anims.currentAnim?.key !== 'dead')  { //2
                this.playerVelocity.normalize();
                this.playerVelocity.scale(1.2);
                this.player.setVelocity(this.playerVelocity.x, this.playerVelocity.y);
            
                this.socket.emit('updatePlayers', {
                    posx: this.player.x, 
                    posy: this.player.y, 
                    velocityx: this.playerVelocity.x, 
                    velocityy: this.playerVelocity.y, 
                    animation: this.player.anims.currentAnim,
                    key: this.player.anims.currentAnim?.key,
                    code: this.code
                });
            }
        }
    }

    protected movePlayerInCascade() {
        if (this.keys.up.isDown) { // 1
            this.playerVelocity.y = -1;
            if (this.playerVelocity.x == 0) { //2
                this.player.anims.play('up', true);
            }
            this.lastDirection = "up";
        } else if (this.keys.down.isDown) { //1
            this.playerVelocity.y = 1;
            if (this.playerVelocity.x == 0) { //2
                this.player.anims.play('down', true);
            }
            this.lastDirection = "down";
        } else { //1
            this.playerVelocity.y = 0;
        }

        if (this.keys.left.isDown) { // 1
            this.player.setFlipX(true);
            this.playerVelocity.x = -1;
            this.player.anims.play('move_x', true);
            this.lastDirection = "left";
        } else if (this.keys.right.isDown) { //1 
            this.playerVelocity.x = 1;
            this.player.anims.play('move_x', true);
            this.player.setFlipX(false);
            this.lastDirection = "right";
        } else { // 1
            this.playerVelocity.x = 0;
        }
    }
    

    protected validCoordinates() {
        const validCoordinates: { x: number; y: number; }[] = [];
        const tiledMap = this.mapa; 
        
        if (tiledMap != null) {
            let solidLayer = tiledMap.getLayer('solidos')?.tilemapLayer;
            if (solidLayer) {
                solidLayer.forEachTile((tile: { index: number; pixelX: number; width: number; pixelY: number; height: number; }) => {
                    if (tile.index === -1) { 
                        validCoordinates.push({ x: tile.pixelX + tile.width / 2, y: tile.pixelY + tile.height / 2 });
                    }
                });
            }

            solidLayer = tiledMap.getLayer('suelo')?.tilemapLayer;
            if (solidLayer) {
                solidLayer.forEachTile((tile: { index: number; pixelX: number; width: number; pixelY: number; height: number; }) => {
                    if (tile.index === -1) { 
                        validCoordinates.push({ x: tile.pixelX + tile.width / 2, y: tile.pixelY + tile.height / 2 });
                    }
                });
            }
        }
    
        return validCoordinates;
    }

    private enableStartButton() {
        const canvas = this.sys.game.canvas;
        const rect = canvas.getBoundingClientRect();
        const canvasLeft = rect.left;
        const canvasTop = rect.top;
    
        const startButton = document.createElement('button');
        startButton.id = 'startButton'; 
        startButton.innerHTML = 'Todo listo?';
        startButton.style.position = 'absolute';
        startButton.style.left = (canvasLeft + canvas.width - startButton.offsetWidth - 220) + 'px';
        startButton.style.top = (canvasTop + canvas.height - startButton.offsetHeight -100) + 'px';
        startButton.style.zIndex = '1'; 
        startButton.style.padding = '20px 40px'; 
        startButton.style.backgroundColor = '#192841'; 
        startButton.style.color = '#FFFFFF'; 
        startButton.style.border = 'none'; 
        startButton.style.borderRadius = '5px'; 
        startButton.style.cursor = 'pointer';
        startButton.style.fontSize = '25px'; 
        startButton.style.fontFamily = 'minecraft';
        document.body.appendChild(startButton); 
    
        startButton.addEventListener('click', () => {
            this.socket.emit('goToDesert', {
                mapaActual: 'DesertScene',
                idOwner:this.socket.id,
            });
        });
    }
} 