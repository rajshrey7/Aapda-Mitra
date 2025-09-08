// client/src/components/GameCanvas.jsx
// Polished game canvas for Rescue Rush Pro

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const GameCanvas = ({ onScoreUpdate, onGameEnd, gameMode = 'desktop' }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [gameObjects, setGameObjects] = useState([]);
  const [particles, setParticles] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  // Game configuration
  const config = {
    canvas: { width: 800, height: 600 },
    player: { size: 20, speed: 5 },
    target: { size: 15, speed: 2 },
    hazard: { size: 25, speed: 3 },
    powerUp: { size: 20, speed: 1 },
    spawnRate: 0.02,
    hazardSpawnRate: 0.005,
    powerUpSpawnRate: 0.001
  };

  // Game state
  const gameState = useRef({
    player: { x: 400, y: 500, vx: 0, vy: 0 },
    targets: [],
    hazards: [],
    powerUps: [],
    particles: [],
    keys: {},
    mouse: { x: 0, y: 0 },
    lastSpawn: 0,
    lastHazardSpawn: 0,
    lastPowerUpSpawn: 0
  });

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = config.canvas.width;
    canvas.height = config.canvas.height;

    // Event listeners
    const handleKeyDown = (e) => {
      gameState.current.keys[e.code] = true;
    };

    const handleKeyUp = (e) => {
      gameState.current.keys[e.code] = false;
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      gameState.current.mouse.x = e.clientX - rect.left;
      gameState.current.mouse.y = e.clientY - rect.top;
    };

    const handleClick = (e) => {
      if (!gameActive) return;
      
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      checkCollisions(clickX, clickY);
    };

    // Touch events for mobile
    const handleTouchStart = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      
      checkCollisions(touchX, touchY);
    };

    canvas.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      canvas.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouchStart);
    };
  }, [gameActive]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background pattern
    drawBackground(ctx);

    // Update game state
    updatePlayer();
    updateTargets();
    updateHazards();
    updatePowerUps();
    updateParticles();
    spawnObjects();

    // Draw game objects
    drawPlayer(ctx);
    drawTargets(ctx);
    drawHazards(ctx);
    drawPowerUps(ctx);
    drawParticles(ctx);
    drawUI(ctx);

    // Check collisions
    checkHazardCollisions();

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameActive, level, score]);

  // Start game loop
  useEffect(() => {
    if (gameActive) {
      animationRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameActive, gameLoop]);

  // Timer
  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive]);

  // Game functions
  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setTimeLeft(60);
    setLevel(1);
    setCombo(0);
    setMaxCombo(0);
    gameState.current = {
      player: { x: 400, y: 500, vx: 0, vy: 0 },
      targets: [],
      hazards: [],
      powerUps: [],
      particles: [],
      keys: {},
      mouse: { x: 0, y: 0 },
      lastSpawn: 0,
      lastHazardSpawn: 0,
      lastPowerUpSpawn: 0
    };
  };

  const endGame = () => {
    setGameActive(false);
    onGameEnd({
      score,
      timeSpent: 60 - timeLeft,
      level,
      maxCombo,
      accuracy: gameState.current.targets.length > 0 ? 
        (score / gameState.current.targets.length) * 100 : 0
    });
  };

  const updatePlayer = () => {
    const player = gameState.current.player;
    const keys = gameState.current.keys;

    // Keyboard controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.vx = -config.player.speed;
    else if (keys['ArrowRight'] || keys['KeyD']) player.vx = config.player.speed;
    else player.vx = 0;

    if (keys['ArrowUp'] || keys['KeyW']) player.vy = -config.player.speed;
    else if (keys['ArrowDown'] || keys['KeyS']) player.vy = config.player.speed;
    else player.vy = 0;

    // Mouse controls
    if (gameMode === 'desktop') {
      const mouse = gameState.current.mouse;
      const dx = mouse.x - player.x;
      const dy = mouse.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 5) {
        player.vx = (dx / distance) * config.player.speed;
        player.vy = (dy / distance) * config.player.speed;
      }
    }

    // Update position
    player.x += player.vx;
    player.y += player.vy;

    // Keep player in bounds
    player.x = Math.max(config.player.size, Math.min(canvas.width - config.player.size, player.x));
    player.y = Math.max(config.player.size, Math.min(canvas.height - config.player.size, player.y));
  };

  const updateTargets = () => {
    gameState.current.targets.forEach((target, index) => {
      target.y += target.speed;
      target.rotation += 0.1;

      // Remove targets that are off screen
      if (target.y > canvas.height) {
        gameState.current.targets.splice(index, 1);
      }
    });
  };

  const updateHazards = () => {
    gameState.current.hazards.forEach((hazard, index) => {
      hazard.y += hazard.speed;
      hazard.rotation += 0.05;

      // Remove hazards that are off screen
      if (hazard.y > canvas.height) {
        gameState.current.hazards.splice(index, 1);
      }
    });
  };

  const updatePowerUps = () => {
    gameState.current.powerUps.forEach((powerUp, index) => {
      powerUp.y += powerUp.speed;
      powerUp.rotation += 0.08;

      // Remove power-ups that are off screen
      if (powerUp.y > canvas.height) {
        gameState.current.powerUps.splice(index, 1);
      }
    });
  };

  const updateParticles = () => {
    gameState.current.particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;

      if (particle.life <= 0) {
        gameState.current.particles.splice(index, 1);
      }
    });
  };

  const spawnObjects = () => {
    const now = Date.now();
    const spawnRate = config.spawnRate * (1 + level * 0.1);

    // Spawn targets
    if (now - gameState.current.lastSpawn > 1000 / spawnRate) {
      spawnTarget();
      gameState.current.lastSpawn = now;
    }

    // Spawn hazards
    if (now - gameState.current.lastHazardSpawn > 1000 / config.hazardSpawnRate) {
      spawnHazard();
      gameState.current.lastHazardSpawn = now;
    }

    // Spawn power-ups
    if (now - gameState.current.lastPowerUpSpawn > 1000 / config.powerUpSpawnRate) {
      spawnPowerUp();
      gameState.current.lastPowerUpSpawn = now;
    }
  };

  const spawnTarget = () => {
    const target = {
      x: Math.random() * (canvas.width - config.target.size),
      y: -config.target.size,
      size: config.target.size,
      speed: config.target.speed + Math.random() * 2,
      rotation: 0,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      points: 10
    };
    gameState.current.targets.push(target);
  };

  const spawnHazard = () => {
    const hazard = {
      x: Math.random() * (canvas.width - config.hazard.size),
      y: -config.hazard.size,
      size: config.hazard.size,
      speed: config.hazard.speed + Math.random() * 2,
      rotation: 0,
      color: '#ff4444'
    };
    gameState.current.hazards.push(hazard);
  };

  const spawnPowerUp = () => {
    const powerUp = {
      x: Math.random() * (canvas.width - config.powerUp.size),
      y: -config.powerUp.size,
      size: config.powerUp.size,
      speed: config.powerUp.speed,
      rotation: 0,
      color: '#44ff44',
      type: Math.random() > 0.5 ? 'multiplier' : 'time'
    };
    gameState.current.powerUps.push(powerUp);
  };

  const checkCollisions = (x, y) => {
    const player = gameState.current.player;
    const distance = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);

    if (distance <= config.player.size) {
      // Check target collisions
      gameState.current.targets.forEach((target, index) => {
        const targetDistance = Math.sqrt((x - target.x) ** 2 + (y - target.y) ** 2);
        if (targetDistance <= target.size + config.player.size) {
          hitTarget(target, index);
        }
      });

      // Check power-up collisions
      gameState.current.powerUps.forEach((powerUp, index) => {
        const powerUpDistance = Math.sqrt((x - powerUp.x) ** 2 + (y - powerUp.y) ** 2);
        if (powerUpDistance <= powerUp.size + config.player.size) {
          collectPowerUp(powerUp, index);
        }
      });
    }
  };

  const hitTarget = (target, index) => {
    // Remove target
    gameState.current.targets.splice(index, 1);

    // Update score
    const points = target.points * (1 + combo * 0.1);
    setScore(prev => prev + Math.floor(points));
    setCombo(prev => {
      const newCombo = prev + 1;
      setMaxCombo(prevMax => Math.max(prevMax, newCombo));
      return newCombo;
    });

    // Create particles
    createParticles(target.x, target.y, target.color);

    // Check level up
    if (score > 0 && score % 500 === 0) {
      setLevel(prev => prev + 1);
    }

    // Notify parent
    onScoreUpdate(score + Math.floor(points));
  };

  const collectPowerUp = (powerUp, index) => {
    // Remove power-up
    gameState.current.powerUps.splice(index, 1);

    // Apply effect
    if (powerUp.type === 'multiplier') {
      setCombo(prev => prev + 2);
    } else if (powerUp.type === 'time') {
      setTimeLeft(prev => Math.min(60, prev + 5));
    }

    // Create particles
    createParticles(powerUp.x, powerUp.y, powerUp.color);
  };

  const checkHazardCollisions = () => {
    const player = gameState.current.player;
    
    gameState.current.hazards.forEach((hazard, index) => {
      const distance = Math.sqrt((player.x - hazard.x) ** 2 + (player.y - hazard.y) ** 2);
      if (distance <= hazard.size + config.player.size) {
        // Hit by hazard
        setCombo(0);
        createParticles(hazard.x, hazard.y, hazard.color);
        gameState.current.hazards.splice(index, 1);
      }
    });
  };

  const createParticles = (x, y, color) => {
    for (let i = 0; i < 8; i++) {
      const particle = {
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        color,
        life: 30
      };
      gameState.current.particles.push(particle);
    }
  };

  // Drawing functions
  const drawBackground = (ctx) => {
    // Draw grid pattern
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  const drawPlayer = (ctx) => {
    const player = gameState.current.player;
    
    // Draw player ship
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(Math.atan2(player.vy, player.vx));
    
    // Ship body
    ctx.fillStyle = '#4ecdc4';
    ctx.beginPath();
    ctx.moveTo(0, -config.player.size);
    ctx.lineTo(-config.player.size/2, config.player.size/2);
    ctx.lineTo(0, config.player.size/4);
    ctx.lineTo(config.player.size/2, config.player.size/2);
    ctx.closePath();
    ctx.fill();
    
    // Ship outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
  };

  const drawTargets = (ctx) => {
    gameState.current.targets.forEach(target => {
      ctx.save();
      ctx.translate(target.x + target.size/2, target.y + target.size/2);
      ctx.rotate(target.rotation);
      
      ctx.fillStyle = target.color;
      ctx.beginPath();
      ctx.arc(0, 0, target.size/2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.restore();
    });
  };

  const drawHazards = (ctx) => {
    gameState.current.hazards.forEach(hazard => {
      ctx.save();
      ctx.translate(hazard.x + hazard.size/2, hazard.y + hazard.size/2);
      ctx.rotate(hazard.rotation);
      
      ctx.fillStyle = hazard.color;
      ctx.beginPath();
      ctx.moveTo(0, -hazard.size/2);
      ctx.lineTo(-hazard.size/2, hazard.size/2);
      ctx.lineTo(0, 0);
      ctx.lineTo(hazard.size/2, hazard.size/2);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    });
  };

  const drawPowerUps = (ctx) => {
    gameState.current.powerUps.forEach(powerUp => {
      ctx.save();
      ctx.translate(powerUp.x + powerUp.size/2, powerUp.y + powerUp.size/2);
      ctx.rotate(powerUp.rotation);
      
      ctx.fillStyle = powerUp.color;
      ctx.beginPath();
      ctx.arc(0, 0, powerUp.size/2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw symbol
      ctx.fillStyle = '#000000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(powerUp.type === 'multiplier' ? 'x' : 'T', 0, 4);
      
      ctx.restore();
    });
  };

  const drawParticles = (ctx) => {
    gameState.current.particles.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.life / 30;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  };

  const drawUI = (ctx) => {
    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 20, 40);
    
    // Time
    ctx.fillText(`Time: ${timeLeft}`, 20, 70);
    
    // Level
    ctx.fillText(`Level: ${level}`, 20, 100);
    
    // Combo
    if (combo > 0) {
      ctx.fillStyle = '#ff6b6b';
      ctx.font = '20px Arial';
      ctx.fillText(`Combo: ${combo}x`, 20, 130);
    }
  };

  return (
    <div className="game-canvas-container">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        style={{
          border: '2px solid #4ecdc4',
          borderRadius: '10px',
          cursor: gameActive ? 'crosshair' : 'default',
          touchAction: 'none'
        }}
        tabIndex={0}
      />
      
      {!gameActive && (
        <div className="game-overlay">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="game-controls"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Rescue Rush Pro</h2>
            <p className="text-gray-300 mb-6">
              Click on targets to score points!<br/>
              Avoid hazards and collect power-ups!
            </p>
            <button
              onClick={startGame}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Start Game
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
