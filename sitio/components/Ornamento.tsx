export default function Ornamento({ className = "" }: { className?: string }) {
  return (
    <p className={`text-center tracking-[0.6em] text-sm texto-2 select-none ${className}`} aria-hidden="true">
      ◆ ◆ ◆
    </p>
  );
}
