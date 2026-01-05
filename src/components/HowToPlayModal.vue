<script setup lang="ts">
import { watch } from 'vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

// Prevent body scroll when modal is open
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  },
);
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <header class="modal-header">
        <h2>How to Play</h2>
        <button class="btn-close" @click="$emit('close')">&times;</button>
      </header>

      <div class="modal-body">
        <section class="rules-section">
          <h3>The Rules</h3>
          <ul>
            <li><strong>Teams:</strong> Split into two teams.</li>
            <li>
              <strong>Act:</strong> One person guesses while the <em>rest of the team</em> acts out
              the word.
            </li>
            <li><strong>Time:</strong> Guess as many words as you can before time runs out!</li>
          </ul>
        </section>

        <section class="controls-section">
          <h3>Controls</h3>
          <p>Hold the device sideways (landscape).</p>
          <div class="phone-visual">
            <div class="screen-area left">
              <span class="icon">❌</span>
              <span class="label">Tap left side<br />to <strong>SKIP</strong></span>
            </div>
            <div class="screen-area right">
              <span class="icon">✅</span>
              <span class="label">Tap right side<br />for <strong>NEXT WORD</strong></span>
            </div>
          </div>
        </section>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-pill btn-primary">Let's Play!</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
h3 {
  color: #4caf50;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

ul {
  padding-left: 1.2rem;
  margin: 0;
  color: #444;
  text-align: left;
}

li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.controls-section {
  margin-top: 2rem;
}

.phone-visual {
  display: flex;
  height: 180px;
  border: 8px solid #333;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.screen-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 1rem;
  color: white;
  transition: opacity 0.2s;
}

.screen-area.left {
  background: linear-gradient(135deg, #ff6b6b, #ee5253);
  border-right: 2px solid rgba(255, 255, 255, 0.3);
}

.screen-area.right {
  background: linear-gradient(135deg, #4caf50, #20bf6b);
}

.icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.label {
  font-weight: 500;
  line-height: 1.4;
  font-size: 0.9rem;
}
</style>
