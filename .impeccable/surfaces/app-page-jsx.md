---
version: 1
slug: "app-page-jsx"
primary_target: "app/page.jsx"
related_targets: ["app/components/EntryPage.jsx","app/components/MissionSection.jsx","app/components/CinematicStage.jsx","app/components/KineticGrid.jsx"]
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

OWN-WORLD: Matte graphite ground with fine grain. A folded-plate relief; its zigzag creases run at plus or minus 30 degrees and are the only lines it draws. One neutral-warm key light, the only source of brightness. Tinted-neutral ink, hairlines instead of boxes. Archivo alone: expanded width for display, normal width for reading. No glow, glass, cards or gradient text.

STORY: The visitor understands that Grovillon makes something worn close to the body for demanding conditions. They believe it because the craft is exact and nothing is oversold, and they write to the address or read the roles.

FIRST VIEWPORT: Full-bleed relief; the lamp warms up once, drifting from left of centre, and comes to rest upper right, opposite the left-set headline so lit facets never sit behind the type; on desktop it then follows the pointer on a spring. The mark sits top left, with the contact address top right. Lower left on the grid: h1 "Grovillon Project" in expanded light caps up to 6rem, the tagline, the one-sentence description, then "Write to us" and "Open roles". Below the hero the next scene already shows at the fold: on a phone its heading, on a landscape screen the stage's lamp, already lit on the relief. Signature: the visitor holds the lamp, here and in every scene below.

SEQUENCE (round 3): the lamp descends. Below the hero one pinned stage plays two scenes on scroll, scrubbed through a spring so it plays backwards as well as forwards. A, "Worn, not carried.": the heading arrives with the stage; the garment stands in front of the hero's relief; the lamp, already lit where the hero's lamp rests, crosses the garment while the camera pulls back from the shoulder and settles as a key light; the heading goes out and the camera pushes onto the right shoulder seam as the relief falls dark and the beam narrows to a pool. The cut is a match on that light. B, "Its complexity is not visible.": the same pool, at the same scale and brightness, falls on the top sheet's fabric, and the camera pulls back to the closed stack as the layers below come into the light; the six sheets part from the outermost inwards to the render's own spacing under a low lamp, the layers away from the lamp falling out of focus (the traced layer never comes sharp), and close again as the heading, "By design." and "Silently present." are lit, the stack back in its photographed light; on a portrait screen the stack then sets, so the statement ends the film alone. In each scene's hold a pointer moving on the subject takes the light and moving off it lets go; a resting pointer changes nothing; a phone needs a still press. C, "Built for high-demand conditions.": the hero's creases in hairlines bend under the mouse and carry a pulse of lamp light from a click or a still tap; the band's resting lamp sends one pulse as it arrives; a swipe only scrolls. Text never moves; the lamp lights it. Without WebGL, script, or with reduced motion, the stage is plain sections; without script or with reduced motion the crease map is a still CSS map.

FORM: Low-observable surface, translated from a stealth hangar at night with no aircraft, markings or military reference; candidate 6 of 7 by resonance; seed:bbd85d2d739354f2 (degraded roll, no challengers).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Open decisions

- Whether the layered-material image should stay public at all; it is kept, darkened and monochrome, because it is approved copy.
- Whether the footer should carry a legal entity name; it carries the brand name only.
