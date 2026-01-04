<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import { ref, computed, onUnmounted, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import easyWords from '@/assets/easy_words.txt?raw';
import mediumWords from '@/assets/medium_words.txt?raw';
import hardWords from '@/assets/hard_words.txt?raw';

const gameStore = useGameStore();
const router = useRouter();

const countdown = ref(0);
const roundTime = ref(0);
const totalRoundTime = ref(0);
let roundTimer: number | undefined;
let currentSkips = ref(0);

// Load words based on difficulty
if (gameStore.words.length === 0) {
  loadWords();
}

function loadWords() {
  const rawWords: string =
    gameStore.difficulty === 'Easy'
      ? easyWords
      : gameStore.difficulty === 'Medium'
        ? mediumWords
        : hardWords;
  gameStore.words = rawWords.split('\r\n').sort(() => Math.random() - 0.5);
}

function nextRound() {
  // Prompt user to rotate phone if not in landscape
  if (window.innerHeight > window.innerWidth) {
    alert('Please rotate your phone to landscape mode');
    return;
  }

  gameStore.gameState = 'countdown';
  startCountdown();
}

function startCountdown() {
  countdown.value = 3;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      startRound();
    }
  }, 1000);
}

function startRound() {
  gameStore.gameState = 'round';
  // If we don't have a start time (new round), set it.
  // If we do (resuming), keep it.
  if (!gameStore.roundStartTime) {
    gameStore.incrementTeamRoundsPlayed(gameStore.nextTeam());
    gameStore.roundStartTime = Date.now();
  }

  totalRoundTime.value = gameStore.roundDuration;
  roundTime.value = (Date.now() - gameStore.roundStartTime) / 1000;
  currentSkips.value = 0;

  if (roundTimer) clearInterval(roundTimer);
  roundTimer = setInterval(() => {
    if (!gameStore.roundStartTime) return;
    const elapsed = (Date.now() - gameStore.roundStartTime) / 1000;
    roundTime.value = elapsed;

    if (roundTime.value >= totalRoundTime.value) {
      clearInterval(roundTimer);
      gameStore.roundStartTime = null; // Reset for next round
      gameStore.wordIndex++; // Move to next word
      postRound();
    }
  }, 100);
}

onUnmounted(() => {
  if (roundTimer) clearInterval(roundTimer);
});

function postRound() {
  gameStore.gameState = 'postRound';
}

function quitGame() {
  const isSure = confirm('Are you sure you want to quit the game?');
  if (!isSure) return;
  gameStore.resetGame();
  router.push('/');
}

function skipWord() {
  if (currentSkips.value < gameStore.freeSkips) {
    currentSkips.value++;
  } else {
    gameStore.decrementTeamScore(gameStore.currentTeam());
  }
  gameStore.wordIndex++;
}

function correctWord() {
  gameStore.incrementTeamScore(gameStore.currentTeam());
  gameStore.wordIndex++;
}

const progressWidth = computed(() => {
  if (totalRoundTime.value === 0) return 0;
  return Math.min((roundTime.value / totalRoundTime.value) * 100, 100);
});

onMounted(() => {
  if (gameStore.gameState === 'round') {
    startRound();
  } else if (gameStore.gameState === 'countdown') {
    startCountdown();
  }
});
</script>

