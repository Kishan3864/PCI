import { cn } from '@/lib/utils';

/**
 * ThreatDiagram — SVG illustration of the skimming threat model:
 * checkout page loads scripts; ScriptProof sits in the middle; a malicious
 * injection is caught before it reaches card data. Pure inline SVG.
 */
export function ThreatDiagram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 320"
      role="img"
      aria-label="Diagram: ScriptProof monitors checkout scripts and flags a malicious injection"
      className={cn('h-auto w-full', className)}
    >
      <defs>
        <linearGradient id="td-cyan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <marker id="td-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill="rgba(103,232,249,0.7)" />
        </marker>
        <marker id="td-arrow-red" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill="rgba(251,113,133,0.8)" />
        </marker>
      </defs>

      {/* checkout browser */}
      <g>
        <rect x="16" y="88" width="150" height="144" fill="rgba(13,24,44,0.9)" stroke="rgba(148,163,184,0.25)" strokeWidth="1.5" />
        <rect x="16" y="88" width="150" height="22" fill="rgba(26,44,73,0.9)" />
        <circle cx="28" cy="99" r="3" fill="#fb7185" opacity="0.8" />
        <circle cx="38" cy="99" r="3" fill="#fbbf24" opacity="0.8" />
        <circle cx="48" cy="99" r="3" fill="#34d399" opacity="0.8" />
        <text x="91" y="132" textAnchor="middle" fill="#e6edf7" fontSize="12" fontWeight="700" fontFamily="ui-sans-serif, system-ui">Your checkout</text>
        <rect x="32" y="146" width="118" height="10" fill="rgba(148,163,184,0.2)" />
        <rect x="32" y="162" width="90" height="10" fill="rgba(148,163,184,0.14)" />
        <rect x="32" y="186" width="118" height="26" fill="rgba(34,211,238,0.12)" stroke="rgba(34,211,238,0.4)" strokeWidth="1" />
        <text x="91" y="203" textAnchor="middle" fill="#67e8f9" fontSize="10" fontFamily="ui-monospace, monospace">card number ••••</text>
      </g>

      {/* scripts flowing in */}
      <g fontFamily="ui-monospace, monospace" fontSize="10">
        <rect x="216" y="40" width="128" height="24" fill="rgba(13,24,44,0.9)" stroke="rgba(52,211,153,0.45)" strokeWidth="1" />
        <text x="280" y="56" textAnchor="middle" fill="#6ee7b7">stripe.js ✓</text>
        <rect x="216" y="76" width="128" height="24" fill="rgba(13,24,44,0.9)" stroke="rgba(52,211,153,0.45)" strokeWidth="1" />
        <text x="280" y="92" textAnchor="middle" fill="#6ee7b7">checkout.js ✓</text>
        <rect x="216" y="112" width="128" height="24" fill="rgba(13,24,44,0.9)" stroke="rgba(52,211,153,0.45)" strokeWidth="1" />
        <text x="280" y="128" textAnchor="middle" fill="#6ee7b7">gtm.js ✓</text>
        {/* malicious */}
        <g>
          <rect x="216" y="228" width="128" height="24" fill="rgba(76,5,25,0.55)" stroke="rgba(251,113,133,0.7)" strokeWidth="1.5" strokeDasharray="4 3" />
          <text x="280" y="244" textAnchor="middle" fill="#fda4af">skimmer.js ✕</text>
        </g>
      </g>

      {/* ScriptProof shield */}
      <g>
        <path d="M420 96 464 112 v40 c0 26-18 46-44 55 -26-9-44-29-44-55 v-40 z" fill="rgba(34,211,238,0.1)" stroke="url(#td-cyan)" strokeWidth="2" />
        <path d="M403 152 l12 12 22 -26" fill="none" stroke="#67e8f9" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="420" y="236" textAnchor="middle" fill="#e6edf7" fontSize="12" fontWeight="700" fontFamily="ui-sans-serif, system-ui">ScriptProof</text>
        <text x="420" y="252" textAnchor="middle" fill="#7d8ba1" fontSize="10" fontFamily="ui-sans-serif, system-ui">fingerprints every script</text>
      </g>

      {/* flows: scripts -> browser */}
      <g stroke="rgba(103,232,249,0.45)" strokeWidth="1.5" fill="none">
        <path d="M216 52 C 190 52 186 120 168 130" markerEnd="url(#td-arrow)" />
        <path d="M216 88 C 196 88 192 128 168 140" markerEnd="url(#td-arrow)" />
        <path d="M216 124 C 200 124 196 140 168 150" markerEnd="url(#td-arrow)" />
      </g>
      {/* malicious flow blocked */}
      <g>
        <path d="M216 240 C 196 240 190 190 170 178" fill="none" stroke="rgba(251,113,133,0.65)" strokeWidth="1.5" strokeDasharray="5 4" markerEnd="url(#td-arrow-red)" />
        <g>
          <circle cx="193" cy="212" r="11" fill="#1c0a12" stroke="#fb7185" strokeWidth="1.5" />
          <path d="M188 207 l10 10 M198 207 l-10 10" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
      {/* monitoring flows: shield watches scripts */}
      <g stroke="rgba(34,211,238,0.5)" strokeWidth="1.5" fill="none" strokeDasharray="1 5" strokeLinecap="round">
        <path d="M376 132 C 362 116 356 92 344 76" />
        <path d="M376 144 C 360 136 356 120 344 106" />
        <path d="M376 168 C 358 186 356 216 344 234" />
      </g>

      {/* alert out of shield */}
      <g>
        <rect x="452" y="256" width="96" height="26" fill="rgba(76,5,25,0.55)" stroke="rgba(251,113,133,0.7)" strokeWidth="1" />
        <text x="500" y="273" textAnchor="middle" fill="#fda4af" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif, system-ui">⚠ email alert</text>
        <path d="M446 210 C 460 224 470 240 476 254" fill="none" stroke="rgba(251,113,133,0.5)" strokeWidth="1.5" markerEnd="url(#td-arrow-red)" />
      </g>
    </svg>
  );
}
