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

// Visual feedback system
interface Feedback {
  id: number;
  text: string;
  type: 'correct' | 'skip' | 'penalty';
  x: number;
  y: number;
}
const feedbacks = ref<Feedback[]>([]);
let feedbackIdCounter = 0;

function addFeedback(x: number, y: number, text: string, type: 'correct' | 'skip' | 'penalty') {
  const id = feedbackIdCounter++;
  feedbacks.value.push({ id, text, type, x, y });

  // Remove feedback after animation (1s)
  setTimeout(() => {
    feedbacks.value = feedbacks.value.filter((f) => f.id !== id);
  }, 1000);
}

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
  gameStore.words = rawWords.split('\n').sort(() => Math.random() - 0.5);
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
    gameStore.resetRoundStats();
  }

  totalRoundTime.value = gameStore.roundDuration;
  roundTime.value = (Date.now() - gameStore.roundStartTime) / 1000;

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

function postRound() {
  gameStore.gameState = 'postRound';
}

function quitGame() {
  const isSure = confirm('Are you sure you want to quit the game?');
  if (!isSure) return;
  gameStore.resetGame();
  router.push('/');
}

function skipWord(event: MouseEvent) {
  let text = 'Skip';
  let type: 'skip' | 'penalty' = 'skip';

  if (gameStore.currentSkips < gameStore.freeSkips) {
    gameStore.currentSkips++;
  } else {
    gameStore.decrementTeamScore(gameStore.currentTeam());
    text = '-1';
    type = 'penalty';
  }

  addFeedback(event.clientX, event.clientY, text, type);

  const word = gameStore.words[gameStore.wordIndex] || 'Unknown';
  gameStore.addWordResult(word, 'skipped');
  gameStore.wordIndex++;
}

function correctWord(event: MouseEvent) {
  addFeedback(event.clientX, event.clientY, 'Got it!', 'correct');

  gameStore.incrementTeamScore(gameStore.currentTeam());
  const word = gameStore.words[gameStore.wordIndex] || 'Unknown';
  gameStore.addWordResult(word, 'correct');
  gameStore.wordIndex++;
}

const showDetails = ref(false);
const activeTeamForDetails = ref('');

function showScoreDetails(teamName: string) {
  if (teamName === gameStore.currentTeam()) {
    activeTeamForDetails.value = teamName;
    showDetails.value = true;
  }
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

onUnmounted(() => {
  if (roundTimer) clearInterval(roundTimer);
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
      <button @click="router.push('/')" class="btn btn-pill btn-secondary">Back to Setup</button>
      <button @click="nextRound()" class="btn btn-pill btn-primary">Start Round</button>
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

    <!-- Feedback Elements -->
    <div
      v-for="feedback in feedbacks"
      :key="feedback.id"
      class="feedback-item"
      :class="feedback.type"
      :style="{ left: feedback.x + 'px', top: feedback.y + 'px' }"
    >
      {{ feedback.text }}
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
          <p
            class="score"
            :class="{ clickable: gameStore.currentTeam() === gameStore.team1Name }"
            @click="showScoreDetails(gameStore.team1Name)"
          >
            {{ gameStore.team1Score }}
          </p>
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
          <p
            class="score"
            :class="{ clickable: gameStore.currentTeam() === gameStore.team2Name }"
            @click="showScoreDetails(gameStore.team2Name)"
          >
            {{ gameStore.team2Score }}
          </p>
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
      <button @click="quitGame()" class="btn btn-pill btn-danger">New Game</button>
      <button @click="nextRound()" class="btn btn-pill btn-primary">Next Round</button>
    </div>
  </div>

  <div v-if="showDetails" class="details-overlay" @click.self="showDetails = false">
    <div class="details-modal">
      <h2>Round Details</h2>
      <div class="words-list">
        <div
          v-for="(result, index) in gameStore.lastRoundWords"
          :key="index"
          class="word-item"
          :class="result.status"
        >
          <span class="word-text">{{ result.word }}</span>
          <span class="status-icon">
            <span v-if="result.status === 'correct'">✓</span>
            <span v-else>—</span>
          </span>
        </div>
      </div>
      <button class="close-btn" @click="showDetails = false">Close</button>
    </div>
  </div>
</template>

<style scoped>
.feedback-item {
  position: fixed;
  pointer-events: none;
  font-size: 2.5rem;
  font-weight: bold;
  transform: translate(-50%, -50%);
  z-index: 100;
  animation: floatUp 1s ease-out forwards;
}

.feedback-item.correct {
  color: #4caf50;
  text-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.feedback-item.skip {
  color: #ff9800; /* Orange for skip */
  text-shadow: 0 0 10px rgba(255, 152, 0, 0.5);
}

.feedback-item.penalty {
  color: #f44336; /* Red for penalty */
  text-shadow: 0 0 10px rgba(244, 67, 54, 0.5);
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -150%) scale(1.5);
  }
}

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
  width: 48px;
  height: 48px;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #333;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.adjust-btn:hover {
  background: #e0e0e0;
}

.score.clickable {
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 8px;
}

.details-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  backdrop-filter: blur(4px);
}

.details-modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.details-modal h2 {
  margin: 0 0 1.5rem;
  color: #333;
}

.words-list {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.word-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 1.2rem;
}

.word-item.correct {
  background: #e6f4ea;
  color: #1e8e3e;
}

.word-item.skipped {
  background: #fce8e6;
  color: #d93025;
}

.word-text {
  font-weight: 500;
}

.status-icon {
  font-weight: bold;
}

.close-btn {
  background: #333;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  font-weight: bold;
}

.close-btn:hover {
  background: #555;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.close-btn:active {
  transform: translateY(0);
}
</style>
