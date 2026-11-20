import type { TechId } from "./stackCoverflowMath";

interface TechIconProps {
  id: TechId;
  className?: string;
}

export function TechIcon({ id, className = "h-8 w-8 md:h-10 md:w-10" }: TechIconProps) {
  switch (id) {
    case "python":
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <path
            d="M23.7 6C16.2 6 16.7 9.2 16.7 9.2V13.4H24V14.8H13.8C13.8 14.8 8.5 14.2 8.5 22.1C8.5 30 13.1 29.7 13.1 29.7H15.8V25.9C15.8 25.9 15.6 21.3 20.3 21.3H28C28 21.3 32.3 21.4 32.3 17.2V10.4C32.3 10.4 33 6 23.7 6ZM19.6 8.5C20.4 8.5 21 9.1 21 9.9C21 10.7 20.4 11.3 19.6 11.3C18.8 11.3 18.2 10.7 18.2 9.9C18.2 9.1 18.8 8.5 19.6 8.5Z"
            fill="#60A5FA"
          />
          <path
            d="M24.3 42C31.8 42 31.3 38.8 31.3 38.8V34.6H24V33.2H34.2C34.2 33.2 39.5 33.8 39.5 25.9C39.5 18 34.9 18.3 34.9 18.3H32.2V22.1C32.2 22.1 32.4 26.7 27.7 26.7H20C20 26.7 15.7 26.6 15.7 30.8V37.6C15.7 37.6 15 42 24.3 42ZM28.4 39.5C27.6 39.5 27 38.9 27 38.1C27 37.3 27.6 36.7 28.4 36.7C29.2 36.7 29.8 37.3 29.8 38.1C29.8 38.9 29.2 39.5 28.4 39.5Z"
            fill="#FACC15"
          />
        </svg>
      );

    case "swift":
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <path
            d="M37.4 33.1C39.8 29.3 40.7 24.5 39.5 19.8C38.4 15.2 35.4 11.3 31.2 9C33.5 13.7 33.9 19.2 31.7 24C26.4 19.7 20.6 14.5 16.4 9.7C18.3 14.8 21.8 20.3 25.8 24.5C20.2 21.3 14.3 16.7 10.6 11.8C12.8 18.2 17.5 24.5 23.3 28.4C17.8 29.2 12.1 27.8 7.5 24.6C10.9 31.6 18.3 36.3 26.5 36.3C30.4 36.3 34.1 35.1 37.1 33.1C38.4 34.4 39.6 35.9 40.3 37.6C40.9 35.8 39.4 34 37.4 33.1Z"
            fill="#FB923C"
          />
        </svg>
      );

    case "nodejs":
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <path
            d="M24 5.5L39.8 14.6V33.4L24 42.5L8.2 33.4V14.6L24 5.5Z"
            stroke="#4ADE80"
            strokeWidth="2.8"
            strokeLinejoin="round"
            fill="rgba(34, 197, 94, 0.14)"
          />
          <path
            d="M19.5 30.8V17.6L28.5 30.8V17.6"
            stroke="#86EFAC"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "flutter":
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <path d="M26.2 6L9.5 22.7L14.8 28L36.8 6H26.2Z" fill="#7DD3FC" />
          <path d="M26.2 21.4L17.4 30.2L22.7 35.5L36.8 21.4H26.2Z" fill="#38BDF8" />
          <path d="M22.7 35.5L26.2 39H36.8L28 30.2L22.7 35.5Z" fill="#0284C7" />
        </svg>
      );

    case "solidity":
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <path d="M28.6 6L21.4 18.8H11.6L18.8 6H28.6Z" fill="#E9D5FF" />
          <path d="M21.4 18.8H31.2L28.6 6L21.4 18.8Z" fill="#C084FC" />
          <path d="M18.8 6L11.6 18.8L16.5 27.4L23.7 14.6L18.8 6Z" fill="#A855F7" fillOpacity="0.72" />
          <path d="M19.4 42L26.6 29.2H36.4L29.2 42H19.4Z" fill="#E9D5FF" />
          <path d="M26.6 29.2H16.8L19.4 42L26.6 29.2Z" fill="#C084FC" />
          <path d="M29.2 42L36.4 29.2L31.5 20.6L24.3 33.4L29.2 42Z" fill="#9333EA" fillOpacity="0.75" />
        </svg>
      );

    case "docker":
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <rect x="13" y="19" width="4.8" height="4.2" rx="0.8" fill="#67E8F9" />
          <rect x="19" y="19" width="4.8" height="4.2" rx="0.8" fill="#67E8F9" />
          <rect x="25" y="19" width="4.8" height="4.2" rx="0.8" fill="#67E8F9" />
          <rect x="19" y="13.5" width="4.8" height="4.2" rx="0.8" fill="#22D3EE" />
          <rect x="25" y="13.5" width="4.8" height="4.2" rx="0.8" fill="#22D3EE" />
          <rect x="25" y="8" width="4.8" height="4.2" rx="0.8" fill="#06B6D4" />
          <path
            d="M7.5 25.5H33.5C35.2 25.5 36.8 24.4 37.5 22.8C38.6 23.6 39.8 24.1 41.2 24C40.9 26.6 39.2 28.4 37.2 29.1C35.2 35.1 29.6 38.5 21.8 38.5C13.6 38.5 7.5 33.9 7.5 25.5Z"
            fill="#22D3EE"
          />
          <circle cx="15.2" cy="30.2" r="1.4" fill="#070B12" />
        </svg>
      );
  }
}
