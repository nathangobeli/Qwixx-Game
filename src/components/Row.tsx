import type { Color, RowState } from '../types/game';
import { useGame } from '../context/GameContext';
import { isValidMark } from '../utils/scoring';

interface RowProps {
    playerIndex: 0 | 1;
    color: Color;
    rowState: RowState;
}

const colorMap = {
    red: 'bg-[var(--color-red-board)] border-red-800 text-red-900',
    yellow: 'bg-[var(--color-yellow-board)] border-yellow-600 text-yellow-900',
    green: 'bg-[var(--color-green-board)] border-green-800 text-green-900',
    blue: 'bg-[var(--color-blue-board)] border-blue-800 text-blue-900',
};

export const Row = ({ playerIndex, color, rowState }: RowProps) => {
    const { state, dispatch } = useGame();

    const isAscending = color === 'red' || color === 'yellow';
    const numbers = isAscending
        ? [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        : [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

    const isColorLocked = state.lockedColors.includes(color);

    const handleBoxClick = (number: number) => {
        // Basic validation implementation
        if (isValidMark(rowState, number, color, isColorLocked, state, playerIndex)) {
            dispatch({ type: 'MARK_NUMBER', payload: { playerIndex, color, number } });
        }
    };

    return (
        <div className={`flex w-full items-stretch rounded-r-2xl rounded-l-md border sm:border-2 shadow-sm my-px sm:my-1 flex-1 min-h-0 ${colorMap[color]}`}>
            <div className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full ml-1 mr-1 self-center flex items-center justify-center border border-white/50 bg-white/20 text-[8px] sm:text-[10px]`}>
                {/* Placeholder for lock icon */}
                {isColorLocked ? '🔒' : ''}
            </div>

            <div className="flex-1 flex justify-between pr-0.5 sm:pr-1 h-full py-1 sm:py-1.5 min-h-0 items-stretch gap-0.5">
                {numbers.map((num) => {
                    const isMarked = rowState.includes(num);
                    const canMark = isValidMark(rowState, num, color, isColorLocked, state, playerIndex);

                    return (
                        <div
                            key={num}
                            onClick={() => handleBoxClick(num)}
                            className={`flex-1 rounded flex items-center justify-center font-bold text-base sm:text-2xl shadow-inner border border-black/10 transition-colors
                ${isMarked ? 'bg-black/80 text-white' : (canMark ? 'bg-white/90 hover:bg-white cursor-pointer active:scale-95' : 'bg-white/50 opacity-50')}
              `}
                        >
                            {isMarked ? 'X' : num}
                        </div>
                    );
                })}
                {/* The Lock Box */}
                <div className={`w-6 sm:w-10 ml-0.5 rounded-full flex items-center justify-center font-bold text-base sm:text-2xl shadow-inner border border-black/10
            ${isColorLocked ? 'bg-black/80 text-white' : 'bg-white/90'}
        `}>
                    {isColorLocked ? 'X' : '🔒'}
                </div>        </div>        </div>
    );
};
