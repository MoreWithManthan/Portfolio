import TechnologyIcon from './TechnologyIcon';

export default function TechnologyBadge({ name }: { name: string }) {
  return (
    <span
      className="technology-token"
      tabIndex={0}
      role="img"
      aria-label={name}
    >
      <TechnologyIcon name={name} />
      <span className="technology-tooltip" aria-hidden>
        {name}
      </span>
    </span>
  );
}
