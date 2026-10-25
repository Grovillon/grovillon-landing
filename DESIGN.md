---
name: Grovillon Project
description: A matte graphite surface that shows only what one neutral-warm lamp reveals; Archivo alone, hairlines instead of boxes.
colors:
  lamp: "#f0e6d6"
  ground: "#0a0b0c"
  ink: "#ecebe7"
  ink-lit: "#f8f5ef"
  ink-2: "#b3b4b0"
  ink-3: "#8e9092"
  line: "rgb(236 235 231 / 0.12)"
  line-strong: "rgb(236 235 231 / 0.26)"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.375rem, 8.1vw, 6rem)"
    fontWeight: 300
    lineHeight: 0.95
    letterSpacing: "0.012em"
    fontVariation: "'wdth' 125"
  statement:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 3.9vw, 3.5rem)"
    fontWeight: 300
    lineHeight: 1.06
    letterSpacing: "-0.006em"
    fontVariation: "'wdth' 112"
  passage:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 2.35vw, 2.125rem)"
    fontWeight: 330
    lineHeight: 1.32
    letterSpacing: "-0.004em"
  lead:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.1875rem, 1.55vw, 1.4375rem)"
    fontWeight: 400
    lineHeight: 1.42
  role:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.85vw, 1.5rem)"
    fontWeight: 400
    lineHeight: 1.3
    fontVariation: "'wdth' 106"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 380
    lineHeight: 1.65
    letterSpacing: "0.004em"
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.13em"
    fontVariation: "'wdth' 112"
  control:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 560
    lineHeight: 1.6
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 112"
  control-quiet:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.6
    fontVariation: "'wdth' 112"
rounded:
  none: "0px"
spacing:
  gutter: "clamp(1.25rem, 5vw, 4.5rem)"
  column-gap: "1.5rem"
  stack-xs: "0.75rem"
  stack-sm: "1.25rem"
  stack-md: "2rem"
  stack-lg: "3rem"
  section: "clamp(7rem, 13vw, 11rem)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    typography: "{typography.control}"
    rounded: "{rounded.none}"
    padding: "0 1.25rem 0 1.375rem"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.ink-lit}"
  link-quiet:
    textColor: "{colors.ink-2}"
    typography: "{typography.control-quiet}"
    height: "3rem"
  link-quiet-hover:
    textColor: "{colors.ink}"
  link-inline:
    textColor: "{colors.ink}"
  header-address:
    textColor: "{colors.ink-2}"
    typography: "{typography.control-quiet}"
    height: "3rem"
  header-address-hover:
    textColor: "{colors.ink}"
  role-row:
    textColor: "{colors.ink}"
    typography: "{typography.role}"
    padding: "1.25rem 0.25rem"
  role-row-hover:
    backgroundColor: "rgb(236 235 231 / 0.035)"
  role-row-active:
    backgroundColor: "rgb(236 235 231 / 0.06)"
  hairline:
    backgroundColor: "{colors.line}"
    height: "1px"
  mark:
    textColor: "{colors.ink}"
    size: "2rem"
---

# Design System: Grovillon Project

## Overview

**Creative North Star: "The Low-Observable Surface"**

The page is a matte graphite surface that absorbs light and shows only what one lamp chooses to reveal. On a hardware GPU the ground under the hero and one mid-page band becomes a folded-plate relief, flat facets meeting at zigzag creases that run at ±30°, raked by a single neutral-warm lamp; everywhere else a still pool of the same light rests on the grain in its place. Either way the visitor meets a dark material first and an interface second.

The system is sparse and exact rather than dramatic. One family, Archivo, carries every word, and its width axis does the expressive work: expanded light capitals for the title, slightly widened light statements, normal width for reading. Ink is a tinted neutral in three steps. Content is separated by 1px hairlines and dark space, never by boxes, and the only solid fill on a screen is the primary button. Density is low: wide, fluid gaps of ground between subjects, short measures, nothing competing with the light.

Motion is rationed and mostly belongs to the light. The lamp sweeps in once and settles, follows a mouse on a spring, and travels with the reader through the band; media opens once with a hard wipe cut at the crease angle. Type never moves, and nothing depends on motion, script or WebGL to be read. The system rejects the dark-tech default outright: a centred glowing headline over an orb or particle field, rows of glass cards, a neon accent, and the same fade-up on every section. Discretion is the brand's posture, so the visuals earn credibility through craft and never through claims.

