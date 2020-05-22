
let type = "WebGL";
if(!PIXI.utils.isWebGLSupported()){
  type = "canvas";
}
PIXI.utils.sayHello(type);

var vw = document.documentElement.clientWidth;
var vh = document.documentElement.clientHeight;

let canvasWidth, canvasHeight;
if (vw/vh > 16/9) {
  // width is bigger
  canvasHeight = vh;
  canvasWidth = Math.floor(vh / 9 * 16);
} else {
  // height is bigger
  canvasWidth = vw;
  canvasHeight = vw / 16 * 9;
}

let app = new PIXI.Application({width: canvasWidth, height: canvasHeight});
document.body.appendChild(app.view);

let loader = PIXI.loader;
let player, enemy, ball;
let floors = [];
let walls = [];
let image;

loader
  .add('bar', 'img/bar.png')
  .add('wall', 'img/wall.png')
  .add('ball', 'img/ball.png')
  .load(setup);

let up = keyboard('w');
let down = keyboard('s');

function setup() {
  let bar_texture = loader.resources.bar.texture;
  let ball_texture = loader.resources.ball.texture;
  let wall_texture = loader.resources.wall.texture;
  // stage
  let stage = new PIXI.Container();
  app.stage.addChild(stage);
  stage.x = app.screen.width / 2;
  stage.y = app.screen.height / 2;
  // player
  player = new PIXI.Sprite(bar_texture);
  stage.addChild(player);
  player.x = -300;
  player.anchor.set(.5);
  // enemy
  enemy = new PIXI.Sprite(bar_texture);
  stage.addChild(enemy);
  enemy.x = 300;
  enemy.anchor.set(.5);
  // ball
  ball = new PIXI.Sprite(ball_texture);
  stage.addChild(ball);
  ball.x = 0;
  ball.anchor.set(.5);
  // Setting up the walls
  for (let i = 0; i < 75; i++) {
    let new_wall = new PIXI.Sprite(wall_texture);
    let new_floor = new PIXI.Sprite(wall_texture);

    walls.push(new_wall);
    stage.addChild(walls[i]);

    walls[i].y = -200;
    walls[i].x = -300 + i * 8;

    walls[i].anchor.set(.5);

    floors.push(new_floor);
    stage.addChild(floors[i]);

    floors[i].y = 200;
    floors[i].x = -300 + i * 8;
    floors[i].anchor.set(.5);
  }
  //movements
  ball.vx = 1;
  ball.vy = 1;
  // Player and Enemy would just move up and down, so it'll just need vy.
  player.vy = 0;
  enemy.vy = 0;
  // Controls
  up.press = () => {
    player.vy = -1;
  };

  up.release = () => {
    player.vy = 0;
  };

  down.press = () => {
    player.vy = 1;
  };

  down.release = () => {
    player.vy = 0;
  };
  app.ticker.add(delta => game(delta));

  const style = new PIXI.TextStyle({
    fontFamily: 'Roboto',
    fill: ['#ffffff'],
    fontSize: 32,
  });
  // Adding Score to our Player and Enemy Object
  player.score = 0;
  enemy.score = 0;
  // Creating the actual Text for the scores.
  playerScore = new PIXI.Text(player.score, style);
  enemyScore = new PIXI.Text(enemy.score, style);
  playerScore.x = -275; 
  playerScore.y = -250;

  enemyScore.x = 250;
  enemyScore.y = -250;
  stage.addChild(playerScore);
  stage.addChild(enemyScore);

  // Controls Below 
}

function game(delta) {
  let speed = 5 * delta;
  if (ball.y > enemy.y) {
		enemy.vy = 1;
	} else if (ball.y < enemy.y) {
		enemy.vy = -1;
	} else {
		enemy.vy = 0;
  }
  // if (ball.y > player.y) {
	// 	player.vy = 1;
	// } else if (ball.y < player.y) {
	// 	player.vy = -1;
	// } else {
	// 	player.vy = 0;
  // }
  // Check Collision of Ball with Player + Enemy
  if (check_collid(ball, enemy) || check_collid(ball, player)) {
    ball.vx *= -1;
  }
  for (let wall of walls) {
    if (check_collid(ball, wall)) {
      ball.vy = 1;
    }
    if (check_collid(player, wall)) {
      if (player.vy < 0) {
        player.vy = 0;
      }
    }
    if (check_collid(enemy, wall)) {
      if (enemy.vy < 0) {
        enemy.vy = 0;
      }
    }
  }
  for (let floor of floors) {
    if (check_collid(ball, floor)) {
      ball.vy = -1;
    }
    if (check_collid(player, floor)) {
      if (player.vy > 0) {
        player.vy = 0;
      }
    }
    if (check_collid(enemy, floor)) {
      if (enemy.vy > 0) {
        enemy.vy = 0;
      }
    }
  }
  // Movement for ball and players
  ball.x += ball.vx * speed;
  ball.y += ball.vy * speed;
  player.y += player.vy * speed * 0.4;
  enemy.y += enemy.vy * speed * 0.4;
  // If ball goes out of bounds, reset it.
  if (ball.x > 325) {
	  ball_reset();
	  player.score++;
	  playerScore.text = player.score;
  } else if (ball.x < -325) {
	  ball_reset();
	  enemy.score++;
	  enemyScore.text = enemy.score;
  }
}

function check_collid(r1, r2) {
  let hit = false, combinedHalfWidths, combinedHalfHeights, vx, vy;
  // Find the center points of each sprite
  r1.centerX = r1.x;
  r1.centerY = r1.y;
  r2.centerX = r2.x;
  r2.centerY = r2.y;
  // Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;
  // Calculate the distance vectors between sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;
  // Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;
  // Check collision on x axis
  if (Math.abs(vx) < combinedHalfWidths &&
    Math.abs(vy) < combinedHalfHeights) {
      hit = true;
  }
  return hit;
}

function keyboard(value) {
  let key = {};
  key.value = value;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;

  key.downHandler = event => {
    if (event.key === key.value) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
      event.preventDefault();
    }
  };

  key.upHandler = event => {
    if (event.key === key.value) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
      event.preventDefault();
    }
  };

  // Attach Event listeners
  const downListener = key.downHandler.bind(key);
  const upListener = key.upHandler.bind(key);

  window.addEventListener("keydown", downListener, false);
  window.addEventListener("keyup", upListener, false);

  // Detach event listeners
  key.unsubscribe = () => {
    window.removeEventListener("keydown", downListener);
    window.removeEventListener("keyup", upListener);
  };

  return key;
}

function ball_reset() {
  ball.x = 0;
  ball.y = 0;
  ball.vy = ball.vy * -1;
  ball.vx = ball.vx * -1;
}
