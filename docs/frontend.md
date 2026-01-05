# Once Frontend Design System

> The definitive design vision for an immersive storytelling experience.

---

## Design North Star

**One sentence**: Once should feel like opening a door to another world — not visiting a website.

**The feeling we're creating**:
- The weight of a leather-bound book in your hands
- The anticipation before a story begins
- The moment when you forget you're reading and start *living* the story
- The bittersweet feeling when a great story ends

---

## Design Principles

### 1. Invisible Interface
The best UI is no UI. When users are in a story, they should forget they're using an app. Controls fade away. The story breathes. Only when they need something does the interface whisper back into existence.

### 2. Earned Complexity
Show less, reveal more. Don't overwhelm on first visit. Let curiosity drive discovery. Every scroll, every hover, every click reveals something new — a delightful surprise, not a burden.

### 3. Living, Not Static
The page should never feel frozen. Subtle motion everywhere — a gentle pulse, a slow drift, particles of light. The world is alive, waiting for you to step in.

### 4. True to the Story
Every design choice must serve the narrative. We're not selling a product. We're inviting someone into an adventure. The aesthetic should whisper "once upon a time" not "click here to sign up."

---

## Anti-AI Aesthetic

> **Critical**: This site is about human imagination. It cannot look like AI made it.

### What Makes Sites Look "AI-Generated"

These are the red flags. Avoid them.

| AI Tell                                      | Why It Feels Fake                                    | Our Alternative                                |
| -------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------- |
| **Gradient overload**                        | Every AI tool defaults to purple-pink-blue gradients | Solid colors with subtle texture               |
| **Perfect symmetry**                         | Too clean = no soul                                  | Intentional irregularity, hand-drawn feel      |
| **Generic blob shapes**                      | The "abstract" fallback when there's no real idea    | Specific, meaningful imagery                   |
| **Glassmorphism everywhere**                 | Trendy ≠ timeless                                    | Opaque surfaces, paper textures                |
| **Floating 3D objects**                      | Looks like every AI landing page from 2023           | Illustrated, 2D, crafted elements              |
| **"Hero illustration" with faceless people** | Stock-art energy                                     | No generic illustrations — only story-relevant |
| **Neon accents on dark backgrounds**         | Cyberpunk cliché                                     | Warm amber, candlelight glow                   |
| **"Powered by AI" badge energy**             | Bragging about the tool, not the experience          | Never mention AI on the frontend               |
| **Overly smooth animations**                 | Feels robotic                                        | Frame-by-frame, hand-crafted motion            |
| **Feature grids with icons**                 | SaaS template #4729                                  | Features revealed through story, not lists     |

### How to Keep It Human

1. **Imperfection is intentional** — Lines that don't quite meet. Colors slightly outside the edges. Real paper textures.

2. **Specificity over abstraction** — Don't show "a mountain." Show those three triangular mountains every kid draws with the sun between them.

3. **Texture, not glass** — Paper grain, crayon streaks, ink bleed. Never frosted glass cards.

4. **Warm, not cool** — No neon blues and purples. Amber, gold, cream, charcoal. Candlelight, not LED.

5. **Motion with character** — Choppy flipbook animation for childhood. Lines drawing themselves for teen. Not smooth tweens everywhere.

6. **Words matter more than visuals** — This is a storytelling app. Let the copy carry emotional weight. Don't hide behind fancy graphics.

7. **No stock anything** — No generic "happy diverse team" photos. No abstract illustrations of "productivity." If we need assets, they're hand-drawn or custom.

### The Test

Before shipping any design, ask:
- "Would this look at home on a generic AI startup landing page?"
- If yes → **cut it**.

---

## Discussion Log

> Key decisions and context from our design conversations. This persists across sessions.

### 2024-12-22: Initial Vision
- User wants a **full immersive experience**, not just polish
- GSAP, Lenis, Motion are for meaningful immersion, not decoration
- Site should feel like "being taken to another planet"
- Modern yet minimal — never stale, never overwhelming

