
class Game {
	field;
	player1;
	player2;
	ball;
	isGameOver;
	isPaused;
	winningScore;

	ballObj;
	p1Obj;
	p2Obj;
	fieldObj;
	lineDrawer1Obj;
	lineDrawer2Obj;

	constructor() {
		this.winningScore = 10;
		this.field = { width: 800, height: 500 };
		
		let buffer = this.field.width/80;
		let paddleHeight = this.field.height / 5;
		let paddleWidth = this.field.width/80;
		let paddleSpeed = this.field.width/100;
		let initialBallSpeed = 7;

		this.ball = { x: this.field.width/2, y: this.field.height/2, radius: this.field.width/100, speed: initialBallSpeed, dx: 5, dy: 5 };

		this.player1 = { 
			x: buffer, 
			y: this.field.height/2 - paddleHeight, 
			width: paddleWidth, 
			height: paddleHeight, 
			score: 0, 
			dy: paddleSpeed,
			name: "Player 1"
		};
		this.player2 = { 
			x: this.field.width - paddleWidth - buffer, 
			y: this.field.height/2 - paddleHeight, 
			width: paddleWidth, 
			height: paddleHeight, 
			score: 0, 
			dy: paddleSpeed,
			name: "Player 2"
		};
		this.player1.program = function(player, ball, field, lineDrawer) {};
		this.player2.program = function(player, ball, field, lineDrawer) {};
		this.lineDrawer1Obj = new LineDrawer("#F00");
		this.lineDrawer2Obj = new LineDrawer("#0F0");

		this.ballObj = new Ball(this.ball);
		this.p1Obj = new Player(this.player1);
		this.p2Obj = new Player(this.player2);
		this.fieldObj = new Field(this.field.width, this.field.height);
	}

	setPlayerProgram(player, func) {
		let s = "player.program = " + func;
		eval(s);
	}

	update() {
		if (this.isGameOver) return;
		if (this.isPaused) return;

		let ball = this.ball;
		let paddle1 = this.player1;
		let paddle2 = this.player2;

		ball.x += ball.dx;
		ball.y += ball.dy;

		// Wall Bounce
		if (ball.y - ball.radius < 0) {
			ball.dy = Math.abs(ball.dy);
			playSound(200, 'sine', 0.1); // Low boop
		}
		if (ball.y + ball.radius > this.field.height) {
			ball.dy = -Math.abs(ball.dy);
			playSound(200, 'sine', 0.1); // Low boop
		}
		
		if (ball.x - ball.radius < paddle1.x + paddle1.width
				&& ball.y + ball.radius >= paddle1.y
				&& ball.y - ball.radius <= paddle1.y + paddle1.height) {

			this.hit(ball, paddle1);
			playSound(440, 'square', 0.1); // High bip
			ball.x = paddle1.x + paddle1.width + ball.radius;
		}
		else if (ball.x + ball.radius > paddle2.x
				&& ball.y + ball.radius >= paddle2.y
				&& ball.y - ball.radius <= paddle2.y + paddle2.height) {
			this.hit(ball, paddle2);
			playSound(440, 'square', 0.1); // High bip
			ball.x = paddle2.x - ball.radius;
		}
		
		if (ball.x - ball.radius < 0) {
			paddle2.score++;
			playSound(150, 'sawtooth', 0.3); // Score sound
			if (paddle2.score >= this.winningScore) this.isGameOver = true;
			else this.resetBall();
		} else if (ball.x + ball.radius > this.field.width) {
			paddle1.score++;
			playSound(150, 'sawtooth', 0.3);
			if (paddle1.score >= this.winningScore) this.isGameOver = true;
			else this.resetBall();
		}

		this.player1.program(this.p1Obj, this.ballObj, this.fieldObj, this.lineDrawer1Obj);
		this.player2.program(this.p2Obj, this.ballObj, this.fieldObj, this.lineDrawer2Obj);

		if (this.p1Obj.v < 0 && paddle1.y > 0) paddle1.y -= paddle1.dy;
		if (this.p1Obj.v > 0 && paddle1.y + paddle1.height < this.field.height) paddle1.y += paddle1.dy;
		if (this.p2Obj.v < 0 && paddle2.y > 0) paddle2.y -= paddle2.dy;
		if (this.p2Obj.v > 0 && paddle2.y + paddle2.height < this.field.height) paddle2.y += paddle2.dy;
	}

	hit(ball, player) {
		let collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
		let angleRad = (Math.PI / 4) * collidePoint;
		let direction = (ball.x < canvas.width / 2) ? 1 : -1;
		ball.dx = direction * ball.speed * Math.cos(angleRad);
		ball.dy = ball.speed * Math.sin(angleRad);
		ball.speed += 0.4;
	}

	resetBall() {
		let ball = this.ball;

		ball.x = this.field.width / 2;
		ball.y = this.field.height / 2;
		ball.speed = 7;
		ball.dx = -ball.dx;
		let magnitude = Math.sqrt(ball.dx*ball.dx + ball.dy*ball.dy);
		ball.dx = ball.speed * ball.dx / magnitude;
		ball.dy = ball.speed * ball.dy / magnitude;
	}

