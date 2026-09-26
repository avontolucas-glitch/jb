export default function Ornamento({ className = "" }: { className?: string }) {
  return (
    <p className={`ornamento revelar text-center tracking-[0.6em] text-sm texto-2 select-none ${className}`} aria-hidden="true">
      <span>◆</span> <span>◆</span> <span>◆</span>
    </p>
  );
}
