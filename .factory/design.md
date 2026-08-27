# Visual thesis: a working botanical field guide

Comprehensible Input Log should feel like the notebook a patient naturalist carries: observant, private, and built to reveal change over time. Each source is a specimen, not an assignment; comprehension is a condition the learner records, not a proficiency score the product awards. The interface borrows the quiet structure of herbarium labels, ruled paper, ink stamps, and pressed leaves while remaining a crisp modern utility.

## Palette

- Parchment `#f2eddf` is the light canvas; warm paper makes long reading calmer than clinical white.
- Paper `#fffdf6` and raised paper `#f8f3e7` separate working surfaces.
- Ink `#1e2b24` and muted ink `#56645b` provide 12.5:1 and 5.7:1 contrast on parchment.
- Fern `#255b45` is the primary action; white text is 7.6:1.
- Moss `#54714f` marks healthy ranges and progress without implying points.
- Ochre `#9b5e1b` marks “stretch” material; deep rust `#8b352a` marks caution/errors.
- Night treatment: soil `#18201c`, dark paper `#212b25`, pale ink `#f2eddf`, sage `#9fc8a5`, and sand `#d9c79f`. It is selected with the device color scheme, not a third-party theme.

## Type and spacing

Headings use Georgia, a locally available book serif that gives specimen labels warmth. Interface and body copy use the system sans stack for fast, legible controls with no font download. Type steps are 0.78, 0.9, 1, 1.25, 1.75, and clamp(2.35–4rem). Body is never below 16px. Long copy stays under 68 characters.

Spacing follows a 4/8px rhythm: 4, 8, 12, 16, 24, 32, 48, 72. Rules and corner cuts create hierarchy before shadows; cards are reserved for individual observations and the active recommendation.

## Interaction grammar

- The primary action is “Log a source,” always visually paired with a small sprout mark.
- Understanding is entered as one of five plain-language bands (A little → Nearly all). Percent ranges are supporting calibration only and are explicitly subjective.
- Source types use hand-authored line icons and short labels; no icon stands alone.
- New observations rise from the log edge by 8px, like inserting a field note. The add/edit sheet expands from its trigger on desktop and becomes a bottom sheet on small screens.
- Trend marks resemble botanical plot points connected by a fine stem. Every chart has a text summary and its values remain readable without color.
- Destructive actions name the source and require confirmation. Import previews counts before replacing local data.

## Motion policy

State changes use 180–240ms opacity and translate transitions with physical origin. The trend line draws once when data changes; nothing loops. Under `prefers-reduced-motion`, transforms and drawing are removed and state changes are instant. Depth remains through paper color, rules, and type scale.

## Asset plan and provenance

The hero includes one original still-life illustration: a pressed fern crossing an open field notebook whose abstract marks suggest reading, listening, and watching. It explains the product as observation across media without depicting hosted content. Generated raster imagery is limited to this atmospheric hero; all functional marks and charts are authored SVG/CSS.

Prompt sheet: “Editorial botanical field-guide still life, top-down open naturalist notebook on warm cream handmade paper, one delicate pressed fern frond crossing the page, tiny abstract ink marks and three simple specimen dots suggesting book audio and film, forest-green and ochre ink, subtle paper grain, quiet morning window light, generous negative space, tactile analog printmaking with precise modern composition, no people, no device UI, no readable text, no letters, no logos, no watermark, no brand symbols.”

Asset: `public/assets/field-notes-hero.webp` (plus AVIF and PNG source). Generated with Azure OpenAI image generation deployment `factory-image` on 2026-08-27. Original for this product. Reviewed for text artifacts, unwanted symbols, seams, and palette consistency. The footer discloses AI-assisted imagery.