<template>
  <div v-if="gameStore.gameState === 'intro'" class="pre-game-container">
    <h1>Game On!</h1>
    <div class="matchup">
      <div class="team">
        <h2>{{ gameStore.team1Name }}</h2>
      </div>
      <div class="vs">VS</div>
      <div class="team">
        <h2>{{ gameStore.team2Name }}</h2>
      </div>
    </div>

    <div class="info">
      <p>Duration: {{ gameStore.roundDuration }}s</p>
      <p>Difficulty: {{ gameStore.difficulty }}</p>
      <p>Free Skips: {{ gameStore.freeSkips }}</p>
    </div>

    <div class="buttons">
      <button @click="router.push('/')" class="back-btn">Back to Setup</button>
      <button @click="nextRound()" class="round-start-btn">Start Round</button>
    </div>
  </div>

  <div v-else-if="gameStore.gameState === 'countdown'" class="countdown-overlay">
    <div class="countdown-number">{{ countdown }}</div>
  </div>

  <div v-else-if="gameStore.gameState === 'round'" class="game-container">
    <div class="progress-bar" :style="{ width: progressWidth + '%' }"></div>
    <div class="game-content">
      <h3>{{ gameStore.currentTeam() }}</h3>
      <div class="word">
        <h1>{{ gameStore.words[gameStore.wordIndex] }}</h1>
      </div>
    </div>

    <div class="skip-btn" @click="skipWord"></div>
    <div class="correct-btn" @click="correctWord"></div>
  </div>

  <div v-else-if="gameStore.gameState === 'postRound'" class="post-round-container">
    <h1>Round Over</h1>
    <div class="matchup">
      <div class="team">
        <h2>{{ gameStore.team1Name }}</h2>
        <div class="score-container">
          <button
            v-if="gameStore.currentTeam() === gameStore.team1Name"
            class="adjust-btn"
            @click="gameStore.decrementTeamScore(gameStore.team1Name)"
          >
            -
          </button>
          <p class="score">{{ gameStore.team1Score }}</p>
          <button
            v-if="gameStore.currentTeam() === gameStore.team1Name"
            class="adjust-btn"
            @click="gameStore.incrementTeamScore(gameStore.team1Name)"
          >
            +
          </button>
        </div>
        <p class="rounds-played">Rounds: {{ gameStore.team1RoundsPlayed }}</p>
      </div>
      <div class="vs">VS</div>
      <div class="team">
        <h2>{{ gameStore.team2Name }}</h2>
        <div class="score-container">
          <button
            v-if="gameStore.currentTeam() === gameStore.team2Name"
            class="adjust-btn"
            @click="gameStore.decrementTeamScore(gameStore.team2Name)"
          >
            -
          </button>
          <p class="score">{{ gameStore.team2Score }}</p>
          <button
            v-if="gameStore.currentTeam() === gameStore.team2Name"
            class="adjust-btn"
            @click="gameStore.incrementTeamScore(gameStore.team2Name)"
          >
            +
          </button>
        </div>
        <p class="rounds-played">Rounds: {{ gameStore.team2RoundsPlayed }}</p>
      </div>
    </div>
    <div class="buttons">
      <button @click="quitGame()" class="new-game-btn">New Game</button>
      <button @click="nextRound()" class="round-start-btn">Next Round</button>
    </div>
  </div>
</template>

<style scoped>
.skip-btn {
  position: fixed;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  z-index: 5;
  cursor: pointer;
}

.correct-btn {
  position: fixed;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  z-index: 5;
  cursor: pointer;
}

.countdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.countdown-number {
  font-size: 10rem;
  color: white;
  font-weight: bold;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.game-container {
  position: relative;
  height: 100vh;
  width: 100vw;
  background-color: white;
  overflow: hidden;
  isolation: isolate;
}

.progress-bar {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: black;
  z-index: 1;
  transition: width 0.1s linear;
}

.game-content {
  position: relative;
  z-index: 2;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
  box-sizing: border-box;
  color: white;
  mix-blend-mode: difference;
}

.word {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.word h1 {
  font-size: 8rem;
  margin: 1rem 0;
  line-height: 1.2;
}

.pre-game-container {
  text-align: center;
  padding: 2rem;
}

.matchup {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin: 3rem 0;
  font-size: 1.5rem;
}

.vs {
  font-weight: bold;
  color: #888;
  font-size: 1.2rem;
}

.team h2 {
  color: #4caf50;
  margin: 0;
}

.info {
  margin-bottom: 3rem;
  color: #666;
}

.back-btn {
  background: none;
  border: 2px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.round-start-btn {
  background-color: #4caf50;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.post-round-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  text-align: center;
  background-color: white;
}

.score {
  font-size: 4rem;
  font-weight: bold;
  margin: 0;
  line-height: 1;
}

.rounds-played {
  font-size: 1.2rem;
  color: #666;
  margin-top: 0.5rem;
}

.score-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.adjust-btn {
  background: #f0f0f0;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #333;
  transition: background-color 0.2s;
}

.adjust-btn:hover {
  background: #e0e0e0;
}

.new-game-btn {
  background: none;
  border: 2px solid #ff4444; /* Red border for destructive action */
  color: #ff4444;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.new-game-btn:hover {
  background: #ff4444;
  color: white;
}
</style>
