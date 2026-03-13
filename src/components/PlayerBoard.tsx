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
            <div className="flex flex-wrap justify-between items-center mb-1 px-1 shrink-0 gap-y-1">
                <div className="flex items-center gap-1 sm:gap-2 truncate">
                    <h2 className="font-black text-stone-600 tracking-tighter uppercase truncate" style={{ fontSize: 'clamp(1.2rem, 5cqi, 2rem)' }}>{player.name}</h2>
                    {isActive && (
                        <span className="bg-amber-400 text-amber-900 font-bold px-2 py-0.5 rounded-md shadow-sm animate-pulse whitespace-nowrap" style={{ fontSize: 'clamp(0.6rem, 2.5cqi, 0.9rem)' }}>
                            YOUR TURN
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-1 sm:gap-3 shrink-0 justify-end">
                    {/* Undo Button */}
                    {canUndo && (
                        <button
                            onClick={() => dispatch({ type: 'UNDO_TURN', payload: { playerIndex } })}
                            className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-2 py-1 md:px-3 rounded-full shadow-md active:scale-95 transition-transform uppercase flex items-center gap-1"
                            style={{ fontSize: 'clamp(0.6rem, 2.5cqi, 1rem)' }}
                        >
                            ↩ Undo
                        </button>
                    )}

                    {/* Misthrows */}
                    <div className="flex items-center gap-0.5 md:gap-1.5 bg-stone-300 p-1 rounded-xl shrink-0">
                        <span className="font-bold text-stone-500 mr-1 uppercase hidden sm:inline-block" style={{ fontSize: 'clamp(0.6rem, 1.8cqi, 0.9rem)' }}>Misthrows</span>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`rounded border-2 border-stone-500 flex items-center justify-center font-bold ${i <= player.misthrows ? 'bg-stone-600 text-white' : 'bg-stone-200'} `} style={{ width: 'clamp(1.2rem, 3.5cqi, 2rem)', height: 'clamp(1.2rem, 3.5cqi, 2rem)', fontSize: 'clamp(0.6rem, 2.5cqi, 1.2rem)' }}>
                                {i <= player.misthrows && 'X'}
                            </div>
                        ))}
                        <button
                            onClick={handleMisthrow}
                            className="ml-1 bg-red-500 hover:bg-red-400 rounded text-white font-bold flex items-center justify-center leading-none"
                            style={{ width: 'clamp(1.2rem, 3.5cqi, 2rem)', height: 'clamp(1.2rem, 3.5cqi, 2rem)', fontSize: 'clamp(0.8rem, 2.5cqi, 1.5rem)' }}
                        >
                            +
                        </button>
                    </div>

                    {/* Score */}
                    <div className="bg-stone-700 text-white px-2 py-1 md:px-4 rounded-full font-bold flex items-center gap-1 sm:gap-2 shrink-0" style={{ fontSize: 'clamp(1rem, 4cqi, 2rem)' }}>
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
            <div className="mt-1 flex flex-wrap justify-between md:justify-around px-1 md:px-2 opacity-80 gap-x-1" style={{ fontSize: 'clamp(0.5rem, 2.2cqi, 1.2rem)' }}>
                <span className="text-stone-500 font-bold whitespace-nowrap">1x=1</span>
                <span className="text-stone-500 font-bold whitespace-nowrap">2x=3</span>
                <span className="text-stone-500 font-bold whitespace-nowrap">3x=6</span>
                <span className="text-stone-500 font-bold whitespace-nowrap">4x=10</span>
                <span className="text-stone-500 font-bold whitespace-nowrap">5x=15</span>
                <span className="text-stone-500 font-bold whitespace-nowrap">6x=21</span>
                <span className="text-stone-500 font-bold whitespace-nowrap">7x=28</span>
                <span className="text-stone-500 font-bold whitespace-nowrap">8x=36</span>
                <span className="text-stone-500 font-bold whitespace-nowrap">9x=45</span>
                <span className="text-stone-500 font-bold whitespace-nowrap">10x=55</span>
                <span className="text-stone-500 font-bold whitespace-nowrap">11x=66</span>
                <span className="text-stone-500 font-bold whitespace-nowrap">12x=78</span>
            </div>
        </div>
    );
};
