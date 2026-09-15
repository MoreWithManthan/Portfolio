export async function hashText(text: string, algorithm = 'SHA-256') {
  if (!['SHA-256', 'SHA-384', 'SHA-512', 'SHA-1'].includes(algorithm))
    throw new Error('Unsupported hash algorithm.');
  if (!globalThis.crypto?.subtle)
    throw new Error('Hashing requires HTTPS or localhost.');
  const digest = await crypto.subtle.digest(
    algorithm,
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');
}
export const stages = [
  {
    name: 'Recon',
    prompt:
      'Public metadata can reveal hidden paths. Which path does /robots.txt ask crawlers to skip?',
    hint: 'Use cat robots.txt in the terminal, or open /robots.txt.',
    answer: '/ops',
  },
  {
    name: 'Encoded clue',
    prompt: 'Recovered token: YmVhY29uLTMwMA==. What is the decoded text?',
    hint: 'Use decode YmVhY29uLTMwMA== in the terminal.',
    answer: 'beacon-300',
  },
  {
    name: 'Artifact analysis',
    prompt:
      'Run investigate. Which measurement is 7.86 / 8.00 on the .text section?',
    hint: 'A measure of randomness; high values can be consistent with packing.',
    answer: 'entropy',
  },
  {
    name: 'Network correlation',
    prompt:
      'Run logs. Which destination IP appears in the synthetic outbound connection?',
    hint: 'Look for the address beginning with 203. This is a documentation-only address.',
    answer: '203.0.113.42',
  },
  {
    name: 'ATT&CK mapping',
    prompt:
      'Which ATT&CK sub-technique ID corresponds to Registry Run Keys / Startup Folder in the case notes?',
    hint: 'Run investigate and read the persistence mapping.',
    answer: 't1547.001',
  },
];
export const flag = 'FLAG{static_first_then_correlate}';
export const incident =
  'SIMULATED TRAINING INCIDENT #001\nArtifact: updater_svc.exe\nSignature: unsigned\n.text entropy: 7.86 / 8.00 (not proof of malware)\nPersistence: HKCU\\...\\CurrentVersion\\Run\\UpdaterSvc\nMapping: Registry Run Keys / Startup Folder — T1547.001\nOutbound destination: 203.0.113.42\nAll artifacts are fictional. No live hosts are queried.';
export async function evaluateCommand(raw: string): Promise<string> {
  const [command, ...args] = raw.trim().split(/\s+/);
  const cmd = command.toLowerCase(),
    arg = args.join(' ');
  switch (cmd) {
    case '':
      return '';
    case 'help':
      return 'whoami · about · projects · skills · contact · cv\nls · pwd · cat <file> · investigate · logs\nhash <text> · base64 <text> · decode <base64>\nnmap (simulation) · ping (simulation) · clear · exit\nctf start · ctf status · hint · answer <value> · ctf reset\nTry Tab to autocomplete and ↑ / ↓ for history.\nSome clues are hiding in plain sight.';
    case 'whoami':
    case 'whois':
      return 'Manthan Garg\nCSE student · Cybersecurity enthusiast · Systems builder\nChitkara University, 2024–2028 | Chandigarh, India\nVice Chair, IEEE Student Branch';
    case 'about':
      return 'Building endpoint security tooling, exploring OS internals, and turning raw sensor data into meaningful signals.\nArch Linux enthusiast. Curious by default.';
    case 'projects':
      return 'SENTRA CORE V2 — endpoint security & threat intelligence\nNeuroSole — healthcare wearable, patent published\nNervoStep-ML — multimodal ML research prototype';
    case 'skills':
    case 'arsenal':
      return 'Security: YARA, entropy analysis, heuristic detection, MITRE ATT&CK\nCode: Python, C++, Java, JavaScript, Bash\nSystems: Linux, Windows APIs, embedded systems, sensor fusion\nDevelopment: Git, FastAPI, REST APIs, Node.js\nML: TensorFlow, Keras, NumPy, SHAP, Streamlit, Plotly';
    case 'contact':
      return 'linkwithmanthan@gmail.com\nhttps://github.com/MoreWithManthan\nhttps://www.linkedin.com/in/morewithmanthan/';
    case 'cv':
    case 'resume':
      return '/assets/Manthan_Garg_Resume.pdf';
    case 'pwd':
      return '/home/visitor';
    case 'ls':
    case 'dir':
      return 'about.txt  projects.txt  robots.txt  custom.yar  .ops  .ctf';
    case 'cat':
      if (arg === 'robots.txt' || arg === '/robots.txt')
        return 'User-agent: *\nDisallow: /ops\n# A training clue, not access control.';
      if (arg === 'custom.yar')
        return 'rule CuriousCat {\n  meta:\n    clue = "Try ctf start. Follow the evidence."\n  condition:\n    false\n}';
      if (arg === 'about.txt') return evaluateCommand('about');
      if (arg === 'projects.txt') return evaluateCommand('projects');
      if (arg === '.ops') return 'Recovered token: YmVhY29uLTMwMA==';
      return 'cat: file not found. Try ls.';
    case 'investigate':
      return incident;
    case 'logs':
      return 'SIMULATED TELEMETRY\n02:41:12Z — Registry Run key created\n02:41:19Z — updater_svc.exe started\n02:41:24Z — outbound TCP/443 → 203.0.113.42\n02:47:03Z — repeating 300s beacon';
    case 'ops':
      return 'Recovered token: YmVhY29uLTMwMA==';
    case 'hash':
      return arg
        ? await hashText(arg)
        : 'Usage: hash <text> (SHA-256). Use the calculator to hash empty input.';
    case 'base64':
      return btoa(
        Array.from(new TextEncoder().encode(arg), (b) =>
          String.fromCharCode(b),
        ).join(''),
      );
    case 'decode':
    case 'decode64':
      try {
        return new TextDecoder('utf-8', { fatal: true }).decode(
          Uint8Array.from(atob(arg), (c) => c.charCodeAt(0)),
        );
      } catch {
        return 'Invalid Base64 or UTF-8 input.';
      }
    case 'nmap':
      return 'SIMULATION — no network request was sent\nHost: localhost (synthetic)\n443/tcp   open    https\n8080/tcp  closed  http-alt';
    case 'ping':
      return 'SIMULATION — no network request was sent\nlocalhost: time=0.42 ms (synthetic)';
    case 'sudo':
      return 'Permission denied. Even the cat runs with least privilege.';
    case 'banner':
      return 'MANTHAN GARG // curious by default\nThe cat knows something. Try ctf start.';
    case 'yara':
      return 'Training rule available: cat custom.yar';
    case 'hashcat':
      return 'This browser lab does not run hashcat. Try hash <text> to compute SHA-256.';
    case 'sysinfo':
      return 'Browser-only portfolio shell. No access to your operating system.';
    case 'matrix':
      return 'Follow the white cat. 🐾';
    default:
      return `${command}: command not found. Type help.`;
  }
}
