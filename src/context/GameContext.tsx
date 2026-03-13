import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { initialGameState, gameReducer } from './gameState';
import type { GameState, GameAction } from '../types/game';

interface GameContextProps {
    state: GameState;
    dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

const GameStorageKey = 'qwixx_game_state';

const initGameState = (initialState: GameState): GameState => {
    try {
        const storedState = localStorage.getItem(GameStorageKey);
        if (storedState) {
            return JSON.parse(storedState) as GameState;
        }
    } catch (error) {
        console.error('Failed to load game state from local storage', error);
    }
    return initialState;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(gameReducer, initialGameState, initGameState);

    useEffect(() => {
        localStorage.setItem(GameStorageKey, JSON.stringify(state));
    }, [state]);

    return (
        <GameContext.Provider value={{ state, dispatch }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
