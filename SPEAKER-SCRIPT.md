# Speaker script — The Apple Problem

~30 minutes plus Q&A. The same notes are in the deck itself: press **S** during
the talk to toggle the presenter overlay.

## Before you walk in

- Open `index.html` (double-click it — no server, no wifi needed).
- Press **F** for fullscreen.
- Press **Esc** once to check the slide grid loads, then **Esc** again.
- Rehearse slides 15, 16 and 20 at least once. They're the three you *drive*,
  and they're the three people will ask you to go back to.
- Have a browser tab with your team's actual AI tool open, in case Q&A goes
  practical.

**Keys:** `→` / space next build · `←` back · `↑` `↓` whole slide ·
`S` notes · `F` fullscreen · `Esc` slide grid · `?` help

A clicker works — it sends arrow keys. Clicking anywhere on the slide also
advances, except on the widget controls.

---

## Timing budget

| Section | Slides | Target | Running |
|---|---|---|---|
| Open + the hook | 1–6 | 5 min | 5 |
| Act 1 · words become numbers | 7–11 | 6 min | 11 |
| Act 2 · context | 12–19 | 10 min | 21 |
| Act 3 · prediction, learning, limits | 20–24 | 7 min | 28 |
| Close | 25–26 | 2 min | 30 |

**If you're running long**, cut slide 12 (order matters) and slide 17
(multi-head) — both are one-minute asides. Never cut 16 or 19.

**If you're running short**, slow down on 15 and click more tokens.

---

## Act 0 — The hook (slides 1–6)

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

Nothing else. Resist adding anything.

### 6. Thesis
The hinge. The promise: **the thing you just did instinctively is literally
what the machine does.**

The last line sets up the payoff slides — from here on, every amber-barred
slide means *this is the part I use tomorrow.*

---

## Act 1 — Words become numbers (slides 7–11)

### 7. Tokenization (live)
Real GPT-2 tokenizer. Real IDs. Type whatever the room shouts.

Three things, in order:

1. **Common words survive whole, rare ones shatter.** Hit `rare words` —
   `unbelievable` → four pieces. The vocabulary was *learned* from frequency.
2. **Hit `apple ×3`.** `apple`, `Apple` and `·apple` (leading space) are three
   different tokens with three different IDs. The middot is the space. This
   surprises people.
3. **Hit `strawberry`.** It comes apart as `st / raw / berry`. **Park it** —
   you're coming back in two slides.

If asked: modern models have bigger vocabularies, same mechanism.

### 8. A token is a row number
Short. Kill the intuition that there's a dictionary inside.

> "If you went looking for the part of the model that knows what an apple is,
> there isn't one. There's a row number."

### 9. Embeddings
Don't linger on the digits. The point is the shift from **symbol** to **position**.

> "The model doesn't have words. It has coordinates. Everything it appears to
> know about language is a fact about distance and direction in this space."

### 10. The map ★
Three beats, three presses.

- **Beat 1:** nothing sorted these. Words used in similar company drifted together.
- **Beat 2 (arrows):** man→king and woman→queen are the same move. *"Nobody
  programmed that. It's a side effect of how the words were used."*
- **Beat 3 — the money beat of Act 1.** Point at the dot in the middle.
  **"This is the slide-three problem, drawn. Half of you said fruit, half said
  the company — and the model has exactly the same problem, for exactly the same
  reason. The word alone isn't enough."**

If asked about honesty: the positions are hand-placed so it's readable. A real
projection of 4096 dimensions to two is an unreadable smear. The *structure* —
clusters, and that parallelogram — is real.

### 11. SO WHAT #1 — words are coordinates
**Teach the room the pattern:** *"every so often I'm going to stop and tell you
what this actually buys you. This is the first one."*

The two-column comparison is the takeaway. Encourage a photo.

The strawberry callback usually gets a reaction — people have seen this fail and
assumed the thing was stupid. Reframe: **"it's not stupid, it's blind to
letters. You'd be bad at counting letters too if you only ever saw syllables."**

---

## Act 2 — Context (slides 12–19) · *the core*

### 12. Order matters
Thirty seconds. Exists so nobody derails Q&A asking how it knows word order.
Don't say "positional encoding" unless asked.

### 13. The idea of attention
Query / key / value without the vocabulary. Only name them if an engineer asks.

**"Simultaneously" is the load-bearing word** — it's why this architecture won.
Older models had to walk the sentence one word at a time.

### 14. The formula, once
Say out loud that this is the only formula in the talk. The non-technical half
of the room visibly relaxes.

**The idea to land is "fixed budget."** Softmax forces the weights to sum to
one, so attention paid to one token is attention taken from another. That single
fact is the entire basis of slide 19 — plant it firmly here.

If the room isn't technical you can move through this in fifteen seconds. Don't
cut it: seeing the real formula and being told they already understand it is
worth the time.

### 15. Attention (live) ★ *drive this one*
Start on **orchard**. `apple` is already selected — arcs go to `orchard`,
`ripe`, `picked`.

Hit **market**. **"Same word, same position, same everything. Only the context
changed."**

**Point out the greyed tokens.** A token can only look *backwards*. Not a
simplification — that's how these models work, and it's why they generate one
word at a time. You'll cash that in on slide 21.

