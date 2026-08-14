# Speaker script — The Apple Problem

~30 minutes plus Q&A. The same notes are in the deck itself: press **S** during
the talk to toggle the presenter overlay.

## Before you walk in

- Open `index.html` (double-click it — no server, no wifi needed).
- Press **F** for fullscreen.
- Press **Esc** once to check the slide grid loads, then **Esc** again.
- Rehearse slides 8, 14, 15 and 19 at least once. Those are the ones you
  *drive*, and they're the ones people ask you to go back to.
- Have a browser tab with your team's actual AI tool open, in case Q&A goes
  practical.

**Keys:** `→` / space next build · `←` back · `↑` `↓` whole slide ·
`S` notes · `F` fullscreen · `Esc` slide grid · `?` help

A clicker works — it sends arrow keys. Clicking anywhere on the slide also
advances, except on widget controls.

## Two registers on a slide

Several slides carry a **read later** block at the bottom, set quieter and
smaller. That's deliberate: the big type is what you say out loud, the read-later
block is for whoever opens the deck afterwards. **Don't read those blocks to the
room.** Bring them up on the last build, say the one sentence flagged in the
notes, and move on.

---

## Timing budget

| Section | Slides | Target | Running |
|---|---|---|---|
| Open + the hook | 1–5 | 5 min | 5 |
| Act 1 · words become numbers | 6–10 | 7 min | 12 |
| Act 2 · context | 11–18 | 10 min | 22 |
| Act 3 · prediction, learning, limits | 19–22 | 5 min | 27 |
| The failure modes + close | 23–26 | 3 min | 30 |

**If you're running long**, cut slide 11 (order matters) and slide 16
(multi-head) — both are one-minute asides. Never cut 15, 18 or 24.

**If you're running short**, slow down on 14 and click more tokens.

---

## Act 0 — The hook (slides 1–5)

### 1. Title
Open plainly. Don't oversell. The promise is small and concrete: *thirty
minutes, and you'll know why it does the weird things it does.*

### 2. Who I am
Name, team, one honest line about how you actually use this stuff day to day.

The two-groups framing — people who get a lot out of it, people who tried it
and quietly stopped — gives the skeptics permission to have been unimpressed
without making them wrong. Don't skip it.

**Be on slide 3 by the 3-minute mark.**

### 3. apple ★ *the whole talk is in this slide*
Put the word up. **Say nothing for a beat.**

> "When I say the word apple — what do you think of?"

Take real answers. Press `→` to drop in each preset as it comes, or type
anything unexpected into the field at the bottom and press Enter.

**Wait for someone to say the company.** Somebody always does. If nobody has
after three or four answers: *"anyone thinking of something that isn't food?"*

Do not explain anything yet. Just collect. The longer this breathes, the harder
the next two slides land.

### 4. How did you know?
Their own answers are still faintly on screen behind the question — they're
looking at the evidence.

Ask it, then **let the silence sit**. Someone will say "context" or "the
sentence." Nod. Don't confirm.

Then: **"I think you know where I'm going with this."** Beat. Advance.

### 5. context.
Hard cut. Say the word once, flat. Let it sit. If the room laughed: *"Surprise."*

**Then press once more** for the bridge line — *you did that in half a second
without noticing, and it's also the entire architecture.* That line is carrying
the job a whole slide used to do, so deliver it and move. The next thing out of
your mouth is *"let me show you the machine that does it."*

---

## Act 1 — Words become numbers (slides 6–10)

### 6. Tokenization (live)
Real GPT-2 tokenizer. Real IDs. Type whatever the room shouts.

Three things, in order:

1. **Common words survive whole, rare ones shatter.** Hit `rare words` —
   `unbelievable` → four pieces. The vocabulary was *learned* from frequency.
2. **Hit `apple ×3`.** `apple`, `Apple` and `·apple` (leading space) are three
   different tokens with three different IDs. The middot is the space. This
   surprises people.
3. **Hit `strawberry`.** It comes apart as `st / raw / berry`. **Park it** —
   you're coming back in four slides.

If asked: modern models have bigger vocabularies, same mechanism.

### 7. One token, 4,096 numbers ★
**The point of this slide is volume.** Let the grid land before you talk over it.