	resetPaddles() {
		this.player1.y = this.field.height / 2 - this.player1.height;
		this.player2.y = this.field.height / 2 - this.player2.height;
	}

	resetLineDrawers() {
		this.lineDrawer1Obj.clear();
		this.lineDrawer2Obj.clear();
	}

	resetGame() {
		this.player1.score = 0;
		this.player2.score = 0;
		this.isGameOver = false;
		this.isPaused = false;
		this.resetBall();
		this.resetPaddles();
	}

	togglePause() {
		this.isPaused = !this.isPaused;
	}
}

class Player {
	#paddle;
	v;
	constructor(p) {
		this.#paddle = p;
		this.v = 0;
	}

	move(v) {
		this.v = v;
	}

	getX() { return this.#paddle.x + this.#paddle.width / 2; }
	getY() { return this.#paddle.y + this.#paddle.height / 2; }
}

class Ball {
	#ball;
	constructor(b) {
		this.#ball = b;
	}
	
	getX() { return this.#ball.x; }
	getY() { return this.#ball.y; }
	getDX() { return this.#ball.dx; }
	getDY() { return this.#ball.dy; }
}

class Field {
	constructor(width, height) {
		this.width = width;
		this.height = height;
	}

	getWidth() { return this.width; }
	getHeight() { return this.height; }
}

// --- AUDIO SYSTEM ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, type, duration) {
	if (audioCtx.state === 'suspended') audioCtx.resume();
	
	const oscillator = audioCtx.createOscillator();
	const gainNode = audioCtx.createGain();

	oscillator.type = type; // 'square' is very retro, 'sine' is smooth
	oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
	
	gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
	gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

	oscillator.connect(gainNode);
	gainNode.connect(audioCtx.destination);

	oscillator.start();
	oscillator.stop(audioCtx.currentTime + duration);
}

function drawLine(ctx, x1, y1, x2, y2, color) {
	ctx.lineWidth = 2;
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

function drawRect(ctx, x, y, w, h, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, w, h);
}

function drawCircle(ctx, x, y, r, color) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.fill();
}


function draw(ctx, game) {
	ctx.save();

	let paddle1 = game.player1;
	let paddle2 = game.player2;
	let ball = game.ball;

	// Scores
	ctx.font = `${game.field.height/10}px Courier New`;
	ctx.fillStyle = "#fff";
	ctx.fillText(paddle1.score, game.field.width / 4, game.field.height/8);
	ctx.fillText(paddle2.score, 3 * game.field.width / 4, game.field.height/8);

	// Net
	for(let i = 0; i <= game.field.height; i+=35) {
		drawRect(ctx, game.field.width/2 - 1, i, 2, 20, "#fff");
	}

	// Paddles and Ball
	drawRect(ctx, paddle1.x, paddle1.y, paddle1.width, paddle1.height, "#fff");
	drawRect(ctx, paddle2.x, paddle2.y, paddle2.width, paddle2.height, "#fff");
	drawCircle(ctx, ball.x, ball.y, ball.radius, "#fff");

	// Player bot lines
	game.lineDrawer1Obj.lines.forEach((line) => {
		drawLine(ctx, line.x1, line.y1, line.x2, line.y2, game.lineDrawer1Obj.color);
	});
	game.lineDrawer2Obj.lines.forEach((line) => {
		drawLine(ctx, line.x1, line.y1, line.x2, line.y2, game.lineDrawer2Obj.color);
	});

	if (game.isGameOver) {
		drawRect(ctx, 0, 0, game.field.width, game.field.height, "rgba(0,0,0,0.7)");
		ctx.fillStyle = "#fff";
		ctx.textAlign = "center";
		ctx.font = `${game.field.height/10}px Courier New`;
		let winner = game.player1.score >= game.winningScore ? game.player1.name : game.player2.name;
		ctx.fillText(winner + " WINS!", game.field.width / 2, game.field.height / 2);
		ctx.font = `${game.field.height/20}px Courier New`;
		ctx.fillText("PRESS ESC TO RESTART", game.field.width / 2, game.field.height / 2 + 50);
		ctx.textAlign = "start";
	}

	if (game.isPaused) {
		drawRect(ctx, 0, 0, game.field.width, game.field.height, "rgba(0,0,0,0.7)");
		ctx.fillStyle = "#fff";
		ctx.textAlign = "center";
		ctx.font = `${game.field.height/10}px Courier New`;
		ctx.fillText("PAUSED", game.field.width / 2, game.field.height / 2);
		ctx.font = `${game.field.height/20}px Courier New`;
		ctx.fillText("PRESS P TO RESUME", game.field.width / 2, game.field.height / 2 + 50);
		ctx.textAlign = "start";
	}

	// undo transformations
	ctx.restore();
}

class LineDrawer {
	constructor(color) {
		this.color = color;
		this.lines = [];
	}

	add(line) {
		this.lines.push(line);
	}
	
	clear() {
		this.lines.length = 0;
	}
}

class Line {
	constructor(x1, y1, x2, y2) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	}
}
