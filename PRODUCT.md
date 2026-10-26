# Product

<!-- impeccable:product-schema 1 -->

Source labels: [Brief] = the client's written brief for this redesign, used as the structured stand-in for the init interview (the run was unattended by instruction). [Repo] = read from this repository and the live public page. [Inferred] = an inference from those sources that the client has not confirmed.

## Platform

web

## Users

- [Inferred] People who reach the site by referral or search and want to understand, quickly, what Grovillon is and whether it is serious enough to engage with.
- [Repo] Engineering talent: the page carries an open call for specific roles and a contact address.
- [Inferred] Prospective partners and investors judging credibility. Not confirmed; copy must not address them directly.

## Product Purpose

- [Brief] Grovillon is an early-stage technology company with a deliberately discreet public identity. The site is its public presence.
- [Inferred] The site succeeds when a visitor leaves with the impression of a serious, premium, quietly confident company and, when relevant, writes to the contact address.

## Positioning

- [Repo] Approved public statements, verbatim: "Stealth tech, quietly present." and "A system designed to support physiological stability in critical and high-demand conditions."
- [Brief] Nothing beyond the approved public copy may be stated or implied about the product.

## Operating Context

- [Repo] One public landing route and no authentication. [Brief] Grovillon needs no login, registration, password recovery or restricted access at this stage, so the legacy login, access-request and password-reset pages and the whitelist API were removed.
- [Repo] Contact happens by email at the address already published on the page.

## Capabilities and Constraints

- [Repo] Next.js 16 App Router, React 19, Tailwind CSS 4.
- [Brief] Confidentiality is a hard constraint: no technical detail of how the product works, and no specifications, demonstrations, partnerships, test results, certifications or commercial claims. Where a visual is needed, use abstract imagery rather than a depiction of the technology.
- [Brief] The legacy authentication, access-request and password-reset code has been removed (round 2); no replacement authentication, user store or provider may be introduced.
- [Brief] Motion may be ambitious (round 3: cinematic, scroll-driven scenes), but every visual stays an artistic presentation of approved imagery or abstract material, never an engineering demonstration.
- [Brief] The page must stay usable when animation fails and must respect reduced-motion preferences.

## Brand Commitments

- [Repo] Name: Grovillon. Public title in use: "Grovillon Project".
- [Brief] Personality, binding: stealth, futuristic, minimal, premium, sophisticated, confident.
- [Brief] The existing dark visual identity is kept.
- [Repo] Mark: a circular monogram drawn as circuit-like lines, `public/images/logo.png`.
- [Repo] Voice: short declarative lines, understated, present tense ("Worn, not carried." "Its complexity is not visible. By design.").
- [Brief] Avoid generic AI-generated website aesthetics, excessive gradients, repetitive card layouts, unnecessary glow, and decorative motion without purpose.

## Evidence on Hand

- [Repo] Approved copy: headline, tagline, one-sentence description, three short image captions, a seven-line passage, and the hiring call with three roles and the contact address.
- [Repo] Public images: `public/images/shirt.png`, `public/images/6 layers textile.png`, `public/images/environment.png`. The other files in `public/images` are not on the public page and are not approved for use.
- [Brief] Absent and never to be fabricated: customers, partners, metrics, test results, certifications, pricing, timelines, team biographies, press.

## Product Principles

1. Discretion is the posture: say less, with precision.
2. Credibility comes from craft, never from claims.
3. Every visual is either already approved or abstract; nothing explains the mechanism.
4. One clear action: get in touch.

## Accessibility & Inclusion

- [Brief] Respect `prefers-reduced-motion`; keep content readable and reachable without animation.
- [Inferred] Target WCAG 2.2 AA for text contrast, focus visibility and keyboard reachability.
