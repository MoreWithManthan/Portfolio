import {
  BarChart3,
  Blocks,
  Boxes,
  Code2,
  Combine,
  Cpu,
  Crosshair,
  Fingerprint,
  GitBranch,
  KeyRound,
  Microchip,
  Network,
  RadioTower,
  ScanLine,
  Split,
  Waves,
  Webhook,
} from 'lucide-react';
import Image from 'next/image';

const logos: Record<string, string> = {
  'C++': 'cplusplus',
  Linux: 'linux',
  React: 'react',
  SQLite: 'sqlite',
  Java: 'java',
  Python: 'python',
  JavaScript: 'javascript',
  Bash: 'bash',
  HTML: 'html5',
  'Arch Linux': 'archlinux',
  'Windows APIs': 'windows',
  Git: 'git',
  'Node.js': 'nodejs',
  FastAPI: 'fastapi',
  TensorFlow: 'tensorflow',
  Keras: 'keras',
  Streamlit: 'streamlit',
  Plotly: 'plotly',
  NumPy: 'numpy',
};
const symbols: Record<string, typeof Code2> = {
  YARA: ScanLine,
  IoT: RadioTower,
  DSP: Waves,
  'Entropy analysis': BarChart3,
  'Heuristic detection': Fingerprint,
  'Network security': Network,
  Cryptography: KeyRound,
  'MITRE ATT&CK': Crosshair,
  'Embedded systems': Cpu,
  'IoT architecture': RadioTower,
  'Sensor fusion': Combine,
  'REST APIs': Webhook,
  SHAP: BarChart3,
  'Data structures & algorithms': GitBranch,
  OOP: Boxes,
  'Design patterns': Blocks,
  Concurrency: Split,
  'OS internals': Microchip,
  'Signal processing': Waves,
};
export default function TechnologyIcon({ name }: { name: string }) {
  const logo = logos[name];
  if (logo)
    return (
      <Image
        src={`/technologies/${logo}.svg`}
        width={32}
        height={32}
        alt=""
        aria-hidden
        className={`technology-logo technology-${logo}`}
      />
    );
  const Icon = symbols[name] ?? Code2;
  return (
    <Icon
      className="technology-symbol"
      size={29}
      strokeWidth={1.65}
      aria-hidden
    />
  );
}
