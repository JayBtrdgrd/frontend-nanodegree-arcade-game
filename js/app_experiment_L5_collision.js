// Class for barrier objects, like rocks and buoys.
var Barrier = function(startingX, startingY, width, height, level, image) {
    this.left = startingX;
    this.top = startingY;
    this.right = startingX + width;
    this.bottom = startingY + height;
    this.width = width;
    this.height = height;
    this.level = level;
    this.sprite = image;
    this.climbed = false;
};

//Class for gems and other things to be collected
var Item = function(startingX, startingY, width, height, points, lives, level, image, messageOne, messageTwo, messageThree, messageFour, messageFive, messageSix) {
    this.left = startingX;
    this.top = startingY;
    this.right = startingX + width;
    this.bottom = startingY + height;
    this.width = width;
    this.height = height;
    this.points = points;
    this.lives = lives;
    this.level = level;
    this.sprite = image;
    this.originalX = startingX;
    this.originalY = startingY;
    this.collected = false;
    this.goingRight = true;
    this.count = 0;
    this.basePoints = points;
    this.baseLives = lives;
    this.up = true;
    this.messageLineOne = messageOne;
    this.messageLineTwo = messageTwo;
    this.messageLineThree = messageThree;
    this.messageLineFour = messageFour;
    this.messageLineFive = messageFive;
    this.messageLineSix = messageSix;
    this.finishedShowingReward = false;
};

// This is a method for specifying movements for certain items like the bobbing bottle and hearts.
Item.prototype.update = function(dt) {
    if (this.sprite == 'images/message-in-bottle-03.png') {
        // The bottle continues going upward
        if ((this.up === true) && (this.top > (this.originalY - 6))) {
            this.top -= 10 * dt;
        }
        // The bottle starts going down
        else if (this.top <= (this.originalY - 6)) {
            this.top += 10 * dt;
            this.up = false;
        }
        // The bottle continues going down
        else if ((this.up === false) && (this.top > (this.originalY - 6)) && (this.top < this.originalY)) {
            this.top += 10 * dt; //keep going down
        }
        // The bottles starts going up
        else if (this.top >= this.originalY) {
            this.top -= 10 * dt;
            this.up = true;
        }

    }
    // Specifies movement of celebratory mini hearts that show up during Game Completed scene.
    else if (this.sprite === 'images/mini-heart.png') {
        if ((this.goingRight === true) && (this.left < (this.originalX + 60)) && (this.top > -1)) {
            // The mini heart keeps going right
            this.left += 4;
            // The mini heart keeps going up
            this.top -= 400 * dt;
        }
        // The mini heart begins going left while continuing its upward movement
        else if ((this.left == (this.originalX + 60)) && (this.top >= 20)) {
            this.left -= 4;
            this.goingRight = false;
            this.top -= 400 * dt;
        }
        // The mini heart continues going left and up
        else if ((this.goingRight === false) && (this.left > (this.originalX - 60)) && (this.top > -1)) {
            this.left -= 4;
            this.top -= 400 * dt;
        }
        // The mini heart begins going to the right, while continuing to go up.
        else if ((this.left == this.originalX - 60) && (this.top > -1)) {
            this.left += 4;
            this.goingRight = true;
            this.top -= 400 * dt;
        }
        else {
            this.top = Math.random() * 550 - Math.random() * 50;
        }
    }
    // These mini hearts move in the same way as the mini hearts above, but in the opposite direction while going up the canvas.
    else if (this.sprite === 'images/mini-heart-02.png') {
        if ((this.goingRight === true) && (this.left > (this.originalX - 60)) && (this.top > -1)) {
            this.left -= 4;
            this.top -= 400 * dt;
        } else if ((this.left == (this.originalX - 60)) && (this.top >= 20)) {
            this.left += 4;
            this.goingRight = false;
            this.top -= 400 * dt;// going up
        } else if ((this.goingRight === false) && (this.left < (this.originalX + 60)) && (this.top > -1)) {
            this.left += 4; //keep going right
            this.top -= 400 * dt;// going up
        } else if ((this.left == this.originalX + 60) && (this.top > -1)) {
            this.left -= 4; //start going left
            this.goingRight = true; //set to true after finishing going right
            this.top -= 400 * dt;// going up
        } else {
            this.top = Math.random() * 550 - Math.random() * 50;
        }
    }
    // The following defines the beating movement of the life-giving heart objects.
    else if ((this.sprite === 'images/Heart-smaller.png') && (this.count <= 70 * dt) && (this.count >= 0)) {
                this.sprite = 'images/Heart-even-smaller-02.png';
    } else if (this.sprite === 'images/Heart-even-smaller-02.png') {
        this.sprite = 'images/Heart-smaller.png';
    }
};

