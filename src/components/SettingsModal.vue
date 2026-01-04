<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useGameStore } from '@/stores/game';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const gameStore = useGameStore();

const duration = ref(gameStore.roundDuration);
const difficulty = ref(gameStore.difficulty);

const difficulties = ['Easy', 'Medium', 'Hard'];
const difficultyIndex = computed({
  get: () => difficulties.indexOf(difficulty.value),
  set: (val) => {
    difficulty.value = difficulties[val] || 'Medium';
  },
});

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      duration.value = gameStore.roundDuration;
      difficulty.value = gameStore.difficulty;
    }
  },
);

function saveSettings() {
  gameStore.setSettings(duration.value, difficulty.value);
  emit('close');
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <h2>Settings</h2>

      <div class="setting-group">
        <label for="duration">Round Duration (seconds): {{ duration }}</label>
        <input id="duration" type="range" v-model.number="duration" min="30" max="120" step="30" />
      </div>

      <div class="setting-group">
        <label for="difficulty">Difficulty: {{ difficulty }}</label>
        <input
          id="difficulty"
          type="range"
          v-model.number="difficultyIndex"
          min="0"
          max="2"
          step="1"
        />
      </div>

      <div class="setting-group">
        <label for="freeSkips">Free Skips: {{ gameStore.freeSkips }}</label>
        <input
          id="freeSkips"
          type="range"
          v-model.number="gameStore.freeSkips"
          min="0"
          max="2"
          step="1"
        />
      </div>

      <div class="modal-actions">
        <button @click="$emit('close')" class="cancel-btn">Cancel</button>
        <button @click="saveSettings" class="save-btn">Save</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.setting-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-weight: bold;
}

.save-btn {
  background-color: #4caf50;
  color: white;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #333;
}
</style>
