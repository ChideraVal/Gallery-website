class GameState {
  constructor() {
    this.defaults = {
      coins: 0,
      lives: 5,
      maxLives: 5,
      adsWatched: 0,
      lastLifeTime: Date.now()
    };
    this.data = this.load();
    this.refillInterval = 30 * 60 * 1000; // 30 mins per life
    this.checkLifeRefill();
  }

  // Load from localStorage or set defaults
  load() {
    const saved = localStorage.getItem("tileGameState");
    return saved ? JSON.parse(saved) : { ...this.defaults };
  }

  // Save back to localStorage
  save() {
    localStorage.setItem("tileGameState", JSON.stringify(this.data));
  }

  // Getters
  get coins() { return this.data.coins; }
  get lives() { return this.data.lives; }
  get adsWatched() { return this.data.adsWatched; }

  // Increment/decrement helpers
  addCoins(amount) {
    this.data.coins += amount;
    this.save();
  }

  useCoins(amount) {
    if (this.data.coins >= amount) {
      this.data.coins -= amount;
      this.save();
      return true;
    }
    return false;
  }

  loseLife() {
    if (this.data.lives > 0) {
      this.data.lives--;
      this.data.lastLifeTime = Date.now(); // start refill timer if needed
      this.save();
      return true;
    }
    return false;
  }

  addLife() {
    if (this.data.lives < this.data.maxLives) {
      this.data.lives++;
      this.data.lastLifeTime = Date.now();
      this.save();
    }
  }

  watchAd() {
    this.data.adsWatched++;
    this.save();
  }

  // Refill logic
  checkLifeRefill() {
    const now = Date.now();
    const { lives, maxLives, lastLifeTime } = this.data;
    if (lives >= maxLives) return;

    const elapsed = now - lastLifeTime;
    const livesToAdd = Math.floor(elapsed / this.refillInterval);
    if (livesToAdd > 0) {
      this.data.lives = Math.min(maxLives, lives + livesToAdd);
      this.data.lastLifeTime = now;
      this.save();
    }
  }

  // Remaining time until next life
  getTimeUntilNextLife() {
    if (this.data.lives >= this.data.maxLives) return 0;
    const elapsed = Date.now() - this.data.lastLifeTime;
    return Math.max(0, this.refillInterval - elapsed);
  }

  reset() {
    this.data = { ...this.defaults };
    this.save();
  }
}


const game = new GameState();

console.log("Coins:", game.coins);
console.log("Lives:", game.lives);
console.log("Ads watched:", game.adsWatched);

game.addCoins(3)

