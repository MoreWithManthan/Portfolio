import { flag, stages } from './security';

export type KittuReply = { text: string; action?: 'ctf' | 'terminal' | 'hash' };
export function readCtfStage(): number {
  try {
    const n = Number(localStorage.getItem('manthan-sleek-ctf'));
    return Number.isInteger(n) && n >= 0 && n <= stages.length ? n : 0;
  } catch {
    return 0;
  }
}
const explanations = [
  'robots.txt gives instructions to web crawlers. The Disallow line names a path. It is public metadata, not a password or access-control rule. Read it with cat robots.txt in the terminal.',
  'Base64 turns bytes into printable text. It is an encoding, not encryption. Paste the recovered token after the terminal’s decode command, then submit the resulting plaintext.',
  'Entropy measures how unpredictable data looks. High entropy can be consistent with compression, encryption, or packing, so it cannot prove a file is malicious on its own. Compare the measurement with the case notes.',
  'Correlating process events with network connections helps reconstruct a timeline. Run logs and look at the outbound TCP/443 entry. The IP is from a documentation range; there is no live target.',
  'MITRE ATT&CK gives techniques shared identifiers. This case involves a Registry Run key that starts a program at sign-in. The investigate output lists the corresponding sub-technique ID.',
];
export function kittuReply(message: string, stage: number): KittuReply {
  const q = message.toLowerCase().trim();
  const index = Math.min(
    Math.max(Number.isInteger(stage) ? stage : 0, 0),
    stages.length,
  );
  const current = stages[index];
  if (/^(hi|hey|hello|meow|kittu)[!. ]*$/.test(q))
    return {
      text: 'Mrrp! I’m Kittu, your guide to Manthan’s five-stage CTF. Ask for a hint, an explanation, or help with the terminal. You can also drag me to a comfy spot.',
    };
  if (/pet|purr|good (cat|kitty)|cute/.test(q))
    return { text: 'Prrr… morale restored. Now let’s follow the evidence. 🐾' };
  if (/drag|move you|move the cat/.test(q))
    return {
      text: 'Hold and drag me with your mouse or finger. You can also focus me with Tab and use the arrow keys to move me. I’ll stay where you put me until you select “Let Kittu roam”.',
    };
  if (/thank/.test(q))
    return {
      text: 'You’re welcome. A curious mind is a good investigation tool. 🐾',
    };
  if (/open.*(hash|calculator)|hash (tool|calculator)/.test(q))
    return {
      text: 'The hash calculator creates SHA fingerprints from text or a file. It runs entirely in your browser.',
      action: 'hash',
    };
  if (/open.*(terminal|shell)|launch.*terminal/.test(q))
    return {
      text: 'Let’s open the terminal. Type help for commands; use ↑ and ↓ for history.',
      action: 'terminal',
    };
  if (/start|begin|open.*ctf|play|continue.*challenge/.test(q))
    return {
      text:
        index === stages.length
          ? 'You’ve completed all five stages. The CTF panel has your flag and a reset option.'
          : `Let’s investigate. You’re on stage ${index + 1}: ${current.name}. ${current.prompt}`,
      action: 'ctf',
    };
  if (/progress|score|stage|where am i|status/.test(q))
    return {
      text:
        index === stages.length
          ? `All five stages are complete — 100/100. ${flag}`
          : `You’ve solved ${index} of 5 stages (${index * 20}/100). Current stage: ${current.name}. ${current.prompt}`,
    };
  if (/answer|solution|flag|spoiler/.test(q))
    return {
      text:
        index === stages.length
          ? `You earned it: ${flag}`
          : `Let’s find it in the evidence first. ${current.hint} Submit your answer in the CTF panel or use answer <value> in the terminal.`,
      action: index === stages.length ? undefined : 'ctf',
    };
  if (/hint|stuck|clue|help me|next step/.test(q))
    return {
      text: current
        ? `One paw in the right direction: ${current.hint}`
        : 'Every stage is solved! You can reset the challenge from the CTF panel.',
    };
  if (/base64|decode|encoding/.test(q)) return { text: explanations[1] };
  if (/entropy|pack|random/.test(q)) return { text: explanations[2] };
  if (/robots|recon|crawl/.test(q)) return { text: explanations[0] };
  if (/mitre|att.ck|persist|registry/.test(q)) return { text: explanations[4] };
  if (/network|beacon|address|logs|tcp/.test(q))
    return { text: explanations[3] };
  if (/hash|sha|fingerprint/.test(q))
    return {
      text: 'A hash is a fixed-length fingerprint of data. Identical input produces the same hash; even a tiny change normally produces a different one. Hashing is not reversible encryption. Try the calculator with SHA-256.',
      action: 'hash',
    };
  if (/terminal|command/.test(q))
    return {
      text: 'Type help for the command list. For this CTF, use cat robots.txt, decode <token>, investigate, and logs. Type answer <value> to submit, hint for a clue, or ctf to view your progress.',
      action: 'terminal',
    };
  if (/explain|why|understand|what does.*mean/.test(q) && current)
    return { text: explanations[index] };
  if (/what.*ctf|capture|how.*work|rules|help/.test(q))
    return {
      text: 'CTF means Capture the Flag. Here you follow five synthetic investigation clues: recon, decoding, file analysis, network correlation, and ATT&CK mapping. Each solved stage earns 20 points. Progress stays in this browser.',
      action: 'ctf',
    };
  if (/manthan|portfolio|project/.test(q))
    return {
      text: 'Manthan builds cybersecurity and systems projects, including SENTRA CORE V2, NeuroSole, and NervoStep-ML. I’m here to guide you through his CTF; the Projects section has the full details.',
    };
  return {
    text: 'My little notebook covers this portfolio’s CTF. Try “give me a hint”, “explain this clue”, “what is Base64?”, or “open the terminal”.',
  };
}