### 2024-12-22: Landing Page Concept
- **User's idea**: Childhood → Teenage → Adult scroll journey
- Childhood = crayon drawings (mountains, sun, river, house, birds)
- Animation = frame-by-frame like a flipbook, NOT smooth tweens
- Teenage = notebook doodles (better lines, controlled chaos)
- Adult = blank page (the gut punch — "you stopped")
- Door opens → invitation to step back in

### 2024-12-22: Key Principles Established
- Every element must make user think "this is MY story"
- Art evolves: irregular → sketchy → clean → elegant
- No AI-generated assets, no generic gradients
- Portraits must show line quality evolution (child = wobbly, teen = better)
- The site tells a story, not sells a product

## The Experience Map

### Landing Page: The Invitation

**Goal**: Make someone stop scrolling, lean forward, and whisper "what is this?"

**Not**: A SaaS landing page with features and pricing
**Yes**: A mysterious door appearing in an ordinary wall

#### Landing Page Structure (MVP)

> Start simple. Add the hand-drawn assets later.

**SECTION 1: Hero (100vh)**
- Dark background (`--bg`) with subtle warm radial glow in center
- Text fades in word-by-word: "Everyone has a story they never got to finish."
- Subtle scroll indicator at bottom (animated down arrow)

**SECTION 2: The Promise (scroll reveal)**
- Three cards emerge with stagger animation:
  - "Your choices shape the story"
  - "The world remembers"  
  - "Every ending is earned"
- Cards have 3D tilt on hover

**SECTION 3: CTA (final section)**
- Text: "What if you could step back in?"
- Button: `[ Begin Your Story ]` — warm gold, subtle glow
- No pricing, no feature dumps

---

### Alternative Concept: "Your Story, Retold" (Future — Requires Hand-Drawn Assets)

> This is the full vision. Requires custom artwork. Saved for later implementation.

<details>
<summary>Click to expand the childhood → teenage → adult journey concept</summary>

**PROLOGUE: THE OPENING**

*100vh — Dark. Quiet. A single sentence fades in.*

> "Everyone has a story they never got to finish."

---

**CHAPTER 1: CHILDHOOD — "The First Drawings"**

*As user scrolls, the darkness lifts. Color bleeds in — bright, crayon-like.*

**Background**: The universal childhood drawing:
- Three triangular mountains (wobbly, uneven)
- Rising sun peeking between them (half circle, rays like sticks)
- A winding river (the classic S-shape)
- A small house (square + triangle roof, single window)
- V-shaped birds scattered across the sky

**Art style**: Crayon texture. Irregular. Lines don't meet perfectly. Colors go outside the lines.

**Animation style**: Frame-by-frame, 4-6 fps. Like a flipbook.

**Text**:
> "You drew mountains before you saw them."
> "Dragons lived in those clouds."
> "The hero always looked like you."

---

**CHAPTER 2: ADOLESCENCE — "The Notebook Margins"**

*The crayon fades. The paper ages. New drawings appear — pen and pencil.*

**Visual shift**: Notebook doodles. More controlled lines but still imperfect.
- A spaceship (half-finished)
- A sword with ornate handle
- A shadowy figure in a cloak
- A heart with initials (scratched out)

**Animation style**: Lines draw themselves via SVG stroke-dashoffset.

**Text**:
> "You filled notebooks with worlds you wanted to escape to."
> "Heroes you wished you could be."

---

**CHAPTER 3: ADULTHOOD — "The Blank Page"**

*The doodles fade. Colors drain. Nearly empty. A cursor blinks.*

**Text**:
> "And then... you stopped."
> "But somewhere, that kid is still there. Waiting."

---

**CHAPTER 4: THE INVITATION — "The Door"**

*A doorway draws itself. The door opens. Warm amber light spills out.*

**Text**:
> "What if you could step back in?"
> "This time, you write the story."

**CTA**: `[ Begin Your Story ]`

---

#### Art Direction (for future assets)

| Stage      | Line Quality   | Color Palette         |
| ---------- | -------------- | --------------------- |
| Childhood  | Wobbly, crayon | Bright primaries      |
| Teenage    | Sketchy, ink   | Blue ink, pencil gray |
| Adulthood  | Minimal        | Desaturated           |
| Invitation | Elegant, warm  | Amber, gold           |

#### Assets Needed

