# Once — The Complete Vision

This document captures the soul of Once. Not as a technical specification, but as the story of what we are building and why it matters.

---

## What Once Is

Once is not an AI chat dressed in fantasy clothes. It is a living world that remembers, reacts, and evolves based on every word you speak into it.

The fundamental promise: You will never read the same story twice. Not because the AI is random, but because every choice you make plants seeds that grow into consequences you could never predict. The world is listening. The world is watching. And the world will respond.

---

## The Problem With AI Storytelling Today

Every AI story tool asks you the same question: "What do you want to do next?"

And then it generates text. You respond. It generates more text. This is not storytelling. This is a conversation with a text generator that has been given a fantasy persona.

True storytelling has weight. True storytelling has memory. True storytelling has stakes. When you make a choice in a real story, that choice follows you. The character you saved becomes an ally. The village you burned becomes a scar on the land. The lie you told in chapter one unravels in chapter twenty.

Once is built on this principle: The story must have consequences that compound.

---

## The Modes of Creation

Not every storyteller comes to the table with the same preparation. Some have a world fully formed in their minds. Some have a single character they have loved for years. Some have nothing but a feeling, a mood, a what-if.

Once must welcome all of them.

### The Blank Canvas

The user arrives with nothing but a genre. They pick "Fantasy" or "Noir" or "Science Fiction" and say: Begin.

Once generates a world, a protagonist, a starting scenario. The user steps into a story that has already started. They inherit a character with a name, a past, a problem. Their first choice is their first mark on this world.

This is for the reader who wants to be surprised. The one who trusts the story to take them somewhere.

### The Seed Planter

The user arrives with fragments. A character they have imagined. A world they have sketched. A conflict they find compelling. But they do not know how to begin. They do not know what the first scene should look like.

Once takes these fragments and weaves them into a starting point. The user provides the raw materials. Once builds the foundation. The first scene emerges from the combination of what the user brought and what the system understood about how stories begin.

The user might say: "I have a character named Kira. She is a former soldier who deserted her army because she discovered they were committing atrocities. She carries guilt like a second skin. I want the story to be about redemption, but I do not know where she is or what she is doing when we meet her."

Once takes this and generates a scene. Kira is somewhere specific. She is doing something specific. The story has begun. The user did not have to architect the opening. They only had to share what they loved about the character.

### The Architect

The user arrives with everything. A protagonist with a name, a history, specific traits. A world with rules, factions, conflicts. A starting scenario that places the character in a specific moment.

Once honors all of it. The system becomes a faithful narrator of the world the user has imagined. The AI does not override. It does not reinterpret. It serves the vision the user has brought.

This is for the writer who knows exactly what they want and needs a partner who can execute without ego.

---

## The Character Vault

Some users have characters they have loved for years. Characters from abandoned novels, from childhood daydreams, from stories they never finished writing. These characters deserve homes in Once.

The Character Vault is where users store the souls they want to bring into stories.

A character in the vault is not a simple list of attributes. It is a living document:

- Their name and appearance
- Their history, as much or as little as the user wants to share
- Their defining traits, the things that make them who they are
- Their relationships, the people who matter to them
- Their unresolved conflicts, the wounds that have not healed
- Their voice, how they speak, what words they would never use

When a user starts a new story, they can pull a character from the vault. That character enters the world with their full history intact. The LLM knows who they are. The story remembers.

But here is the deeper feature: deferred characters.

A user might have a character they love, but they do not know when that character should appear. They do not want to force the introduction. They want the story to find the right moment.

The user adds the character to the story as a "waiting soul." They provide a trigger condition, explicit or implicit:

- Explicit: "Introduce this character when the protagonist visits a port city."
- Implicit: "Introduce this character when it makes narrative sense. They are a rival from the protagonist's past."

Once holds this character in memory. When the trigger condition is met, or when the LLM determines the moment is right, the character enters the story. The introduction feels organic because it is timed by the narrative, not by the user.

---

## The Story Session

Each session follows a loop that brings the world to life.

