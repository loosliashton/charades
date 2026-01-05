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
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <header class="modal-header">
        <h2>Settings</h2>
        <button class="btn-close" @click="$emit('close')">&times;</button>
      </header>

      <div class="modal-body">
        <div class="setting-group">
          <label for="duration">Round Duration (seconds): {{ duration }}</label>
          <input
            id="duration"
            type="range"
            v-model.number="duration"
            min="30"
            max="120"
            step="30"
          />
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
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-pill btn-secondary">Cancel</button>
        <button @click="saveSettings" class="btn btn-pill btn-primary">Save</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.setting-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
