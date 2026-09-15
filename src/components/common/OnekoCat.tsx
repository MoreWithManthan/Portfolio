import Script from 'next/script';

export default function OnekoCat() {
  return (
    <Script
      src="/oneko/oneko.js?v=kittu-2"
      data-cat="/oneko/oneko.gif"
      strategy="afterInteractive"
    />
  );
}
