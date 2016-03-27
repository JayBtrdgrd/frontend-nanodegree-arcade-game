/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */
var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    var gamePaused = false;
    var gameUnpaused = false;
    var animationFrameCount = 0;
    var specialAnimationFrameCount = 0;
    var numberOfFramesBeforeDisappearing = 220;
    var rewardAnimationFrame = 0;
    var rewardAnimationFrameLimit = 20;

    // Listen for keys to pause, unpause, or restart game
    document.addEventListener('keydown', function(e) {
        /* By pressing any key except 'p', you dismiss the
         * message (from the bottle in Level 4); the message
         * image and corresponding text do not render when
         * the player dismissed property is set to true.
         */
        if ((e.keyCode != 80) && (bottle.collected)) {
            player.dismissed = true;
        }
        // Unpause game
        if ((e.keyCode == 80) && (gamePaused === true)) {
            gamePaused = false;
            gameUnpaused = true;
            win.requestAnimationFrame(main);
        } else if (e.keyCode == 80) {
            // Pause game
            gamePaused = true;
        }
        // Pressing Enter/Return key restarts game
        else if (e.keyCode == 13) {
            if (player.gameOver === true) {
                  player.gameOver = false;
                  win.requestAnimationFrame(main);
            }
            // Reset properties
            player.lives = 3;
            player.score = 0;
            player.level = 1;
            player.dismissed = false;
            player.up = true;
            player.notYetOnOceanFloor = false;
            player.goingUp = false;
            player.bounceYet = false;
            player.smallBouncesFromHere = false;
            specialAnimationFrameCount = 0;
            allItems.forEach(function(item) {
                item.finishedShowingReward = false;
                item.collected = false;
            });
            // Reset enemy level to zero
            for (var i = 0; i < allEnemies.length; i++) {
                allEnemies[i].level = 0;
            }
            player.reset();
            allEnemiesReset();
            for (var i = 0; i < allItems.length; i++) {
                allItems[i].collected = false;
                allItems[i].points = allItems[i].basePoints;
                allItems[i].lives = allItems[i].baseLives;
            }
            player.finishedGame = false;
        }
    });

    /* Listen for keys and assign the following strings. Pass
     * in string to handleInput method.
     */
    document.addEventListener('keyup', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        if (gamePaused !== 'true') {
            player.handleInput(allowedKeys[e.keyCode]);
        }
    });

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        // Counter for heart 'beats'
        if (animationFrameCount == 100) {
            animationFrameCount = 0;
            heart.count = animationFrameCount;
        } else {
            animationFrameCount++;
            heart.count = animationFrameCount;
        }
        if (gameUnpaused === true) {
            update(0);
            gameUnpaused = false;
        } else {
            update(dt);
        }

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        // Display this when the player has no more lives
        if (player.lives === 0) {
            setTimeout(function() {
                player.gameOver = true;
                ctx.font = '23pt Arial';
                ctx.globalAlpha = 0.65;
                ctx.fillStyle = 'black';
                ctx.fillRect(78, 200, 350, 200);
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'yellow';
                ctx.fillText('GAME OVER!', 155, 285);
                ctx.font = '18pt Arial';
                ctx.fillStyle = 'white';
                ctx.fillText('Press Enter to Play Again', 117, 350);
            }, 50);
        }
        // Set enemy's collided property back to false after collision
        else if (player.collided === true) {
            for (var i = 0; i < allEnemies.length; i++) {
                if (allEnemies[i].collided === true) {
                    allEnemies[i].collided = false;
                }
            }
            // Draw heart image and lives text
            ctx.drawImage(Resources.get('images/Heart-mini-03-thicker-white-outline.png'), 19, 552.5);
            ctx.font = '23pt Arial';
            ctx.globalAlpha = 0.6;
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 6;
            ctx.strokeText(player.lives, 89, 575);
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'black';
            ctx.fillText(player.lives, 89, 575);
            /* Use the browser's requestAnimationFrame function to call this
             * function again as soon as the browser is able to draw another frame.
             */
            setTimeout(function() {
                win.requestAnimationFrame(main);
            }, 500);
        } else if (gamePaused === false) {
            win.requestAnimationFrame(main);
        }
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        if (player.finishedGame !== true) {
            allEnemies.forEach(function(enemy) {
            enemy.update(dt);
            });
        }
        if (player.level == 5) {
            Bubbles.forEach(function(bubble) {
                bubble.update(dt);
            });
            allSadCharacters.forEach(function(char) {
                char.update(dt);
            });
        }
        if (player.finishedGame === true) {
            // Happy Characters come out and jump up and down when game is completed
            allHappyCharacters.forEach(function(char) {
                char.update(dt);
            });
            // Mini hearts move left and right while floating up the canvas
            allHappyHearts.forEach(function(heart) {
                heart.update(dt);
            });
        }
        player.update(dt);
        heart.update(dt);
        gem.update(dt);
        bottle.update(dt);
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */

        var rowImages = [];

        // This is the image used for Level 4, 'Floating on Water'
        if (player.level == 4)  {
            rowImages = [
                'images/water-block.png', // Top row is water
                'images/water-block.png', // Row 1 of 3 of water
                'images/water-block.png', // Row 2 of 3 of water
                'images/water-block.png', // Row 3 of 3 of water
                'images/water-block.png', // Row 1 of 2 of water
                'images/water-block.png' // Row 2 of 2 of water
            ];
        }
        //These are the images used for Level 6, 'The Island'.
        else if (player.level == 6) {
            rowImages = [
                'images/sand-02.png', // Top row is sand
                'images/sand-02.png', // Row 1 of 3 of sand
                'images/sand-02.png', // Row 2 of 3 of sand
                'images/sand-02.png', // Row 3 of 3 of sand
                'images/sand-02.png', // Row 1 of 2 of sand
                'images/shore-02.png' // Row 2 of 2 of shore
            ];
        } else {
            rowImages = [
                'images/water-block.png', // Top row is water
                'images/stone-block.png', // Row 1 of 3 of stone
                'images/stone-block.png', // Row 2 of 3 of stone
                'images/stone-block.png', // Row 3 of 3 of stone
                'images/grass-block.png', // Row 1 of 2 of grass
                'images/grass-block.png' // Row 2 of 2 of grass
            ];
        }
        var numRows = 6,
            numCols = 5,
            row, col;
        // When the player reaches Level 5, a dialog occurs between the player and the imprisoned characters.
        if (player.level == 5) {
            ctx.drawImage(Resources.get('images/underwater-scene-02.jpg'), 0, 48);
            renderEntities();
            ctx.fillStyle = '#6666cc';
            ctx.globalAlpha = 0.3;
            ctx.fillRect(0, 48, canvas.width, canvas.height - 68);
            ctx.globalAlpha = 1;
            if ((player.notYetOnOceanFloor === false) && (player.goingUp === true)) {
                specialAnimationFrameCount++;
                if ((specialAnimationFrameCount >= 220) && (specialAnimationFrameCount < 300)) {
                    ctx.drawImage(Resources.get('images/L5-3-dots.png'), player.x + 80, player.y - 10);
                }
                else if ((specialAnimationFrameCount >= 310) && (specialAnimationFrameCount < 390)) {
                    ctx.drawImage(Resources.get('images/L5-whats-wrong-05.png'), player.x + 80, player.y - 10);
                }
                else if ((specialAnimationFrameCount >= 440) && (specialAnimationFrameCount < 575)) {
                    ctx.drawImage(Resources.get('images/L5-Evil-Octopus-02.png'), sadChar.x - 160, sadChar.y - 5);
                }
                else if ((specialAnimationFrameCount >= 635) && (specialAnimationFrameCount < 865)) {
                    ctx.drawImage(Resources.get('images/L5-treasure-chest-02.png'), sadChar.x - 175, sadChar.y - 10);
                }
                else if ((specialAnimationFrameCount >= 900) && (specialAnimationFrameCount < 990)) {
                    ctx.drawImage(Resources.get('images/L5-help-us-02.png'), sadChar.x - 150, sadChar.y + 25);
                }
                else if ((specialAnimationFrameCount >= 1025) && (specialAnimationFrameCount < 1175)) {
                    ctx.drawImage(Resources.get('images/L5-sure-02.png'), player.x + 80, player.y - 45);
                }
                else if ((specialAnimationFrameCount >= 1225) && (specialAnimationFrameCount < 1340)) {
                    ctx.drawImage(Resources.get('images/L5-on-island-02.png'), sadChar.x - 160, sadChar.y + 20);
                }
                else if ((specialAnimationFrameCount >= 1370) && (specialAnimationFrameCount < 1485)) {
                    ctx.drawImage(Resources.get('images/L5-swim.png'), sadChar.x - 145, sadChar.y);
                }
                else if ((specialAnimationFrameCount >= 1515) && (specialAnimationFrameCount < 1635)) {
                ctx.drawImage(Resources.get('images/L5-thank-you-gl.png'), sadChar.x - 130, sadChar.y);
                }
            }
        }
        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (var row = 0; row < numRows; row++) {
            for (var col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                if (player.level != 5) {
                    ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
                }
            }
        }
        // For Level 4, draw canvas so that the ocean 'rows' get progressively lighter from top to bottom
        if (player.level == 4) {
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = 'black';
            ctx.fillRect(303, 48, 101, 83);
            ctx.fillRect(202, 48, 101, 83);
            ctx.fillRect(101, 48, 101, 83);
            ctx.fillRect(0, 48, 101, 83);
            ctx.fillRect(404, 48, 101, 83);
            // Less opacity for 2nd row
            ctx.globalAlpha = 0.15;
            ctx.fillRect(303, 131, 101, 83);
            ctx.fillRect(202, 131, 101, 83);
            ctx.fillRect(101, 131, 101, 83);
            ctx.fillRect(0, 131, 101, 83);
            ctx.fillRect(404, 131, 101, 83);
            // Less opacity for 3rd row
            ctx.globalAlpha = 0.1;
            ctx.fillRect(303, 214, 101, 83);
            ctx.fillRect(202, 214, 101, 83);
            ctx.fillRect(101, 214, 101, 83);
            ctx.fillRect(0, 214, 101, 83);
            ctx.fillRect(404, 214, 101, 83);
            // Less opacity for 4th row
            ctx.globalAlpha = 0.05;
            ctx.fillRect(303, 297, 101, 83);
            ctx.fillRect(202, 297, 101, 83);
            ctx.fillRect(101, 297, 101, 83);
            ctx.fillRect(0, 297, 101, 83);
            ctx.fillRect(404, 297, 101, 83);
            // Less opacity for 4th row
            ctx.globalAlpha = 0.025;
            ctx.fillRect(303, 380, 101, 83);
            ctx.fillRect(202, 380, 101, 83);
            ctx.fillRect(101, 380, 101, 83);
            ctx.fillRect(0, 380, 101, 83);
            ctx.fillRect(404, 380, 101, 83);
            ctx.globalAlpha = 1;
        }
        for (var i = 0; i < allObjects.length; i++) {
            if ((player.level == allObjects[i].level) && (allObjects[i].collected !== true) && (allObjects[i].sprite !== 'images/octopus-03.png')) {
                ctx.drawImage(Resources.get(allObjects[i].sprite), allObjects[i].left, allObjects[i].top);
            }
        }
        if ((player.level == 6) && (player.finishedGame === false)) {
            ctx.drawImage(Resources.get('images/treasure-chest-closed.png'), 210, 50);
        }
        if (player.finishedGame === true) {
            ctx.font = '27pt Arial';
            ctx.globalAlpha = 0.05;
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 48, canvas.width, canvas.height - 68);
            allHappyCharacters.forEach(function(char) {
                char.render();
            });
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = 'black';
            ctx.fillRect(97, 350, 310, 138);
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#ede715';
            ctx.fillText('YOU DID IT!!!', 141, 410);
            ctx.font = '17pt Arial';
            ctx.fillStyle = 'white';
            ctx.fillText('Press Enter to Play Again', 123, 455);
            ctx.drawImage(Resources.get('images/treasure-chest-open.png'), 200, 50);
            ctx.drawImage(Resources.get('images/char-boy-cropped-happy.png'), player.x, player.y);
            ctx.drawImage(Resources.get('images/Key-smaller-04.png'), player.x, player.y - 50);
            allHappyHearts.forEach(function(heart) {
                heart.render();
            });
        }
        ctx.font = '23pt Arial';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.strokeText('Lvl: ' + player.level, 400, 100);
        ctx.fillStyle = 'yellow';
        ctx.fillText('Lvl: ' + player.level, 400, 100);
        ctx.strokeText('Score: ' + player.score, 20, 100);
        ctx.fillText('Score: ' + player.score, 20, 100);
        ctx.drawImage(Resources.get('images/Heart-mini-03.png'), 20, 553);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.strokeText('x', 58, 573);
        ctx.strokeText(player.lives, 89, 575);
        ctx.fillStyle = 'black';
        ctx.fillText('x', 58, 573);
        ctx.fillText(player.lives, 89, 575);
        ctx.font = '12.5pt Arial';
        ctx.fillStyle = 'white';
        ctx.globalAlpha = 0.7;
        ctx.fillText('Press p to pause or resume', 290, 572);
        ctx.globalAlpha = 1;

        // Level 5 needs to be rendered in a specific order. For all other levels, render as follows.
        if (player.level != 5) {
            renderEntities();
        }
        if ((key.collected === true) && (player.finishedGame !== true)) {
            ctx.drawImage(Resources.get('images/Key-smaller-04.png'), player.x, player.y - 50);
        }
        // Render transparent water image over message in bottle object in Level 4
        if (player.level == 4) {
            if (bottle.collected !== true) {
                ctx.globalAlpha = 0.7;
                ctx.drawImage(Resources.get('images/submerged.png'), bottle.originalX - 5, bottle.originalY + 67);
            }
            ctx.globalAlpha = 1;
        }

        /* Render scroll with text (string parameters of bottle object) so that message only appears for a specific
         * number of frames. Right before scroll completely disappears, its opacity gradually decreases.
         */
        if ((player.level == 4) && (bottle.collected === true) && (numberOfFramesBeforeDisappearing != specialAnimationFrameCount) && (player.dismissed !== true)) {
            specialAnimationFrameCount++;
            if (specialAnimationFrameCount >= 210) {
                ctx.globalAlpha = 0.25;
                ctx.drawImage(Resources.get('images/scroll_with_text.png'),bottle.originalX + 100, bottle.originalY - 80);
                ctx.globalAlpha = 1;
            } else if (specialAnimationFrameCount >= 205) {
                ctx.globalAlpha = 0.5;
                ctx.drawImage(Resources.get('images/scroll_with_text.png'),bottle.originalX + 100, bottle.originalY - 80);
                ctx.globalAlpha = 1;
            } else if (specialAnimationFrameCount >= 200) {
                ctx.globalAlpha = 0.75;
                ctx.drawImage(Resources.get('images/scroll_with_text.png'),bottle.originalX + 100, bottle.originalY - 80);
                ctx.globalAlpha = 1;
            } else if (specialAnimationFrameCount >= 9) {
                ctx.drawImage(Resources.get('images/scroll_with_text.png'),bottle.originalX + 100, bottle.originalY - 80);
            }
        }
        // Render points or life gained at the time of item collection
        allItems.forEach(function(item) {
            /* If item has been collected, but the reward number has not been shown or has not finished
             * showing, show reward number, otherwise reset rewardAnimationFrame and set finishedShowingReward to true
             */
            if (item.collected && item.finishedShowingReward !== true) {
                /* This condition ensures that when the player moves onto the next level or collides right after
                 * collecting item, the points/life gain doesn't continue being shown.
                 */
                if (item.collected && (rewardAnimationFrame < rewardAnimationFrameLimit) && (item.finishedShowingReward === false) && (item.level == player.level) && (player.y < 383)) {
                    ctx.font = '18pt Arial';
                    ctx.lineWidth = 3;
                    ctx.fillStyle = 'black';
                    // If the points for an item are greater than zero, show points gained.
                    if (item.basePoints > 0) {
                        ctx.fillStyle = '#582589';
                        rewardAnimationFrame++;
                        if (rewardAnimationFrame < 5) {
                            // If item is gem, use these coordinates for reward info.
                            if (item.sprite === 'images/gem-glowing.png') {
                                ctx.fillText('+' + item.basePoints + ' pts', item.left + 40, item.top + 20);
                            }
                            // If not, then the item is a bottle, so use these coordinates.
                            else {
                                ctx.fillText('+' + item.basePoints + ' pts', item.left, item.top - 5);
                            }
                        }
                        /* The rest of the conditions check for the rewardAnimationFrame value and
                         * decrease the opacity of the text accordingly.
                         */
                        else if (rewardAnimationFrame <= 8) {
                            ctx.globalAlpha = 0.8;
                            if (item.sprite === 'images/gem-glowing.png') {
                                ctx.fillText('+' + item.basePoints + ' pts', item.left + 40, item.top + 16);
                            } else {
                                ctx.fillText('+' + item.basePoints + ' pts', item.left, item.top - 9);
                            }
                            ctx.globalAlpha = 1;
                        } else if (rewardAnimationFrame <= 11) {
                            ctx.globalAlpha = 0.65;
                            if (item.sprite === 'images/gem-glowing.png') {
                                ctx.fillText('+' + item.basePoints + ' pts', item.left + 40, item.top + 12);
                            } else {
                                ctx.fillText('+' + item.basePoints + ' pts', item.left, item.top - 13);
                            }
                            ctx.globalAlpha = 1;
                            } else if (rewardAnimationFrame <= 14) {
                                ctx.globalAlpha = 0.5;
                                if (item.sprite === 'images/gem-glowing.png') {
                                    ctx.fillText('+' + item.basePoints + ' pts', item.left + 40, item.top + 8);
                                } else {
                                ctx.fillText('+' + item.basePoints + ' pts', item.left, item.top - 17);
                                }
                                ctx.globalAlpha = 1;
                            } else if (rewardAnimationFrame <= 17) {
                                ctx.globalAlpha = 0.35;
                                if (item.sprite === 'images/gem-glowing.png') {
                                    ctx.fillText('+' + item.basePoints + ' pts', item.left + 40, item.top + 4);
                                } else {
                                ctx.fillText('+' + item.basePoints + ' pts', item.left, item.top - 21);
                                }
                                ctx.globalAlpha = 1;
                            } else if (rewardAnimationFrame <= 20) {
                                ctx.globalAlpha = 0.2;
                                if (item.sprite === 'images/gem-glowing.png') {
                                    ctx.fillText('+' + item.basePoints + ' pts', item.left + 40, item.top);
                                } else {
                                    ctx.fillText('+' + item.basePoints + ' pts', item.left, item.top - 25);
                                }
                                ctx.globalAlpha = 1;
                            }
                        }
                        // The following are the conditions for showing the life gained text.
                        else {
                            rewardAnimationFrame++;
                            ctx.fillStyle = '#582589';
                            if (rewardAnimationFrame < 5) {
                                ctx.fillText('+' + item.baseLives + ' Life', item.left + 15, item.top + 30);
                            } else if (rewardAnimationFrame <= 8) {
                                ctx.globalAlpha = 0.8;
                                ctx.fillText('+' + item.baseLives + ' Life', item.left + 15, item.top + 26);
                                ctx.globalAlpha = 1;
                            } else if (rewardAnimationFrame <= 11) {
                                ctx.globalAlpha = 0.65;
                                ctx.fillText('+' + item.baseLives + ' Life', item.left + 15, item.top + 22);
                                ctx.globalAlpha = 1;
                            } else if (rewardAnimationFrame <= 14) {
                                ctx.globalAlpha = 0.5;
                                ctx.fillText('+' + item.baseLives + ' Life', item.left + 15, item.top + 18);
                                ctx.globalAlpha = 1;
                            } else if (rewardAnimationFrame <= 17) {
                                ctx.globalAlpha = 0.35;
                                ctx.fillText('+' + item.baseLives + ' Life', item.left + 15, item.top + 14);
                                ctx.globalAlpha = 1;
                            } else if (rewardAnimationFrame <= 20) {
                                ctx.globalAlpha = 0.2;
                                ctx.fillText('+' + item.baseLives + ' Life', item.left + 15, item.top + 10);
                                ctx.globalAlpha = 1;
                            }
                        }
                    }
                // Set the properties as follows once rewardAnimationFrame equals the assigned limit
                else if (item.collected && (rewardAnimationFrame == rewardAnimationFrameLimit)) {
                    item.finishedShowingReward = true;
                    rewardAnimationFrame = 0;
                }
            }
        });
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */

        // For Level 4, shark fins must appear over the sheer water graphic placed over player.
        if (player.level == 4) {
            allEnemies.forEach(function(enemy) {
                /* Render player over shark fin if the player's head bounces above the bottom of the fin;
                 * otherwise, it will look as if the player's head is slipping behind the fin
                 */
                if (((enemy.y + 80) > player.y) && (player.y > enemy.y + 40)) {
                    enemy.render();
                    player.render();
                }
                // ordering the rendering this way keeps the submerged image under the enemy at time of collision
                else {
                    player.render();
                    enemy.render();
                }
            });
            if (player.collided !== true) {
                // As long as no collision has occured, render the transparent water image above the player.
                ctx.globalAlpha = 0.7;
                ctx.drawImage(Resources.get('images/submerged.png'), player.x - 17, player.referenceY + 65);
                ctx.globalAlpha = 1;
                /* Place black rectangle over submerged image that goes above the player. Its opacity
                 * corresponds with the opacity level of the black rectangles placed over the water blocks
                 * earlier in the render function.
                 */
                if (player.referenceY == 384) {
                    ctx.globalAlpha = 0.025;
                    ctx.fillStyle = 'black';
                    ctx.fillRect(player.x - 17, player.referenceY + 65, 100, 16);
                    ctx.globalAlpha = 1;
                } else if (player.referenceY == 301) {
                    ctx.globalAlpha = 0.05;
                    ctx.fillStyle = 'black';
                    ctx.fillRect(player.x - 17, player.referenceY + 65, 100, 16);
                    ctx.globalAlpha = 1;
                } else if (player.referenceY == 218) {
                    ctx.globalAlpha = 0.1;
                    ctx.fillStyle = 'black';
                    ctx.fillRect(player.x - 17, player.referenceY + 65, 100, 16);
                    ctx.globalAlpha = 1;
                } else if (player.referenceY == 135) {
                    ctx.globalAlpha = 0.15;
                    ctx.fillStyle = 'black';
                    ctx.fillRect(player.x - 17, player.referenceY + 65, 100, 16);
                    ctx.globalAlpha = 1;
                } else if (player.referenceY == 72) {
                    ctx.globalAlpha = 0.2;
                    ctx.fillStyle = 'black';
                    ctx.fillRect(player.x - 17, player.referenceY + 65, 100, 16);
                    ctx.globalAlpha = 1;
                }
            }
        }
        /* For Level 5, the octopus needs to be drawn above the sharks but below the
         * the imprisoned characters. Bubbles need to be rendered behind the player.
         */
        else if (player.level == 5) {
            allEnemies.forEach(function(enemy) {
                enemy.render();
            });
            ctx.drawImage(Resources.get(octopus.sprite), octopus.left, octopus.top);
            allSadCharacters.forEach(function(char) {
                char.render();
            });
            Bubbles.forEach(function(bubble) {
                bubble.render();
            });
            player.render();
        }
        else if (player.finishedGame !== true) {
            allEnemies.forEach(function(enemy) {
                enemy.render();
            });
            player.render();
        }
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/metal-fence-06.png',
        'images/Rock-cropped.png',
        'images/sand-02.png',
        'images/gem-glowing.png',
        'images/Heart-mini-03.png',
        'images/Heart-smaller.png',
        'images/Heart-even-smaller-02.png',
        'images/Heart-mini-03-thicker-white-outline.png',
        'images/mini-heart.png',
        'images/mini-heart-02.png',
        'images/treasure-chest-closed.png',
        'images/treasure-chest-open.png',
        'images/Key-smaller-04.png',
        'images/enemy-bug-cropped.png',
        'images/seagull.png',
        'images/seagull-facing-right.png',
        'images/shark-fin.png',
        'images/shark-fin-going-back.png',
        'images/shark.png',
        'images/char-boy-cropped.png',
        'images/char-boy-cropped-no-shadow.png',
        'images/char-boy-cropped-happy.png',
        'images/char-boy-cropped-sad-04.png',
        'images/char-cat-girl-no-shadow.png',
        'images/char-horn-girl-no-shadow.png',
        'images/char-pink-girl-no-shadow.png',
        'images/char-princess-girl-no-shadow.png',
        'images/char-cat-girl-sad.png',
        'images/char-horn-girl-sad.png',
        'images/char-pink-girl-sad.png',
        'images/char-princess-girl-sad.png',
        'images/round-shadow-02.png',
        'images/buoy.png',
        'images/buoy-pointing-left.png',
        'images/buoy-far-away-leaning-left.png',
        'images/buoy-far-away-leaning-right.png',
        'images/submerged.png',
        'images/shore-02.png',
        'images/Tree Short.png',
        'images/underwater-scene-02.jpg',
        'images/message-in-bottle-03.png',
        'images/scroll_with_text.png',
        'images/bubble-07.png',
        'images/octopus-03.png',
        'images/L5-3-dots.png',
        'images/L5-whats-wrong-05.png',
        'images/L5-Evil-Octopus-02.png',
        'images/L5-treasure-chest-02.png',
        'images/L5-help-us-02.png',
        'images/L5-sure-02.png',
        'images/L5-on-island-02.png',
        'images/L5-swim.png',
        'images/L5-thank-you-gl.png'

    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;

})(this);