### Context Assembly

Before generating any narration, the system gathers all relevant information:

- Last N scenes (recency buffer for short-term memory)
- Protagonist current state (health, energy, location, traits, inventory)
- Relevant memories from the knowledge graph
- Semantically similar past moments from the vector store
- Pending echoes that might trigger
- Deferred characters waiting to enter
- Relevant codex entries

This assembled context ensures the LLM knows everything it needs to respond coherently.

### User Action

The user types what they want to do. Free-form text, not menu selections. This is the soul of the product. The input should feel like agency, not a command prompt.

### LLM Processing

The action and context are sent to the LLM with:

- The narrative stance (grimdark, heroic, grounded, mythic, noir)
- The story mode (protagonist or narrator)
- All assembled context
- Structured output schema for consistent responses

### Streaming Response

The narration streams to the user in real-time. They watch the story unfold word by word. This creates anticipation and immersion that batch responses cannot match.

### State Mutation

After the narration completes, the system:

- Updates protagonist state (health, energy, location, traits, inventory)
- Checks if any echoes should trigger
- Plants new echoes if the choice warranted delayed consequences
- Introduces deferred characters if their trigger conditions are met
- Updates or creates codex entries for new entities mentioned
- Stores the scene in the database
- Stores the interaction in the memory system for future retrieval

### The Loop

The user reads the narration, sees their updated state, and types their next action. The cycle continues until the story reaches a natural pause or conclusion.

---

## The Protagonist System

In protagonist mode, the user controls a character with depth.

### Vitals

Health and energy. Actions can cost energy. Damage reduces health. Rest recovers both. These create stakes without being gamified.

### Location

Where they are in the world. Affects what is possible and who they might encounter. The world has geography that matters.

### Traits

Personality attributes that can evolve. Start "Optimistic" and make cynical choices, the trait may flip. The character grows based on actions, not just words.

### Inventory

Items carried. Can affect story options and outcomes. A rope might save a life. A letter might end one.

### Scars

Permanent marks from major events. "Lost an eye in the siege." These never heal. They are the visible history of what the protagonist has survived.

### Ensemble Support

For stories with multiple POV characters, multiple protagonists exist within a single story. The isActive flag tracks whose perspective is current. The user can switch focus between characters.

---

## Narrator Mode

In narrator mode, no protagonist is tracked. The user guides events, switches perspectives, watches the world unfold. This is for stories like Game of Thrones where the narrative follows the world, not a single hero.

The user is not a character. They are the author, shaping events from above.

---

## Forking

Stories are linear. Each scene has a turn number. There is no in-story branching.

But users can fork. At any scene, they can say "Continue from here" and create a new story:

- The new story references the original (forkedFromStoryId, forkedAtSceneId)
- Protagonist state is restored from that scene's snapshot
- The new story continues independently
- The original story remains unchanged

This is the git model. Users can explore multiple paths without losing their original story. The library shows fork relationships, creating a tree of alternate histories.

---

## The Plot Compass

Some users have a destination but not a path. They know how they want the story to end, or they know a specific scene they want to experience, but they do not know how to get there.

The Plot Compass is a system that guides the story toward user-defined milestones without forcing the path.

### Planting a Destination

At any point, a user can plant a destination:

- "I want the story to eventually reach a betrayal by someone the protagonist trusts."
- "I want a scene where the protagonist must choose between saving a loved one and saving a city."
- "I want the story to end with the protagonist becoming the thing they once fought against."

The destination is not a script. It is a gravitational pull. Once begins to shape the narrative so that events and characters align toward making that destination possible. But the user's choices still matter. If the user's actions diverge too far, the destination may become unreachable, and the system will gently surface this.

### The Wanderer Mode

Some users want no destination. They want to wander. The Plot Compass has a mode for this: Wanderer.

In Wanderer mode, there is no end goal. The story continues until the protagonist dies, until the user chooses to end it, or until a natural conclusion emerges. This is for users who want to live in a world rather than complete a narrative arc.