Item.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.left, this.top);
};

// Enemies player must avoid. Include switch property to be used for shark fins going back and forth on Level 4.
// changeDirection property will be used on Level 6 by seagull enemies to specify when to fly up instead of down.
var Enemy = function(x, y, width, height, speed, xChangeDirection) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.sprite = 'images/enemy-bug-cropped.png';
    this.level = 1;
    this.switch = 'back';
    this.changeDirection = xChangeDirection;
    this.originalY = y;
    this.originalSpeed = speed;
    this.collided = false;
};

// This method updates each enemy's position
// Parameter dt is a time delta between animation frames.
Enemy.prototype.update = function(dt) {
    // Most movements are multiplied by the dt parameter
    // to ensure that the game runs at the same speed for
    // all computers.

    // The following conditions define the movements of the sharks (shark fin images) on Level 4.
    // They are programmed to go back and forth horizontally on the canvas, instead of only
    // moving rightwards, like the ladybug and under-the-sea shark (Level 5) enemies do.
    if ((player.level == 4) && (this.x >= 470) && (this.switch === 'back')) {
        this.x -= this.speed * dt * 4; // shark fin starting to go left
        this.switch = 'forth'; // resets switch property to be ready to go right when limit reached.
        this.sprite = 'images/shark-fin-going-back.png';
    } else if ((player.level == 4) && (this.x < 470) && (Math.floor(this.x) >= 0) && (this.switch === 'forth')) {
        this.x -= this.speed * dt * 4; // shark fin continues to go left.
        this.sprite = 'images/shark-fin-going-back.png';
    } else if ((player.level == 4) && (this.x <= 1)) {
        this.x += this.speed * dt * 4; //shark fin moves right until reaches far right-side of canvas.
        this.switch = 'back';
        this.sprite = 'images/shark-fin.png';
    }
    // The following conditions define the movement of the seagull enemies on Level 6. A seagull enemy
    // will fly downwards towards the right of the canvas until it reaches the x-coordinate defined by
    // changeDirection. From there, the seagull will switch to flying upwards, while still moving
    // towards the right-side of the canvas.

    else if ((player.level == 6) && (this.x <= this.changeDirection) && (this.y > 0) && (this.x > 1)) {
        this.x += this.speed * dt * 2;
        this.y += 0.7;
        this.sprite = 'images/seagull-facing-right.png';
        //this.switch = 'back';
    } else if ((player.level == 6) && (this.x > this.changeDirection) && (this.x < 400) && (this.y > 0)) {
        this.x += this.speed * dt * 2;
        this.y -= 0.7;
    }
    // This condition resets the enemy movement once it hits the far right-side of canvas. At this point
    // all objects (including barriers and collectables) will have their climbed property reset to false.
    // This ensures that the enemies climb over the barrier or item in its path after each enemy reset.
    else if (this.x >= 470) {
       for (var i = 0; i < allObjects.length; i++) {
            if ((this.y > allObjects[i].top) && (this.y < allObjects[i].bottom) && (this.level == allObjects[i].level)) {
                allObjects[i].climbed = false;
            }
        }
        this.reset();
    } else {
        this.checkForBarriersOrItems(allObjects, dt);
    }
};

// Method for defining movement when enemy encounters a barrier or collectable item
Enemy.prototype.checkForBarriersOrItems = function(objectsList, dt) {
    for (var i = 0; i < objectsList.length; i++) {
        if ((this.level == objectsList[i].level) && (objectsList[i].climbed !== true)) {
            if (((this.x + (this.width / 1.25)) >= objectsList[i].left) && ((this.x + (this.width / 1.25)) < (objectsList[i].left + (objectsList[i].width / 2))) && (objectsList[i].collected !== true) && (this.y < (objectsList[i].bottom - 20)) && (this.y > (objectsList[i].top - 35))) {
                this.y -= 1;
                this.x += (this.speed * 0.05) * dt;
            } else if (((this.x + (this.width / 2)) > (objectsList[i].left + (objectsList[i].width / 1.25))) && (objectsList[i].collected !== true) && (this.y < objectsList[i].bottom) && (this.y > (objectsList[i].top - 30)) && (this.y < this.originalY)) {
                this.y += 1;
                this.x += (this.speed  * 0.05) * dt;
            } else if (this.y < this.originalY) {
                this.x += (this.speed * 0.05) * dt;
            } else if ((this.y == this.originalY) && (this.x > objectsList[i].right) && (this.y > objectsList[i].top) && (this.y < objectsList[i].bottom) && (this.level == objectsList[i].level)) {
                objectsList[i].climbed = true;
            }
        } else {
            this.x += this.speed * dt * 0.2;
        }
    }
};