The grey self-loop is the token attending to itself: real, usually the largest
single weight, not the interesting part. Say so before someone asks.

Click other tokens if the room is engaged. `bought` → `I` is a nice one.

### 16. The vector moves ★★ *the slide the whole talk exists for*
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
becomes a decision.

Honesty note if asked: map positions are hand-placed, but the *path* is
computed — real attention arithmetic, and the dot goes where it says.

### 17. Multi-head
One minute. Takeaway: **parallel specialists, not one mechanism.**

"Nobody assigned them those jobs" is the first hint of the training slide's
bigger point: this structure is *discovered*, not designed.

### 18. Stack it
The residual stream as a **running notebook** — each layer annotates rather than
replaces.

Worth saying: people assume attention holds the knowledge. It doesn't —
attention is the *routing*. The feed-forward layers hold most of the parameters
and most of what the model knows.

### 19. SO WHAT #2 — the context window ★★ *the most useful slide*
**Say it: "if you take one slide away, make it this one."** Then pause for photos.

Tie every bullet back to the fixed budget — that's what makes this different
from the listicles they've all skimmed. They now know *why*.

"Start a fresh chat" usually gets an audible reaction. A lot of people do it and
feel vaguely superstitious about it. **Tell them they were right.**

---

## Act 3 — Prediction, learning, limits (slides 20–24)

### 20. Next token (live)
Frame it: *"a hundred billion parameters, eighty layers, and the output is a
ranked list of a hundred thousand guesses at the next word."*

Flip orchard ↔ market. Same machinery, different context, completely different
top answer — `bite` vs `position`. That's Act 2 cashing out.

**Then the temperature slider.** Down to 0.05: always the same thing. Up to 2.0:
the nonsense at the bottom starts getting real probability.

> "This is the creativity dial, and it's just how flat you make this graph
> before rolling the dice."

Low for anything factual or code. Higher when you want options and you'll pick.

### 21. The loop
Let it play — the rhythm does the work.

> "There is no plan. There is no outline it's working from. Every word you have
> ever seen it produce was chosen with no knowledge of the word that came after."

Callback: the backwards-only mask from slide 15 is what makes this loop possible.

**The practical hook:** if it can only think by producing tokens, then giving it
room to produce tokens before answering — *"think it through step by step"* — is
literally giving it more computation. Not a trick. The architecture.

### 22. How it learns
Let the grid run while you talk. Noise → an apple, and **nothing in the code
knows what an apple is.** It only ever knew "you were wrong by this much."

That's real gradient descent, and the loss curve is measured from the run.

Scale it up: *"the real version plays guess-the-next-token across a large
fraction of the public internet, adjusting billions of numbers a fraction at a
time, for months."*

**Land this:** grammar, facts, tone, some reasoning — none of it was programmed.
All of it is a side effect of getting better at guessing the next word. That's
why it's uneven: good where the data was thick, shaky where it wasn't. And it's
why there's a cutoff date.

### 23. Then it's taught to be useful
Ninety seconds. One thing to leave with: **the confident, agreeable,
well-organised voice is a trained style, and it is uncorrelated with accuracy.**

> "It was rewarded for producing answers people liked. Nobody was checking, at
> that stage, whether the answers were true."

### 24. SO WHAT #3 — the failure modes
Frame up front: *"none of these are bugs somebody forgot to fix. Every one falls
out of a design decision I've already shown you."*

The sycophancy point lands hardest with anyone using it for review or feedback.
Give them the exact replacement phrasing — **"what's the strongest argument this
is wrong?"** — and tell them to steal it.

Don't be cynical. The framing is **"knowing the failure mode is what lets you use
it hard"**, not "it's unreliable, be careful."

---

## Close (slides 25–26)

### 25. The playbook
**"This is the one to take a picture of."** Then genuinely stop talking for five
seconds. Let them.

Don't read all seven — you've earned every one already. Pick the two that fit
your team and say those. Offer to send the deck round; everything is clickable.

### 26. Back to apple
Same word, same black, where you started.

Land the two lines and stop. **Don't add a summary** — slide 25 was the summary.

Then: *"Questions."* Press **Esc** for the grid to jump back to anything they
ask about. Slides 15 and 16 are the two people want to see again.

---

## Questions you should expect

**"Is this how ChatGPT/Claude works, or just GPT-2?"**
Same architecture. The tokenizer in the deck is literally GPT-2's because it's
public and small enough to ship. Current models are bigger — more layers, more
dimensions, bigger vocabularies — plus extra training stages. The mechanism on
these slides is the mechanism.

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
You can't, structurally — slide 24. You can reduce it: give it the source
material rather than relying on training data, ask for citations you can check,
lower the temperature, and ask it to flag what it isn't sure about.

**"Why is it bad at maths?"**
Same root as strawberry. Numbers get tokenized into fragments and it's
pattern-matching over those fragments, not calculating. Which is why the good
tools now hand arithmetic to an actual calculator.

**"What's a context window, exactly?"**
How many tokens it can look at in one go, question and answer together. Slide 19
is the practical consequence. Numbers change constantly — don't quote one.
