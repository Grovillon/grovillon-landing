---
name: Grovillon Project
description: A matte graphite surface that shows only what one neutral-warm lamp reveals; Hubot Sans alone, hairlines instead of boxes.
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
    fontFamily: "Hubot Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(0.9375rem, 2.6vw, 2.25rem)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "0.28em"
    fontVariation: "'wdth' 125"
  statement:
    fontFamily: "Hubot Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 3.9vw, 3.5rem)"
    fontWeight: 300
    lineHeight: 1.06
    letterSpacing: "-0.006em"
    fontVariation: "'wdth' 112"
  passage:
    fontFamily: "Hubot Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 2.35vw, 2.125rem)"
    fontWeight: 330
    lineHeight: 1.32
    letterSpacing: "-0.004em"
  lead:
    fontFamily: "Hubot Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.1875rem, 1.55vw, 1.4375rem)"
    fontWeight: 400
    lineHeight: 1.42
  role:
    fontFamily: "Hubot Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.85vw, 1.5rem)"
    fontWeight: 400
    lineHeight: 1.3
    fontVariation: "'wdth' 106"
  body:
    fontFamily: "Hubot Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 380
    lineHeight: 1.65
    letterSpacing: "0.004em"
  label:
    fontFamily: "Hubot Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.13em"
    fontVariation: "'wdth' 112"
  control:
    fontFamily: "Hubot Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 560
    lineHeight: 1.6
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 112"
  control-quiet:
    fontFamily: "Hubot Sans, ui-sans-serif, system-ui, sans-serif"
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
  hairline:
    backgroundColor: "{colors.line}"
    height: "1px"
  mark:
    textColor: "{colors.ink}"
    size: "3rem"
  mail-chooser:
    backgroundColor: "{colors.ground}"
    rounded: "{rounded.none}"
  mail-chooser-note:
    textColor: "{colors.ink-3}"
    padding: "0.5rem 1rem"
  mail-chooser-item:
    textColor: "{colors.ink-2}"
    typography: "{typography.control-quiet}"
    padding: "0 0.875rem 0 1rem"
    height: "3rem"
  mail-chooser-item-hover:
    textColor: "{colors.ink}"
    backgroundColor: "rgb(236 235 231 / 0.035)"
---

# Design System: Grovillon Project

## Overview

**Creative North Star: "The Low-Observable Surface"**

The page is a matte graphite surface that absorbs light and shows only what one lamp chooses to reveal. On a hardware GPU the ground under the hero becomes a folded-plate relief, flat facets meeting at zigzag creases that run at ±30°, raked by a single neutral-warm lamp; below it the same relief runs on behind one pinned stage, where the lamp finds the approved images in their own shade, and then under a band where a square grid of hairlines lies on it like a second skin. Without a GPU, a still pool of the same light and plain sections stand in; without script, a still grid. Either way the visitor meets a dark material first and an interface second.

The system is sparse and exact rather than dramatic. One family, Hubot Sans, carries every word, and its width axis does the expressive work: expanded light capitals for the title, slightly widened light statements, normal width for reading. Ink is a tinted neutral in three steps. Content is separated by 1px hairlines and dark space, never by boxes, and the only solid fill on a screen is the primary button. Density is low: wide, fluid gaps of ground between subjects, short measures, nothing competing with the light.

Motion belongs to the light and to the reader's hand. The hero lamp sweeps in once and settles, then follows a mouse on a spring. In the stage, every move is a pure function of scroll position, scrubbed through a soft spring so it plays backwards exactly as forwards; the relief behind the stage stays lit and still, a subject's light goes out before it leaves and the next is drawn out of the dark by light where it stands, and a hand moving on the subject may lean or hold the light. Type never moves: it is lit or unlit. Nothing depends on motion, script or WebGL to be read. The system rejects the dark-tech default outright: a centred glowing headline over an orb or particle field, rows of glass cards, a neon accent, and the same fade-up on every section. Discretion is the brand's posture, so the visuals earn credibility through craft and never through claims.

**Key Characteristics:**
- A matte graphite ground under a static 128px grain tile; never flat black.
- One neutral-warm lamp, the only light; nothing else glows, and unlit areas fall to the ground, never below it.
- A ±30° crease angle shared by the hero's relief and its continuations behind the stage and under the grid band; scene C's grid is square and draws no creases.
- Hubot Sans alone; width (125, 112, 106, 100) is the expressive axis and weight stays light.
- Hairlines instead of boxes, square corners, no UI shadows.
- Scenes scrubbed by scroll, subjects lit out of their own shade, and answering only to a hand on the subject.
- Complete and legible with motion reduced, scripts off or no GPU.

## Colors

A near-monochrome graphite palette: three tinted-neutral inks on a cool near-black ground, and one neutral-warm lamp that exists as light, not paint.

