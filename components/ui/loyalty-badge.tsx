export function LoyaltyBadge({ tier }: { tier: 'Mono' | 'Aethel' | 'Noble' }) {
    const styles = {
        Mono: "bg-slate-800 text-slate-300 border-slate-700",
        Aethel: "bg-amber-950 text-amber-400 border-amber-800",
        Noble: "bg-emerald-950 text-emerald-400 border-emerald-800"
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${styles[tier] || styles.Mono}`}>
            {tier ? tier.toUpperCase() : 'MONO'}
        </span>
    );
}
