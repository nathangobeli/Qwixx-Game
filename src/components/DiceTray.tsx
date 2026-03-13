import { useState } from 'react';
import { useGame } from '../context/GameContext';
import type { DiceState } from '../types/game';

const rollDice = (): number => {
    const array = new Uint8Array(1);
    do {
        window.crypto.getRandomValues(array);
    } while (array[0] >= 252); // Prevent modulo bias (252 is the highest multiple of 6 below 256)
    return (array[0] % 6) + 1;
};

export const DiceTray = () => {
    const { state, dispatch } = useGame();
    const { dice, lockedColors, currentPhase, activePlayerIndex } = state;
    const [isRolling, setIsRolling] = useState(false);

    const handleRoll = () => {
        if (currentPhase === 'ROLL' && !isRolling) {
            setIsRolling(true);

            // Generate visual "bouncing" rolls
            let rollCount = 0;
            const rollInterval = setInterval(() => {
                rollCount++;
                if (rollCount > 8) {
                    clearInterval(rollInterval);
                    const newDice: DiceState = {
                        white1: rollDice(),
                        white2: rollDice(),
                        red: rollDice(),
                        yellow: rollDice(),
                        green: rollDice(),
                        blue: rollDice(),
                    };
                    dispatch({ type: 'ROLL_DICE', payload: newDice });
                    setIsRolling(false);
                }
            }, 50);
        }
    };

    const handleReady = (playerIndex: 0 | 1) => {
        if (currentPhase !== 'ROLL' && !state.playersReady[playerIndex]) {
            dispatch({ type: 'PASS_TURN', payload: { playerIndex, actionPhase: 1 } });
        }
    };

    return (
        <div className="h-20 sm:h-28 bg-[#4c5c68] w-full shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 flex items-center justify-between px-2 sm:px-6 md:px-12 border-y-2 sm:border-y-4 border-[#2f3e46] box-border relative">

            <button
                onClick={() => dispatch({ type: 'NAVIGATE_TO_MENU' })}
                className="absolute left-[50%] top-[-2rem] transform -translate-x-1/2 -translate-y-[50%] bg-stone-700/80 text-white px-4 py-1.5 rounded-t-xl font-bold text-[10px] sm:text-xs tracking-widest shadow-lg border-x-2 border-t-2 border-stone-600/50 backdrop-blur-md uppercase z-50"
            >
                Pause / Menu
            </button>

            {/* Player 2 Controls */}
            <div className="flex flex-col gap-2 items-center">
                {currentPhase === 'ROLL' && activePlayerIndex === 1 ? (
                    <div
                        onClick={handleRoll}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-500 flex flex-col items-center justify-center border-2 sm:border-4 border-green-300 shadow-lg transform rotate-180 hover:scale-105 active:scale-95 cursor-pointer animate-bounce z-20"
                    >
                        <span className="font-bold text-xs sm:text-sm uppercase tracking-wider text-white">Roll</span>
                    </div>
                ) : (
                    <div
                        onClick={() => handleReady(1)}
                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center border-2 sm:border-4 shadow-lg cursor-pointer transform rotate-180 hover:scale-105 active:scale-95 transition-all
                  ${state.playersReady[1] ? 'bg-green-600 border-green-400 text-white' : 'bg-amber-500 border-amber-300 text-white animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.6)]'}
                `}
                    >
                        <span className="font-bold text-[10px] sm:text-sm uppercase">Ready</span>
                        {state.playersReady[1] && <span className="text-xl leading-none mt-1">✓</span>}
                    </div>
                )}
            </div>

            {/* Center Dice */}
            <div className={`flex bg-[#2f3e46]/80 p-1 sm:p-2 rounded-xl sm:rounded-2xl shadow-inner border border-[#1f282e]/50 gap-1 sm:gap-2 items-center transition-all ${isRolling ? 'scale-105' : ''}`}>
                <Die value={isRolling ? rollDice() : dice.white1} color="white" rolling={isRolling} />
                <Die value={isRolling ? rollDice() : dice.white2} color="white" rolling={isRolling} delay="delay-75" />
                <div className="w-0.5 h-6 sm:h-8 bg-[#1f282e] rounded-full mx-0.5"></div> {/* Divider */}
                <Die value={isRolling ? rollDice() : dice.red} color="red" disabled={lockedColors.includes('red')} rolling={isRolling && !lockedColors.includes('red')} delay="delay-100" />
                <Die value={isRolling ? rollDice() : dice.yellow} color="yellow" disabled={lockedColors.includes('yellow')} rolling={isRolling && !lockedColors.includes('yellow')} delay="delay-150" />
                <Die value={isRolling ? rollDice() : dice.green} color="green" disabled={lockedColors.includes('green')} rolling={isRolling && !lockedColors.includes('green')} delay="delay-200" />
                <Die value={isRolling ? rollDice() : dice.blue} color="blue" disabled={lockedColors.includes('blue')} rolling={isRolling && !lockedColors.includes('blue')} delay="delay-300" />
            </div>

            {/* Player 1 Controls */}
            <div className="flex flex-col gap-2 items-center">
                {currentPhase === 'ROLL' && activePlayerIndex === 0 ? (
                    <div
                        onClick={handleRoll}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-500 flex flex-col items-center justify-center border-2 sm:border-4 border-green-300 shadow-lg transform hover:scale-105 active:scale-95 cursor-pointer animate-bounce"
                    >
                        <span className="font-bold text-xs sm:text-sm uppercase tracking-wider text-white">Roll</span>
                    </div>
                ) : (
                    <div
                        onClick={() => handleReady(0)}
                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center border-2 sm:border-4 shadow-lg cursor-pointer transform hover:scale-105 active:scale-95 transition-all
              ${state.playersReady[0] ? 'bg-green-600 border-green-400 text-white' : 'bg-amber-500 border-amber-300 text-white animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.6)]'}
            `}
                    >
                        <span className="font-bold text-[10px] sm:text-sm uppercase tracking-wider">Ready</span>
                        {state.playersReady[0] && <span className="text-xl leading-none mt-1">✓</span>}
                    </div>
                )}
            </div>


        </div>
    );
};

// Simple Die Subcomponent
const dieColors: Record<string, string> = {
    white: 'bg-white text-black border-stone-300',
    red: 'bg-red-500 text-white border-red-700',
    yellow: 'bg-yellow-400 text-white border-yellow-600',
    green: 'bg-green-500 text-white border-green-700',
    blue: 'bg-blue-500 text-white border-blue-700',
};

const Die = ({ value, color, disabled = false, rolling = false, delay = '' }: { value: number, color: string, disabled?: boolean, rolling?: boolean, delay?: string }) => {
    return (
        <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-md sm:rounded-xl shadow-md border-b-2 sm:border-b-4 flex items-center justify-center font-black text-2xl sm:text-5xl relative transition-transform duration-75
      ${dieColors[color]}
      ${disabled ? 'opacity-30 grayscale' : ''}
      ${rolling ? `animate-ping scale-110 ${delay}` : ''}
    `}>
            {value}
            {disabled && <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg text-white text-[10px]">🔒</div>}
        </div>
    );
};
