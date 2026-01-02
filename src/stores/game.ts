import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useGameStore = defineStore('game', () => {
  const team1Name = ref('')
  const team2Name = ref('')
  const team1Score = ref(0)
  const team2Score = ref(0)
  const roundDuration = ref(60) // seconds
  const difficulty = ref('Medium') // 'Easy', 'Medium', 'Hard'
  const isGameStarted = ref(false)

  // Load state from localStorage on initialization
  const savedState = localStorage.getItem('charades_game_state')
  if (savedState) {
    const parsed = JSON.parse(savedState)
    team1Name.value = parsed.team1Name
    team2Name.value = parsed.team2Name
    team1Score.value = parsed.team1Score
    team2Score.value = parsed.team2Score
    roundDuration.value = parsed.roundDuration
    difficulty.value = parsed.difficulty
    isGameStarted.value = parsed.isGameStarted
  }

  // Watch for changes and save to localStorage
  watch(
    [team1Name, team2Name, team1Score, team2Score, roundDuration, difficulty, isGameStarted],
    () => {
      const stateToSave = {
        team1Name: team1Name.value,
        team2Name: team2Name.value,
        team1Score: team1Score.value,
        team2Score: team2Score.value,
        roundDuration: roundDuration.value,
        difficulty: difficulty.value,
        isGameStarted: isGameStarted.value,
      }
      localStorage.setItem('charades_game_state', JSON.stringify(stateToSave))
    },
    { deep: true },
  )

  function setTeamNames(t1: string, t2: string) {
    team1Name.value = t1
    team2Name.value = t2
  }

  function setSettings(duration: number, level: string) {
    roundDuration.value = duration
    difficulty.value = level
  }

  function startGame() {
    if (team1Name.value && team2Name.value) {
      isGameStarted.value = true
    }
  }

  function resetGame() {
    isGameStarted.value = false
    localStorage.removeItem('charades_game_state')
    // Optionally reset names or keep them for replay
  }

  return {
    team1Name,
    team2Name,
    team1Score,
    team2Score,
    roundDuration,
    difficulty,
    isGameStarted,
    setTeamNames,
    setSettings,
    startGame,
    resetGame,
  }
})
