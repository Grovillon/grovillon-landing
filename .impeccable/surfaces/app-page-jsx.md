---
version: 1
slug: "app-page-jsx"
primary_target: "app/page.jsx"
related_targets: ["app/components/EntryPage.jsx","app/components/MissionSection.jsx","app/components/CinematicStage.jsx","app/components/KineticGrid.jsx","app/components/LightField.jsx","app/components/MailLink.jsx"]
---

## Scope

The public landing route `/` (`app/page.jsx`, composed in `app/components/EntryPage.jsx` and `app/components/MissionSection.jsx`). Visitor mode: Persuade.

## Audience, job, action

- A visitor arriving by referral or search decides, in seconds, whether Grovillon is serious. Engineers judge whether to answer the open call.
- Primary action: write to the published address. Secondary: read the open roles.
- Proof is the craft of the page itself; claims stay limited to the approved copy.

## Content and constraints

- Approved copy only, preserved word for word; list punctuation may be normalised.
- Approved images: the garment and the layered material. The lab scene is retired from this surface: it is the one bright, stock-like frame on a dark page and it shows a readout that reads as a product demonstration.
- The cinematic scenes draw only these images' own pixels (WebGL textures derived without generation; provenance in `public/images/stage/*.json`). Light may scale how much of a pixel shows and focus may soften it; nothing may add surface, detail or geometry the images do not contain. The six-sheet render can close its spacing and open back to the render's own spacing, but never wider, and it never turns or slides sideways.
- Nothing may explain how the product works. Abstract material carries any visual the copy needs.
- Content must be readable with animation off, scripts failed, or reduced motion requested.
- Other routes and server code are out of scope.

## Direction contract

THESIS: A low-observable surface. The page absorbs light and shows only what one lamp chooses to reveal. It refuses the dark-tech default: a centred glowing headline over an orb or particle field, a row of glass cards, a neon accent and the same fade-up on every section.

OWN-WORLD: Matte graphite ground with fine grain. A folded-plate relief; its zigzag creases run at plus or minus 30 degrees and are the only lines it draws. The relief runs on under the band below, its folds continuing the stage's, and a second skin lies on it: a square grid of hairlines with a dot at every crossing, the only lines there drawn as lines. One neutral-warm key light, the only source of brightness. Tinted-neutral ink, hairlines instead of boxes. Hubot Sans alone: expanded width for display, normal width for reading. No glow, glass, cards or gradient text.

STORY: The visitor understands that Grovillon makes something worn close to the body for demanding conditions. They believe it because the craft is exact and nothing is oversold, and they write to the address or read the roles.

FIRST VIEWPORT: Full-bleed relief; the lamp warms up once, drifting from left of centre, and comes to rest upper right, away from the left-set copy; on desktop it then follows the pointer on a spring. The mark (3rem) sits top left, with the contact address top right; it, the closing line's address and "Write to us" are plain mailto: links that go straight to the reader's own mail app. At the centre of the open relief, on one line, h1 "Grovillon Project" in small, widely spaced expanded light caps (15px to 36px), the one protagonist; lower left on the grid: the tagline, the one-sentence description, then "Write to us" and "Open roles". Below the hero the stage's relief continues the hero's, its folds running on across the join under the hero's own lamp, so hero and stage read as one surface with no seam or fade; scene A's heading is lit and the garment waits unseen in its shade: on a phone that heading shows at the fold. Signature: the visitor holds the lamp, here and in every scene below.

SEQUENCE (round 8): the hero's relief runs on behind one pinned stage below the hero, steady and lit behind both scenes, while two scenes play in front of it on scroll, scrubbed through a spring that follows the input (soft for a mouse wheel's separate steps, firmer for a trackpad, a finger or the keyboard), so it plays backwards as well as forwards; its moves flow through their keys and the camera zooms at an even rate. A, "Worn, not carried.": the garment is solid throughout; unlit, it sits in a soft pool of its own shade on the relief and reads as darkness. With the camera still at the opening framing, close on the shoulder (on desktop the garment is small and stands on the left, inside a veil that darkens the left of the relief while its right stays lit, and the light falls on it from the right), light comes down from above the right shoulder and lights it gradually where it stands; nothing moves, scales or fades. Then the camera pulls back to the whole garment, the shade round it easing, while the lamp crosses it and settles as a key light; the heading goes out and the camera pushes onto the right shoulder seam; the light gathers on the seam and goes out. The garment and its shade dissolve together as the light goes out, so no dark shape is left, and there is a pause on the relief alone. B, "Its complexity is not visible.": the heading, "By design." and "Silently present." are lit first, on the relief alone; then a plane of light passes down through the stack where it stands, open at the render's own spacing and never wider, drawing its layers out of the dark with a line of light where it crosses them; nothing falls or moves in. A low lamp crosses the open layers, those away from it falling out of focus (the traced layer never comes sharp) while the base sheet keeps its outline; they close again from the top while the camera draws back 20%, the stack back in its photographed light under the statement; on a portrait screen the stack then dissolves, so the statement ends the film alone. In each scene's hold a pointer moving on the subject takes the light and moving off it lets go; in B the sheets it leaves dim but keep their outlines; a resting pointer changes nothing; a phone needs a still press. C, "Built for high-demand conditions.": the relief runs on under the band, continuing the stage's folds under the same lamp with no seam, then sinking back into the ground, its lamp resting and following a mouse with the grid's; on it a quiet square grid of hairlines, a second skin, gathers toward a mouse or pen, lit by the band's lamp, and a click or a still tap sends a ripple through it as a wave of lamp light; the band sends one ripple as it arrives; a swipe only scrolls; no line or dot crosses the words. The roles are a plain list between hairlines; the closing line, "We'd love to hear from you. Write to us at d@grovillon.com.", is the way to write. Text never moves; the lamp lights it. Without WebGL, script, or with reduced motion, the stage is plain, left-set sections; with reduced motion the grid is drawn still, and without script it is a still CSS grid.

FORM: Low-observable surface, translated from a stealth hangar at night with no aircraft, markings or military reference; candidate 6 of 7 by resonance; seed:bbd85d2d739354f2 (degraded roll, no challengers).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Open decisions

- Whether the layered-material image should stay public at all; it is kept, darkened and monochrome, because it is approved copy.
- Whether the footer should carry a legal entity name; it carries the brand name only.
