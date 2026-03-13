import { useEffect, useRef } from 'react';
import './App.css'
import { PlayerBoard } from './components/PlayerBoard';
import { DiceTray } from './components/DiceTray';
import { StartScreen } from './components/StartScreen';
import { useGame } from './context/GameContext';
import { getAiActions } from './utils/ai';

function App() {
  const { state, dispatch } = useGame();

  const lastProcessedRollCount = useRef<number>(0);

  // CPU Opponent AI Hooks
  useEffect(() => {
    // 1. CPU Rolling Logic
    if (state.mode === 'CPU' && state.currentPhase === 'ROLL' && state.activePlayerIndex === 1) {
      const timer = setTimeout(() => {
        const rollDice = (): number => {
          const array = new Uint8Array(1);
          do {
            window.crypto.getRandomValues(array);
          } while (array[0] >= 252);
          return (array[0] % 6) + 1;
        };
        dispatch({
          type: 'ROLL_DICE', payload: {
            white1: rollDice(), white2: rollDice(),
            red: rollDice(), yellow: rollDice(), green: rollDice(), blue: rollDice()
          }
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.mode, state.currentPhase, state.activePlayerIndex, dispatch]);

  useEffect(() => {
    // 2. CPU Action Logic (Making marking decisions)
    if (state.mode !== 'CPU' || state.currentPhase !== 'ACTION1') return;

    // Ensure we only process each roll once
    if (lastProcessedRollCount.current === state.rollCount) return;
    lastProcessedRollCount.current = state.rollCount;

    const timer = setTimeout(() => {
      const actions = getAiActions(state, 1);
      actions.forEach(action => dispatch(action));
    }, 1200);

    return () => clearTimeout(timer);
  }, [state, dispatch]);

  if (state.currentPhase === 'SETUP') {
    return <StartScreen />;
  }

  if (state.currentPhase === 'GAME_OVER') {
    const p1Score = state.players[0].score;
    const p2Score = state.players[1].score;
    let winnerText = "IT'S A TIE!";
    if (p1Score > p2Score) winnerText = `${state.players[0].name} WINS!`;
    if (p2Score > p1Score) winnerText = `${state.players[1].name} WINS!`;

    return (
      <div className="h-[100dvh] w-[100dvw] bg-stone-900 text-white flex flex-col items-center justify-center font-sans relative overflow-hidden">
        {/* Background confett or glow */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-green-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <h2 className="text-3xl font-bold text-stone-400 mb-2 tracking-widest uppercase">Game Over</h2>
        <h1 className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600 mb-12 tracking-tighter drop-shadow-2xl text-center px-4">
          {winnerText}
        </h1>

        <div className="flex gap-8 sm:gap-16 text-2xl bg-stone-800/80 p-8 sm:p-12 rounded-[3rem] shadow-2xl border-4 border-stone-700 backdrop-blur-md z-10 w-full max-w-2xl justify-center items-center">
          <div className={`flex flex-col items-center ${p1Score >= p2Score ? 'text-green-400 scale-110 transform transition-transform' : 'text-stone-500 opacity-80'}`}>
            <span className="uppercase text-sm sm:text-base tracking-widest font-bold mb-2">{state.players[0].name}</span>
            <span className="text-6xl sm:text-8xl font-black">{p1Score}</span>
            {p1Score > p2Score && <span className="text-2xl mt-2 animate-bounce">👑</span>}
          </div>

          <div className="w-1 h-24 bg-stone-700 rounded-full"></div>

          <div className={`flex flex-col items-center ${p2Score >= p1Score ? 'text-green-400 scale-110 transform transition-transform' : 'text-stone-500 opacity-80'}`}>
            <span className="uppercase text-sm sm:text-base tracking-widest font-bold mb-2">{state.players[1].name}</span>
            <span className="text-6xl sm:text-8xl font-black">{p2Score}</span>
            {p2Score > p1Score && <span className="text-2xl mt-2 animate-bounce">👑</span>}
          </div>
        </div>
        <button onClick={() => dispatch({ type: 'RESET_GAME' })} className="mt-12 bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-full font-bold text-xl tracking-wider shadow-lg transform hover:scale-105 transition-all">
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#3a454d] text-white flex flex-col font-sans fixed inset-0">
      {/* Top Board (Player 2 / CPU) - Rotated 180 degrees */}
      <div className="flex-1 w-full flex justify-center items-center relative p-1 overflow-hidden min-h-0">
        <div className="w-full h-full flex justify-center items-center transform rotate-180">
          <PlayerBoard playerIndex={1} />
        </div>
      </div>

      {/* Center Console (Dice Tray & Controls) */}
      <div className="shrink-0 z-10">
        <DiceTray />
      </div>

      {/* Bottom Board (Player 1) */}
      <div className="flex-1 w-full flex justify-center items-center relative p-1 overflow-hidden min-h-0">
        <PlayerBoard playerIndex={0} />
      </div>
    </div>
  )
}

export default App
