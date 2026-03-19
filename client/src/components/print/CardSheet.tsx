import type { CardData } from '../../lib/print/types';
import SongCard from './SongCard';

interface CardSheetProps {
  cards: CardData[];
}

export default function CardSheet({ cards }: CardSheetProps) {
  return (
    <div className="card-sheet">
      {cards.map((data, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: slot index within sheet is stable
        <SongCard key={i} data={data} />
      ))}
    </div>
  );
}
