'use client';

const CHIPS = ['aset', 'audiens', 'ai', 'preview'];
const LABELS = { aset: 'Aset', audiens: 'Audiens', ai: 'Pesan', preview: 'Preview' };

export default function DapurChips({ activeChip, onChipChange }) {
  const activeIdx = CHIPS.indexOf(activeChip);

  return (
    <div id="mobile-dapur-chips" className="mobile-dapur-chips">
      {CHIPS.map((chip, idx) => {
        const isDone = idx < activeIdx;
        const isActive = chip === activeChip;
        return (
          <button
            key={chip}
            className={`mobile-dapur-chip${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}
            data-chip={chip}
            onClick={() => onChipChange(chip)}
          >
            <span className="chip-step">{isDone ? '✓' : idx + 1}</span>
            <span className="chip-label">{LABELS[chip]}</span>
          </button>
        );
      })}
    </div>
  );
}