- **Beat 1:** a handful of numbers. "So far, so boring."
- **Beat 2:** the full grid. **"Every square is one number. That's four thousand
  and ninety-six numbers, for one word."** Pause. This is where the scale of the
  thing stops being abstract.
- **Beat 3:** the read-later block. Don't read it. If you want one line, use
  **2.7 million numbers just to hold a 500-word prompt.**

If asked why 4,096: it's a per-model design choice. Bigger means more capacity
and more compute. GPT-3 used 12,288.

### 8. What the numbers mean ★ *drive this one*
**Correcting the obvious guess is the whole slide.** Almost everyone assumes
dimension 400 is "redness". It isn't, and the truth is more interesting.

- **Beat 1:** the reframe. Stop asking what one number means; start asking which
  *directions* mean something.
- **Beat 2:** the meters. **Click "food, eating" and point at the grid** — the
  contributing squares are scattered everywhere. Then click "companies,
  business": a completely different scattering of the *same* squares.
- **Click "law, courts" too.** It reads flat. That's your control — these meters
  are measuring something, not just drawing bars. Worth doing; it's what makes
  the rest of the slide credible.
- **Beat 3:** the read-later block. One sentence out loud: *"a concept isn't a
  slot, it's a direction — and that's why you can't open a model up and read
  what it knows."*

**Then land the punchline out loud:** food and companies come back almost
exactly tied. **"That's the question I asked you on slide three, in numbers.
The word arrives carrying both and nothing in it picks a side."** That sets up
the map.

Honesty if asked: these directions were constructed so the demo is deterministic
and the same every time. The projection maths recovering them is real, and the
structure — concepts as directions spread across dimensions, packed so they
barely overlap — is what interpretability research actually finds in real models.
The word for it is superposition.

### 9. The map ★
Three beats, three presses.

- **Beat 1:** nothing sorted these. Words used in similar company drifted together.
- **Beat 2 (arrows):** man→king and woman→queen are the same move. *"Nobody
  programmed that. It's a side effect of how the words were used."*
- **Beat 3:** point at the dot in the middle. **"Same thing you just saw in the
  meters, drawn as a picture. It belongs to both neighbourhoods, so it sits in
  neither."**

If asked: positions are hand-placed so it's readable. A real projection of 4,096
dimensions to two is an unreadable smear. The *structure* — clusters, and that
parallelogram — is real.

### 10. SO WHAT #1 — words are coordinates
**Teach the room the pattern:** *"every so often I'm going to stop and tell you
what this actually buys you. This is the first one."*

The two-column comparison is the takeaway. Encourage a photo.

The strawberry callback usually gets a reaction — people have seen this fail and
assumed the thing was stupid. Reframe: **"it's not stupid, it's blind to
letters. You'd be bad at counting letters too if you only ever saw syllables."**

---

## Act 2 — Context (slides 11–18) · *the core*

### 11. Order matters
Thirty seconds. Exists so nobody derails Q&A asking how it knows word order.
Don't say "positional encoding" unless asked.

### 12. The idea of attention
Query / key / value without the vocabulary. Only name them if an engineer asks.

**"Simultaneously" is the load-bearing word** — it's why this architecture won.
Older models had to walk the sentence one word at a time.

### 13. The formula, once
Say out loud that this is the only formula in the talk — the non-technical half
of the room visibly relaxes. Then: **"and you already understand every piece of
it. I just showed you all three."**

**The idea to land is "fixed budget."** Softmax forces the weights to sum to
one, so attention paid to one token is attention taken from another. That single
fact is the entire basis of slide 18 — plant it firmly here.

**On √d, say the short version and leave the rest on screen:** *"that's a unit
conversion. Those match scores get bigger just because the vectors are long, and
if you let them get too big, softmax hands everything to one token and ignores
the rest."* That's enough. The read-later block has the trainability detail for
anyone who wants it.

If the room isn't technical you can move through this in twenty seconds. Don't
cut it: seeing the real formula and being told they already understand it is
worth the time.

### 14. Attention (live) ★ *drive this one*
Start on **orchard**. `apple` is already selected — arcs go to `orchard`,
`ripe`, `picked`.

Hit **market**. **"Same word, same position, same everything. Only the context
changed."**

**Point out the greyed tokens.** A token can only look *backwards*. Not a
simplification — that's how these models work, and it's why they generate one
word at a time. You'll cash that in on slide 20.

