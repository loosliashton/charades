<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import easyWords from '@/assets/easy_words.txt?raw';
import mediumWords from '@/assets/medium_words.txt?raw';
import hardWords from '@/assets/hard_words.txt?raw';

const gameStore = useGameStore();
const router = useRouter();

const countdown = ref(0);

// Redirect if no current game
if (!gameStore.isGameStarted) {
  router.push('/');
}

// Load words based on difficulty
loadWords();

function loadWords() {
  const rawWords: string =
    gameStore.difficulty === 'Easy'
      ? easyWords
      : gameStore.difficulty === 'Medium'
        ? mediumWords
        : hardWords;
  gameStore.words = rawWords.split('\r\n');
  // Shuffle words
  gameStore.words.sort(() => Math.random() - 0.5);
}

function nextRound() {
  // Prompt user to rotate phone if not in landscape
  if (window.innerHeight > window.innerWidth) {
    alert('Please rotate your phone to landscape mode');
    return;
  }

  countdown.value = 3;
  let timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      gameStore.incrementTeamRoundsPlayed(gameStore.nextTeam());
    }
  }, 1000);

  countdown.value = gameStore.roundDuration;
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      gameStore.incrementTeamRoundsPlayed(gameStore.nextTeam());
    }
  }, 1000);
}

function skipWord() {
  gameStore.wordIndex++;
}

function correctWord() {
  gameStore.incrementTeamScore(gameStore.currentTeam());
  gameStore.wordIndex++;
}
</script>

<template>
  <div v-if="countdown > 0" class="countdown-overlay">
    <div class="countdown-number">{{ countdown }}</div>
  </div>

  <div
    v-else-if="gameStore.team1RoundsPlayed === 0 && gameStore.team2RoundsPlayed === 0"
    class="pre-game-container"
  >
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
    </div>

    <div class="buttons">
      <button @click="router.push('/')" class="back-btn">Back to Setup</button>
      <button @click="nextRound()" class="round-start-btn">Start Round</button>
    </div>
  </div>

  <div v-else class="game-container">
    <div class="skip-btn" @click="skipWord"></div>
    <div class="correct-btn" @click="correctWord"></div>
    <h3>{{ gameStore.currentTeam() }}</h3>
    <div class="word">
      <h1>{{ gameStore.words[gameStore.wordIndex] }}</h1>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  width: 100vw;
  text-align: center;
  padding: 2rem;
  box-sizing: border-box;
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
</style>