---

## The Echo System

Consequences in Once do not expire. They wait.

An Echo is a consequence that has been planted but not yet resolved. When a user makes a significant choice, the system determines whether that choice should create an Echo.

A user spares an enemy. An Echo is planted: "The enemy remembers."

Turns later, or scenes later, or chapters later, the Echo resolves. The enemy returns. Maybe as an ally. Maybe as a threat. Maybe in a way no one expected.

Echoes are not visible to the user by default. They are surprises. But users who want more control can view their planted Echoes and even influence when they might resolve.

The Echo system is what makes Once feel alive. The world is not just reacting to your current action. It is remembering everything you have ever done.

---

## The Codex

As the story unfolds, knowledge accumulates. Characters are met. Locations are discovered. Items are acquired. Factions are encountered.

The Codex is an automatically maintained encyclopedia of everything that has happened in the story. It is generated by the LLM, which extracts and summarizes key information from each scene.

The Codex has sections:

- Characters: Every named character, their relationship to the protagonist, their last known status
- Locations: Every place visited, with notes about what happened there
- Items: Every significant object, its history, its current location
- Factions: Every group, their goals, the protagonist's standing with them
- Timeline: A chronological record of major events

The Codex is not just for the user. It is also for the LLM. When context is assembled for a new scene, the Codex provides structured knowledge that the LLM can reference. This improves consistency and reduces the chance of the story contradicting itself.

Users can edit the Codex. If they notice an error, or if they want to add information the LLM did not capture, they can make corrections. These corrections are treated as canon and inform future scenes.

---

## The Narrative Stance

Tone is not a slider. It is a philosophy.

Once offers Narrative Stances that shape how the world behaves and how the LLM narrates:

### Grimdark

The world is hostile. Death is permanent and common. There are no heroes, only survivors. The system is harsh in its consequences. A failed negotiation might end in violence. A moment of mercy might be repaid with betrayal.

### Heroic

The protagonist is exceptional. Luck favors the bold. Unlikely victories are possible. The world is dangerous, but it rewards courage. This is for stories where the underdog wins and the hero rises.

### Grounded

Realism governs. Injuries take time to heal. Resources are finite. Social dynamics are complex. The world does not bend to the protagonist's will. Success requires planning, patience, and often compromise.

### Mythic

The scale is epic. Gods walk the earth. Prophecies shape destinies. The protagonist is part of something larger than themselves. This is for stories of legendary scope.

### Noir

Morality is gray. Everyone has secrets. Trust is a liability. The atmosphere is heavy, the stakes personal, the victories pyrrhic. This is for stories where the real enemy is within.

The Narrative Stance affects not just tone but mechanics. A Grimdark story might have permanent death. A Heroic story might allow for miraculous recoveries. The stance is chosen at story creation and shapes everything that follows.

---

## Story Inheritance

Death is not always the end.

When a protagonist dies, the user has a choice:

### End the Story

The story concludes. It becomes a completed tale, preserved in the user's library. The choices made, the consequences faced, the ending reached. All of it becomes history.

### Continue as a Successor

The world persists. A new protagonist emerges. They inherit some of what came before:

- The world state (factions, locations, events) remains intact
- Some reputation carries forward (the successor is known as the child, or student, or avenger of the fallen protagonist)
- Some items may be inherited
- Echoes planted by the previous protagonist may resolve for the successor

The successor story is not a reset. It is a continuation. The weight of the previous protagonist's choices is still felt. The new protagonist walks through a world shaped by someone who came before.

This allows for generational sagas. A story that spans lifetimes. A world that evolves across multiple protagonists.

---

## The Library

Every story the user completes, abandons, or pauses lives in the Library.

The Library is organized by:

- Active Stories: Currently in progress
- Completed Stories: Finished with an ending
- Archived Stories: Paused or abandoned, but preserved

Each story in the Library contains:

- The full scene history
- The final state of the protagonist and world
- The Codex
- Statistics (word count, choices made, time spent)
- Echoes that never resolved

