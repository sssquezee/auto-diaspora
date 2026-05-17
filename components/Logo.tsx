import { Link } from "@/i18n/navigation";

type Props = {
  className?: string;
  invert?: boolean;
};

export function Logo({ className = "", invert = false }: Props) {
  return (
    <Link
      href="/"
      className={`inline-flex items-baseline font-sans font-black uppercase leading-none tracking-[-0.05em] ${
        invert ? "text-white" : "text-ink"
      } ${className}`}
    >
      <span>AUTO</span>
      <span className="bg-accent text-white px-1.5 pt-[2px] pb-px ml-0.5 inline-block">
        DIASPORA
      </span>
    </Link>
  );
}
