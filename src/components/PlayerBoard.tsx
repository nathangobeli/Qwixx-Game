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
        <div className={`w-full h-full bg-stone-100 rounded-2xl md:rounded-3xl p-1.5 sm:p-2 md:p-4 shadow-2xl border-4 ${isActive ? 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.6)]' : 'border-stone-300'} relative flex flex-col ${inverted ? 'rotate-180' : ''}`} style={{ containerType: 'inline-size' }}>

            {/* Removed absolute Active Turn Indicator */}

            {/* Header Info */}
            <div className="flex justify-between items-center mb-1 px-1 shrink-0">
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 truncate">
                    <h2 className="font-black text-stone-600 tracking-tighter uppercase truncate" style={{ fontSize: 'clamp(1rem, 4cqi, 1.8rem)' }}>{player.name}</h2>
                    {isActive && (
                        <span className="bg-amber-400 text-amber-900 font-bold px-2 py-0.5 rounded-md shadow-sm animate-pulse w-fit whitespace-nowrap" style={{ fontSize: 'clamp(0.6rem, 2cqi, 0.9rem)' }}>
                            YOUR TURN
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1 md:gap-4 shrink-0">
                    {/* Undo Button */}
                    {canUndo && (
                        <button
                            onClick={() => dispatch({ type: 'UNDO_TURN', payload: { playerIndex } })}
                            className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-md active:scale-95 transition-transform uppercase flex items-center gap-1"
                            style={{ fontSize: 'clamp(0.6rem, 2.5cqi, 1rem)' }}
                        >
                            ↩ Undo
                        </button>
                    )}

                    {/* Misthrows */}
                    <div className="flex items-center gap-0.5 md:gap-1.5 bg-stone-300 p-1 md:p-1.5 rounded-xl shrink-0">
                        <span className="font-bold text-stone-500 mr-1 uppercase hidden sm:inline-block" style={{ fontSize: 'clamp(0.6rem, 1.8cqi, 0.9rem)' }}>Misthrows</span>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`rounded border-2 border-stone-500 flex items-center justify-center font-bold ${i <= player.misthrows ? 'bg-stone-600 text-white' : 'bg-stone-200'} `} style={{ width: 'clamp(1rem, 3cqi, 1.5rem)', height: 'clamp(1rem, 3cqi, 1.5rem)', fontSize: 'clamp(0.6rem, 2cqi, 1rem)' }}>
                                {i <= player.misthrows && 'X'}
                            </div>
                        ))}
                        <button
                            onClick={handleMisthrow}
                            className="ml-1 md:ml-2 bg-red-500 hover:bg-red-400 rounded text-white font-bold flex items-center justify-center leading-none"
                            style={{ width: 'clamp(1.2rem, 3.5cqi, 1.8rem)', height: 'clamp(1.2rem, 3.5cqi, 1.8rem)', fontSize: 'clamp(0.8rem, 2.5cqi, 1.2rem)' }}
                        >
                            +
                        </button>
                    </div>

                    {/* Score */}
                    <div className="bg-stone-700 text-white px-2 py-1 md:px-4 md:py-1.5 rounded-full font-bold flex items-center gap-1 md:gap-2 shrink-0" style={{ fontSize: 'clamp(1rem, 4cqi, 2rem)' }}>
                        <span className="text-stone-300 uppercase" style={{ fontSize: 'clamp(0.6rem, 2cqi, 1rem)' }}>Score</span>
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
