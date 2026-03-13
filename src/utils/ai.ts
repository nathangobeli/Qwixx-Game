import type { GameAction, GameState, Color } from '../types/game';
import { isValidMark } from './scoring';

export const getAiActions = (state: GameState, cpuIndex: 0 | 1): GameAction[] => {
    const actions: GameAction[] = [];

    // Clone the row state so we can optimistically mark
    const cpu = {
        ...state.players[cpuIndex],
        rows: {
            red: [...state.players[cpuIndex].rows.red],
            yellow: [...state.players[cpuIndex].rows.yellow],
            green: [...state.players[cpuIndex].rows.green],
            blue: [...state.players[cpuIndex].rows.blue],
        }
    };

    const isActive = state.activePlayerIndex === cpuIndex;

    const { white1, white2, red, yellow, green, blue } = state.dice;
    const whiteSum = white1 + white2;

    const colors: Color[] = ['red', 'yellow', 'green', 'blue'];
    const diceValues: Record<Color, number> = { red, yellow, green, blue };

    let markedThisTurn = false;

    const calculateSkip = (row: number[], num: number, color: Color) => {
        const isAscending = color === 'red' || color === 'yellow';
        if (row.length === 0) {
            return isAscending ? num - 2 : 12 - num;
        }
        const last = row[row.length - 1];
        return Math.abs(num - last) - 1;
    };

    const difficulty = state.cpuDifficulty || 'medium';

    // Easy AI: randomly pick from valid marks, ignores skip penalty
    if (difficulty === 'easy') {
        const validWhites: { color: Color, num: number }[] = [];
        colors.forEach(color => {
            if (!state.lockedColors.includes(color) && isValidMark(cpu.rows[color], whiteSum, color, false)) {
                validWhites.push({ color, num: whiteSum });
            }
        });

        if (validWhites.length > 0) {
            const pick = validWhites[Math.floor(Math.random() * validWhites.length)];
            actions.push({ type: 'MARK_NUMBER', payload: { playerIndex: cpuIndex, color: pick.color, number: pick.num } });
            markedThisTurn = true;
            cpu.rows[pick.color].push(pick.num);
        }

        if (isActive) {
            const validColors: { color: Color, num: number }[] = [];
            colors.forEach(color => {
                if (state.lockedColors.includes(color)) return;
                [white1, white2].forEach(w => {
                    const comboSum = w + diceValues[color];
                    if (isValidMark(cpu.rows[color], comboSum, color, false)) {
                        validColors.push({ color, num: comboSum });
                    }
                });
            });

            if (validColors.length > 0) {
                const pick = validColors[Math.floor(Math.random() * validColors.length)];
                actions.push({ type: 'MARK_NUMBER', payload: { playerIndex: cpuIndex, color: pick.color, number: pick.num } });
                markedThisTurn = true;
            }

            if (!markedThisTurn) {
                actions.push({ type: 'MARK_MISTHROW', payload: { playerIndex: cpuIndex } });
            }
            actions.push({ type: 'PASS_TURN', payload: { playerIndex: cpuIndex, actionPhase: 1 } });
        } else {
            actions.push({ type: 'PASS_TURN', payload: { playerIndex: cpuIndex, actionPhase: 1 } });
        }
        return actions;
    }

    // Medium & Hard Logic
    // Hard wants to hit edges early, avoids middle skips. Medium is standard min-skip.
    const getScoreWeight = (num: number, skip: number, rowLen: number) => {
        if (difficulty === 'hard') {
            // Hard cares about crossing edges (2,3,11,12) first because they roll less frequently. 
            // The further it gets in the game, the less this matters.
            const isEdge = num <= 4 || num >= 10;
            if (isEdge && rowLen < 3) return skip - 3; // Heavily prioritize edges early on
            return skip; // Standard min skip otherwise
        }
        return skip;
    };

    // 1. Try Action 1: White Dice Sum (for any player)
    let bestWhiteColor: Color | null = null;
    let minSkipWhite = 999;

    for (const color of colors) {
        if (state.lockedColors.includes(color)) continue;
        if (isValidMark(cpu.rows[color], whiteSum, color, false)) {
            const skip = calculateSkip(cpu.rows[color], whiteSum, color);
            const weight = getScoreWeight(whiteSum, skip, cpu.rows[color].length);

            if (skip <= (difficulty === 'hard' ? 4 : 2) && weight < minSkipWhite) {
                minSkipWhite = weight;
                bestWhiteColor = color;
            }
        }
    }

    if (bestWhiteColor) {
        actions.push({
            type: 'MARK_NUMBER',
            payload: { playerIndex: cpuIndex, color: bestWhiteColor, number: whiteSum }
        });
        markedThisTurn = true;
        cpu.rows[bestWhiteColor].push(whiteSum);
    }

    // 2. Try Action 2: White + Color (Active player only)
    if (isActive) {
        let bestColorCombo: Color | null = null;
        let bestColorNumber = 0;
        let minSkipCombo = 999;

        const whites = [white1, white2];

        for (const color of colors) {
            if (state.lockedColors.includes(color)) continue;
            for (const w of whites) {
                const comboSum = w + diceValues[color];
                if (isValidMark(cpu.rows[color], comboSum, color, false)) {
                    const skip = calculateSkip(cpu.rows[color], comboSum, color);
                    const weight = getScoreWeight(comboSum, skip, cpu.rows[color].length);
                    // Standard AI heuristic: don't skip more than 3, prioritizing smaller skips
                    if (skip <= (difficulty === 'hard' ? 4 : 3) && weight < minSkipCombo) {
                        minSkipCombo = weight;
                        bestColorCombo = color;
                        bestColorNumber = comboSum;
                    }
                }
            }
        }

        if (bestColorCombo) {
            actions.push({
                type: 'MARK_NUMBER',
                payload: { playerIndex: cpuIndex, color: bestColorCombo, number: bestColorNumber }
            });
            markedThisTurn = true;
        }

        // 3. Misthrow Check
        if (!markedThisTurn) {
            actions.push({ type: 'MARK_MISTHROW', payload: { playerIndex: cpuIndex } });
        }
    }

    // 4. Pass turn
    actions.push({ type: 'PASS_TURN', payload: { playerIndex: cpuIndex, actionPhase: 1 } });

    return actions;
};
