import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useGameStore = defineStore('game', () => {
  const team1Name = ref('');
  const team2Name = ref('');
  const team1Score = ref(0);
  const team2Score = ref(0);
  const team1RoundsPlayed = ref(0);
  const team2RoundsPlayed = ref(0);
  const roundDuration = ref(60); // seconds
  const difficulty = ref('Medium'); // 'Easy', 'Medium', 'Hard'
  const wordIndex = ref(0);
  const words = ref<string[]>([]);
  const isGameStarted = ref(false);

  // Load state from localStorage on initialization
  const savedState = localStorage.getItem('charades_game_state');
  if (savedState) {
    const parsed = JSON.parse(savedState);
    team1Name.value = parsed.team1Name;
    team2Name.value = parsed.team2Name;
    team1Score.value = parsed.team1Score;
    team2Score.value = parsed.team2Score;
    team1RoundsPlayed.value = parsed.team1RoundsPlayed;
    team2RoundsPlayed.value = parsed.team2RoundsPlayed;
    roundDuration.value = parsed.roundDuration;
    difficulty.value = parsed.difficulty;
    isGameStarted.value = parsed.isGameStarted;
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
        team1RoundsPlayed: team1RoundsPlayed.value,
        team2RoundsPlayed: team2RoundsPlayed.value,
        roundDuration: roundDuration.value,
        difficulty: difficulty.value,
        isGameStarted: isGameStarted.value,
      };
      localStorage.setItem('charades_game_state', JSON.stringify(stateToSave));
    },
    { deep: true },
  );

  function setTeamNames(t1: string, t2: string) {
    team1Name.value = t1;
    team2Name.value = t2;
  }

  function setSettings(duration: number, level: string) {
    roundDuration.value = duration;
    difficulty.value = level;
  }

  function startGame() {
    isGameStarted.value = true;
  }

  function resetGame() {
    isGameStarted.value = false;
    localStorage.removeItem('charades_game_state');
  }

  function nextTeam() {
    if (team1RoundsPlayed.value > team2RoundsPlayed.value) {
      return team2Name.value;
    } else {
      return team1Name.value;
    }
  }

  function currentTeam() {
    return nextTeam() === team1Name.value ? team2Name.value : team1Name.value;
  }

  function incrementTeamScore(team: string) {
    if (team === team1Name.value) {
      team1Score.value++;
    } else if (team === team2Name.value) {
      team2Score.value++;
    }
  }

  function decrementTeamScore(team: string) {
    if (team === team1Name.value) {
      team1Score.value--;
    } else if (team === team2Name.value) {
      team2Score.value--;
    }
  }

  function incrementTeamRoundsPlayed(team: string) {
    if (team === team1Name.value) {
      team1RoundsPlayed.value++;
    } else if (team === team2Name.value) {
      team2RoundsPlayed.value++;
    }
  }

  return {
    team1Name,
    team2Name,
    team1Score,
    team2Score,
    team1RoundsPlayed,
    team2RoundsPlayed,
    roundDuration,
    difficulty,
    wordIndex,
    words,
    isGameStarted,
    setTeamNames,
    setSettings,
    startGame,
    resetGame,
    nextTeam: nextTeam,
    currentTeam: currentTeam,
    incrementTeamScore,
    decrementTeamScore,
    incrementTeamRoundsPlayed,
  };
});