// Reset method for enemy after reaching right-side of canvas
Enemy.prototype.reset = function() {
    if ((player.level == 4) && (this.x > 250)) {
        this.x = Math.random() * 20 + 400;
    } else if (player.level == 6) {
        this.y = Math.random() * 400;
        this.x = Math.random() * -300;
    } else {
        this.x = Math.random() * -75;
        this.y = this.originalY;
    }
};

// Draws the enemy on the screen
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Characters shown on Level 5. They are being held prisoner by Evil Octopus.
var SadCharacter = function(x, y, image) {
    this.x = x;
    this.y = y;
    this.originalY = y;
    this.sprite = image;
    this.up = true;
};

// This method defines the movement of the sad characters on Level 5.
// This movement is supposed to simulate bobbing underwater.
SadCharacter.prototype.update = function(dt) {
    if ((this.up === true) && (this.y > (this.originalY - 5))) {
        this.y -= 5 * dt; // Keep going up
    } else if (this.y <= (this.originalY - 5)) {
        this.y += 5 * dt; // Start going down
        this.up = false;
    } else if ((this.up === false) && (this.y > (this.originalY - 5)) && (this.y < this.originalY)) {
        this.y += 5 * dt; // Keep going down
    } else if (this.y >= this.originalY) {
        this.y -= 5 * dt; //Start going up
        this.up = true; //Set to true after finishing downward movement
    }
};

SadCharacter.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Same characters as those shown in Level 5, but now with a happy expression since
// the player has freed them from Evil Octopus' imprisonment. I could also combine
// the Happy and Sad characters into one class object with shared methods
// and just switch up the images depending on where in the game the player is (like
// what I did with the enemy objects).
var HappyCharacter = function(x, y, image) {
    this.x = x;
    this.y = y;
    this.originalY = y;
    this.sprite = image;
    this.up = true;
};

// The freed characters express their gratitude and excitement by jumping up and down.
HappyCharacter.prototype.update = function(dt) {
    if ((this.up === true) && (this.y > (this.originalY - 34))) {
        this.y -= 2; // Keep going up
    } else if (this.y == (this.originalY - 34)) {
        this.y += 2; // Start going down
        this.up = false;
    } else if ((this.up === false) && (this.y > (this.originalY - 34)) && (this.y < this.originalY)) {
        this.y += 2; // Keep going down
    } else if (this.y == this.originalY) {
        this.y -= 2; // Start going up
        this.up = true; // Set to true after finishing downward movement
    }
};

