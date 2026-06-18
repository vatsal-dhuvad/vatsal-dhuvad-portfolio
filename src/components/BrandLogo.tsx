type BrandLogoProps = {
  className?: string;
  label?: string;
};

export default function BrandLogo({ className = "", label = "Vatsal Dhuvad" }: BrandLogoProps) {
  return (
    <span className={`brand-logo ${className}`} aria-label={label}>
      <svg viewBox="0 0 180 180" role="img" aria-hidden="true">
        <rect width="180" height="180" rx="34" fill="#000000" />
        <path
          d="M34 52L66 128L98 52"
          fill="none"
          stroke="#ffffff"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M113 52V128H136C158 128 171 112 171 90C171 68 158 52 136 52H113Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
