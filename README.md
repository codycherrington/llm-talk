# How LLMs Actually Work

An animated, interactive slide deck explaining how a large language model
actually works — and how understanding the mechanism makes you better at using
one. Built to be presented live in about 30 minutes.

The deck opens with the word *apple*, asks the room what they think of, and uses
their own answers as the running example through every slide that follows:
tokenization, embeddings, attention, stacking, sampling, training, and the
failure modes that fall out of all of it.

## Present it

Double-click `index.html`. That's the whole setup — no server, no build step,
no network. Everything including the fonts and the tokenizer vocabulary is
local, so it works on conference-room wifi that doesn't exist.

| Key | Does |
|---|---|
| `→` / space | next build |
| `←` | back |
| `↑` `↓` | previous / next whole slide |
| `S` | speaker notes overlay |
| `F` | fullscreen |
| `Esc` | grid of all slides — click to jump |
| `?` | key help |

A presentation clicker works (it sends arrow keys). Clicking the slide also
advances, except on widget controls.

`index.html?slide=14` jumps straight to a slide for rehearsal.
Add `&steps=all` to land with every build already revealed.

**Read [`SPEAKER-SCRIPT.md`](SPEAKER-SCRIPT.md) before presenting.** It has the
talk track, the audience-interaction beats for the opening, a timing budget,
what to cut if you're running long, and answers to the questions you'll get.

## Interactive bits

Nine slides are live, not animations. Drive them.

| Slide | What you can do |
|---|---|
| 05 Tokenization | Type any sentence, see the real GPT-2 split and token IDs |
| 06 One token, 4,096 numbers | Watch a single token's whole vector appear |
| 07 What the numbers mean | Click a concept, see which dimensions carry it |
| 08 The map | Watch `apple` land stranded between two clusters |
| 13 Attention | Click any token to see what it looks back at |
| 14 The vector moves | Run one layer at a time and watch meaning resolve |
| 16 Running notes | Step through what the token means after each block |
| 18 Next token | Compare contexts, drag the temperature slider |
| 20 How it learns | Real gradient descent, running live |

## What's real and what's schematic

The talk makes a claim about how the thing really works, so the deck is careful
about which parts are measured and which are drawn. Anything schematic is
labelled as such on the slide itself.

- **Tokenizer — real.** Real GPT-2 vocabulary, real byte-level BPE merges, real
  token IDs, for any text you type.
- **Attention arithmetic — real.** Genuine `softmax(QKᵀ/√d)` with causal
  masking. Toy scale: 8 hand-authored interpretable dimensions instead of
  thousands of learned ones, so the axes mean something you can point at.
- **Gradient descent — real.** The weights start as noise, the loss is measured
  from the run, the curve is not drawn.
- **Concept directions — constructed, projections real.** On slide 7 the named
  directions (food, companies, colour…) were built deliberately, so the demo is
  deterministic and identical every time you present. The projection maths that
  reads those weights back out of a 4,096-dimensional vector is real, and it
  works *because* random directions in a space that big are nearly orthogonal —
  which is the superposition point the slide is making, running live rather than
  asserted. A concept the word doesn't carry ("law, courts") correctly reads as
  flat, which is the control.
- **Embedding map positions — hand-placed.** A true projection of real
  embeddings down to 2D is an unreadable blob. The structure shown (clusters,
  and the king/queen parallelogram) is a real documented property.
- **`apple`'s path across the map — computed.** That's the real attention update
  running repeatedly; the dot goes wherever the arithmetic puts it.
- **Multi-head patterns and next-token logits — illustrative.** The head
  behaviours are real documented types from interpretability work; the specific
  weights are not measured.

## Layout model

Every slide is authored in a fixed 1280×720 coordinate space and the stage is
transform-scaled to fit the display. Nothing reflows, so what you rehearse is
exactly what the projector shows — at any resolution.

The flip side is that content which runs long falls off the bottom instead of
scrolling. `node tools/audit.mjs` catches that:

```
$ node tools/audit.mjs
Slide overflow audit — authoring box is 1280 x 720

All 24 slides fit.
```

Run it after editing slide copy.

## Publishing

```bash
node tools/build-single.mjs
```

Inlines everything into `dist/deck.html` (a standalone file you can email or
put on a USB stick) and `dist/artifact.html` (the same page as a fragment, for
the Artifact publisher). Zero external requests in either.

## Project layout

```
index.html              all 24 slides, with speaker notes inline
css/deck.css            theme tokens, layout, animation
css/fonts.css           GENERATED — fonts as base64 data URIs
js/deck.js              navigation, builds, presenter overlay, slide grid
js/tokenizer-engine.js  GPT-2 byte-level BPE
js/attention-math.js    softmax(QKᵀ/√d)V with causal masking
js/widgets/             the live slides
data/bpe.js             GENERATED — GPT-2 vocab + merges
data/vectors.js         hand-authored embeddings and map positions
tools/fetch-vocab.mjs   rebuilds data/bpe.js
tools/fetch-fonts.mjs   rebuilds css/fonts.css
tools/audit.mjs         slide overflow check
tools/build-single.mjs  inlines everything for publishing
SPEAKER-SCRIPT.md       the talk track
```

The two generated files are committed so the deck works from a fresh clone with
no network. Regenerate them only if you want to change the vocabulary or the
typefaces.

## Editing the content

Slides are plain HTML `<section class="slide">` elements in `index.html`.

- `data-title` and `data-act` fill in the slide grid.
- `data-step="n"` on a child reveals it on the nth arrow press.
- A `<div class="notes">` inside a slide is speaker notes — never rendered on
  the slide, pulled into the `S` overlay.

After editing, run `node tools/audit.mjs`, then rebuild if you're republishing.

## Credits

Typefaces: Newsreader, IBM Plex Sans, IBM Plex Mono — all SIL Open Font License
1.1. Tokenizer data from OpenAI's GPT-2, MIT licensed.
