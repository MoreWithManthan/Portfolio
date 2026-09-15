export const projects = [
  {
    name: 'SENTRA CORE V2',
    kind: 'Endpoint security & threat intelligence',
    date: 'June 2026 — Present',
    icon: 'shield',
    status: 'Active project',
    url: 'https://github.com/MoreWithManthan/Sentra-Core-V2',
    description:
      'Making endpoint activity easier to investigate. Static file analysis, multi-source reputation checks, and live system telemetry in one platform.',
    tags: ['Python', 'FastAPI', 'YARA', 'React', 'SQLite'],
    details: [
      'Combined YARA signature matching, Shannon entropy analysis, heuristic risk scoring, and keyword-based MITRE ATT&CK mapping.',
      'Integrated VirusTotal, MalwareBazaar, AlienVault OTX, AbuseIPDB, and URLhaus with cached verdicts and Windows Authenticode fallback.',
      'Streamed CPU, memory, process, and network telemetry over WebSockets at one-second intervals. Added scan history, scheduled scans, and PDF audit reports.',
    ],
  },
  {
    name: 'NeuroSole',
    kind: 'Smart healthcare wearable',
    date: 'February — May 2026',
    icon: 'activity',
    status: 'Patent published',
    url: 'https://github.com/MoreWithManthan/NeuroSole',
    live: 'https://neurosole.vercel.app',
    description:
      'From physical signals to meaningful data. A connected wearable combining pressure, motion, and muscle sensing with a remote healthcare dashboard.',
    tags: ['Embedded systems', 'IoT', 'Sensor fusion', 'DSP'],
    details: [
      'Built a data acquisition pipeline around FSR pressure sensors, MPU6050 IMU, and EMG sensors.',
      'Applied digital signal processing to plantar-pressure patterns and asynchronous ingestion between firmware and cloud analytics.',
      'Patent published for the hardware-software integration. Publication is distinct from patent grant; no clinical performance claims are made.',
    ],
  },
  {
    name: 'NervoStep-ML',
    kind: 'Multimodal ML research prototype',
    date: 'April — June 2026',
    icon: 'brain',
    status: 'Research prototype',
    url: 'https://github.com/MoreWithManthan/NervoStep-ML',
    description:
      'Exploring multimodal time-series classification with recurrent and convolutional models, explainable outputs, and an interactive research dashboard.',
    tags: ['TensorFlow', 'Keras', 'SHAP', 'Streamlit'],
    details: [
      'Implemented GRU recurrent networks and 1D CNNs for multimodal time-series fusion and three-class classification.',
      'Built NumPy preprocessing and subject-aware ECG train/validation splits, with dropout and early stopping.',
      'Used SHAP feature-attribution heatmaps, SVG gait animations, and Plotly time-series views on simulated scenario inputs. Research prototype, not a clinically validated system.',
    ],
  },
];
export const skills = [
  [
    'Cybersecurity',
    [
      'YARA',
      'Entropy analysis',
      'Heuristic detection',
      'Network security',
      'Cryptography',
      'MITRE ATT&CK',
    ],
  ],
  ['Programming', ['C++', 'Java', 'Python', 'JavaScript', 'Bash', 'HTML']],
  [
    'Systems & IoT',
    [
      'Arch Linux',
      'Windows APIs',
      'Embedded systems',
      'IoT architecture',
      'Sensor fusion',
    ],
  ],
  ['Development', ['Git', 'Node.js', 'REST APIs', 'FastAPI']],
  [
    'ML & data',
    ['TensorFlow', 'Keras', 'SHAP', 'Streamlit', 'Plotly', 'NumPy'],
  ],
  [
    'Core concepts',
    [
      'Data structures & algorithms',
      'OOP',
      'Design patterns',
      'Concurrency',
      'OS internals',
      'Signal processing',
    ],
  ],
] as const;
export const certifications = [
  ['Introduction to Cybersecurity', 'Cisco Networking Academy'],
  ['Cybersecurity Fundamentals', 'IBM SkillsBuild'],
  ['Introduction to Modern AI', 'Cisco Networking Academy'],
  ['Introduction to Data Science', 'Cisco Networking Academy'],
  [
    'Introduction to IoT and Digital Transformation',
    'Cisco Networking Academy',
  ],
  ['Digital Personal Data Protection Act, 2023', 'Certification'],
  ['Design Thinking', 'Infosys Springboard'],
];
export const socialLinks = [
  ['GitHub', 'https://github.com/MoreWithManthan'],
  ['LinkedIn', 'https://www.linkedin.com/in/morewithmanthan/'],
  ['X', 'https://x.com/MoreWithManthan'],
  ['TryHackMe', 'https://tryhackme.com/p/MoreWithManthan'],
  ['HackerRank', 'https://www.hackerrank.com/profile/MoreWithManthan'],
  ['LeetCode', 'https://leetcode.com/u/MoreWithManthan/'],
];
