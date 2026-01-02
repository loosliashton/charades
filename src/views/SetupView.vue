<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import SettingsModal from '@/components/SettingsModal.vue'

const router = useRouter()
const gameStore = useGameStore()

const team1 = ref('')
const team2 = ref('')
const isSettingsOpen = ref(false)

const canStart = computed(() => {
  return team1.value.trim().length > 0 && team2.value.trim().length > 0
})

function handleStartGame() {
  if (canStart.value) {
    gameStore.setTeamNames(team1.value, team2.value)
    gameStore.startGame()
    router.push({ name: 'game' })
  }
}
</script>

<template>
  <div class="setup-container">
    <header>
      <h1>Charades</h1>
      <button @click="isSettingsOpen = true" class="settings-btn">⚙️ Settings</button>
    </header>

    <main>
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

      <button @click="handleStartGame" :disabled="!canStart" class="start-btn">Start Game</button>
    </main>

    <SettingsModal :is-open="isSettingsOpen" @close="isSettingsOpen = false" />
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
  justify-content: center;
  align-items: center;
  margin-bottom: 3rem;
}

h1 {
  font-size: 3rem;
  color: #2c3e50;
  margin: 0;
}

.settings-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.settings-btn:hover {
  background-color: #f0f0f0;
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
}

input:focus {
  border-color: #4caf50;
  outline: none;
}

.start-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 1rem 3rem;
  font-size: 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  transition:
    transform 0.1s,
    opacity 0.2s;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(76, 175, 80, 0.3);
}

.start-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  background-color: #45a049;
}

.start-btn:active:not(:disabled) {
  transform: translateY(0);
}
</style>