// Happy characters are rendered with separate shadow images (which will remain static as characters jump and down)
HappyCharacter.prototype.render = function() {
    ctx.globalAlpha = 0.5;
    ctx.drawImage(Resources.get('images/round-shadow-02.png'), this.x + 30, this.originalY + 130);
    ctx.globalAlpha = 1;
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Bubbles that come from the player while underwater on Level 5
var Bubble = function(x, y, speed) {
    this.x = x;
    this.y = y;
    this.originalX = x;
    this.originalY = y;
    this.speed = speed;
    this.notYetSetToPlayer = true;
};

// Returns a random number between min (inclusive) and max (exclusive)
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

// Defines where bubbles are placed in relation to player and how they move.
Bubble.prototype.update = function(dt) {
    // First, place bubbles based on where player is while he/she is falling to the ocean floor (so only y needs to be set).
    if (this.notYetSetToPlayer === true) {
        this.y = player.y + getRandomArbitrary(-10, this.originalY);
        // This step does not have to happen again, now that player has finished falling for the 'intro' to level 5,
        // so notYetSetToPlayer should be set to false.
        this.notYetSetToPlayer = false;
    }
    // When bubbles reach top of canvas, reset them to wherever the player is
    if ((this.y <= -400) && (player.y > 300)) {
        this.y = player.y + getRandomArbitrary(-10, this.originalY);
        this.x = player.x + this.originalX;
    }
    // This lengthens the window between bubbles originating from player and resetting.
    // Takes into consideration that height between player and top of canvas is smaller
    // as player moves up.
    if ((this.y <= -200) && (player.y <= 300)) {
        this.y = player.y + getRandomArbitrary(-10, this.originalY);
        this.x = player.x + this.originalX;
    }
    this.y -= this.speed * dt;
};

Bubble.prototype.render = function() {
    ctx.drawImage(Resources.get('images/bubble-07.png'), this.x, this.y);
};

// Player class
var Player = function(x, y) {
    this.x = x;
    this.y = y;
    this.sprite = 'images/char-boy-cropped.png';
    this.level = 1;
    this.score = 0;
    this.lives = 3;
    this.referenceY = y;
    this.finishedGame = false; // Set to true when game complete
    this.collided = false;
    this.up = true;
    this.gameOver = false; // Set to true when all lives lost
    this.notYetOnOceanFloor = false;
    this.goingUp = false;
    this.bounceYet = false;
    this.smallBouncesFromHere = false;
    this.dismissed = false;
};

Player.prototype.render = function() {
    if (player.collided !== true) {
        if (player.level == 5) {
            // Player rendered without shadow for underwater scene
            ctx.drawImage(Resources.get('images/char-boy-cropped-no-shadow.png'), this.x, this.y);
        } else {
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        }
    }
    // If player collides with enemy, show sad-faced version of player
    else {
        ctx.drawImage(Resources.get('images/char-boy-cropped-sad-04.png'), player.x - 8, player.y - 9);
    }
};

Player.prototype.checkCollisions = function(enemiesList) {
    // The only case when player is 'invincible' is during the falling intro
    // during Level 5, 'Underwater'. For the rest of the cases, check if
    // player has made contact with an enemy object.
    if (this.notYetOnOceanFloor !== true) {
        for (var i = 0; i < enemiesList.length; i++) {
            var playerTop = this.y;
            var playerBottom = this.y + 72;
            var playerRight = this.x + 65;
            var playerLeft = this.x;
            if (player.level == 5) {
                var sharkBodyTop = enemiesList[i].y + 37;
                var sharkBodyBottom = enemiesList[i].y + 83;
                var sharkBodyLeft = enemiesList[i].x;
                var sharkBodyRight = enemiesList[i].x + 147;
                var sharkFinTop = enemiesList[i].y;
                var sharkFinBottom = enemiesList[i].y + 32;
                var sharkFinLeft = enemiesList[i].x + 66;
                var sharkFinRight = enemiesList[i].x + 68;
                if (((playerTop <= sharkBodyBottom) && (playerBottom >= sharkBodyTop) && (playerLeft <= sharkBodyRight) && (playerRight >= sharkBodyLeft)) ||
                    ((playerTop <= sharkFinBottom) && (playerBottom >= sharkFinTop) && (playerLeft <= sharkFinRight) && (playerRight >= sharkFinLeft))) {
                    player.finishedGame = false;
                    // This condition ensures that lives property is only decremented once
                    if (this.collided === false) {
                        this.lives--;
                        this.collided = true;
                        enemiesList[i].collided = true;
                    }
                    resetAfterCollision();
                    return true;
                }
            } else {
                var enemyTop = enemiesList[i].y;
                var enemyBottom = enemiesList[i].y + 65;
                var enemyRight = enemiesList[i].x + 80;
                var enemyLeft = enemiesList[i].x + 15;
                if ((playerTop <= enemyBottom) && (playerBottom >= enemyTop) && (playerLeft <= enemyRight) && (playerRight >= enemyLeft)) {
                    player.finishedGame = false;
                    // This condition ensures that lives property is only decremented once
                    if (this.collided === false) {
                        this.lives--;
                        this.collided = true;
                        enemiesList[i].collided = true;
                    }
                    resetAfterCollision();
                    return true;
                }
            }
        }
    }
};

// Delay player.reset() and key property resets so that player, with or without the key, will be shown colliding with the enemy.
// If the delay is not included, the player resets too quickly; this allows a brief transition to occur. (Sad-faced version
// of player shown, with or without key.)
function resetAfterCollision() {
    setTimeout(function() {
        player.reset();
        key.collected = false;
        key.left = key.originalX;
        key.top = key.originalY;
    }, 300);
}

// Method checks for player contact with items
Player.prototype.checkItem = function(itemList) {
    for (var i = 0; i < itemList.length; i++) {
    var playerTop = this.y;
    var playerBottom = this.y;
    var playerRight = this.x;
    var playerLeft = this.x;
        if (player.level == itemList[i].level) {
            if (((playerTop <= itemList[i].bottom) && (playerBottom >= itemList[i].top)) && ((playerLeft <= itemList[i].right) && (playerRight >= itemList[i].left))) {
                itemList[i].collected = true;
                this.score += itemList[i].points;
                this.lives += itemList[i].lives;
                itemList[i].points = 0;
                itemList[i].lives = 0;
                return true;
            }
        }
    }
};

// This method checks for barrier objects in north, south, east, and west directions that are next to the player
// and returns an array that specifies which directions are blocked.
Player.prototype.checkBarrier = function(barrierList) {
    var playerTop = this.y;
    var playerBottom = this.y + 72;
    var playerRight = this.x + 67;
    var playerLeft = this.x;
    var blockedDirections = [];
    for (var i = 0; i < barrierList.length; i++) {

        if (this.level == barrierList[i].level) {
            if (((playerTop - 83) < barrierList[i].bottom) && ((playerBottom - 83) > barrierList[i].top) && (playerLeft < barrierList[i].right) && (playerRight > barrierList[i].left)) {
                blockedDirections.push('cannot go up');
            } else if (((playerTop + 83) < barrierList[i].bottom) && ((playerBottom + 83) > barrierList[i].top) && (playerLeft < barrierList[i].right) && (playerRight > barrierList[i].left)) {
                blockedDirections.push('cannot go down');
            } else if ((playerTop < barrierList[i].bottom) && (playerBottom > barrierList[i].top) && ((playerLeft - 50.5) < barrierList[i].right) && ((playerRight - 50.5) > barrierList[i].left)) {
                blockedDirections.push('cannot go left');
            } else if ((playerTop < barrierList[i].bottom) && (playerBottom > barrierList[i].top) && ((playerLeft + 50.5) < barrierList[i].right) && ((playerRight + 50.5) > barrierList[i].left)) {
                blockedDirections.push('cannot go right');
            }
        }
    }
    return blockedDirections;
};

// Player reset method. Reset placements dependent on level and whether falling intro has completed (on Level 5).
Player.prototype.reset = function() {
    if (this.level != 5) {
        this.x = 218.5;
        this.y = 467;
    } else if ((this.level == 5) && (this.notYetOnOceanFloor === false) && (this.goingUp === false)) {
        this.x = 20;
        this.y = 45;
    } else if (this.goingUp === true) {
        this.x = 117.5;
        this.y = 467;
    }
    this.collided = false;
    this.referenceY = 467;
};

Player.prototype.update = function(dt) {
    // First, check if any collisions occured. If so, reset the player.
    this.checkCollisions(allEnemies);
    // Then check if player is on Level 5. Player falls from top-left part of canvas
    // towards the ocean floor. After hitting the ocean floor, player will be making slight
    // bobbing movements. When player is not 'swimming' (using controls), player sinks
    // slowly towards bottom of canvas.
    if (this.level == 5) {
        if ((this.y < 467) && (this.goingUp === false) && (this.smallBouncesFromHere === false)) {
            this.y += 175 * dt;
        } else if ((this.goingUp === false) && (this.bounceYet === false) && (this.smallBouncesFromHere === false)) { //if level 5 and reached ocean floor
            this.notYetOnOceanFloor = false; // Player has reached ocean floor
            this.y = 473;
            this.goingUp = true;
        } else if ((this.goingUp === true) && (this.notYetOnOceanFloor === false) && (this.y >= 415) && (this.bounceYet === false) && (this.smallBouncesFromHere === false)) {
            this.y -= 1;
        } else if ((this.goingUp === true) && (this.y <= 414) && (this.notYetOnOceanFloor === false) && (this.bounceYet === false) && (this.smallBouncesFromHere === false)) {
            this.bounceYet = true; // Player has reached peak of small bounce
            this.y += 1;
        } else if ((this.goingUp === true) && (this.y < 473) && (this.bounceYet === true) && (this.smallBouncesFromHere === false)) {
            this.y += 1;
        } else if ((this.y == 473)) {
            this.smallBouncesFromHere = true;
            this.y -= 10 * dt;
        } else if ((this.up === true) && (this.y > 463) && (this.smallBouncesFromHere === true)) {
            // Player is experiencing upwards movement of bounce.
            this.y -= 10 * dt;
        } else if ((this.y <= 463) && (this.bounceYet === true)) {
            // Player begins to experience downward movement of bounce.
            this.y += 10 * dt;
            this.up = false;
        } else if ((this.up === false) && (this.y > 463) && (this.y < 473) && (this.smallBouncesFromHere === true) && (this.bounceYet === true)) {
            // Player continues experiencing downward movement of bounce.
            this.y += 10 * dt;
        } else if ((this.y >= 473) && (this.smallBouncesFromHere === true)) {
            // Player begins to experience upward movement of bounce.
            this.y -= 10 * dt;
            this.up = true;
        }
    }
    // Otherwise, check if player is on Level 4, during which he is floating in the water.
    else if (this.level == 4) {
        if ((this.up === true) && (this.y > (this.referenceY - 6))) {
            // Player experiences upward movement of bounce.
            this.y -= 10 * dt;
        } else if (this.y <= (this.referenceY - 6)) {
            // Player begins to experience downward movement of bounce.
            this.y += 10 * dt;
            this.up = false;
        } else if ((this.up === false) && (this.y > (this.referenceY - 6)) && (this.y < this.referenceY)) {
            // Player continues to experience downward movement of bounce.
            this.y += 10 * dt;
        } else if (this.y >= this.referenceY) {
            // Player begins to experience upward movement of bounce.
            this.y -= 10 * dt;
            this.up = true;
        }
    }
};

Player.prototype.handleInput = function(code) {
    var checkBlockedDirections = this.checkBarrier(allBarriers);
    // To account for the falling animation scene on Level 5, 'Underwater',
    // the handleInput function is disabled until player has hit the ocean
    // floor.
    if (this.notYetOnOceanFloor !== true) {
        // This condition prevents movement of player during Game Over scene
        // and Game Completed scene.
        if ((player.finishedGame !== true) && (player.gameOver !== true)) {
            // This condition checks for whether a barrier is directly above the player by looking through the array
            // returned by the checkBarrier method. It also makes sure that the player has not collided with an enemy
            // so that there is no unnecessary movement during the small window between the player being hit and the
            // player being placed at the reset position.
            if ((code === 'up') && (checkBlockedDirections.indexOf('cannot go up') == -1) && (this.collided !== true)) {
                if ((this.level != 4) && (this.level != 5)) {
                    this.y -= 83;
                } else if ((this.level == 5) && ((this.y - 83) >= -10)) {
                    this.y -= 83;
                } else if (this.level == 4) {
                    this.y = this.referenceY - 83;
                }
                this.checkItem(allItems);
                this.completedLevel();
                this.referenceY -= 83;
            }
            // This condition makes sure that the player does not go below Y-coordinate
            // 473 and that there is no barrier directly below the player.
            if ((code === 'down') && ((this.y + 83) < 473) && (checkBlockedDirections.indexOf('cannot go down') == -1)) {
                if (player.level != 4) {
                    this.y += 83;
                    this.referenceY += 83;
                } else if (this.referenceY != 467) {
                    this.y = this.referenceY + 83;
                    this.referenceY += 83;
                }
                this.checkItem(allItems);
            }
            // This condition makes sure player's x-coordinate does not go lower than 20 and that there are no barriers to
            // the left of the player
            if ((code === 'left') && (this.x > 20) && (checkBlockedDirections.indexOf('cannot go left') == -1)) {
                this.x -= 101;
                this.checkItem(allItems);

            }
            if ((code === 'right') && (this.x < 420.5) && (checkBlockedDirections.indexOf('cannot go right') == -1)) {
                this.x += 101;
                this.checkItem(allItems);
            }
        }
    }
};

// Resets enemies during level change; also ensures that certain properties are reset when game is reset and
// ladybug enemies reappear.
function allEnemiesReset() {
    for (var i = 0; i < allEnemies.length; i++) {
        allEnemies[i].reset();
        allEnemies[i].level++;
        if (player.level == 4) {
            if (allEnemies[i].originalY == 139) {
                allEnemies[i].speed = 80;
            }
            allEnemies[i].sprite = 'images/shark-fin.png';
            allEnemies[i].y = allEnemies[i].originalY;
        }
        else if (player.level == 5) {
            allEnemies[i].sprite = 'images/shark.png';
            if (allEnemies[i].originalY == 139) {
                allEnemies[i].speed = 50;
            } else {
                allEnemies[i].speed -= 45;
            }
            allEnemies[i].width = 110;
            allEnemies[i].height = 40;

        } else if (player.level == 6) {
            allEnemies[i].sprite = 'images/seagull-facing-right.png';
            allEnemies[i].speed += 60;
            allEnemies[i].width = 80;
            allEnemies[i].height = 62;
        } else {
            allEnemies[i].sprite = 'images/enemy-bug-cropped.png';
            allEnemies[i].y = allEnemies[i].originalY;
            allEnemies[i].speed = allEnemies[i].originalSpeed;
        }
    }
}

// What to do when player completes a level
Player.prototype.completedLevel = function() {
    if ((this.level == 6) && key.collected && (this.x == 218.5) && (this.y <= 100)) {
        this.finishedGame = true;
    } else if ((this.level == 5) && (this.y <= 48) && (this.x >= 404)) {
        this.level++;
        player.reset();
        if (player.level == 5) {
            // So that the player doesn't have a collision on way down to ocean floor,
            // set these properties to true and false, respectively.
            player.notYetOnOceanFloor = true;
            player.up = false;
        }
        allEnemiesReset();
    } else if (this.y == 52) {
        // If player reaches top of canvas, move to next level
        this.level++;
        this.score += 500;
        setTimeout(function() {
            player.reset();
            if (player.level == 5) {
                // So player doesn't have a collision on way down to ocean floor
                // during Level 5 intro, these properties must be set as follows.
                player.notYetOnOceanFloor = true;
                player.up = false;
            }
            allEnemiesReset();
        }, 50);
    }
};

// Below is the instantiation of all game objects.
// All enemy objects are in an array called allEnemies
// All barrier objects are in an array called allBarriers
// All item objects are in an array called allItems
// allBarriers array and allItems array are combined into one array called allObjects

var allEnemies = [];
var enemyOne = new Enemy(15, 139, 80, 62, 50, Math.random() * 200 / 2);
var enemyTwo = new Enemy(100, 305, 80, 62, 90, Math.random() * 180 / 2);
var enemyThree = new Enemy(225, 222, 80, 62, 70, Math.random() * 150.5 / 2);

allEnemies.push(enemyOne);
allEnemies.push(enemyTwo);
allEnemies.push(enemyThree);

var allBarriers = [];

var metalFence = new Barrier(101, 87, 101, 45, 2, 'images/metal-fence-06.png');
var metalFenceTwo = new Barrier(0, 87, 101, 45, 2, 'images/metal-fence-06.png');
var metalFenceThree = new Barrier(202, 87, 101, 45, 2, 'images/metal-fence-06.png');
var metalFenceFour = new Barrier(404, 87, 101, 45, 3, 'images/metal-fence-06.png');

var rock = new Barrier(210, 295, 101, 83, 3, 'images/Rock-cropped.png');
var rockTwo = new Barrier(10, 295, 101, 83, 6, 'images/Rock-cropped.png');
var rockThree = new Barrier(110, 50, 101, 83, 6, 'images/Rock-cropped.png');
var rockFour = new Barrier(110, 130, 101, 83, 6, 'images/Rock-cropped.png');
var rockFive = new Barrier(10, 210, 101, 83, 3, 'images/Rock-cropped.png');
var rockSix = new Barrier(110, 130, 101, 83, 3, 'images/Rock-cropped.png');
var rockSeven = new Barrier(312, 213, 101, 83, 3, 'images/Rock-cropped.png');
var rockEight = new Barrier(312, 130, 101, 83, 3, 'images/Rock-cropped.png');
var rockNine = new Barrier(208, 210, 101, 83, 6, 'images/Rock-cropped.png');

var buoy = new Barrier(112, 430, 101, 83, 4, 'images/buoy.png');
var buoyTwo = new Barrier(320, 380, 52, 83, 4, 'images/buoy-pointing-left.png');
var buoyThree = new Barrier(5, 45, 101, 83, 4, 'images/buoy-far-away-leaning-left.png');
var buoyFour = new Barrier(101, 45, 101, 83, 4, 'images/buoy-far-away-leaning-right.png');
var buoyFive = new Barrier(202, 45, 101, 83, 4, 'images/buoy-far-away-leaning-left.png');
var buoySix = new Barrier(404, 45, 101, 83, 4, 'images/buoy-far-away-leaning-right.png');
var tree = new Barrier(5, -7, 101, 83, 6, 'images/Tree Short.png');
var treeTwo = new Barrier(300, -7, 101, 83, 6, 'images/Tree Short.png');
var treeThree = new Barrier(405, -7, 101, 83, 6, 'images/Tree Short.png');

var octopus = new Barrier(208, 350, 300, 207, 5, 'images/octopus-03.png');

allBarriers.push(metalFence);
allBarriers.push(metalFenceTwo);
allBarriers.push(metalFenceThree);
allBarriers.push(metalFenceFour);

allBarriers.push(rock);
allBarriers.push(rockTwo);
allBarriers.push(rockThree);
allBarriers.push(rockFour);
allBarriers.push(rockFive);
allBarriers.push(rockSix);
allBarriers.push(rockSeven);
allBarriers.push(rockEight);
allBarriers.push(rockNine);

allBarriers.push(buoy);
allBarriers.push(buoyTwo);
allBarriers.push(buoyThree);
allBarriers.push(buoyFour);
allBarriers.push(buoyFive);
allBarriers.push(buoySix);

allBarriers.push(tree);
allBarriers.push(treeTwo);
allBarriers.push(treeThree);

allBarriers.push(octopus);

var player = new Player(218.5, 467);

var Bubbles = [];
var bubbleOne = new Bubble(10, -10, 200);
var bubbleTwo = new Bubble(25, -30, 200);
var bubbleThree = new Bubble(40, 10, 200);

Bubbles.push(bubbleOne);
Bubbles.push(bubbleTwo);
Bubbles.push(bubbleThree);

var allSadCharacters = [];

var sadChar = new SadCharacter(300, 250, 'images/char-horn-girl-sad.png');
var sadCharTwo = new SadCharacter(333, 250, 'images/char-cat-girl-sad.png');
var sadCharThree = new SadCharacter(366, 250, 'images/char-pink-girl-sad.png');
var sadCharFour = new SadCharacter(399, 250, 'images/char-princess-girl-sad.png');

allSadCharacters.push(sadChar);
allSadCharacters.push(sadCharTwo);
allSadCharacters.push(sadCharThree);
allSadCharacters.push(sadCharFour);

var allHappyCharacters = [];

var happyChar = new HappyCharacter(150, 200, 'images/char-cat-girl-no-shadow.png');
var happyCharTwo = new HappyCharacter(350, 170, 'images/char-horn-girl-no-shadow.png');
var happyCharThree = new HappyCharacter(50, 170, 'images/char-pink-girl-no-shadow.png');
var happyCharFour = new HappyCharacter(250, 200, 'images/char-princess-girl-no-shadow.png');

allHappyCharacters.push(happyChar);
allHappyCharacters.push(happyCharTwo);
allHappyCharacters.push(happyCharThree);
allHappyCharacters.push(happyCharFour);

var allItems = [];

var gem = new Item(73, 92, 101, 83, 500, 0, 2, 'images/gem-glowing.png');
var gemTwo = new Item(376, 95, 101, 83, 500, 0, 3, 'images/gem-glowing.png');

var bottle = new Item(5, 380, 73, 80, 500, 0, 4, 'images/message-in-bottle-03.png', 'Good job for', 'coming this far!', 'Now swim past', 'the sharks to get', 'to the bottom of', 'the sea.');

var heart = new Item(305, 175, 80, 80, 0, 1, 2, 'images/Heart-smaller.png');

var key = new Item(5, 40, 101, 171, 500, 0, 6, 'images/Key-smaller-04.png');

allItems.push(gem);
allItems.push(gemTwo);
allItems.push(bottle);
allItems.push(heart);
allItems.push(key);

var allHappyHearts = [];

var happyHeart = new Item(305, Math.random() * 600, 80, 80, 0, 0, 6, 'images/mini-heart.png');
var happyHeartTwo = new Item(105, Math.random() * 600, 80, 80, 0, 0, 6, 'images/mini-heart-02.png');
var happyHeartThree = new Item(205, Math.random() * 600, 80, 80, 0, 0, 6, 'images/mini-heart.png');
var happyHeartFour = new Item(405, Math.random() * 600, 80, 80, 0, 0, 6, 'images/mini-heart-02.png');
var happyHeartFive = new Item(50, Math.random() * 600, 80, 80, 0, 0, 6, 'images/mini-heart.png');
var happyHeartSix = new Item(275, Math.random() * 600, 80, 80, 0, 0, 6, 'images/mini-heart-02.png');
var happyHeartSeven = new Item(150, Math.random() * 600, 80, 80, 0, 0, 6, 'images/mini-heart.png');
var happyHeartEight = new Item(250, Math.random() * 600, 80, 80, 0, 0, 6, 'images/mini-heart-02.png');
var happyHeartNine = new Item(350, Math.random() * 600, 80, 80, 0, 0, 6, 'images/mini-heart.png');

allHappyHearts.push(happyHeart);
allHappyHearts.push(happyHeartTwo);
allHappyHearts.push(happyHeartThree);
allHappyHearts.push(happyHeartFour);
allHappyHearts.push(happyHeartFive);
allHappyHearts.push(happyHeartSix);
allHappyHearts.push(happyHeartSeven);
allHappyHearts.push(happyHeartEight);
allHappyHearts.push(happyHeartNine);

var allObjects = allBarriers.concat(allItems);