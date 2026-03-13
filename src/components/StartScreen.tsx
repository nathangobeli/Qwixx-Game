import { useState } from 'react';
import { useGame } from '../context/GameContext';
import type { GameMode } from '../types/game';

export const StartScreen = () => {
    const { state, dispatch } = useGame();
    const [p1Name, setP1Name] = useState('Player 1');
    const [p2Name, setP2Name] = useState('Player 2');
    const [mode, setMode] = useState<GameMode>('2P');
    const [cpuDifficulty, setCpuDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [showRules, setShowRules] = useState(false);

    const handleStart = () => {
        if (hasSavedGame) {
            if (!window.confirm("Are you sure you want to start a new game? Your paused game will be lost!")) return;
        }
        dispatch({ type: 'START_GAME', payload: { mode, p1Name, p2Name, cpuDifficulty } });
    };

    const hasSavedGame = state.rollCount > 0 && !!state.savedPhase;

    if (showRules) {
        return (
            <div className="h-full w-full bg-[#3a454d] text-white flex flex-col font-sans p-4 sm:p-8 overflow-y-auto">
                <div className="max-w-3xl mx-auto w-full bg-stone-100 text-stone-900 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
                    <button
                        onClick={() => setShowRules(false)}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 bg-stone-300 hover:bg-stone-400 rounded-full font-bold text-xl flex items-center justify-center transition-colors shadow-sm"
                    >
                        ✕
                    </button>
                    <h1 className="text-3xl sm:text-5xl font-black text-amber-500 mb-6 uppercase tracking-tighter drop-shadow-sm">How to Play Qwixx</h1>

                    <div className="space-y-6 text-sm sm:text-base leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold border-b-2 border-stone-300 pb-1 mb-2">The Boards</h2>
                            <p>Each player has 4 color rows. Red and Yellow numbers go up (2 to 12). Green and Blue numbers go down (12 to 2).</p>
                            <p className="mt-2 font-bold text-red-600">Rule: Numbers must be crossed out from left to right. Once you skip a number, you can NEVER cross it out later!</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold border-b-2 border-stone-300 pb-1 mb-2">Turn Sequence</h2>
                            <p>The Active Player rolls all 6 dice. Then, two actions happen:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-2">
                                <li><strong>Action 1:</strong> ALL players (including active player) may choose to mark the sum of the <strong>two white dice</strong> on any colored row.</li>
                                <li><strong>Action 2:</strong> The ACTIVE player may choose to mark the sum of <strong>one white die AND one colored die</strong> on the row of that same color.</li>
                            </ul>
                            <p className="mt-2">Players tap "Ready" (or "Wait") when they have taken their actions to pass the turn.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold border-b-2 border-stone-300 pb-1 mb-2">Misthrows (Penalties)</h2>
                            <p>If the Active Player does not mark any number in Action 1 or Action 2, they must mark a Misthrow box. Each misthrow is <strong>-5 points</strong>. Non-active players never take misthrows.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold border-b-2 border-stone-300 pb-1 mb-2">Locking Rows</h2>
                            <p>To lock a row, you must have marked at least 5 numbers in that row, and then mark the number on the far right (12 for Red/Yellow, 2 for Green/Blue). Locking a row also gives you a bonus mark for scoring and removes that color die from the game for everyone.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold border-b-2 border-stone-300 pb-1 mb-2">Game End & Scoring</h2>
                            <p>The game ends immediately if two rows are locked or if any player gets 4 misthrows.</p>
                            <p className="mt-2">Scores grow exponentially: (1 mark = 1pt, 2 marks = 3pts, 3=6, 4=10, 5=15, 6=21, 7=28, 8=36, 9=45, 10=55, 11=66, 12=78).</p>
                        </section>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={() => setShowRules(false)}
                            className="bg-green-500 hover:bg-green-400 text-white font-bold py-3 px-10 rounded-full text-xl shadow-lg transform hover:scale-105 transition-all"
                        >
                            Got It
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-[#3a454d] text-white flex flex-col items-center justify-center font-sans p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-red-500/20 rounded-xl rotate-12 blur-md"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500/20 rounded-xl -rotate-12 blur-md"></div>

            <div className="z-10 bg-stone-800/80 backdrop-blur-sm p-8 sm:p-12 rounded-[3rem] shadow-2xl border-4 border-stone-600 max-w-lg w-full text-center">
                <h1 className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-red-500 mb-2 drop-shadow-lg tracking-tighter uppercase italic">
                    Qwixx
                </h1>
                <p className="text-xl text-stone-400 font-bold mb-8 tracking-widest uppercase">Head-to-Head</p>

                <div className="space-y-6">
                    <div className="flex justify-center gap-4 mb-4">
                        <button
                            onClick={() => { setMode('2P'); setP2Name('Player 2'); }}
                            className={`px-6 py-2 rounded-full font-bold text-lg border-2 transition-colors ${mode === '2P' ? 'bg-amber-400 text-amber-900 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-stone-700 text-stone-300 border-stone-500 hover:bg-stone-600'}`}
                        >
                            2 Player
                        </button>
                        <button
                            onClick={() => { setMode('CPU'); setP2Name('CPU'); }}
                            className={`px-6 py-2 rounded-full font-bold text-lg border-2 transition-colors ${mode === 'CPU' ? 'bg-amber-400 text-amber-900 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-stone-700 text-stone-300 border-stone-500 hover:bg-stone-600'}`}
                        >
                            vs CPU
                        </button>
                    </div>

                    {mode === 'CPU' && (
                        <div className="flex flex-col gap-2 bg-stone-700/30 p-4 rounded-2xl border border-stone-600">
                            <label className="text-sm font-bold text-stone-400 uppercase tracking-wider text-left pl-2">CPU Difficulty</label>
                            <div className="flex gap-2">
                                {['easy', 'medium', 'hard'].map((diff) => (
                                    <button
                                        key={diff}
                                        onClick={() => setCpuDifficulty(diff as 'easy' | 'medium' | 'hard')}
                                        className={`flex-1 py-1.5 rounded-full font-bold text-sm uppercase border-2 transition-all ${cpuDifficulty === diff ? 'bg-blue-500 border-blue-400 text-white shadow-md' : 'bg-stone-600 text-stone-400 border-stone-500 hover:bg-stone-500'}`}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-stone-400 uppercase tracking-wider text-left pl-4">Player 1 Name</label>
                        <input
                            type="text"
                            value={p1Name}
                            onChange={(e) => setP1Name(e.target.value)}
                            className="bg-stone-700/50 border-2 border-stone-500 text-white px-6 py-4 rounded-full font-bold text-xl outline-none focus:border-amber-400 transition-colors shadow-inner w-full"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-stone-400 uppercase tracking-wider text-left pl-4">Player 2 Name</label>
                        <input
                            type="text"
                            disabled={mode === 'CPU'}
                            value={p2Name}
                            onChange={(e) => setP2Name(e.target.value)}
                            className="bg-stone-700/50 border-2 border-stone-500 text-white px-6 py-4 rounded-full font-bold text-xl outline-none focus:border-amber-400 transition-colors shadow-inner w-full disabled:bg-stone-800 disabled:text-stone-500 disabled:border-stone-700"
                        />
                    </div>

                    <div className="pt-4 flex flex-col gap-3 sm:gap-4">
                        {hasSavedGame ? (
                            <>
                                <button
                                    onClick={() => dispatch({ type: 'RESUME_GAME' })}
                                    className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-4 px-8 rounded-full text-xl sm:text-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)] transform hover:scale-105 active:scale-95 transition-all uppercase tracking-widest border-2 border-blue-300"
                                >
                                    Resume Game
                                </button>
                                <button
                                    onClick={handleStart}
                                    className="w-full bg-stone-700 hover:bg-red-500 text-stone-300 hover:text-white font-bold py-3 px-8 rounded-full text-sm sm:text-lg shadow-md transform hover:scale-105 active:scale-95 transition-all uppercase tracking-wider border-2 border-stone-600 hover:border-red-400"
                                >
                                    Abandon & New Game
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleStart}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-black py-4 px-8 rounded-full text-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transform hover:scale-105 active:scale-95 transition-all uppercase tracking-widest border-2 border-green-300"
                            >
                                Start Game
                            </button>
                        )}

                        <button
                            onClick={() => setShowRules(true)}
                            className="w-full bg-stone-700 hover:bg-stone-600 text-stone-300 font-bold py-3 px-8 rounded-full text-lg shadow-md transform hover:scale-105 active:scale-95 transition-all uppercase tracking-wider border-2 border-stone-600"
                        >
                            How to Play
                        </button>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 text-stone-500 font-bold text-sm tracking-widest uppercase">
                Touch-Optimized Local Multiplayer
            </div>
        </div>
    );
};
