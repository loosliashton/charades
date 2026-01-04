import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useGameStore = defineStore(
  'game',
  () => {
    const team1Name = ref('');
    const team2Name = ref('');
    const team1Score = ref(0);
    const team2Score = ref(0);
    const team1RoundsPlayed = ref(0);
    const team2RoundsPlayed = ref(0);
    const roundDuration = ref(60); // seconds
    const difficulty = ref('Medium'); // 'Easy', 'Medium', 'Hard'
    const currentSkips = ref(0);
    const freeSkips = ref(1);
    const wordIndex = ref(0);
    const words = ref<string[]>([]);
    const gameState = ref<GameState>('intro');
    const roundStartTime = ref<number | null>(null);
    const lastRoundWords = ref<{ word: string; status: 'correct' | 'skipped' }[]>([]);

    function addWordResult(word: string, status: 'correct' | 'skipped') {
      lastRoundWords.value.push({ word, status });
    }

    function resetRoundStats() {
      lastRoundWords.value = [];
      currentSkips.value = 0;
    }

    function setTeamNames(t1: string, t2: string) {
      team1Name.value = t1;
      team2Name.value = t2;
    }

    function setSettings(duration: number, level: string) {
      roundDuration.value = duration;
      difficulty.value = level;
    }

    function startGame() {
      gameState.value = 'intro';
      words.value = [];
    }

    function resetGame() {
      gameState.value = 'intro';
      team1Score.value = 0;
      team2Score.value = 0;
      team1RoundsPlayed.value = 0;
      team2RoundsPlayed.value = 0;
      wordIndex.value = 0;
      roundStartTime.value = null;
      words.value = [];
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
      currentSkips,
      freeSkips,
      wordIndex,
      words,
      gameState,
      roundStartTime,
      lastRoundWords,
      setTeamNames,
      setSettings,
      startGame,
      resetGame,
      nextTeam: nextTeam,
      currentTeam: currentTeam,
      incrementTeamScore,
      decrementTeamScore,
      incrementTeamRoundsPlayed,
      addWordResult,
      resetRoundStats,
    };
  },
  { persist: true },
);

export type WordResult = {
  word: string;
  status: 'correct' | 'skipped';
};

export type GameState = 'intro' | 'countdown' | 'round' | 'postRound';
