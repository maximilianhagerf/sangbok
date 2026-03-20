export default function SangbokLogo() {
  return (
    <svg
      width="156"
      height="40"
      viewBox="0 0 156 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Sangbok"
    >
      {/* Quarter note — head at bottom, stem up */}
      <ellipse cx="10" cy="31" rx="6" ry="4.2" fill="#292524" transform="rotate(-18 10 31)" />
      <line x1="15.4" y1="29" x2="15.4" y2="8" stroke="#292524" strokeWidth="1.2" />

      {/* Wordmark */}
      <text
        x="26"
        y="31"
        fontFamily="'DM Serif Display', Georgia, serif"
        fontSize="24"
        fill="#292524"
      >
        Sangbok
      </text>
    </svg>
  );
}
