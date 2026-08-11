export function StarMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <use href="#babylon-star" />
    </svg>
  );
}