The grey self-loop is the token attending to itself: real, usually the largest
single weight, not the interesting part. Say so before someone asks.

Click other tokens if the room is engaged. `bought` → `I` is a nice one.

### 15. The vector moves ★★ *the slide the whole talk exists for*
**Do not rush this.**

Set it up: *"Remember the dot stuck in the middle? Watch what context does to it."*

One press per layer. Six presses. Narrate: *"one layer, it leans. Two, further."*
The dot walks into the fruit cluster and stops among `orchard` and `ripe`.

Switch to **market**, run it again. Same starting dot. Opposite corner.

**The line:** *"The word apple didn't change. Its meaning did — and the meaning
literally lives somewhere different now. That's what this thing does. That's all
it does."*

**Second lesson:** it took six layers, not one. One layer only nudges. This is
the honest answer to "why are these models so deep" — depth is how a nudge
becomes a decision. It also sets up slide 17, so don't skip it.

Honesty if asked: map positions are hand-placed, but the *path* is computed —
real attention arithmetic, and the dot goes where it says.

### 16. Multi-head
One minute. Takeaway: **parallel specialists, not one mechanism.**

"Nobody assigned them those jobs" is the first hint of the training slide's
bigger point: this structure is *discovered*, not designed.

### 17. Stack it — the running notes
**This is the slide people used to get lost on, so lead with the notes and treat
the diagram as wallpaper. Don't say "residual stream" out loud. Say "notes".**

Set it up from the last slide: *"one layer only nudged the meaning. So what's
happening in the other seventy-nine?"*

Then step through the notes one press at a time and just read them. **The list
is the explanation:**

- it starts knowing nothing
- attention finds that it got picked
- the feed-forward works out what that implies
- a later block notices the orchard
- and by the end the meaning is completely specific

Point at the diagram **once**, at the arrow: *"and the notes only ever go up.
Nothing gets thrown away — each block adds to what's already written."* That's
all the diagram needs to do.

Last beat brings up the read-later block. The one line worth saying: **attention
gathers, the feed-forward thinks, and the feed-forward is where most of the
parameters actually are.** People assume the knowledge is in attention. It isn't.

### 18. SO WHAT #2 — the context window ★★ *the most useful slide*
**Say it: "if you take one slide away, make it this one."** Then pause for photos.

Tie every bullet back to the fixed budget — that's what makes this different
from the listicles they've all skimmed. They now know *why*.

"Start a fresh chat" usually gets an audible reaction. A lot of people do it and
feel vaguely superstitious about it. **Tell them they were right.**

---

## Act 3 — Prediction, learning, limits (slides 19–22)

### 19. Next token (live)
Frame it: *"a hundred billion parameters, eighty layers, and the output is a
ranked list of a hundred thousand guesses at the next word."*

Flip orchard ↔ market. Same machinery, different context, completely different
top answer — `bite` vs `position`. That's Act 2 cashing out.

**Then the temperature slider.** Down to 0.05: always the same thing. Up to 2.0:
the nonsense at the bottom starts getting real probability.

> "This is the creativity dial, and it's just how flat you make this graph
> before rolling the dice."

Low for anything factual or code. Higher when you want options and you'll pick.

### 20. The loop
Let it play — the rhythm does the work.

> "There is no plan. There is no outline it's working from. Every word you have
> ever seen it produce was chosen with no knowledge of the word that came after."

Callback: the backwards-only mask from slide 14 is what makes this loop possible.

**The practical hook:** if it can only think by producing tokens, then giving it
room to produce tokens before answering — *"think it through step by step"* — is
literally giving it more computation. Not a trick. The architecture.

### 21. How it learns
Let the grid run while you talk. Noise → an apple, and **nothing in the code
knows what an apple is.** It only ever knew "you were wrong by this much."

That's real gradient descent, and the loss curve is measured from the run.

Scale it up: *"the real version plays guess-the-next-token across a large
fraction of the public internet, adjusting billions of numbers a fraction at a
time, for months."*

**Land this:** grammar, facts, tone, some reasoning — none of it was programmed.
All of it is a side effect of getting better at guessing the next word. That's
why it's uneven: good where the data was thick, shaky where it wasn't. And it's
why there's a cutoff date, and why it has never seen anything internal to your
company.

