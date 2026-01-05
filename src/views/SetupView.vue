<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/game';
import SettingsModal from '@/components/SettingsModal.vue';
import HowToPlayModal from '@/components/HowToPlayModal.vue';

const router = useRouter();
const gameStore = useGameStore();

const team1 = ref('');
const team2 = ref('');
const isSettingsOpen = ref(false);
const isHowToPlayOpen = ref(false);

const canStart = computed(() => {
  return (
    team1.value.trim().length > 0 && team2.value.trim().length > 0 && team1.value !== team2.value
  );
});

const hasActiveGame = computed(() => {
  return gameStore.gameState !== 'intro';
});

function handleResumeGame() {
  router.push({ name: 'game' });
}

function handleNewGame() {
  if (confirm('Are you sure you want to start a new game?')) {
    gameStore.resetGame();
    team1.value = '';
    team2.value = '';
  }
}

function handleStartGame() {
  if (canStart.value) {
    gameStore.setTeamNames(team1.value, team2.value);
    router.push({ name: 'game' });
    gameStore.startGame();
  }
}
</script>

<template>
  <div class="setup-container">
    <header>
      <h1>Backwards Pantomime</h1>
      <div class="header-buttons">
        <button @click="isHowToPlayOpen = true" class="icon-btn help-btn">
          <span class="icon">❓</span>
          <span class="label">How to Play</span>
        </button>
        <button v-if="!hasActiveGame" @click="isSettingsOpen = true" class="icon-btn settings-btn">
          <span class="icon">⚙️</span>
          <span class="label">Settings</span>
        </button>
      </div>
    </header>

    <main v-if="hasActiveGame" class="active-game-prompt">
      <div class="matchup-preview">
        <h2>Game in Progress</h2>
        <p class="teams">{{ gameStore.team1Name }} vs {{ gameStore.team2Name }}</p>
        <p class="score">{{ gameStore.team1Score }} - {{ gameStore.team2Score }}</p>
      </div>
      <div class="action-buttons">
        <button @click="handleResumeGame" class="btn btn-pill btn-primary">Resume Game</button>
        <button @click="handleNewGame" class="btn btn-pill btn-danger">New Game</button>
      </div>
    </main>

    <main v-else>
      <div class="team-input-group">
        <div class="input-wrapper">
          <label for="team1">Team 1 Name</label>
          <input
            id="team1"
            v-model="team1"
            placeholder="Enter name for Team 1"
            autocomplete="off"
          />
        </div>

        <div class="input-wrapper">
          <label for="team2">Team 2 Name</label>
          <input
            id="team2"
            v-model="team2"
            placeholder="Enter name for Team 2"
            autocomplete="off"
          />
        </div>
      </div>

      <button @click="handleStartGame" :disabled="!canStart" class="btn btn-pill btn-primary">
        Start Game
      </button>
    </main>

    <SettingsModal :is-open="isSettingsOpen" @close="isSettingsOpen = false" />
    <HowToPlayModal :is-open="isHowToPlayOpen" @close="isHowToPlayOpen = false" />
  </div>
</template>

<style scoped>
.setup-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 3rem;
  gap: 1rem;
}

h1 {
  font-size: 3rem;
  color: #2c3e50;
  margin: 0;
}

.header-buttons {
  display: flex;
  gap: 1rem;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition:
    background-color 0.2s,
    transform 0.1s;
  width: auto;
  height: auto;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  color: #555;
  font-weight: bold;
}

.icon-btn:hover {
  background-color: #f0f0f0;
  transform: scale(1.05);
}

.icon-btn:active {
  transform: scale(0.98);
}

.icon {
  font-size: 1.5rem;
  line-height: 1;
}

.label {
  font-size: 1rem;
}

.team-input-group {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

label {
  font-weight: bold;
  color: #555;
}

input {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

input:focus {
  border-color: #4caf50;
  outline: none;
}

.active-game-prompt {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
}

.matchup-preview {
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
}

.matchup-preview h2 {
  color: #4caf50;
  margin-top: 0;
}

.teams {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1rem 0;
}

.score {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
}
</style>