Users can revisit completed stories as readers. They can export them as documents. They can share them with others as published tales.

---

## Publishing and Community

Stories created in Once can be shared, but the community is designed to be supportive, not competitive.

### Published Stories

A user can publish a completed story. It becomes readable by others. Readers experience the story as a finished narrative, seeing the choices the author made but not able to change them.

Published stories can be:

- Public (anyone can read)
- Private (only invited users can read)
- Featured (highlighted by curators based on quality and engagement)

### Upvotes Only

There are no downvotes in Once. Every story is someone's creation, their imagination made real. If a reader does not connect with a story, they simply move on. If they love it, they upvote.

This creates an environment where sharing feels safe. A story with zero upvotes is not a failure. It is simply a story waiting for its audience. A story with many upvotes is a story that resonated.

The absence of punishment encourages more users to share. More shared stories means a richer community.

### The Suggestion Box

Every published story has a Suggestion Box. Readers who want to offer feedback can leave suggestions. These are private by default, visible only to the author.

Suggestions are not reviews. They are gifts. A reader might suggest:

- A character they wished had more screen time
- An alternate path they wondered about
- A moment that moved them and why
- A technical issue with pacing or clarity

The author can choose to make suggestions public, turning them into a discussion. Or they can keep them private, using the feedback to improve future stories.

This system encourages constructive engagement without the toxicity of public criticism.

### Story Templates

A user can publish not a finished story, but a starting point. A world they have built. A set of characters. A conflict waiting for a protagonist.

Other users can take this template and start their own stories within it. The original creator receives credit and can see statistics about how many stories have been born from their template.

This creates a marketplace of worlds. Users who are better at world-building can share their creations. Users who prefer to explore can find worlds that call to them.

---

## The Experience of Playing

This is what it feels like to use Once.

You open the app. You are greeted by your active stories, waiting for your return. You select one, and the last scene appears, along with a brief reminder of where you left off.

You read the scene. The world is vivid. The narrator knows your protagonist, knows the world, knows the history. The narration does not feel generic. It feels like it was written for this moment, because it was.

At the bottom, a simple input waits. You type what your protagonist does. Not a command. Not a selection from a list. Your words. Your choice.

You submit. The response streams in, word by word. You watch the story unfold in real time. The narration responds to your choice in ways that surprise you. A character you forgot about reappears. A consequence you planted ten scenes ago resolves. The world remembers.

The scene ends. Your protagonist has changed. Their health, their inventory, their relationships, their traits. You see the updates. You feel the weight.

You type again. Or you step away, knowing the story will wait.

This is Once. A world that listens. A world that remembers. A world that grows with you.

---

## What We Are Building

This document is the soul. The code we write must serve this soul.

Every technical decision should be measured against the experience described here. If a feature makes the story feel more alive, we build it. If a shortcut makes the story feel generic, we reject it.

Once is not a product. It is a world-building engine. It is a memory keeper. It is a consequence calculator. It is a story that writes itself with you.

The only story you can not rewrite.

---

## Appendix: The Questions We Must Answer

Before starting implementation, we must decide:

1. How much control does the user have over Echo resolution timing?
2. Should the Codex be editable, or read-only with correction requests?
3. How do we price and limit LLM usage without breaking the immersion?
4. How do we structure the knowledge graph to maximize retrieval relevance while minimizing token cost?
5. What is the optimal chunking strategy for vector embeddings of story scenes?
6. How do we prevent the LLM from hallucinating facts that contradict the Codex?
7. Should published stories show the user's actions, or only the resulting narrative?
8. How do we handle content moderation for published stories?
9. What is the maximum story length before performance degrades, and how do we gracefully handle long-running stories?
10. How do we teach new users the depth of the system without overwhelming them?
11. How do we balance between graph memory (relationships, facts) and vector memory (semantic similarity) in context retrieval?
12. What triggers should cause automatic Codex updates versus requiring user confirmation?

These questions will be answered as we build. But they must be kept in mind.
