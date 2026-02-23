import { SVGProps } from "react";

const iconClass = "shrink-0 text-accentPurple";

export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={`${iconClass} ${props.className || ""}`}
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
        <path d="M 48.003124,207.99947 V 144.00668" />
        <path d="M 208.00205,207.99948 V 143.99989" />
        <path d="M 80.002888,239.99926 H 176.00225" />
        <path d="m 208.00205,207.99948 a 31.999787,31.999787 0 0 1 -31.9998,31.99978" />
        <path d="m 48.003124,207.99948 a 31.999787,31.999787 0 0 0 31.999764,31.99978" />
        <path d="m 128.00258,207.99949 v -31.9998" />
        <path d="M 47.996095,144.00668 A 15.999894,15.999894 0 0 1 63.995976,128.0068" />
        <path d="M 208.00205,143.99989 A 15.999894,15.999894 0 0 0 192.00218,128" />
        <path d="M 176.00225,64.00042 A 47.999683,47.999683 0 0 0 128.00258,16.00074" />
        <path d="M 80.002812,64.00042 A 47.999683,47.999683 0 0 1 128.00249,16.00074" />
        <path d="M 80.002888,128 V 63.907475" />
        <path d="M 176.00225,64.000424 V 128" />
        <path d="M 64.003006,128 H 192.00218" />
      </g>
    </svg>
  );
}

export function FileImageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`${iconClass} ${props.className || ""}`}
      {...props}
    >
      <path d="M4 0h8a2 2 0 0 1 2 2v8.293l-2.73-2.73a1 1 0 0 0-1.52.127l-1.889 2.644l-1.769-1.062a1 1 0 0 0-1.222.15L2 12.292V2a2 2 0 0 1 2-2m4.002 5.5a1.5 1.5 0 1 0-3 0a1.5 1.5 0 0 0 3 0" />
      <path d="M10.564 8.27L14 11.708V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-.293l3.578-3.577 2.56 1.536 2.426-3.395z" />
    </svg>
  );
}

export function PeopleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`${iconClass} ${props.className || ""}`}
      {...props}
    >
      <path d="M9 11a4 4 0 1 0-4-4a4 4 0 0 0 4 4m0-6a2 2 0 1 1-2 2a2 2 0 0 1 2-2m8 8a3 3 0 1 0-3-3a3 3 0 0 0 3 3m0-4a1 1 0 1 1-1 1a1 1 0 0 1 1-1m0 5a5 5 0 0 0-3.06 1.05A7 7 0 0 0 2 20a1 1 0 0 0 2 0a5 5 0 0 1 10 0a1 1 0 0 0 2 0a6.9 6.9 0 0 0-.86-3.35A3 3 0 0 1 20 19a1 1 0 0 0 2 0a5 5 0 0 0-5-5" />
    </svg>
  );
}

export function KeyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`${iconClass} ${props.className || ""}`}
      {...props}
    >
      <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8m4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5" />
      <path d="M4 8a1 1 0 1 1-2 0a1 1 0 0 1 2 0" />
    </svg>
  );
}
