export default function Arrow({ direction = 'right', className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      className={className}
      data-direction={direction}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
    >
      {direction === 'down' ? <path d="M10 3v13M4.5 10.5 10 16l5.5-5.5" /> : <path d="M3 10h13M10.5 4.5 16 10l-5.5 5.5" />}
    </svg>
  );
}
