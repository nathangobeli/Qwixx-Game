export type Color = 'red' | 'yellow' | 'green' | 'blue';
export type RowState = number[];

export interface PlayerState {
    id: string;
    name: string;
    score: number;
    misthrows: number;
    rows: {
        red: RowState;
        yellow: RowState;
        green: RowState;
        blue: RowState;
    };
    turnActionsTaken: {
        whiteMarked: boolean;
        colorMarked: boolean;
    };
}

export interface DiceState {
    white1: number;
    white2: number;
    red: number;
    yellow: number;
    green: number;
    blue: number;
}

export type GameMode = '1P' | '2P' | 'CPU';
export type CpuDifficulty = 'easy' | 'medium' | 'hard';
export type GamePhase = 'SETUP' | 'ROLL' | 'ACTION1' | 'ACTION2' | 'GAME_OVER';

export interface GameState {
    mode: GameMode;
    players: PlayerState[];
    activePlayerIndex: 0 | 1;
    currentPhase: GamePhase;
    dice: DiceState;
    lockedColors: Color[];
    rollCount: number;
    turnSnapshot?: {
        players: PlayerState[];
        lockedColors: Color[];
    };
    playersReady: boolean[];
    cpuDifficulty?: CpuDifficulty;
}

export type GameAction =
    | { type: 'START_GAME'; payload: { mode: GameMode; p1Name: string; p2Name: string; cpuDifficulty?: CpuDifficulty } }
    | { type: 'ROLL_DICE'; payload: DiceState }
    | { type: 'UNDO_TURN'; payload: { playerIndex: 0 | 1 } }
    | { type: 'MARK_NUMBER'; payload: { playerIndex: 0 | 1; color: Color; number: number } }
    | { type: 'MARK_MISTHROW'; payload: { playerIndex: 0 | 1 } }
    | { type: 'PASS_TURN'; payload: { playerIndex: 0 | 1; actionPhase: 1 | 2 } }
    | { type: 'LOCK_COLOR'; payload: Color }
    | { type: 'END_GAME' }
    | { type: 'RESET_GAME' };
