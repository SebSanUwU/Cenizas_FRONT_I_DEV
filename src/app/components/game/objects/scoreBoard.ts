export class ScoreBoard {
    relatedScene: Phaser.Scene;
    score: number;
    scoreText!: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        this.relatedScene = scene;
        this.score = 0;
        this.create();
    }

    create() {
        this.relatedScene.add.rectangle(430, 410, 190, 25, 0x000000, 0.5).setOrigin(0).setScrollFactor(0);
        this.scoreText = this.relatedScene.add.text(440, 410, 'Puntuación: ', {
            fontSize: '18px',
            fontFamily: 'Verdana, Arial, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0);
    }

    incrementScore(points: number) {
        this.score += parseInt(points.toString());
        this.scoreText.setText('');
        this.scoreText.setText('Puntuación: ' + this.score);    
    }

    getScore(){
        return this.score;
    }
}