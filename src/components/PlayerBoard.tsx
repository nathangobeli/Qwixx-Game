import { useGame } from '../context/GameContext';
import { Row } from './Row';

interface PlayerBoardProps {
    playerIndex: 0 | 1;
    inverted?: boolean;
}

export const PlayerBoard = ({ playerIndex, inverted = false }: PlayerBoardProps) => {
    const { state, dispatch } = useGame();
    const player = state.players[playerIndex];
    const isActive = state.activePlayerIndex === playerIndex;

    const handleMisthrow = () => {
        if (player.misthrows < 4) {
            dispatch({ type: 'MARK_MISTHROW', payload: { playerIndex } });
        }
    };

    const canUndo = state.currentPhase === 'ACTION1' && (player.turnActionsTaken.whiteMarked || player.turnActionsTaken.colorMarked);

    return (
        <div className={`w-full max-w-[1000px] bg-stone-100 rounded-3xl p-2 sm:p-4 md:p-6 shadow-2xl border-4 md:border-8 ${isActive ? 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.6)]' : 'border-stone-300'} relative flex flex-col h-full ${inverted ? 'rotate-180' : ''}`}>

            {/* Removed absolute Active Turn Indicator */}

            {/* Header Info */}
            <div className="flex justify-between items-center mb-1 sm:mb-2 px-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 truncate">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-stone-600 tracking-tighter uppercase truncate">{player.name}</h2>
                    {isActive && (
                        <span className="bg-amber-400 text-amber-900 font-bold px-3 py-1 rounded-md text-[10px] sm:text-xs md:text-sm shadow-sm animate-pulse w-fit whitespace-nowrap">
                            YOUR TURN
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1 sm:gap-4 md:gap-6">
                    {/* Undo Button */}
                    {canUndo && (
                        <button
                            onClick={() => dispatch({ type: 'UNDO_TURN', payload: { playerIndex } })}
                            className="bg-blue-500 hover:bg-blue-400 text-white text-[10px] sm:text-sm md:text-base font-bold px-2 py-1 sm:px-4 sm:py-2 rounded-full shadow-md active:scale-95 transition-transform uppercase flex items-center gap-1"
                        >
                            ↩ Undo
                        </button>
                    )}

                    {/* Misthrows */}
                    <div className="flex items-center gap-0.5 sm:gap-1.5 bg-stone-300 p-1 sm:p-2 rounded-xl shrink-0">
                        <span className="text-[10px] sm:text-sm md:text-base font-bold text-stone-500 mr-1 uppercase hidden sm:inline-block">Misthrows</span>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded border-2 md:border-4 border-stone-500 flex items-center justify-center text-[10px] sm:text-sm md:text-xl font-bold ${i <= player.misthrows ? 'bg-stone-600 text-white' : 'bg-stone-200'} `}>
                                {i <= player.misthrows && 'X'}
                            </div>
                        ))}
                        <button
                            onClick={handleMisthrow}
                            className="ml-1 md:ml-2 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-red-500 hover:bg-red-400 rounded text-white font-bold text-sm md:text-xl flex items-center justify-center leading-none"
                        >
                            +
                        </button>
                    </div>

                    {/* Score */}
                    <div className="bg-stone-700 text-white px-3 py-1 sm:px-5 sm:py-2 rounded-full font-bold text-base sm:text-xl md:text-3xl flex items-center gap-2 shrink-0">
                        <span className="text-[10px] sm:text-sm md:text-base text-stone-300 uppercase">Score</span>
                        {player.score}
                    </div>
                </div>
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-1 sm:gap-2 flex-1 min-h-0 mt-1 sm:mt-2">
                <Row playerIndex={playerIndex} color="red" rowState={player.rows.red} />
                <Row playerIndex={playerIndex} color="yellow" rowState={player.rows.yellow} />
                <Row playerIndex={playerIndex} color="green" rowState={player.rows.green} />
                <Row playerIndex={playerIndex} color="blue" rowState={player.rows.blue} />
            </div>

            {/* Footer Info (Scoring Legend - simplified) */}
            <div className="mt-1 sm:mt-3 md:mt-4 text-[8px] sm:text-xs md:text-sm text-stone-500 font-bold flex justify-between px-2 sm:px-6 md:px-8 opacity-80">
                <span>1x=1</span>
                <span>2x=3</span>
                <span>3x=6</span>
                <span>4x=10</span>
                <span>5x=15</span>
                <span>6x=21</span>
                <span>7x=28</span>
                <span>8x=36</span>
                <span>9x=45</span>
                <span>10x=55</span>
                <span>11x=66</span>
                <span>12x=78</span>
            </div>
        </div>
    );
};
