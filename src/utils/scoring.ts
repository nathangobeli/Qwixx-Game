import type { RowState, PlayerState } from '../types/game';

// Standard Qwixx scoring (Triangular number formula)
export const calculateRowScore = (marksCount: number): number => {
    if (marksCount === 0) return 0;
    return (marksCount * (marksCount + 1)) / 2;
};

export const calculatePlayerScore = (player: PlayerState): number => {
    const redsCount = player.rows.red.length;
    const yellowsCount = player.rows.yellow.length;
    const greensCount = player.rows.green.length;
    const bluesCount = player.rows.blue.length;

    const score =
        calculateRowScore(redsCount) +
        calculateRowScore(yellowsCount) +
        calculateRowScore(greensCount) +
        calculateRowScore(bluesCount);

    // -5 per misthrow
    return score - (player.misthrows * 5);
};

export const isValidMark = (
    currentRow: RowState,
    numberToMark: number,
    color: 'red' | 'yellow' | 'green' | 'blue',
    isRowLocked: boolean,
    gameState?: import('../types/game').GameState,
    playerIndex?: 0 | 1
) => {
    if (isRowLocked) return false;

    const ascending = color === 'red' || color === 'yellow';
    const endNumber = ascending ? 12 : 2;

    if (currentRow.includes(numberToMark)) return false; // Already marked

    if (currentRow.length === 0) {
        if (numberToMark === endNumber) return false; // Cannot mark 12 or 2 as first number without 5 marks
    } else {
        // Get rightmost marked number
        const lastMarked = currentRow[currentRow.length - 1];

        // Ascending rows (Red, Yellow) must go left to right (larger)
        if (ascending) {
            if (numberToMark <= lastMarked) return false;
        } else {
            // Descending rows (Green, Blue) must go left to right (smaller)
            if (numberToMark >= lastMarked) return false;
        }

        // Can only mark the last number if they have at least 5 marks prior
        if (numberToMark === endNumber && currentRow.length < 5) return false;
    }

    // NEW LOGIC: Check strict dice roll constraints if game state is provided
    if (gameState && playerIndex !== undefined) {
        if (gameState.currentPhase !== 'ACTION1' && gameState.currentPhase !== 'ROLL') return false;
        if (gameState.currentPhase === 'ROLL') return false; // Cannot mark before rolling

        const player = gameState.players[playerIndex];
        const isActive = gameState.activePlayerIndex === playerIndex;
        const dice = gameState.dice;

        const whiteSum = dice.white1 + dice.white2;
        const colorSum1 = dice.white1 + dice[color];
        const colorSum2 = dice.white2 + dice[color];

        const isWhiteMatch = numberToMark === whiteSum;
        const isColorMatch = (numberToMark === colorSum1 || numberToMark === colorSum2);

        if (!isActive) {
            // Inactive player can ONLY mark the white sum, exactly once.
            if (player.turnActionsTaken.whiteMarked) return false;
            if (!isWhiteMatch) return false;
        } else {
            // Active player logic
            if (player.turnActionsTaken.whiteMarked && player.turnActionsTaken.colorMarked) return false;

            if (player.turnActionsTaken.whiteMarked) {
                // Already used white sum, must use color sum
                if (!isColorMatch) return false;
            } else if (player.turnActionsTaken.colorMarked) {
                // Already used color sum (Action 2), meaning they skipped Action 1. Cannot mark white now.
                return false;
            } else {
                // Nothing used yet, could be either
                if (!isWhiteMatch && !isColorMatch) return false;
            }
        }
    }

    return true;
};