| Section   | What to Create                                  |
| --------- | ----------------------------------------------- |
| Childhood | 6-8 PNGs per animation loop (sun, birds, smoke) |
| Teenage   | Single SVG with separated strokes               |
| Door      | SVG archway with light rays                     |

</details>

### Story Interface: The Immersion

**Goal**: Make users lose track of time.

#### View Modes

| Mode             | What's Visible            | When                  |
| ---------------- | ------------------------- | --------------------- |
| **Story Mode**   | Only narration + ESC hint | During active reading |
| **View Mode**    | + Protagonist sidebar     | When checking stats   |
| **Command Mode** | + Action input            | When making choices   |

#### Transitions Between Modes

- Story Mode → View Mode: Sidebar slides in like a book's margin notes
- View Mode → Story Mode: Interface dissolves like morning mist
- All transitions: 400-600ms, ease-out, never jarring

#### Dynamic Ambient System

The background is never static. It breathes with the story.

**Implementation**:
```
LLM Response → includes "mood" field → CSS custom property updates → smooth transition
```

**Mood Palette**:
| Mood       | Background                 | Ambient Glow        | Text Shadow |
| ---------- | -------------------------- | ------------------- | ----------- |
| `peaceful` | Deep warm brown            | Golden edge light   | None        |
| `danger`   | Charcoal with crimson tint | Red pulse at edges  | Subtle red  |
| `mystery`  | Cool slate                 | Purple fog          | Blue-ish    |
| `triumph`  | Rich amber                 | Bright gold bloom   | Golden      |
| `tension`  | Compressed dark            | Flickering warmth   | None        |
| `sadness`  | Desaturated blue-gray      | Faded, distant      | Cold        |
| `wonder`   | Deep teal                  | Sparkling particles | Cyan tint   |

**Transition**: 2-3 seconds, smooth. Never abrupt.

---

## Tech Stack (Full Immersion)

| Layer                  | Tool               | Purpose                                  |
| ---------------------- | ------------------ | ---------------------------------------- |
| **Scroll**             | Lenis              | Buttery smooth, dreamlike momentum       |
| **Scroll Animations**  | GSAP ScrollTrigger | Pinned sections, parallax, timeline sync |
| **Micro-interactions** | Motion (Framer)    | Hovers, entry/exit, gestures             |
| **Advanced Effects**   | Aceternity UI      | Hero background, text reveals            |
| **Base Components**    | shadcn/ui          | Accessible, customizable foundation      |
| **Styling**            | Tailwind CSS       | Design tokens, utility classes           |
| **Markdown**           | Streamdown         | AI-optimized streaming text              |

---

## Color System

### Philosophy
Not a color palette. A mood.
The app should feel like candlelight — warm, intimate, alive.

### Primary Palette

| Token             | Light Mode | Dark Mode | Purpose              |
| ----------------- | ---------- | --------- | -------------------- |
| `--bg`            | `#F8F4ED`  | `#12110E` | Canvas               |
| `--surface`       | `#FFFFFF`  | `#1A1815` | Cards, modals        |
| `--surface-hover` | `#F5F0E8`  | `#242018` | Interactive surfaces |
| `--text`          | `#1A1815`  | `#F5EDE0` | Primary text         |
| `--text-muted`    | `#6B5D4D`  | `#8B7D6B` | Secondary text       |
| `--primary`       | `#C4973C`  | `#D4A853` | Actions, links       |
| `--accent`        | `#4A7C6F`  | `#5A9988` | Success, magic       |
| `--danger`        | `#A34A4A`  | `#C45C5C` | Danger, errors       |
| `--border`        | `#E8E0D4`  | `#2A2520` | Subtle dividers      |

### Ambient Colors (Story Mode)

Applied as gradient overlays and edge glows, never replacing the base.

---

## Typography

### Hierarchy

| Role    | Font             | Weight | Size    | Use             |
| ------- | ---------------- | ------ | ------- | --------------- |
| Display | Playfair Display | 700    | 48-72px | Hero headlines  |
| Heading | DM Serif Display | 400    | 24-36px | Section titles  |
| Body    | Source Sans 3    | 400    | 16-18px | Story text, UI  |
| UI      | Source Sans 3    | 600    | 14-16px | Buttons, labels |
| Mono    | JetBrains Mono   | 400    | 14px    | Code, data      |