### Primary
- **Neutral-Warm Lamp** (#f0e6d6): The key light and the system's only chroma. It lights the hero relief and its continuations behind the stage and under the grid band (the shaders use a full-brightness version of this warm white), leaves only a trace of its warmth on the images the stage lights (so the black garment never reads bronze) and draws the line of light where scene B's plane crosses the layers, tints the hero's still light (7%, a radial falloff to nothing), lights the grid's lines and dots near its lamp and colours its ripples, draws the focus ring and backs selected text (88%, with ground-coloured text).

### Neutral
- **Graphite Ground** (#0a0b0c): The page and every background. It is tiled with a 128px grain whose noise (±3 levels per channel) averages exactly to this value, so the surface reads matte rather than flat. It is also the floor of every lit scene: unlit pixels fall to it and never below. The browser theme colour and the label colour on the primary button.
- **Chalk Ink** (#ecebe7): The title, statements, the tagline, the passage, list titles and all hovered text; the fill of the primary button; scene B's closing lines while they are lit in the stage. About 16.5:1 on the ground. At 5% it is also the grid's resting hairlines, and at 9% the dots at its crossings, on the canvas and in its still stand-in alike.
- **Lit Ink** (#f8f5ef): Chalk Ink brightened toward the lamp; only the primary button's hover fill.
- **Ash Ink** (#b3b4b0): Supporting sentences, secondary lead lines and quiet links at rest, including the header address. About 9.4:1.
- **Smoke Ink** (#8e9092): Fine print, and the mail chooser's quiet first line. About 6.1:1, still above AA for small text.
- **Hairline** (rgb(236 235 231 / 0.12)): 1px rules between the roles, under a list and above the footer; a barely-there seam in the ground.
- **Strong Hairline** (rgb(236 235 231 / 0.26)): The resting underline of inline links, and the outline of the mail chooser.

### Named Rules
**The One Lamp Rule.** Light has one source and one colour. In every scene the lamp is the only thing that emits light; ink, hairlines, the button and the images reflect it and never glow.

**The Light-Not-Paint Rule.** The lamp colour appears only as light (the relief and its still stand-in, the stage's lamp and its plane of light, the grid's lamp and ripples), as the focus ring and as the text selection. It is never a fill, a text colour, a border or an accent.

**The Three Inks Rule.** Text on the ground takes ink, ink-2 or ink-3 and nothing else: ink for what is read first, ink-2 for what supports it, ink-3 for fine print and the mail chooser's quiet line. The one inversion is the primary button, ground on ink. Interaction may raise ink-2 to ink; nothing changes hue.

## Typography

**Display Font:** Hubot Sans, variable (weight 200–900, width 75–125%), with ui-sans-serif, system-ui, sans-serif
**Body Font:** Hubot Sans at normal width
**Label/Mono Font:** Hubot Sans at 112% width; there is no mono

**Character:** One mechanical grotesque, its squared curves echoing the garment's panels, used at four widths. Expanded light capitals make the title wide, low and engineered; slightly widened light statements carry the voice; normal-width text reads plainly and gets out of the way.

### Hierarchy
- **Display** (300, clamp(0.9375rem, 2.6vw, 2.25rem), 1): 125% width, uppercase, +0.28em, on one line. The page title only, one per page, centred in the open relief above the hero's copy as its one protagonist; 15px on a phone, 36px on a desktop.
- **Statement** (300, clamp(1.875rem, 3.9vw, 3.5rem), 1.06): 112% width, −0.006em, sentence case. Section headings; in the stage held to 13ch (12ch on landscape).
- **Passage** (330, clamp(1.375rem, 2.35vw, 2.125rem), 1.32): Normal width, −0.004em, Chalk Ink. A long passage set one phrase per line and grouped by sentence: lines inside a sentence sit on the line height, sentences 0.9em apart; on a phone it scales down, to no less than 1.125rem, until its longest phrase holds one line of the column, so from 360px wide every phrase keeps its line; on a narrower screen a phrase balances its own lines.
- **Lead** (400, clamp(1.1875rem, 1.55vw, 1.4375rem), 1.42): The tagline, short answer lines under a statement, a closing contact line; Chalk Ink or Ash Ink.
- **Role** (400, clamp(1.125rem, 1.85vw, 1.5rem), 1.3): 106% width. The open roles, between hairlines.
- **Body** (380, 1.0625rem, 1.65): Ash Ink. Supporting sentences, held to 28–42ch.
- **Label** (500, 0.8125rem, 1.2, +0.13em, uppercase): 112% width. The footer wordmark only; never a tag above a heading.
- **Control** (560, 0.9375rem, +0.01em) and **Quiet control** (500, 0.9375rem): 112% width. Button and quiet-link text, including the header address and the mail chooser's choices.

Headings balance their lines and paragraphs avoid orphans (`text-wrap: balance` and `pretty`); synthesized bold and italics are switched off. Two pieces of text are set outside these roles: the footer's copyright line (0.875rem in Smoke Ink) and the mail chooser's quiet first line (400, 0.9375rem, 112% width, in Smoke Ink, cut short with an ellipsis).

### Named Rules
**The One Family Rule.** Hubot Sans alone, from one variable file. Expression comes from the width axis, not from a second typeface: 125% for the title, 112% for statements, labels and controls, 106% for list titles, 100% for reading.

**The Light Type Rule.** Large type is light: 300 for the title and the statements, 330 for the passage. Nothing is bold or italic; the heaviest weight in the system is the button's 560.

**The Still Type Rule.** Type never moves. Outside the stage every word is simply visible. In the stage each text block is lit or unlit as a state: it switches on at a point in the scroll and fades there in place (about 300ms in, 200ms out), never scrubbed and never resting half-lit. There is no translation, typing effect or split letters, every word is in the server HTML, and unlit text takes no pointer, so a selection never catches it.

## Layout

One centred container, at most 84rem wide, with a fluid side gutter (20px on a phone, 72px on a wide desktop). A breakpoint at 48rem (768px) turns the one-column phone stack into a 12-column grid with 1.5rem column gaps. The stage alone has a second, shape-based switch: landscape is at least 720px wide with an aspect ratio of at least 21/20; anything else is portrait.

The page runs: hero, the pinned stage (scenes A and B), the grid band (scene C), the roles, the footer. Compositions are asymmetric and left-set: a 5-column heading over a passage stepped down and right into columns 6 to 12; a 5-column heading beside a 7-column list of roles. In the plain sections that stand in for the stage, a 5-column statement sits beside 7 columns of media: scene A's garment runs out through the right gutter from 48rem and edge to edge on a phone; scene B's stack is centred in its 7 columns, beside the statement as in the stage, and follows it on a phone.

The stage is one screen tall (100lvh) and pinned through a run of 4 screens of scroll on portrait and 4.4 on landscape. On landscape its copy sits in the page's left column, vertically centred and min(30rem, 31vw) wide, with the image to its right; on portrait the copy sits at the top, max(7svh, 3rem) down, above the image. Behind the stage the hero's relief runs on, its folds continuing across the join; scene A's heading is lit from first paint and the garment is unseen in its shade, so on a phone the heading shows on the lit relief below the hero at the fold.

Fields are full-bleed and sit under the content. The hero is at least max(36rem, 82svh) tall (max(36rem, 96svh) on a phone, so the name has open relief around it, 6rem clear below it before the copy), with the title centred in the open relief and the rest of its content pushed to the lower left (8rem above it, clamp(4.5rem, 13svh, 8.5rem) below). The grid band carries clamp(5rem, 11vw, 10rem) of padding above its content and clamp(7rem, 15vw, 13rem) below.

Vertical rhythm is generous and fluid. Between plain sections the gap is the section token (7rem on a phone, 11rem on a desktop). A field brings its own padding, so the section after the hero or the band opens with only clamp(3rem, 5vw, 4rem) or clamp(3rem, 6vw, 5rem), and the band follows the content above it directly, its own top padding giving the gap. The footer sits clamp(6rem, 12vw, 10rem) below the last section. Inside a group the steps are small and fixed, mostly stack-xs from a tagline to its sentence, stack-sm from a heading to its supporting line, stack-md (2.5rem from 48rem) from the title to its copy block, and stack-lg before a closing line or an image. Supporting sentences hold to 28–42ch, and the hero's copy block to 38rem.

Touch targets: controls, the header address, the mark and the mail chooser's choices 3rem tall (the choices 2.5rem for a fine pointer). The roles' rows are at least 4.5rem tall, though they are text, not targets. Hover effects, and any lamp that follows the pointer, exist only for a fine pointer; a swipe is always a scroll.

### Named Rules
**The Asymmetry Rule.** Content is left-set on asymmetric splits of the 12-column grid (5 and 7, or a 5-column heading over a passage stepped to columns 6 to 12); in the stage, copy holds the left column and the image the rest. No block of content is centred.

## Elevation & Depth

Flat, with no UI shadows anywhere: no box-shadow, no drop-shadow, no backdrop blur, no glass. Depth is light falling on form. On a hardware GPU the ground under the hero is a folded-plate relief: straight folds and zigzag creases whose segments run at ±30° divide it into flat facets. A single point lamp hangs just above it; each facet is shaded only by its angle to the lamp and its distance from it, with a faint specular sheen, and the creases are drawn as fine lines that brighten only near the lamp. Away from the lamp the relief sinks back into the ground, and towards the hero's foot a layer of the ground, grain and all, settles over it, from nothing at 58% of the hero's height to full at its bottom edge; once the stage's relief runs on from the hero's under the same lamp, that layer lifts (800ms) and the two read as one surface. The relief carries the same ±3-level grain as the page's tile, so relief and ground read as one matte surface.

Behind the stage the hero's relief runs on, drawn as the hero draws it and lit by its own steady lamp; the camera moves the subjects, never the relief. Inside the stage the lamp may be occluded, and that is the only shadow the system knows: the garment stands in a soft pool of its own shade on the relief, darkest against it (97%) and fading out into the lit relief, with a shadow thrown down and to the left, away from the relief's lamp; and each sheet of the layered material darkens the sheet below where they rest close. Scene B also has a camera's depth of field: sheets away from the lamp soften as the stack opens, and nothing is soft while it is closed; the inner layers are only ever suggested, kept in shadow and out of sharp focus. Where the stage meets the hero, and again where it meets the grid band, the relief simply runs on: the next relief continues the pattern and is lit by the same lamp across the join, so neither join has a fade or a seam. Under the grid band the relief continues the stage's folds and sinks back into the ground from 66% of the band's height. Where one side is missing, that edge fades instead: the stage's relief fades up from the ground below the join over 0.25 of the hero's height when there is no hero relief to share a lamp with, and fades out over 0.22 of it to the stage's bottom edge when there is no band relief below; the band's relief rises out of the ground over the band's first 24% when no pinned stage runs above it. Images outside the stage take depth the same way: lit from above and dissolving into the ground through masks, never framed or lifted.

### Named Rules
**The Depth-Is-Light Rule.** Nothing is raised. Surfaces get depth only from the lamp falling across facets and images, from the lamp being occluded inside the stage, and from masks that let forms fall off into the ground.

**The Still Light Rule.** When the relief cannot run on a hardware GPU (a software WebGL renderer, no WebGL, or no script), a still radial pool of lamp light sits where the hero's lamp would rest. Content never depends on the relief.

**The Pixel Truth Rule.** Scenes draw only the approved images' own pixels. Light scales how much of a pixel shows and focus softens it (on the base sheet a faint rim of light traces its own outline, and where scene B's plane of light crosses a sheet its surface catches a line of the lamp's light); nothing adds surface, detail or geometry. Unlit areas fall to the ground colour, never below it.

## Shapes

Square, hard-edged and sparse. Every surface and control has square corners: the button, image bounds and the focus ring. Interface lines are 1px hairlines, and on the page only horizontal: one above each role, one closing the list, one above the footer. The mail chooser alone is outlined on all four sides, a transient control rather than content. The only angled geometry is the crease: the relief's zigzags at ±30°, in the hero, behind the stage and under the grid band. Scene C's grid is square, hairlines running across and down the page with a small dot at each crossing; it is a field under the content, not an interface line. Images are unframed, cut-outs and renders that dissolve into the ground through masks. Apart from the grid's dots, the mark is the one round form, a circular monogram drawn in the current text colour; arrows are 18px line drawings with a 1.5px stroke and square caps, so even the icons have no rounded ends. A down arrow jumps within the page; an up-right arrow marks a link that leaves it ("Write to us", and the mail chooser's Gmail, Outlook and Email app).

### Named Rules
**The Crease Angle Rule.** Folds and creases run at the relief's 30° angle and no other: the hero relief and its continuations behind the stage and under the grid band. Scene C's grid draws no creases; its lines run square to the page. Don't introduce skews, diagonal wipes or angled section edges.

**The No-Box Rule.** Content is never boxed: no cards, panels, outlined containers or framed images. Separation is a 1px hairline or dark space. The mail chooser's outline is not an exception: it is a transient control that opens on a click and closes again, never a container for content.

## Components

### Buttons
A plain, solid, square block: the only solid fill on a screen.
- **Shape:** square corners (0px), 3rem tall.
- **Primary:** Chalk Ink fill with Graphite Ground text in the control type, padded 0 1.25rem 0 1.375rem, with an 18px up-right arrow 0.75rem after the label, since it writes to the address: a plain mailto: link, so a click goes straight to the reader's own mail app, with no chooser.
- **Hover / Focus:** on fine pointers the fill brightens to Lit Ink (200ms), and the arrow leans 3px up and out (200ms, ease-out). Keyboard focus draws the lamp ring: a square 2px outline 4px outside the shape. Press scales to 0.97 over 160ms (ease-out).
- **Quiet link (secondary action):** no fill and no border; Ash Ink text in the quiet control type, 3rem tall, 0.625rem before its arrow. Hover raises it to Chalk Ink and leans the arrow 4px along its direction (3px for a down arrow); press scales to 0.97.

### Inline Links
- **Style:** Chalk Ink text with a 1px underline in Strong Hairline, offset 0.28em.
- **Hover:** the underline rises to Chalk Ink (200ms), and stays there while the link's mail chooser is open (the closing line's address).

### Lists (hairline rows)
An open ledger, not a stack of cards.
- **Row:** a plain list item at least 4.5rem tall, padded 1.25rem 0.25rem, with a Hairline above each row and one closing the list. The title is set in the role type in Chalk Ink. A row is text, not a link: it has no arrow, hover or press state.
- **Writing:** the closing line under the list, "We'd love to hear from you. Write to us at d@grovillon.com." in the lead type and Ash Ink, is the way to write; its address is an inline link that opens the mail chooser.

### Navigation
- **Header:** the mark (3rem, Chalk Ink) top left links back to the top; the contact address sits top right as a quiet link (Ash Ink, 3rem tall) that opens the mail chooser, so the address is on screen from the first moment and a visitor without a mail app can still read it. The header floats over the hero with no bar, background or border and does not stick; there is no navigation menu. Hover raises the address to Chalk Ink.
- **In-page jumps:** a link or a Tab keypress that would carry the reader across the stage jumps instead of scrolling smoothly, so the film never flashes past.
- **Footer:** a Hairline above; the mark (2.25rem) beside the label-type wordmark, both in Ash Ink; the copyright in Smoke Ink.

### Mail Chooser
A small transient control that makes the written-out address work, with or without a mail app. It serves the header address and the closing line under the roles; "Write to us" is a plain mailto: link that goes straight to the reader's own mail app.
- **Behaviour:** each address it serves stays a mailto: link, so without script, with a modifier key or with a middle click it behaves as one. A plain click (or Space) opens the chooser instead: a quiet first line showing the address, then Gmail, Outlook, Email app and Copy address. Gmail and Outlook open in a new tab, Email app follows the mailto: link, and Copy address copies the address and reads "Copied" for 1.5s (also announced to screen readers). Only one chooser is open at a time.
- **Keyboard:** focus moves to the first choice on opening; the arrow keys move through the choices and wrap, Home and End go to the ends, Space chooses, Escape closes and returns focus to the link, and Tab closes it and carries on from the link.
- **Closing:** a press or focus outside it closes it. It travels with its link as the page scrolls, and closes once the page has scrolled 48px from where it opened (measured from where a scroll still under way comes to rest, and not within 150ms of opening) or when its link leaves the screen.
- **Placement:** 6px below its link (above it when there is no room below), kept 8px inside the viewport, aligned to the link's start, or to its end for the header address. At least 13rem wide and at most min(20rem, 100vw − 1rem).
- **Look:** the ground with its grain, a 1px Strong Hairline outline, no fill, no shadow, square corners. Choices are 3rem tall (2.5rem for a fine pointer), in Ash Ink in the quiet control type, separated by Hairlines, each that leaves the page with an up-right arrow. Hover or focus raises a choice to Chalk Ink over a 3.5% ink tint (the arrow leans 3px up and out), press deepens it to 6%; keyboard focus draws the lamp ring 2px inside the choice. While it is open, its link keeps its hover state.
- **Motion:** it grows out of its link's side, from 97% scale and 4px toward the link, over 180ms in and 120ms out on the page's ease-out; with reduced motion it simply appears and goes.

### Relief Field (signature)
The ground itself, drawn in WebGL behind the hero.
- **Form:** straight folds and ±30° zigzag creases cut the plane into flat facets; one point lamp shades each facet by angle and distance; only the creases are drawn as lines. Lengths are measured against the hero's own height so the folds keep one physical size, and a field narrower than its height switches to a finer fold.
- **Hero lamp:** sweeps once from left of centre to rest at upper right, opposite the title (1700ms, cubic-bezier(0.77, 0, 0.175, 1)), while warming from dark to full (1200ms, ease-out). With a mouse it then follows the pointer on a spring (stiffness 170, damping 26) and returns to rest when the pointer leaves. A pointer that arrives mid-entrance takes the lamp with its momentum: the spring's stiffness ramps in over 200ms, critically damped throughout, so the lamp carries on briefly before turning.
- **Rendering:** shown only after its first frame (a 300ms fade), so it never pops in; drawn at CSS-pixel resolution with 4× supersampling; paused off-screen and in hidden tabs; rebuilt after a lost context.
- **Fallback:** drawn only on a hardware GPU. Software renderers, no WebGL and no script all get the still light (600ms fade in): a radial pool of lamp light near the lamp's rest, 7% at 72% across and 8% down. The direction first called for the relief everywhere; the build reserves it for hardware GPUs, and the build is the rule.
- **Reduced motion:** no sweep and no following. The lamp starts at rest at full strength.

### Cinematic Stage (signature)
One pinned stage below the hero, drawn in WebGL on a hardware GPU, in which the hero's relief runs on behind the two approved images. Scene A runs to 0.615 of the pinned run and scene B from there, with a cut on the relief between them.
- **Scrub:** the scenes follow scroll position through a critically damped spring, solved exactly each frame so it is the same at any frame rate, that follows the input: soft (stiffness 40) for a mouse wheel, so its separate steps blend into one continuous move, and firmer (stiffness 120) for a trackpad, a finger or the keyboard, which already scroll smoothly; it eases from one to the other over about 200ms. The film plays backwards exactly as forwards. A jump (first frame, the stage off screen, a resize, a Tab or in-page link jump) lands directly. Keyframed values run through their keys with continuous velocity (a monotone cubic, so they never overshoot) and come to rest only at either end, on a held value and where they turn back; camera moves change scale at an even rate (log space), zooming about the one screen point both framings share; moving lights follow velocity-continuous paths, and a repeated key is a hold. Light changes ease with glide, cubic-bezier(0.45, 0, 0.55, 1).
- **Lamp model:** each image is shown at the lamp's exposure, a pool that falls off with distance under a lamp at a set height and radius, blended toward the image as photographed by a fill amount; the lit colour never falls below the ground. Images take only a trace of the lamp's warmth (tint 65% to 100% white as the fill rises); the relief keeps the full lamp colour. Grain is ±3/255 at one CSS pixel, as the hero draws it.
- **Background:** the hero's relief, drawn by the stage with the hero's shading, its unit (the hero's height), folds, look and grain, and placed by the hero's top so the folds run on from the hero's across the join. It is steady: its own lamp rests on the stage where the hero's rests on the hero, it never moves with the camera or the scenes, and the relief is lit behind both scenes. While the join with the hero is on screen, the stage's relief is lit by the hero's own lamp, wherever a mouse has taken it, so hero and stage read as one surface with no seam and no fade; the stage takes its own lamp back over the last 20% of the screen before it pins (smoothstep). As the stage leaves, the grid band's lamp takes over within the first 5% of the stage's height leaving; at rest it hangs where the stage's does, and the band's relief runs on below with no fade. Without a hero relief to share a lamp with, the stage's own lamp is held back while the stage approaches, hanging one hero height higher so its light is faint and even (it comes down as the stage's top rises from 0.7 to 0.3 hero heights below the viewport's top), and the relief fades up from the ground over 0.25 hero heights below the join, a fade that scrolls with the join. Without a band relief below, the relief fades out as the stage leaves over 0.22 hero heights to the stage's bottom edge, eased in over the first 10% of the stage's height leaving.
- **Scene A, the garment:** the garment stands in front of the relief and is solid the whole time; it never fades, moves in or scales into view. Before the light reaches it, it is unlit and stands in a soft pool of its own shade on the relief, so it reads as darkness while the rest of the relief stays lit. With the camera still at the opening framing, close on the right shoulder (on a portrait screen the camera is at 0.72 of the fitted distance, centred on the chest; on a landscape screen the garment is small, fitted within 0.38 of the screen's width and 0.52 of its height, the camera at 0.75 of the hold distance, and it stands on the left, its chest a third of the way across, inside a veil that darkens the relief from the left edge, as dark as the shade against the garment to 55% across and gone by 85%, so the right of the relief stays lit; the veil belongs to the relief, so it is there before the garment arrives and no light on the garment lifts it), light comes down from above the right shoulder and lights the garment gradually: a soft front spreads from a point above the shoulder down and across it (t 0 to 0.21) while the lamp descends onto the shoulder and the fill rises to half (to 0.35 on a landscape screen, so the light falls from the right and the garment's left, under the heading, stays in shadow); where the light falls, the pool around the garment lifts a little. The garment image shows the collar's shadowed inside and carries no light fringe at its edge. The lit garment rests, the camera and lamp still, to 0.235. Then the camera pulls back to the whole garment (to 0.35; to the hold distance, about 1.33× on a landscape screen and 0.95 of the fitted distance, about 1.3×, on portrait), the veil lifting (to 0.33) and the shade round the lit garment easing to 40% of its depth (0.235 to 0.33), since it only has to ground the garment in the key light, while the lamp crosses from upper right to lower left (roughly along the crease angle) and the fill rises to 0.82, and curves up to settle as a key light over the left shoulder (radius 360 → 560 → 680), held to 0.43. The heading goes out (0.38 to 0.41), and the camera pushes onto the right shoulder seam (0.43 to 0.51, to 0.6 of the hold's camera distance on a landscape screen and 0.62 of the fitted distance on portrait) while the beam narrows (680 → 260 → 200 image px) and the fill falls away. From 0.43 the light gathers onto the seam, the garment going dark from the frame's edges inwards and its shade deepening again (back to full by 0.49), and from 0.49 to 0.56 what is left goes out.
- **The cut:** made on the relief, which stays lit. The garment and its shade dissolve together while its light goes out (0.5 to 0.555, glide), so neither is ever left on the relief as a dark shape; after a pause on the relief alone, scene B's statement is lit first, on the relief: the heading (0.635 to 0.655), then "By design." (0.665 to 0.685) and "Silently present." (0.69 to 0.71). Then a plane of light passes down through the stack where it stands, open at the render's own spacing (0.715 to 0.835, glide), from above its top edge to below its base: the rows it has passed show, the rows it has not reached do not, over a soft edge of 56 render px, and where it crosses a layer the surface catches a line of the lamp's light (an 18 render px glint, gone as the plane leaves the base). One plane serves every sheet, so a sheet is never drawn where the one above it is not. The lamp rides the plane down, close over the layers it is reaching, while the fill rises from 0.22 to 0.3, so the plane reads as light passing through them. Nothing moves in: the stack never falls, slides or scales into view.
- **Scene B, the sheets:** six sheets cut from the approved render. Each pair of sheets moves between 30% and 100% of the render's own spacing, never wider and never sideways, and each sheet sits at least as low as the sheet below it, so no surface the render does not contain is ever shown. Once the plane has passed, the lamp rises over the open stack (0.825 to 0.865) and crosses it, from the stack's centre to the left (450 render px at 0.86) and across to the right (690 at 0.885), settling at 540 by 0.95 (radius 420 → 520 → 600 → 640), the sheets away from the lamp softening out of focus; the third sheet is kept darker (80% shade) and never in sharp focus while the stack is open. The base sheet keeps its outline over the relief's dark lower panel: it keeps 84% of its light, carries a faint rim of light just inside its edge, and softens least, so it never reads as a reflection. From 0.885 the pairs close from the top, each over 0.04, 0.012 after the one above, and the fill rises from 0.45 to 0.85 (0.87 to 0.94) so the closed stack returns to its photographed light under the lit statement; the lamp then loses a quarter of its strength (0.955 to 0.995). The camera keeps the stack framed beside the statement throughout; as the layers come together it draws back with them, 20% over the closing (0.885 to 0.96), and recedes a little further (to 77%) by the end. On a portrait screen the stack then dissolves into the relief (0.945 to 0.985), ahead of the stage leaving, so the statement ends the film on its own. The sheets are monochrome, with the same filter as the static image (grayscale 1, brightness 0.96, contrast 1.06), and the inner sheets are a little darker than the outer ones.
- **Hand on the subject (fine pointer):** only a moving mouse moves the light; a pointer event without a change of position does not count. A mouse that moves on the subject (the garment's silhouette, or the sheets plus a 24px margin) leans the lamp 30% toward itself through most of each scene, and scrolling hands it back. In each scene's hold (scene A at its key light, scene B while the lamp crosses the open stack, fully held 0.865 to 0.885), moving on the subject takes the lamp and moving off it lets go; a still pointer keeps what it has until the hold ends or the pointer leaves the stage. A held lamp models the image: the fill drops by up to 75% (in scene B to no less than 0.3, so every sheet keeps its outline and none reads as a hole in the one below) and the radius moves toward 440 image px in scene A and 380 render px in scene B; in scene B focus follows it into the layers. The held lamp springs as the hero's does (170, 26), and once the hand has let go and the share has gone, it rests exactly on the scripted lamp. A resting pointer, anywhere, changes nothing.
- **Touch:** a single still press of 400ms within 10px on the subject takes the light; any movement past 10px, a scroll or lifting the finger lets go. A swipe is always a scroll.
- **Text:** four blocks (scene A's heading and line; scene B's heading and its two closing lines), each lit or unlit as a state (see the Still Type Rule). Scene A's heading and line start lit, as the stylesheet shows them; on screen every change fades, including on a reload into the stage, and only off screen does a block land on its state directly. In the stage scene B's closing lines take Chalk Ink.
- **Rendering:** the stage wakes once the page has loaded and the hero's entrance has played, as the reader nears it, or at once on a page that opens below the hero. Its relief draws as soon as it wakes, without waiting for the textures; the canvas is shown only after its first frame (300ms, ease-out). A subject whose texture arrives while the stage is on screen joins it: the garment over 0.4s, as its shade, then its dark form, then its light; the stack fades in over 0.3s. The canvas draws only while something moves and the stage is visible, and lowers its resolution rather than drop frames; the relief is supersampled on a low-density screen.
- **Fallback:** reduced motion (also when switched on mid-visit), no WebGL, a software renderer, no script, images that have not arrived within 12s (the stage stands down once it is off screen, so the page never changes under the reader), and print all get the same markup as plain sections at full ink: scene A as a 5/7 split with the garment under the fall-off treatment, scene B as a left-set 5/7 split, the statement in the left columns and the layered material centred in its 7 columns under the lit-from-above treatment.

### Grid Band (signature)
Scene C: a square grid of hairlines behind the band, with a dot at every crossing, a second skin laid on the hero's relief, which runs on under it.
- **Relief under the grid:** on a hardware GPU the band draws the hero's relief beneath the grid (LightField's band variant): lengths in the hero's height and the canvas placed in the hero's pattern. Below the pinned stage its pattern continues the stage's from the stage's bottom edge, so the folds run on across the join, and its lamp rests where the stage's lamp hangs, above the band; otherwise its folds align with the hero's and its lamp rests upper right. The grid rests its lamp in the same place and the two follow a mouse on the same spring (170, 26), so relief and grid share one light; it does not sweep in. It sinks back into the ground from 66% of the band's height (with no pinned stage above, it also rises out of it over the band's first 24%), and is shown only after its first frame (300ms). With reduced motion its lamp stays at rest. Without a hardware GPU it is simply absent and the grid lies on the ground.
- **Grid:** the cell comes from the band's --grid-cell custom property: 44px on a phone, 54px from 48rem. A vertical line runs through the band's centre and a horizontal one half a cell below its top, and the grid runs a cell past every edge, so a moved edge never shows a line's end. Lines are 0.75px on dense screens and 1px otherwise, at 5% Chalk Ink; dots are 1.1px in radius, at 9%. The band's vertical fade (in over its first 22%, out over its last 22%) covers the grid in every state.
- **Lamp:** the band's lamp, shared with the relief beneath: below the pinned stage it rests where the stage's lamp hangs, above the band, out of the grid's reach until a pointer brings it in; otherwise upper right (78% across, 30% of the band's height down, at most 320px). It moves with the relief's when that changes (the stage going back to plain sections). Lines and dots are lit by a radial gradient around it reaching 260px (×1.3 under a pointer): lamp colour at its centre (lines 20%, dots 34%; 48% and 62% under a pointer), Chalk Ink at 45% of its reach (lines 9%, dots 14%; 13% and 19%), and their resting 5% and 9% beyond. Under a pointer, dots within 170px of the lamp grow by up to 0.65px.
- **Gather (mouse and pen only):** the pointer carries the lamp on the hero's spring (170, 26), and the skin gathers toward it on the same spring: crossings within 220px are drawn in toward the pointer, up to 45% of the way beside it and smoothly to nothing at 220px, so the cells never fold over, and the sides of moving cells curve rather than kink. A page scrolling under a still pointer keeps the skin gathered under it. When the pointer leaves, the skin relaxes and the lamp returns to rest.
- **Ripple:** a click on open space ripples at once; a click on the words ripples on release, unless it dragged more than 10px or selected text; a still tap (released within 10px, and never taken for a scroll) ripples on release. A ripple is a wave through the grid: as its front arrives each crossing moves outward (7px at its start) and then rings back and forth a little behind it (100px from crest to crest, rising over 24px ahead of the front and dying over 70px behind), while the cell where it starts stays calm. The front carries a band of lamp light ±40px wide, at 22% on the lines and 70% on the dots, which also grow by up to 0.9px as it crosses them. It travels at about 40% of the band's width per second (300–600px/s) and fades out over 1.5s. At most three run at once; a fourth retires the oldest over 150ms. When the band's heading first reaches the upper half of the viewport, the resting lamp sends one ripple from where its light meets the band (on the band's top edge when the lamp rests above it), unless the visitor has already interacted.
- **Quiet zones:** no line or dot crosses a line of text (heading, body, passage), ripples included: each line's box and 2px around it are clear, and beyond it the grid fades out in steps over 18px (30%, 60% and 84% removed from 18, 12 and 6px).
- **Touch:** a tap ripples; a swipe only scrolls; touch never gathers the skin.
- **Reduced motion:** the canvas draws the grid still, lamp at rest: no gathering and no ripples (also when switched on mid-visit, when the grid settles at rest).
- **Fallback:** without script, a still CSS grid: a tile of one cell crossed at its centre, at the same cell size, origin, stroke and opacity as the canvas (5% lines, 9% dots), so it covers the band exactly as the canvas would at rest, without its lamp. The canvas fades in over it (300ms) after its first draw.
- **Provenance:** built from the client's reference for its KineticGrid component (a square grid that warps toward the pointer and ripples on every click), whose source was not supplied; treat its exact values as provisional.

### Media
Used where the stage stands down, as plain sections.
- **Fall-off treatment:** a colour image whose lower edge dissolves into the ground (solid to 72%, transparent at the bottom); it may bleed out of the container through the gutter.
- **Lit-from-above treatment:** a monochrome image (greyscale, 96% brightness, 106% contrast) under a graded mask (solid to 48%, 62% at 74%, 20% at 92%, gone at the bottom), so its top catches the light and its lower part falls away into shadow while staying legible.

### Named Rules
**The One Filled Control Rule.** The primary button is the only solid fill on a screen and appears once there; every other action is text with an arrow.

**The Brighten Rule.** Interaction only brightens: ink-2 rises to ink, a strong hairline to ink, ink to lit ink, and arrows lean 3px toward where they lead. Nothing changes hue, grows or lifts.

**The Scrub Rule.** Scenes are pure functions of scroll position, never of timers, and play backwards exactly as forwards. Only the text's on/off fade, the visitor's held lamp and a late subject's arrival have time of their own.

**The Unseen Exit Rule.** The relief behind the stage stays lit through a change of scene; only the subjects come and go. A subject's light goes out until it is as dark as the shade it stands in, then it and its shade leave together, unseen, so no shade is ever left on its own; after a pause on the relief alone, the next subject is drawn out of the dark where it stands, by light passing through it. At the change of scene nothing pops in or vanishes in view, so nothing jumps.

**The Hand on the Subject Rule.** The light answers only to a hand moving on the subject: moving on it leans the light, and in a hold takes it; moving off it lets go. A resting pointer, or a swipe, changes nothing.

## Do's and Don'ts

### Do:
- **Do** keep every surface on the graphite ground with its grain tile, and let the lamp (on the relief, in the stage, on the grid, or as the still light) be the only thing that brightens it.
- **Do** rest the lamp away from the type: in the hero it settles upper right, away from the copy at lower left; in the stage the copy holds the left column and the light works on the image to its right.
- **Do** separate content with 1px hairlines (line, 12% ink) and dark space, and keep surfaces and controls square-cornered.
- **Do** set every word in Hubot Sans and change width before weight: 125% title; 112% statements, labels and controls; 106% list titles; 100% reading.
- **Do** run any new fold or crease at the 30° crease angle, and align any new run of the relief with the hero's folds.
- **Do** ease arrivals and responses with cubic-bezier(0.23, 1, 0.32, 1), press controls to scale(0.97), and keep hover effects behind `(hover: hover) and (pointer: fine)`; ease scroll-scrubbed moves with cubic-bezier(0.45, 0, 0.55, 1).
- **Do** drive scenes from scroll position through a soft spring, so they play backwards exactly as forwards, and change scene behind a lit relief: the light goes out on one subject before it leaves unseen, and light draws the next out of the dark where it stands.
- **Do** make every view complete without motion, script or WebGL: content visible by default, the still light in place of the relief, plain sections in place of the stage, the still CSS grid in place of the grid's canvas.
- **Do** use only approved images or abstract material, lit by the same lamp and falling off into the ground; draw only their own pixels, ship any derived raster with its provenance, and treat client originals in CSS only.

### Don't:
- **Don't** add glow, bloom or halos to type, controls, the mark or images; the only soft light is the lamp.
- **Don't** use frosted glass, cards, panels or framed images.
- **Don't** use gradients as decoration (gradient text, gradient buttons, tinted gradient backdrops); a gradient is only ever the lamp's falloff or a mask into the ground.
- **Don't** introduce an accent colour, or use the lamp colour as paint.
- **Don't** add box or drop shadows to the interface, the mail chooser included; the only shadows are the lamp's light occluded inside the stage.
- **Don't** set a centred, glowing headline over an orb or particle field.
- **Don't** move text into view, type it out or split it, or give every section the same entrance; in the stage text is lit in place, nowhere else does it animate.
- **Don't** cut from one lit subject to another, ease a move to a stop at every keyframe, or drive a scene from a timer.
- **Don't** let a resting pointer or a swipe move the light; only a hand moving on the subject, or a still press on it, may.
- **Don't** add surface, detail or geometry the approved images do not contain, or open the layered material wider than its own render.
- **Don't** set anything bold or italic, or add a second typeface.
- **Don't** add technical detail of the product or invented claims to any visual.
