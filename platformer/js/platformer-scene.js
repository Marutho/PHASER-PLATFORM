import Player from "./player.js";
import MouseTileMarker from "./mouse-tile-maker.js";


var coins;
var score;
var scoreText;
var enemies;
var enemies2;

/**
 * A class that extends Phaser.Scene and wraps up the core logic for the platformer level.
 */
export default class PlatformerScene extends Phaser.Scene {

  preload() {
    this.load.spritesheet(
      "player",
      "../assets/spritesheets/0x72-industrial-player-32px-extruded.png",
      {
        frameWidth: 32,
        frameHeight: 32,
        margin: 1,
        spacing: 2
      }
    );
    this.load.image("spike", "../assets/images/spike.png");
    this.load.image("tiles", "../assets/tilesets/super.png");
    this.load.image("enemy", "../assets/images/enemy.png");
    this.load.image("coin", "../assets/images/coin.png");
    this.load.image("portal","../assets/images/portal.png");

    this.load.tilemapTiledJSON("map", "../assets/tilemaps/platformer2.json");
        
  }
   
  
  collectCoin (player, coin)
  { 
    coin.disableBody(true, true);
    //  Add and update the score
    score += Phaser.Math.Between(0, 20);
    scoreText.setText('Score: ' + score);
    var numCoins=1;
    coins.children.iterate(function (child) {
      child.enableBody(true, Phaser.Math.Between(0, this.groundLayer.width), 0, true, true);
});
  }