### Story Typography

For the reading experience itself:
- Line height: 1.8 (generous breathing room)
- Max width: 650px (optimal reading line length)
- Letter spacing: Slightly increased (+0.01em)
- Paragraph spacing: 1.5em between paragraphs

---

## Animation Principles

### Speed Guide

| Type             | Duration    | Easing        |
| ---------------- | ----------- | ------------- |
| Micro (hovers)   | 150ms       | ease-out      |
| State changes    | 250ms       | ease-in-out   |
| Entry/exit       | 400ms       | ease-out      |
| Page transitions | 600ms       | custom bezier |
| Ambient shifts   | 2000-3000ms | ease-in-out   |

### Motion Rules

1. **Never animate without purpose** — if it doesn't guide, delight, or inform, cut it
2. **Respect reduced motion** — all animations must have fallbacks
3. **Stagger reveals** — elements appearing together should cascade (50-80ms delays)
4. **Exit before enter** — old content leaves before new arrives

---

## Spacing Philosophy

Everything aligned to an 8px grid. But more importantly:

### Breathing Room

- Hero sections: Generous. Let them be 80-100vh. Silence is powerful.
- Between sections: 96-128px. Stories need pauses.
- Inside cards: 24-32px padding. Content shouldn't feel cramped.
- Text blocks: 48-64px between major paragraphs on landing.

### Density Modes

| Context      | Density     | Example                |
| ------------ | ----------- | ---------------------- |
| Landing page | Sparse      | A few words per screen |
| Story mode   | Focused     | Just the narrative     |
| Dashboard    | Comfortable | Stats and controls     |
| Settings     | Compact     | Forms and options      |

---

## Component Style Guide

### Buttons

**Primary**: Warm gold with subtle inner glow, no harsh borders
- Hover: Lift 2px, glow intensifies
- Active: Sink 1px, glow spreads

**Secondary**: Outlined, muted
- Hover: Fill with surface color

**Ghost**: Text only, underline on hover

### Cards

- Always have depth (subtle shadow, gets stronger on hover)
- Slight border radius (8-12px)
- Optional: 3D tilt on hover (perspective, rotateY)
- Content padded 24px minimum

### Inputs

- Large touch targets (min 48px height)
- Subtle inner shadow, not harsh borders
- Focus: Golden glow ring
- Labels: Float above on focus (animation)

---

## Scroll Behavior

### Lenis Configuration

```javascript
{
  duration: 1.2,          // Slow, dreamy
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  smoothTouch: false,     // Native on mobile
  touchMultiplier: 2,
}
```

### ScrollTrigger Patterns

| Pattern         | Use Case                              |
| --------------- | ------------------------------------- |
| Pin + Scrub     | Text reveals alongside fixed imagery  |
| Batch reveals   | Stagger in cards/features             |
| Parallax        | Depth layers on hero                  |
| Progress-linked | Ambient color tied to scroll position |

---

## Accessibility

### Non-Negotiables

- [ ] 4.5:1 contrast ratio minimum
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible and styled
- [ ] `prefers-reduced-motion` respected
- [ ] Screen reader tested
- [ ] Semantic HTML throughout

### Motion Fallbacks

When reduced motion is preferred:
- Instant state changes (no transitions)
- Static backgrounds
- Content visible by default (no scroll reveals)

---

## Performance Targets

| Metric | Target  |
| ------ | ------- |
| LCP    | < 2.5s  |
| FID    | < 100ms |
| CLS    | < 0.1   |
| TTI    | < 3.5s  |

### Strategies

- [ ] Lazy load below-fold content
- [ ] Code-split GSAP and Aceternity
- [ ] Use CSS animations where possible
- [ ] Preload fonts
- [ ] Optimize images with next/image

---

## Next Steps

1. [ ] Create prototype of landing page scroll journey
2. [ ] Test Lenis + GSAP integration
3. [ ] Build ambient color system proof of concept
4. [ ] Design Story Mode interface
5. [ ] Iterate based on feeling, not checklist

---

*The goal is not a beautiful website. The goal is a doorway to infinite adventures.*