### 22. Then it's taught to be useful
Ninety seconds. One thing to leave with: **the confident, agreeable,
well-organised voice is a trained style, and it is uncorrelated with accuracy.**

> "It was rewarded for producing answers people liked. Nobody was checking, at
> that stage, whether the answers were true."

This is the setup for the next two slides. Don't over-explain here.

---

## The failure modes (slides 23–24)

### 23. You've seen this happen — *diagnosis only*
**Give no fixes on this slide.** The pause between diagnosis and prescription is
what makes the fixes land.

Read the three quotes out loud and **ask for a show of hands** on each:

- *"It made that up."*
- *"It just agreed with me."*
- *"It ignored what I told it."*

You'll get hands on all three. That's the point — this is a shared experience in
the room, not anyone's personal failing.

Then the last line — *none of these are bugs somebody forgot to fix* — and
advance. **Do not start explaining here.**

If someone volunteers a fourth ("it didn't know about our internal docs"), take
it, and note it falls straight out of slide 21: hard cutoff, no memory between
chats, never saw your company's files.

### 24. Same machine, and the fix
Now you pay off the pause. **One row per press**, read across: symptom, cause, fix.

**Every cause is a callback — say which slide it came from.** Row 1 is the
prediction slide. Row 2 is the training-stages slide. Row 3 is the fixed-budget
slide. This is the moment the whole talk clicks into place as one thing rather
than a tour, so name the slides out loud.

**Row 2 is the one people act on.** Give them the exact phrasing and tell them to
steal it: *"what's the strongest argument this is wrong?"* Anyone using this for
review or feedback should write it down.

Last press brings up the read-later block. Say only the first sentence:
**"fluency carries no information about accuracy."** Leave the rest for them.

**Tone check:** the framing is "knowing the failure mode is what lets you use it
hard", not "be careful, it's unreliable." Don't end sounding cynical — the
playbook is next and it's constructive.

---

## Close (slides 25–26)

### 25. The playbook
**"This is the one to take a picture of."** Then genuinely stop talking for five
seconds. Let them.

Don't read all seven — you've earned every one already. Pick the two that fit
your team and say those. Offer to send the deck round; everything is clickable,
and the read-later blocks are there for anyone who wants to go deeper.

### 26. Back to apple
Same word, same black, where you started.

Land the two lines and stop. **Don't add a summary** — slide 25 was the summary.

Then: *"Questions."* Press **Esc** for the grid to jump back to anything they
ask about. Slides 14 and 15 are the two people want to see again.

---

## Questions you should expect

**"Is this how ChatGPT/Claude works, or just GPT-2?"**
Same architecture. The tokenizer in the deck is literally GPT-2's because it's
public and small enough to ship. Current models are bigger — more layers, more
dimensions, bigger vocabularies — plus extra training stages. The mechanism on
these slides is the mechanism.

**"So is dimension 400 'redness' or not?"**
No. Concepts are directions, not slots — that's slide 8. And because a
4,096-dimensional space can hold far more nearly-perpendicular directions than
it has dimensions, models pack many more concepts in than you'd expect. If
someone wants the term: superposition. If they want to go further, the search
term is "sparse autoencoders" — that's the tooling researchers use to pull these
directions out of real models.

**"Does it understand, or is it just statistics?"**
Don't take a side — it's a genuinely open argument and taking a side costs you
the room. Say what you showed: it moves meanings around in a space based on
context, and that produces behaviour we'd call understanding in a person.
Whether that *is* understanding is a question this talk can't settle.

**"Will it replace my job?"**
Not the talk's question, and don't wing it. Redirect: *"What I can tell you is
what it's structurally good and bad at"* — meaning vs. characters, plausible vs.
verified — *"and that's the shape of what to hand it."*

**"How do I stop it making things up?"**
You can't, structurally — slide 24, row 1. You can reduce it: give it the source
material rather than relying on training data, ask for citations you can check,
lower the temperature, and ask it to flag what it isn't sure about.

**"Why is it bad at maths?"**
Same root as strawberry. Numbers get tokenized into fragments and it's
pattern-matching over those fragments, not calculating. Which is why the good
tools now hand arithmetic to an actual calculator.

**"What's a context window, exactly?"**
How many tokens it can look at in one go, question and answer together. Slide 18
is the practical consequence. Numbers change constantly — don't quote one.
