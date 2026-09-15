import Link from 'next/link';

export default function Ops() {
  return (
    <main style={{ maxWidth: 680, margin: '80px auto', padding: 24 }}>
      <p>TRAINING ARTIFACT</p>
      <h1>A clue in plain sight.</h1>
      <p>
        Recovered token: <code>YmVhY29uLTMwMA==</code>
      </p>
      <p style={{ margin: '24px 0' }}>
        Decode it in the portfolio terminal. All evidence is synthetic.
      </p>
      <Link href="/#lab">Return to the security lab →</Link>
    </main>
  );
}
