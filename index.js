const canvas = document.querySelector("canvas"),
  ctx = canvas.getContext("2d"),
  $sprite = document.getElementById("sprite"),
  $bricks = document.getElementById("bricks"),
  $pausedBtn = document.getElementById("pause"),
  $level = document.getElementById("level"),
  $score = document.getElementById("score"),
  $lives = document.getElementById("lives");

canvas.width = innerWidth >= 768 ? innerWidth / 2 : innerWidth;
canvas.height = (innerHeight / 4) * 3;

const ball = {
  x: canvas.width / 2,
  y: canvas.height - 30,
  radius: 8,
  dx: -4,
  dy: -4,
};

const brick = {
  row: innerHeight / 5 / 16,
  column: innerWidth < 768 ? innerWidth / 38 : 20,
  width: 32,
  height: 16,
  offSetTop: 80,
  offSetLeft: 20,
  group: [],
  status: {
    ACTIVE: 1,
    BROKEN: 0,
  },
};

let paddleWidth = 150;
let paddleHeight = 20;
let pausedGame = false;

const paddle = {
  width: paddleWidth,
  height: paddleHeight,
  x: (canvas.width - paddleWidth) / 2,
  y: canvas.height - paddleHeight - paddleHeight / 3,
  rightPressed: false,
  leftPressed: false,
  SENSITIVITY: 8,
};

constructGroupBricks = () => {
  for (let c = 0; c < brick.column; c++) {
    brick.group[c] = [];
    for (let r = 0; r < brick.row; r++) {
      const brickX = c * brick.width + brick.offSetLeft;
      const brickY = r * brick.height + brick.offSetTop;

      const random = Math.floor(Math.random() * 8);

      brick.group[c][r] = {
        x: brickX,
        y: brickY,
        color: random,
        status: brick.status.ACTIVE,
      };
    }
  }
};

drawBall = () => {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
};

drawPaddle = () => {
  let { x, y, width, height } = paddle;

  ctx.drawImage($sprite, 29, 174, width / 3, height / 2, x, y, width, height);
};

drawBricks = () => {
  for (let c = 0; c < brick.column; c++) {
    for (let r = 0; r < brick.row; r++) {
      const { x, y, status, color } = brick.group[c][r];

      if (status === brick.status.BROKEN) continue;

      const clipX = color * 32;

      ctx.drawImage(
        $bricks,
        clipX,
        0,
        brick.width,
        brick.height,
        x,
        y,
        brick.width,
        brick.height
      );
    }
  }
};

collitionDetection = () => {
  for (let c = 0; c < brick.column; c++) {
    for (let r = 0; r < brick.row; r++) {
      const { x, y, status, color } = brick.group[c][r];

      if (status === brick.status.BROKEN) continue;

      const isBallSameXAsBrick = ball.x > x && ball.x < x + brick.width;
      const isBallSameYAsBrick = ball.y > y && ball.y < y + brick.height;

      if (isBallSameXAsBrick && isBallSameYAsBrick) {
        $score.innerText = Number($score.innerText) + color;
        brick.group[c][r].status = brick.status.BROKEN;
        ball.dy = -ball.dy;
      }
    }
  }
};

ballMovement = () => {
  if (
    ball.x + ball.dx > canvas.width - ball.radius ||
    ball.x + ball.dx < ball.radius
  )
    ball.dx = -ball.dx;

  if (ball.y + ball.dy < ball.radius) ball.dy = -ball.dy;

  const isBallSameXAsPaddle =
    ball.x > paddle.x && ball.x < paddle.x + paddle.width;

  const isBallTouchingPaddle = ball.y + ball.dy > paddle.y;

  if (isBallSameXAsPaddle && isBallTouchingPaddle) ball.dy = -ball.dy;
  else if (ball.y + ball.dy > canvas.height - ball.radius) {
    resetPosition();

    if ($lives.innerText == 0) {
      $lives.innerText = 5;
      $score.innerText = 0;

      paddle.x = (canvas.width - paddle.width) / 2;
      constructGroupBricks();
    }
  }

  if (pausedGame) return;

  ball.x += ball.dx;
  ball.y += ball.dy;
};

resetPosition = () => {
  ball.x = canvas.width / 2;
  ball.y = canvas.height - 30;
  ball.dx = -ball.dx;
  ball.dy = -ball.dy;

  $lives.innerText = Number($lives.innerText) - 1;
};

paddleMovement = () => {
  if (paddle.leftPressed && paddle.x > 0) paddle.x -= paddle.SENSITIVITY;
  else if (paddle.rightPressed && paddle.x < canvas.width - paddle.width)
    paddle.x += paddle.SENSITIVITY;
};

cleanCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

TogglePausedGame = () => {
  pausedGame = !pausedGame;
};

initEvents = () => {
  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);
  $pausedBtn.addEventListener("click", TogglePausedGame);

  function keyDownHandler({ key }) {
    if (key === "Right" || key === "ArrowRight") paddle.rightPressed = true;
    else if (key === "Left" || key === "ArrowLeft") paddle.leftPressed = true;
  }

  function keyUpHandler({ key }) {
    if (key === "Escape") TogglePausedGame();
    if (key === "Right" || key === "ArrowRight") paddle.rightPressed = false;
    else if (key === "Left" || key === "ArrowLeft") paddle.leftPressed = false;
  }
};

draw = () => {
  cleanCanvas();

  drawBall();
  drawPaddle();
  drawBricks();

  collitionDetection();
  ballMovement();
  paddleMovement();
  requestAnimationFrame(draw);
};

constructGroupBricks();
draw();

initEvents();