**Key Characteristics:**
- A matte graphite ground under a static 128px grain tile; never flat black.
- One neutral-warm lamp, the only light; nothing else glows.
- A ±30° crease angle shared by the relief and the media reveal.
- Archivo alone; width (125, 112, 106, 100) is the expressive axis and weight stays light.
- Hairlines instead of boxes, square corners, no shadows.
- Complete and legible with motion reduced, scripts off or no GPU.

## Colors

A near-monochrome graphite palette: three tinted-neutral inks on a cool near-black ground, and one neutral-warm lamp that exists as light, not paint.

### Primary
- **Neutral-Warm Lamp** (#f0e6d6): The key light and the system's only chroma. It lights the relief (the shader uses a full-brightness version of this warm white), tints the still light that stands in for the relief (7% in the hero, 5% in the band, a radial falloff to nothing), draws the focus ring and backs selected text (88%, with ground-coloured text).

### Neutral
- **Graphite Ground** (#0a0b0c): The page and every background. It is tiled with a 128px grain whose noise (±3 levels per channel) averages exactly to this value, so the surface reads matte rather than flat. Also the browser theme colour and the label colour on the primary button.
- **Chalk Ink** (#ecebe7): The title, statements, the tagline, the passage, list titles and all hovered text; the fill of the primary button. About 16.5:1 on the ground.
- **Lit Ink** (#f8f5ef): Chalk Ink brightened toward the lamp; only the primary button's hover fill.
- **Ash Ink** (#b3b4b0): Supporting sentences, secondary lead lines and quiet links at rest, including the header address. About 9.4:1.
- **Smoke Ink** (#8e9092): Fine print only. About 6.1:1, still above AA for small text.
- **Hairline** (rgb(236 235 231 / 0.12)): 1px rules between list rows, under a list and above the footer; a barely-there seam in the ground.
- **Strong Hairline** (rgb(236 235 231 / 0.26)): The resting underline of inline links.

### Named Rules
**The One Lamp Rule.** Light has one source and one colour. The lamp is the only thing on the page that emits light; ink, hairlines and the button reflect it and never glow.

**The Light-Not-Paint Rule.** The lamp colour appears only as light (the relief and its still stand-in), as the focus ring and as the text selection. It is never a fill, a text colour, a border or an accent.

**The Three Inks Rule.** Text on the ground takes ink, ink-2 or ink-3 and nothing else: ink for what is read first, ink-2 for what supports it, ink-3 for fine print. The one inversion is the primary button, ground on ink. Interaction may raise ink-2 to ink; nothing changes hue.

## Typography

**Display Font:** Archivo, variable (weight 100–900, width 62–125%), with ui-sans-serif, system-ui, sans-serif
**Body Font:** Archivo at normal width
**Label/Mono Font:** Archivo at 112% width; there is no mono

**Character:** One grotesque used at four widths. Expanded light capitals make the title wide, low and engineered; slightly widened light statements carry the voice; normal-width text reads plainly and gets out of the way.

### Hierarchy
- **Display** (300, clamp(2.375rem, 8.1vw, 6rem), 0.95): 125% width, uppercase, +0.012em. The page title only, one per page, left-set; 38px on a phone, 96px on a desktop.
- **Statement** (300, clamp(1.875rem, 3.9vw, 3.5rem), 1.06): 112% width, −0.006em, sentence case. Section headings.
- **Passage** (330, clamp(1.375rem, 2.35vw, 2.125rem), 1.32): Normal width, −0.004em, Chalk Ink. A long passage set one phrase per line and grouped by sentence: lines inside a sentence sit on the line height, sentences 0.9em apart.
- **Lead** (400, clamp(1.1875rem, 1.55vw, 1.4375rem), 1.42): The tagline, short answer lines under a statement, a closing contact line; Chalk Ink or Ash Ink.
- **Role** (400, clamp(1.125rem, 1.85vw, 1.5rem), 1.3): 106% width. Titles inside hairline lists.
- **Body** (380, 1.0625rem, 1.65): Ash Ink. Supporting sentences, held to 28–42ch.
- **Label** (500, 0.8125rem, 1.2, +0.13em, uppercase): 112% width. The footer wordmark only; never a tag above a heading.
- **Control** (560, 0.9375rem, +0.01em) and **Quiet control** (500, 0.9375rem): 112% width. Button and quiet-link text, including the header address.

Headings balance their lines and paragraphs avoid orphans (`text-wrap: balance` and `pretty`); synthesized bold and italics are switched off. The footer's copyright line is the one piece of text set outside these roles (0.875rem in Smoke Ink).

### Named Rules
**The One Family Rule.** Archivo alone, from one variable file. Expression comes from the width axis, not from a second typeface: 125% for the title, 112% for statements, labels and controls, 106% for list titles, 100% for reading.

**The Light Type Rule.** Large type is light: 300 for the title and statements, 330 for the passage. Nothing is bold or italic; the heaviest weight in the system is the button's 560.

**The Still Type Rule.** Type never moves. No fade-ups, typing effects, split letters or scroll-linked text; every word is in the server HTML and visible before any script runs.

## Layout

One centred container, at most 84rem wide, with a fluid side gutter (20px on a phone, 72px on a wide desktop). A single breakpoint at 48rem (768px) turns the one-column phone stack into a 12-column grid with 1.5rem column gaps; nothing else in the layout is breakpoint-driven.

Compositions are asymmetric and left-set: a 5-column statement beside 7 columns of media; a 5-column heading with its passage stepped down and right below it, in columns 6 to 12; a 5-column heading beside a 7-column list. Media may break the container: the fall-off image runs out through the right gutter from 48rem and edge to edge on a phone.

Fields are full-bleed and sit under the content. The hero is at least max(36rem, 82svh) tall, with its content pushed to the lower left (8rem above it, clamp(4.5rem, 13svh, 8.5rem) below). The mid-page band carries clamp(5rem, 11vw, 10rem) of padding above its content and clamp(7rem, 15vw, 13rem) below.

Vertical rhythm is generous and fluid. Between plain sections the gap is the section token (7rem on a phone, 11rem on a desktop). A field brings its own padding, so the section after the hero or the band opens with only clamp(3rem, 5vw, 4rem) or clamp(3rem, 6vw, 5rem), and the band follows the content above it directly, its own top padding giving the gap. The footer sits clamp(6rem, 12vw, 10rem) below the last section. Inside a group the steps are small and fixed, mostly stack-xs from a tagline to its sentence, stack-sm from a heading to its supporting line, stack-md (2.5rem from 48rem) from the title to its copy block, and stack-lg before a closing line or an image. Supporting sentences hold to 28–42ch, and the hero's copy block to 38rem.

Touch targets: controls and the header address 3rem tall, the mark 2.75rem, list rows at least 4.5rem. Hover effects, and the lamp that follows the pointer, exist only under `(hover: hover) and (pointer: fine)`.

### Named Rules
**The Asymmetry Rule.** Content is left-set on asymmetric splits of the 12-column grid (5 and 7, or a 5-column heading over a passage stepped to columns 6 to 12). Centring is kept for a short interlude: one statement, its lead lines and a narrow image, never a whole page.

## Elevation & Depth

Flat, with no shadows anywhere: no box-shadow, no drop-shadow, no blur, no glass. Depth is light falling on form. On a hardware GPU the ground under the hero, and again under one mid-page band, is a folded-plate relief: straight folds and zigzag creases whose segments run at ±30° divide it into flat facets. A single point lamp hangs just above it; each facet is shaded only by its angle to the lamp and its distance from it, with a faint specular sheen, and the creases are drawn as fine lines that brighten only near the lamp. Away from the lamp the relief sinks back into the ground, and masks finish the job: the hero field is solid to 58% of its height and gone at its bottom edge; the band fades in over its first 22% and out over its last 22%. The relief carries the same ±3-level grain as the page's tile, so relief and ground read as one matte surface. Images take depth the same way: lit from above and dissolving into the ground through masks, never framed or lifted.

### Named Rules
**The Depth-Is-Light Rule.** Nothing is raised. Surfaces get depth only from the lamp falling across facets and from masks that let forms fall off into the ground.

**The Still Light Rule.** When the relief cannot run on a hardware GPU (a software WebGL renderer, no WebGL, or no script), a still radial pool of lamp light sits where the lamp would rest. Content never depends on the relief.

## Shapes

Square, hard-edged and sparse. Every surface and control has square corners: the button, list rows, image bounds and the focus ring. Lines are 1px hairlines, and only horizontal: one above each list row, one closing the list, one above the footer. The only angled geometry is the crease: the relief's zigzags at ±30° and the media reveal's wipe edge at 30°. Images are unframed, cut-outs and renders that dissolve into the ground through masks. The mark is the one round form, a circular monogram drawn in the current text colour; arrows are 18px line drawings with a 1.5px stroke and square caps, so even the icons have no rounded ends. A down arrow jumps within the page; an up-right arrow marks a link that leaves it (every mail link).

### Named Rules
**The Crease Angle Rule.** Folds, cuts and wipes run at the relief's 30° crease angle and no other. Don't introduce skews, other diagonal wipes or angled section edges.

**The No-Box Rule.** Content is never boxed: no cards, panels, outlined containers or framed images. Separation is a 1px hairline or dark space.

## Components

### Buttons
A plain, solid, square block: the only solid fill on a screen.
- **Shape:** square corners (0px), 3rem tall.
- **Primary:** Chalk Ink fill with Graphite Ground text in the control type, padded 0 1.25rem 0 1.375rem, with an 18px up-right arrow 0.75rem after the label, since it opens the mail app.
- **Hover / Focus:** on fine pointers the fill brightens to Lit Ink (200ms), and the arrow leans 3px up and out (200ms, ease-out). Keyboard focus draws the lamp ring: a square 2px outline 4px outside the shape. Press scales to 0.97 over 160ms (ease-out).
- **Quiet link (secondary action):** no fill and no border; Ash Ink text in the quiet control type, 3rem tall, 0.625rem before its arrow. Hover raises it to Chalk Ink and leans the arrow 4px along its direction (3px for a down arrow); press scales to 0.97.

### Inline Links
- **Style:** Chalk Ink text with a 1px underline in Strong Hairline, offset 0.28em.
- **Hover:** the underline rises to Chalk Ink (200ms).

### Lists (hairline rows)
An open ledger, not a stack of cards.
- **Row:** a full-width link at least 4.5rem tall, padded 1.25rem 0.25rem, with a Hairline above each row and one closing the list. The title is set in the role type in Chalk Ink; each row opens an email, so a trailing up-right arrow sits at the far edge, 1.5rem clear of the text.
- **Hover / Press:** hover lays a 3.5% ink tint across the row and leans the arrow 3px up and out; press deepens the tint to 6% within 100ms.

### Navigation
- **Header:** the mark (2rem, Chalk Ink) top left links back to the top; the contact address sits top right as a quiet link (Ash Ink, 3rem tall), so the address is on screen from the first moment and a visitor without a mail app can still read it. The header floats over the hero with no bar, background or border and does not stick; there is no menu. Hover raises the address to Chalk Ink.
- **Footer:** a Hairline above; the mark (2.25rem) beside the label-type wordmark, both in Ash Ink; the copyright in Smoke Ink.

### Relief Field (signature)
The ground itself, drawn in WebGL behind the hero and once more behind a mid-page band.
- **Form:** straight folds and ±30° zigzag creases cut the plane into flat facets; one point lamp shades each facet by angle and distance; only the creases are drawn as lines. Lengths are measured against a reference height (the hero's own height, or the viewport height for the band) so the folds keep one physical size, and a field narrower than its reference height switches to a finer fold.
- **Hero lamp:** sweeps once from left of centre to rest at upper right, opposite the title (1700ms, cubic-bezier(0.77, 0, 0.175, 1)), while warming from dark to full (1200ms, ease-out). With a mouse it then follows the pointer on a spring (stiffness 170, damping 26) and returns to rest when the pointer leaves. A pointer that arrives mid-entrance takes the lamp with its momentum: the spring's stiffness ramps in over 200ms, critically damped throughout, so the lamp carries on briefly before turning.
- **Band lamp:** lower, dimmer and grazing. It crosses from 8% to 92% of the width as the band passes through the viewport, held level with the reader's eye line (42% of the viewport height), on a softer spring (stiffness 90, damping 19) along the horizontal only.
- **Rendering:** shown only after its first frame (a 300ms fade), so it never pops in; drawn at CSS-pixel resolution with 4× supersampling; paused off-screen and in hidden tabs; rebuilt after a lost context.
- **Fallback:** drawn only on a hardware GPU. Software renderers, no WebGL and no script all get the still light (600ms fade in): a radial pool of lamp light near the lamp's rest, 7% at 72% across and 8% down in the hero, 5% at 62% and 42% in the band. The direction first called for the relief everywhere; the build reserves it for hardware GPUs, and the build is the rule.
- **Reduced motion:** no sweep and no following. The hero lamp starts at rest at full strength; the band lamp parks at mid-width.

### Media (signature)
- **Fall-off treatment:** a colour image whose lower edge dissolves into the ground (solid to 72%, transparent at the bottom); it may bleed out of the container through the gutter.
- **Lit-from-above treatment:** a monochrome image (greyscale, 96% brightness, 106% contrast) under a graded mask (solid to 48%, 62% at 74%, 20% at 92%, gone at the bottom), so its top catches the light and its lower part falls away into shadow while staying legible.
- **Reveal:** media that starts below the fold opens once from its top-left corner behind a hard clip-path edge at the 30° crease angle (900ms, cubic-bezier(0.33, 1, 0.68, 1); the visible sweep takes about 200ms, slow enough for the edge to read as passing light), as it crosses 88% of the viewport height. Media already in view at load is never hidden; there is no reveal under reduced motion, without script, or in print. The direction first described reveals as the lamp's light passing over; the build cuts a hard 30° edge instead, and the build is the rule.

### Named Rules
**The One Filled Control Rule.** The primary button is the only solid fill on a screen and appears once there; every other action is text with an arrow.

**The Brighten Rule.** Interaction only brightens: ink-2 rises to ink, a strong hairline to ink, ink to lit ink, and arrows lean 3px toward where they lead. Nothing changes hue, grows or lifts.

**The Reveal Once Rule.** Media opens once and stays open; what the reader can already see is never hidden.

## Do's and Don'ts

### Do:
- **Do** keep every surface on the graphite ground with its grain tile, and let the relief or its still light be the only thing that brightens it.
- **Do** rest the lamp away from the type: in the hero it settles upper right while the title sits lower left.
- **Do** separate content with 1px hairlines (line, 12% ink) and dark space, and keep surfaces and controls square-cornered.
- **Do** set every word in Archivo and change width before weight: 125% title; 112% statements, labels and controls; 106% list titles; 100% reading.
- **Do** cut any new fold, wipe or diagonal at the 30° crease angle.
- **Do** ease arrivals and responses with cubic-bezier(0.23, 1, 0.32, 1), press controls to scale(0.97), and keep hover effects behind `(hover: hover) and (pointer: fine)`.
- **Do** make every view complete without motion, script or WebGL: content visible by default, the reveal's hidden state set only by script and only when motion is allowed, the still light in place of the relief.
- **Do** use only approved images or abstract material, lit by the same lamp and falling off into the ground through masks; ship any derived or generated raster with its provenance embedded, and treat client originals in CSS only.

### Don't:
- **Don't** add glow, bloom or halos to type, controls, the mark or images; the only soft light is the lamp on the relief or its still stand-in.
- **Don't** use frosted glass, cards, panels or framed images.
- **Don't** use gradients as decoration (gradient text, gradient buttons, tinted gradient backdrops); a gradient is only ever the lamp's falloff or a mask into the ground.
- **Don't** introduce an accent colour, or use the lamp colour as paint.
- **Don't** add box or drop shadows; depth comes only from light on the relief.
- **Don't** set a centred, glowing headline over an orb or particle field.
- **Don't** animate text into view or give every section the same entrance; only media reveals, once.
- **Don't** set anything bold or italic, or add a second typeface.
- **Don't** add technical detail of the product or invented claims to any visual.
