import type { GameState, GameAction, PlayerState } from '../types/game';
import { calculatePlayerScore } from '../utils/scoring';

const createInitialPlayer = (id: string, name: string): PlayerState => ({
    id,
    name,
    score: 0,
    misthrows: 0,
    rows: { red: [], yellow: [], green: [], blue: [] },
    turnActionsTaken: { whiteMarked: false, colorMarked: false },
});

export const initialGameState: GameState = {
    mode: '2P',
    players: [createInitialPlayer('1', 'Player 1'), createInitialPlayer('2', 'Player 2')],
    activePlayerIndex: 0,
    currentPhase: 'SETUP',
    dice: { white1: 1, white2: 1, red: 1, yellow: 1, green: 1, blue: 1 },
    lockedColors: [],
    rollCount: 0,
    playersReady: [false, false],
};

const countGameEndConditions = (state: GameState) => {
    let isGameOver = false;
    if (state.lockedColors.length >= 2) isGameOver = true;
    if (state.players.some(p => p.misthrows >= 4)) isGameOver = true;
    return isGameOver;
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case 'START_GAME':
            return {
                ...initialGameState,
                mode: action.payload.mode,
                players: [createInitialPlayer('p1', action.payload.p1Name), createInitialPlayer('p2', action.payload.p2Name)],
                currentPhase: 'ROLL',
                rollCount: 0,
                playersReady: [false, false],
                cpuDifficulty: action.payload.cpuDifficulty,
            };

        case 'ROLL_DICE': {
            const snapshotPlayers = state.players.map(p => ({
                ...p,
                rows: {
                    red: [...p.rows.red],
                    yellow: [...p.rows.yellow],
                    green: [...p.rows.green],
                    blue: [...p.rows.blue],
                },
                turnActionsTaken: { whiteMarked: false, colorMarked: false }
            }));

            return {
                ...state,
                players: snapshotPlayers,
                turnSnapshot: {
                    players: snapshotPlayers,
                    lockedColors: [...state.lockedColors],
                },
                dice: action.payload,
                currentPhase: 'ACTION1', // Both players can use the white sum
                rollCount: state.rollCount + 1,
                playersReady: [false, false],
            };
        }

        case 'MARK_NUMBER': {
            const { playerIndex, color, number } = action.payload;
            const player = state.players[playerIndex];
            const isActive = state.activePlayerIndex === playerIndex;

            // Figure out which action we are consuming
            const dice = state.dice;
            const whiteSum = dice.white1 + dice.white2;
            const colorSum1 = dice.white1 + dice[color];
            const colorSum2 = dice.white2 + dice[color];

            const isWhiteMatch = number === whiteSum;
            const isColorMatch = number === colorSum1 || number === colorSum2;

            let consumedWhite = false;
            let consumedColor = false;

            if (!isActive) {
                if (!isWhiteMatch || player.turnActionsTaken.whiteMarked) return state; // Invalid mark
                consumedWhite = true;
            } else {
                if (player.turnActionsTaken.colorMarked) {
                    // If Action 2 is taken, Action 1 is forfeited. No more marks allowed.
                    return state;
                }

                if (!player.turnActionsTaken.whiteMarked) {
                    // Nothing marked yet
                    if (isWhiteMatch && isColorMatch) {
                        consumedWhite = true; // Default to burning white if ambiguous
                    } else if (isWhiteMatch) {
                        consumedWhite = true;
                    } else if (isColorMatch) {
                        consumedColor = true;
                    } else {
                        return state; // Neither matched
                    }
                } else {
                    // White is marked, can only mark color
                    if (isColorMatch) {
                        consumedColor = true;
                    } else {
                        return state; // Must match color
                    }
                }
            }

            const newRows = { ...player.rows, [color]: [...player.rows[color], number] };
            let newLockedColors = [...state.lockedColors];
            const endNumber = (color === 'red' || color === 'yellow') ? 12 : 2;

            if (number === endNumber && newRows[color].length >= 5 && !newLockedColors.includes(color)) {
                newLockedColors.push(color);
                // Add the 'lock' symbol which is +1 mark effectively (to score 1 extra)
                newRows[color].push(99);
            }

            const newPlayer = {
                ...player,
                rows: newRows,
                turnActionsTaken: {
                    whiteMarked: player.turnActionsTaken.whiteMarked || consumedWhite,
                    colorMarked: player.turnActionsTaken.colorMarked || consumedColor,
                }
            };
            newPlayer.score = calculatePlayerScore(newPlayer);

            const players = [...state.players];
            players[playerIndex] = newPlayer;

            let newState = { ...state, players, lockedColors: newLockedColors };
            if (countGameEndConditions(newState)) {
                newState.currentPhase = 'GAME_OVER';
                return newState;
            }

            // Auto-Ready Logic: if player has taken all actions, auto-ready them.
            const playerAfterMark = newState.players[playerIndex];
            const isExhausted = isActive
                ? (playerAfterMark.turnActionsTaken.whiteMarked && playerAfterMark.turnActionsTaken.colorMarked)
                : playerAfterMark.turnActionsTaken.whiteMarked;

            if (isExhausted) {
                const newPlayersReady = [...newState.playersReady];
                newPlayersReady[playerIndex] = true;
                newState.playersReady = newPlayersReady;

                if (newPlayersReady[0] && newPlayersReady[1]) {
                    newState.activePlayerIndex = newState.activePlayerIndex === 0 ? 1 : 0;
                    newState.currentPhase = 'ROLL';
                    newState.playersReady = [false, false];
                }
            }

            return newState;
        }

        case 'UNDO_TURN': {
            if (!state.turnSnapshot || state.currentPhase !== 'ACTION1') return state;
            const { playerIndex } = action.payload;
            const players = [...state.players];

            // Revert this specific player to their snapshot at the start of the roll
            // Must deep copy to avoid reference sharing
            const snapPlayer = state.turnSnapshot.players[playerIndex];
            players[playerIndex] = {
                ...snapPlayer,
                rows: {
                    red: [...snapPlayer.rows.red],
                    yellow: [...snapPlayer.rows.yellow],
                    green: [...snapPlayer.rows.green],
                    blue: [...snapPlayer.rows.blue],
                },
                turnActionsTaken: { ...snapPlayer.turnActionsTaken }
            };

            // Recompute lockedColors in case undoing removes the lock that ended the game
            let newLockedColors = [...state.turnSnapshot.lockedColors];
            const allColors: ('red' | 'yellow' | 'green' | 'blue')[] = ['red', 'yellow', 'green', 'blue'];

            allColors.forEach(c => {
                const endNum = (c === 'red' || c === 'yellow') ? 12 : 2;
                const anyPlayerLocked = players.some(p => p.rows[c].includes(endNum) && p.rows[c].length >= 6);
                if (anyPlayerLocked && !newLockedColors.includes(c)) {
                    newLockedColors.push(c);
                }
            });

            // If we undid the end condition, ensure phase doesn't get stuck in Game Over if we handled it early
            // (Which we don't, because Undo happens during ACTION1, but just in case)
            return { ...state, players, lockedColors: newLockedColors };
        }

        case 'MARK_MISTHROW': {
            const { playerIndex } = action.payload;
            const players = [...state.players];
            players[playerIndex].misthrows += 1;
            players[playerIndex].score = calculatePlayerScore(players[playerIndex]);

            let newState = { ...state, players };
            if (countGameEndConditions(newState)) {
                newState.currentPhase = 'GAME_OVER';
            }
            return newState;
        }

        case 'PASS_TURN': {
            const { playerIndex } = action.payload;

            // Only active player gets penalized for marking nothing
            const isActivePlayer = state.activePlayerIndex === playerIndex;
            const playerState = state.players[playerIndex];
            const takenNoActions = !playerState.turnActionsTaken.whiteMarked && !playerState.turnActionsTaken.colorMarked;

            // Deep clone players array to apply potential penalty
            const players = [...state.players];

            if (isActivePlayer && takenNoActions) {
                players[playerIndex] = {
                    ...playerState,
                    misthrows: playerState.misthrows + 1
                };
                players[playerIndex].score = calculatePlayerScore(players[playerIndex]);
            }

            const newPlayersReady = [...state.playersReady];
            newPlayersReady[playerIndex] = true;

            const bothReady = newPlayersReady[0] && newPlayersReady[1];

            // Re-evaluate game over condition because a misthrow was potentially added
            let newState = { ...state, players, playersReady: newPlayersReady };
            if (countGameEndConditions(newState)) {
                newState.currentPhase = 'GAME_OVER';
                return newState;
            }

            if (bothReady) {
                return {
                    ...newState,
                    activePlayerIndex: state.activePlayerIndex === 0 ? 1 : 0,
                    currentPhase: 'ROLL',
                    playersReady: [false, false],
                };
            }

            return newState;
        }

        case 'END_GAME':
            return { ...state, currentPhase: 'GAME_OVER' };

        case 'NAVIGATE_TO_MENU':
            return { ...state, savedPhase: state.currentPhase, currentPhase: 'SETUP' };

        case 'RESUME_GAME':
            return { ...state, currentPhase: state.savedPhase || 'ROLL', savedPhase: undefined };

        case 'RESET_GAME':
            return initialGameState;

        default:
            return state;
    }
};
