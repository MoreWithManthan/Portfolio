import { socialLinks } from '@/config/Portfolio';
import { Github, Linkedin, Mail } from 'lucide-react';
import type { CSSProperties } from 'react';

const logoFiles: Record<string, string> = {
  X: 'x',
  TryHackMe: 'tryhackme',
  HackerRank: 'hackerrank',
  LeetCode: 'leetcode',
};
export default function SocialLinks({
  className = '',
}: {
  className?: string;
}) {
  return (
    <div
      className={`social-logos ${className}`}
      aria-label="Social profiles and email"
    >
      {[...socialLinks, ['Email', 'mailto:linkwithmanthan@gmail.com']].map(
        ([name, url]) => (
          <a
            key={name}
            href={url}
            aria-label={name}
            title={name}
            target={name === 'Email' ? undefined : '_blank'}
            rel={name === 'Email' ? undefined : 'noreferrer'}
          >
            {name === 'GitHub' ? (
              <Github aria-hidden size={22} />
            ) : name === 'LinkedIn' ? (
              <Linkedin aria-hidden size={22} />
            ) : name === 'Email' ? (
              <Mail aria-hidden size={22} />
            ) : (
              <span
                aria-hidden
                className="brand-logo"
                style={
                  {
                    '--logo': `url(/social/${logoFiles[name]}.svg)`,
                  } as CSSProperties
                }
              />
            )}
            <span className="social-tooltip" aria-hidden>
              {name}
            </span>
          </a>
        ),
      )}
    </div>
  );
}
