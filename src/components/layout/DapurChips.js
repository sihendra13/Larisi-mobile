'use client';

const CHIPS = ['aset', 'audiens', 'ai', 'preview'];
const LABELS = { aset: 'Aset', audiens: 'Audiens', ai: 'Pesan', preview: 'Preview' };

export default function DapurChips({ activeChip, onChipChange }) {
  const activeIdx = CHIPS.indexOf(activeChip);

  return (
    <div id="mobile-dapur-chips" className="mobile-dapur-chips" style={{display:'flex', gap:'8px', overflowX:'auto', padding:'0 16px', margin:'0 -16px'}}>
      {CHIPS.map((chip, idx) => {
        const isDone = idx < activeIdx;
        const isActive = chip === activeChip;
        
        let Icon = null;
        if (chip === 'aset') Icon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
        if (chip === 'audiens') Icon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
        if (chip === 'ai') Icon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
        if (chip === 'preview') Icon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8l4 4-4 4M8 12h8"/></svg>;

        return (
          <button
            key={chip}
            style={{
              display:'flex', alignItems:'center', gap:'6px',
              padding:'8px 14px', borderRadius:'999px',
              background: isActive ? 'var(--m-brand)' : '#fff',
              color: isActive ? '#fff' : 'var(--m-ink-sub)',
              border: isActive ? '1px solid var(--m-brand)' : '1px solid #E2E2EA',
              fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'600',
              cursor:'pointer', whiteSpace:'nowrap', flexShrink:0
            }}
            onClick={() => onChipChange(chip)}
          >
            {Icon}
            <span>{idx + 1} . {LABELS[chip]}</span>
          </button>
        );
      })}
    </div>
  );
}
