<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { useRouter } from 'vue-router'

const gameStore = useGameStore()
const router = useRouter()

// Redirect if game hasn't started (e.g. direct URL access)
</script>

<template>
  <div class="game-container">
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

    <button @click="router.push('/')" class="back-btn">Back to Setup</button>
  </div>
</template>

<style scoped>
.game-container {
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
</style>