  create() {
    
    
    this.isPlayerDead = false;

    const map = this.make.tilemap({ key: "map" });
    const tiles = map.addTilesetImage("super", "tiles");

    map.createDynamicLayer("Background", tiles);
    this.groundLayer = map.createDynamicLayer("Ground", tiles);
    map.createDynamicLayer("Foreground", tiles);

    // Instantiate a player instance at the location of the "Spawn Point" object in the Tiled map
    const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
    this.player = new Player(this, spawnPoint.x, spawnPoint.y);

    // Collide the player against the ground layer - here we are grabbing the sprite property from
    // the player (since the Player class is not a Phaser.Sprite).
    this.groundLayer.setCollisionByProperty({ collides: true });
    this.physics.world.addCollider(this.player.sprite, this.groundLayer);

    //create the portal
    this.portalBlock = this.physics.add.staticGroup();
    const portal = this.portalBlock.create(70,400, 'portal');
    this.physics.add.collider(this.player, this.portalBlock);


    //this.physics.add.overlap(this.player, coins, collectCoin, null, this);
     

    // The map contains a row of spikes. The spike only take a small sliver of the tile graphic, so
    // if we let arcade physics treat the spikes as colliding, the player will collide while the
    // sprite is hovering over the spikes. We'll remove the spike tiles and turn them into sprites
    // so that we give them a more fitting hitbox.
    this.spikeGroup = this.physics.add.staticGroup();

    //Create coins
    //Some coins collect with random position
    coins = this.physics.add.group({
      key: 'coin',      
      setXY: { x: Phaser.Math.Between(0, this.groundLayer.width)
      }
    });

    coins.children.iterate(function (child) {
      //  Give each star a slightly different bounce
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
    this.physics.add.collider(coins, this.player);
    this.physics.add.collider(coins,this.spikeGroup);
    this.physics.add.collider(coins,this.groundLayer);  
    this.physics.add.collider(coins,this.portalBlock);   
    this.physics.add.overlap(this.player.sprite, coins, this.collectCoin, null, this);


    //a verr ESTO PA LOS ENEMIGOS OLE OLEEE YEA YEA EYEEEYEYEYA!
    enemies = this.physics.add.group({
        key: 'enemy',
        repeat: 11,
        setXY: { x: 50, y: 0, stepX: 200 }
    });    

    enemies.children.iterate(function (child) {
      //  Give each star a slightly different bounce
      child.setBounceY(1);
      enemies.setVelocity(0, 20);
      enemies.allowGravity = false;
    });
     //enemies.setCollideWorldBounds(true);

     this.physics.add.collider(enemies, this.groundLayer);
     this.physics.add.collider(enemies,this.spikeGroup);
     this.physics.add.collider(enemies,this.player);

      //ENEMIGOS HORIZONTALES SIIIUUUUIUIUIU! YEEE :p
      enemies2 = this.physics.add.group({
        key: 'enemy',
        repeat: 1,
        setXY: { x: 200, y: +500, stepX: 50, stepY:100},
        allowGravity : false,
        
      });    

    enemies2.children.iterate(function (child) {
      //  Give each star a slightly different bounce

      child.setBounceX(1);
      child.setBounceY(0.5);
      enemies2.setVelocity(200, 0);

    
      
    });
    //enemies.setCollideWorldBounds(true);

  

    this.physics.add.collider(enemies2, this.groundLayer);
    this.physics.add.collider(enemies2,this.spikeGroup);
    this.physics.add.collider(enemies2,this.player);

 

            
    this.groundLayer.forEachTile(tile => {
      if (tile.index === 888) {
        const spike = this.spikeGroup.create(tile.getCenterX(), tile.getCenterY(), "spike");

        // The map has spikes rotated in Tiled (z key), so parse out that angle to the correct body
        // placement
        spike.rotation = tile.rotation;
        if (spike.angle === 0) spike.body.setSize(34, 6).setOffset(0, 0);
        else if (spike.angle === -90) spike.body.setSize(34, 34).setOffset(0, 0);
        else if (spike.angle === 90) spike.body.setSize(34, 34).setOffset(0, 0);

        this.groundLayer.removeTileAt(tile.x, tile.y);
      }
    });

    this.cameras.main.startFollow(this.player.sprite);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    console.log(this.groundLayer.width);
    this.marker = new MouseTileMarker(this, map);

      score = 0;
      scoreText = this.add.text(this.groundLayer.width/4, 16, 'score: '+score, { fontSize: '32px', fill: '#000', backgroundColor: "#ffffff"}).setScrollFactor(0);
  //overlap
    //this.physics.add.overlap(this.player, this.coins, collectCoin, null, this);                                    
  };
  
  collectCoin (player, coin)
  { 
    coin.disableBody(true, true);
    //  Add and update the score
    score += Phaser.Math.Between(0, 20);
    scoreText.setText('Score: ' + score);
    var numCoins=1;
    coins.children.iterate(function (child) {
      child.enableBody(true, Phaser.Math.Between(0, 1360), 0, true, true);
});
  }


  update(time, delta) {
    
    if (this.isPlayerDead) return;
                  
    this.marker.update();
    this.player.update();

    // Add a colliding tile at the mouse position
    const pointer = this.input.activePointer;
    const worldPoint = pointer.positionToCamera(this.cameras.main);
    if (pointer.isDown) {

      if(this.groundLayer.getTileAtWorldXY(worldPoint.x, worldPoint.y) == null && this.player.boxNumber() >= 5){
        this.groundLayer.removeTileAtWorldXY(this.player.getLastBox().x, this.player.getLastBox().y);
        this.player.reduceBox();
      }

      if(this.groundLayer.getTileAtWorldXY(worldPoint.x, worldPoint.y) == null 
      && this.player.boxNumber()<5){
        this.player.increaseBox();
        const tile = this.groundLayer.putTileAtWorldXY(1004, worldPoint.x, worldPoint.y);
        tile.setCollision(true);
        this.player.lastBoxPosition(worldPoint.x, worldPoint.y);
        
      }
    }

    //Portal
    if(this.physics.world.overlap(this.player.sprite, this.portalBlock))
    {
      this.player.sprite.x=(Math.random() *this.groundLayer.width);
      this.player.sprite.y=(Math.random() *(this.groundLayer.height)/3);
    }
    
    //Win
    if(score>50)
    {
      alert("you win");
    }
   

    //nubes horizontales chocan
    





    if (
      this.player.sprite.y > this.groundLayer.height ||
      this.physics.world.overlap(this.player.sprite, this.spikeGroup) || this.physics.world.overlap(this.player.sprite, enemies)
      || this.physics.world.overlap(this.player.sprite, enemies2)
    ) {
      //reset box number
      this.player.resetBoxNumber();
      
      // Flag that the player is dead so that we can stop update from running in the future
      this.isPlayerDead = true;

      const cam = this.cameras.main;
      cam.shake(100, 0.05);
      cam.fade(250, 0, 0, 0);

      // Freeze the player to leave them on screen while fading but remove the marker immediately
      this.player.freeze();
      this.marker.destroy();

      cam.once("camerafadeoutcomplete", () => {
        this.player.destroy();
        this.scene.restart();
      });
    }
  }
}
