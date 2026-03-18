import { useState, useEffect, useRef } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  ink: "#1a1208", cream: "#f5f0e8", parchment: "#ede5d0",
  gold: "#9a7c3f", goldLight: "#c4a35a", rust: "#8b3a2a",
  border: "rgba(154,124,63,0.25)", borderStrong: "rgba(154,124,63,0.5)",
};

// ── Storage ──────────────────────────────────────────────────────────────────
function loadProgress() {
  try { return JSON.parse(sessionStorage.getItem("press_progress") || "{}"); } catch { return {}; }
}
function saveProgress(p) {
  try { sessionStorage.setItem("press_progress", JSON.stringify(p)); } catch {}
}
function loadSubs() {
  try { return JSON.parse(sessionStorage.getItem("press_subs") || "[]"); } catch { return []; }
}
function saveSubs(s) {
  try { sessionStorage.setItem("press_subs", JSON.stringify(s)); } catch {}
}

// ── Timer ────────────────────────────────────────────────────────────────────
function useTimer(minutes) {
  const [secs, setSecs] = useState(minutes * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (running && secs > 0) {
      ref.current = setInterval(() => setSecs(s => {
        if (s <= 1) { clearInterval(ref.current); setRunning(false); setDone(true); return 0; }
        return s - 1;
      }), 1000);
    }
    return () => clearInterval(ref.current);
  }, [running]);
  const reset = (m) => { clearInterval(ref.current); setSecs(m * 60); setRunning(false); setDone(false); };
  const fmt = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  return { fmt, running, done, start: () => setRunning(true), pause: () => setRunning(false), reset };
}

// ── Data ─────────────────────────────────────────────────────────────────────
const BOOKS = [
  {
    number: "I", title: "The Material", subtitle: "What writing is made of",
    modules: [
      { id: 1, title: "The Image",
        brief: `An image is not a picture. It is a pressure point — the place where language touches the world and the world pushes back. Robert Hass wrote that "a word is elegy to what it signifies," which means every noun is already a small act of mourning. When you write "grief," you have named a thing and killed it. When you write "the smell of his coat still on the hook by the door," you have made the reader feel it without naming it at all.\n\nThe difference between description and image is the difference between telling someone a room was cold and making them pull their collar up. Description reports. Image renders. Seamus Heaney didn't describe a blackberry as purple — he wrote that it "glossed the purple clot." The verb is doing everything. Mary Oliver doesn't explain the wild geese are beautiful; she shows you where they're going.\n\nYour task is to find five moments of contact between language and the physical world — and to render them without once reaching for abstraction. No words like beauty, loss, time, memory, longing, darkness, hope. Those are conclusions. You are looking for the evidence.`,
        anchor: { title: `Hass, Robert — Praise (1979). Read "Meditation at Lagunitas."`, url: "https://www.poetryfoundation.org/poems/47553/meditation-at-lagunitas" },
        exercise: "Write five images. Each must render something physical and specific. No abstract nouns — no beauty, loss, time, memory, sorrow, longing, hope, darkness, light (as metaphor), silence (as metaphor). If you catch yourself naming a feeling, cut it and find the thing that caused it.", timer: 12 },
      { id: 2, title: "The Line",
        brief: `The line is the fundamental unit of poetry — but it governs prose too, even if invisibly. A line ending is a decision about where the reader breathes, where they pause, where the meaning doubles. Charles Wright said the line is "a unit of attention." That's the whole thing. Not a unit of syntax. Not a unit of grammar. A unit of how long the mind can hold something before needing to move.\n\nIn poetry, the line break can make a single sentence mean two things at once. Sharon Olds ends a line on "I wanted" before the line turns and completes — and in that pause, the wanting is total, unqualified, infinite. Then it gets finished into something specific and the infinity is gone. That's what the line does: it holds the undecided moment.\n\nIn prose, sentences move in rhythm too — long sentences accumulate pressure and short ones release it. Joan Didion wrote sentences that piled clause on clause until the center couldn't hold, and then broke with something like: "We tell ourselves stories in order to live." Seven words. After twenty. That's rhythm. That's the line, even in prose.`,
        anchor: { title: `Olds, Sharon — Satan Says (1980). Read "The One Girl at the Boys Party" and "Sex Without Love."`, url: "https://www.poetryfoundation.org/poets/sharon-olds" },
        exercise: "Take a paragraph — your own, or one from any prose book you have near you. Break it into lines as if it were a poem. Read it aloud. Then reassemble it into prose. In your reflection: what did you lose? What did you gain? What did the line breaks reveal about where the weight actually lives?", timer: 12 },
      { id: 3, title: "Voice",
        brief: `Voice is not personality. It is not the writer's presence on the page — it is the writer's absence in a specific shape. What the voice refuses to explain, what it refuses to sentimentalize, what it refuses to apologize for: that's where the character lives. Denis Johnson's narrators never explain why they do what they do. Maggie Nelson doesn't perform uncertainty — she inhabits it as a structural principle. Ocean Vuong doesn't tell you his mother couldn't read the letter he wrote her. He shows you the letter.\n\nThe mistake most writers make is confusing voice with tone — with sounding a certain way. But voice is built at the level of what the writer chooses to render and what they choose to omit. It's built in diction: the specific vocabulary a consciousness carries. It's built in syntax: how a mind moves through a sentence, what it puts first, what it buries, what it never finishes. Frank O'Hara's voice is inseparable from its speed, its distraction, its delight. Anne Carson's voice is inseparable from its gaps.\n\nYou cannot manufacture voice. But you can identify it by writing two versions of the same scene in which the narrator is a different consciousness — and noticing how the world changes shape.`,
        anchor: { title: "Vuong, Ocean — On Earth We're Briefly Gorgeous (2019). Read the first 20 pages.", url: "https://www.penguinrandomhouse.com/books/563479/on-earth-were-briefly-gorgeous-by-ocean-vuong/" },
        exercise: "Write the same scene twice — the same event, the same moment. Two voices that have never met each other. Not two tones (angry vs. calm). Two different consciousnesses: different diction, different syntax, different things they notice, different things they refuse to name. The scene can be simple: a person waiting. A door. A meal. What changes is who is looking.", timer: 12 },
      { id: 4, title: "Pressure",
        brief: `A piece of writing has pressure when it feels like something is at stake — when the reader senses that the writer could not have written it any other way, at any other time, about anything else. The opposite of pressure is competence: technically correct writing that doesn't need to exist. Most first drafts contain both. The writer's job is to locate where the pressure is and work toward it, cutting away the sentences that only arrive at the place where the pressure begins.\n\nLarry Levis said the best poems "cost something." Not in the sense of personal disclosure — confessional poetry can be pressureless too, if the emotion is performed rather than felt. The cost is formal: the writing risks something structurally. It commits to an image that might not work. It ends before it's ready to end. It refuses the comfort of resolution. Jack Gilbert's "Refusing Heaven" has pressure because it refuses consolation at every turn, when consolation is available at every turn.\n\nTo find pressure in your own work: locate the lowest-pressure sentence. The one that sounds fine, that's technically correct, that arrives and departs without consequence. That sentence is probably protecting you from something. The revision is not to make it more beautiful — it is to make it cost something.`,
        anchor: { title: `Gilbert, Jack — Refusing Heaven (2005). Read the title poem and "Failing and Flying."`, url: "https://www.poetryfoundation.org/poems/48467/failing-and-flying" },
        exercise: "Find the lowest-pressure sentence in a piece you've already written — the sentence that could be cut without consequence, or that says something true but at no cost. Rewrite it five times, each time making it cost more. Not more dramatic — more necessary. The goal is a sentence the piece cannot survive without.", timer: 12 },
    ],
  },
  {
    number: "II", title: "The Architecture", subtitle: "How writing is built",
    modules: [
      { id: 5, title: "Structure and Form",
        brief: `Structure is the argument a piece makes about time. Every poem and every essay is implicitly answering: what order does experience arrive in? What must come before what? Form is not the container — it is the logic. The sonnet's volta is not a rule, it is the formalization of the mind changing. The lyric essay's fragmentation is not style — it is an epistemological claim: knowledge arrives in pieces.\n\nAnne Carson's Autobiography of Red is structured as a novel that is secretly a retelling of a Greek myth that is secretly a love poem. The structure is the meaning. Eduardo Galeano's Memory of Fire uses a relentless series of short, dated fragments — each one complete, each one accumulating into something that no single fragment contains. The architecture of that book says: history is made of small moments, and small moments make history.\n\nTo understand how a piece is built, you have to read it as a structure — not as a sequence of sentences but as a set of decisions about time, space, arrival, and withholding. The map is the argument.`,
        anchor: { title: "Carson, Anne — Autobiography of Red (1998). Read the first three chapters.", url: "https://www.penguinrandomhouse.com/books/86572/autobiography-of-red-by-anne-carson/" },
        exercise: "Choose a published poem or essay you admire. Map its architecture — not an outline, a diagram. Where does it begin in time versus where it ends? Where does it accelerate and where does it slow? Where is the silence? Where is the turn? Draw this. The drawing is the exercise — it does not need to be beautiful, it needs to be accurate.", timer: 12 },
      { id: 6, title: "The Sentence",
        brief: `Syntax is meaning. The sentence "He left her" and the sentence "She was left" contain the same event and radically different claims about who holds power, who is acted upon, who the consciousness centers. Passive constructions are not weakness — they are a specific kind of claim. Fragments are not failure — they are refusal. The run-on sentence, the sentence that refuses to end, that accumulates clause upon clause, that keeps going even when it has passed the place where most writers would have put a period, is a formal decision about how the mind holds experience.\n\nBaldwin's sentences are long and coiling because the thought he is tracing is long and coiling — the sentence enacts the difficulty of thinking clearly about race in America. Carver's sentences are stripped because the consciousness he inhabits has learned not to trust complexity. Both are right. Neither is a model. Your job is to find the syntax that belongs to what you are actually trying to say.\n\nThe exercise here is diagnostic: writing the same content in ten different syntactic shapes forces you to see what the sentence is actually doing, independent of what it means.`,
        anchor: { title: "Baldwin, James — Notes of a Native Son (1955). Read the title essay for its sentences alone.", url: "https://www.penguinrandomhouse.com/books/7753/notes-of-a-native-son-by-james-baldwin/" },
        exercise: "Pick a subject — any subject, even an object in the room. Write ten sentences about it, each in a radically different syntax: declarative, interrogative, imperative, fragmented, run-on, inverted, appositive-heavy, verb-first, noun-only, list. Don't worry about which is best. Worry about what each one knows that the others don't.", timer: 12 },
      { id: 7, title: "Openings",
        brief: `The first line of a piece is a contract. It tells the reader what kind of attention is required, what speed, what temperature, what level of trust. "Call me Ishmael" makes a claim about character before it makes a claim about story. "It was the best of times, it was the worst of times" establishes a structural irony that will govern the entire novel. "Happy families are all alike; every unhappy family is unhappy in its own way" is a thesis statement disguised as an observation — and the rest of the book disproves it.\n\nIn poetry, the first line is even more decisive. It establishes the music, the stance, the degree of difficulty. Lucille Clifton's "won't you celebrate with me / what i have shaped into / a kind of life?" opens with an invitation and a quiet devastation — "a kind of life" is the wound. It's in the third line, quietly. You almost miss it. That's how great openings work: they give you something and withhold something at the same time.\n\nThe opening does not start the piece. It enters it — and the difference between starting and entering is everything.`,
        anchor: { title: `Clifton, Lucille — The Collected Poems (2012). Read "won't you celebrate with me" and the first ten poems.`, url: "https://www.poetryfoundation.org/poems/50974/wont-you-celebrate-with-me" },
        exercise: "Collect ten first lines from published works you admire. For each one, write two sentences of annotation: what does it do on arrival? What does it give, and what does it withhold? Then write three opening lines of your own for pieces that don't exist yet — and annotate those too.", timer: 12 },
      { id: 8, title: "Endings",
        brief: `The ending is not the conclusion. The ending is the last thing the piece allows itself to know. Most endings are too explanatory — they arrive at a statement that summarizes what the piece has already done, as if the writer doesn't trust the reader to have felt it. The better ending arrives at an image, a gesture, a sound — something that holds the resonance of everything before it without naming it.\n\nBishop's "One Art" ends on "Write it!" — two words, an imperative, a collapse of the entire argument about loss that the poem has been making. The exclamation point is ironic and desperate at once. The poem cannot contain what it is trying to contain, and the ending admits it. That admission is the ending. Chekhov's stories end before the scene ends — he cuts away at the moment before the emotional resolution arrives, leaving the reader in the space where the feeling is.\n\nOver-resolution is the most common failure of endings. The piece has done its work, and then the writer, afraid the reader won't get it, says it one more time, in plain language, just to be sure. That extra line is almost always the worst line in the piece.`,
        anchor: { title: `Bishop, Elizabeth — The Complete Poems 1927–1979. Read "One Art," "The Fish," and "At the Fishhouses."`, url: "https://www.poetryfoundation.org/poems/47536/one-art" },
        exercise: "Take three pieces you've already written — poems, essays, anything. Find the last line of each. Now: rewrite each ending without using the word that felt like the answer. If the ending rested on a noun, find the image. If it rested on a statement, find the gesture. Write three new endings for each piece — then decide which is truest.", timer: 12 },
    ],
  },
  {
    number: "III", title: "The Workshop", subtitle: "How writing is read and remade",
    modules: [
      { id: 9, title: "Reading as a Writer",
        brief: `A reader asks: what does this mean? A writer asks: how does this work? These are different questions and they produce different kinds of attention. Reading as a writer means suspending the question of whether you like something — and asking instead: what decisions were made here? What is the syntax doing that the content alone could not do? Where is the structure load-bearing?\n\nThis is harder to do with work you love, because love makes you passive. It is easier — and more instructive — with work you resist. When you read a poem you dislike, you are forced to ask why it does what it does, rather than surrendering to it. You might discover that it is doing something correctly that you simply don't prefer — and that distinction between disliking a technique and evaluating it is the beginning of craft literacy.\n\nNabokov said he read with his spine — that the physical sensation of good writing was the proof of it. That's real. But the spine response is the beginning of the reading, not the end. The writer's job is to follow that sensation back into the text and find its source.`,
        anchor: { title: "Nabokov, Vladimir — Lectures on Literature (1980). Read the first lecture.", url: "https://www.penguinrandomhouse.com/books/117766/lectures-on-literature-by-vladimir-nabokov/" },
        exercise: "Find a published poem you genuinely dislike — not one you're indifferent to, one that actually bothers you. Read it three times. Then write a technical appreciation: what does it do correctly? What formal decisions are sound, even if they produce effects you don't like? This is not a review. It is a craft autopsy.", timer: 12 },
      { id: 10, title: "Critique",
        brief: `A workshop letter is not a review. It is a craft conversation — the goal is to articulate what the piece is trying to do, then identify where the execution falls short of the ambition. The vocabulary of critique is precise and impersonal: it speaks about the text, not about the writer. "This stanza loses pressure" rather than "I felt confused here." The distinction matters because one is a craft observation and the other is a reader report.\n\nThe most useful thing a workshop letter can do is name the piece's best version of itself — what it is reaching for — and then identify the specific place where it doesn't yet arrive. This requires the reader to be more generous than the text deserves and more exacting than the writer expects. The failure of most workshop is that it is either too generous (everything is interesting, everything has potential) or too aggressive (the reader's taste becomes law).\n\nThe model here is the editor's letter — the note a good editor writes before returning a manuscript. It begins with what is working and why. It identifies the central formal problem. It asks questions rather than issuing corrections. It ends with the reader's belief in the writer's ability to solve it.`,
        anchor: { title: `Hugo, Richard — The Triggering Town (1979). Read chapters 1–3.`, url: "https://wwnorton.com/books/9780393334876" },
        exercise: "Choose a published piece — a poem or a short essay — that you find genuinely interesting but imperfect. Write a full workshop letter: what is it trying to do, where does it succeed, what is the central formal problem, what specific line or moment is where the ambition and execution diverge? One page minimum. No plot summary. All craft.", timer: 20 },
      { id: 11, title: "Revision I — Subtraction",
        brief: `Most first drafts are overwritten — not because the writer is careless, but because writing toward something requires generating more than the thing needs. The surplus is the approach. The problem is when the approach becomes part of the final piece: the warm-up sentences that preceded the real opening, the explanatory paragraph that follows the image that didn't need explaining, the final line that says what the penultimate line already said.\n\nRevision by subtraction is not editing for tightness. It is a structural question: what is the piece's actual argument, and what material is not serving that argument? Sometimes the first three paragraphs are the approach to the piece, and the piece begins on the fourth. Sometimes the last line is the approach to the ending, and the ending is the line before it. The material you cut is not bad writing — it is the scaffolding. Once the building stands, the scaffolding comes down.\n\nThe discipline of cutting by a third is arbitrary, but productive: it forces you to identify the hierarchy of material — what is essential, what is strong, what is merely good, what is the approach. You will find the piece beneath the piece.`,
        anchor: { title: "Strunk, William & White, E.B. — The Elements of Style. Read section V: An Approach to Style.", url: "https://www.pearson.com/en-us/subject-catalog/p/elements-of-style-the/P200000000446" },
        exercise: "Take your longest piece of writing — poem, essay, lyric prose, anything. Your target: cut it by one third without losing its central argument. You are not cutting the worst material. You are finding the hierarchy. Write your reflection on what you discovered the piece was actually about once the surrounding material was gone.", timer: 20 },
      { id: 12, title: "Revision II — Addition",
        brief: `Revision is not only subtraction. Some pieces are thin not because they are overwritten but because they are undertold — they arrive at the emotional center and then pull back, offering the reader a controlled gesture when the piece needs to go somewhere it hasn't been. Monica Youn calls this "generative revision" — the understanding that a poem can be revised by addition, that the original and the revised version can coexist as parallel possibilities rather than as replacement.\n\nThe parallel draft is one of the most useful revision tools available: write a second version of a finished piece that begins where the original ends. The original ends with an image of departure — the second version begins there and continues. What comes next is not an extension; it is a different piece that uses the first piece as its entry point. Sometimes the second draft replaces the first. Sometimes the combination of both becomes the final piece. Sometimes you discover what the first piece was actually about only by writing past it.\n\nJosé Saramago said that writing is the process of discovering what you know. The parallel draft is how you find the knowledge that arrived too late for the first version.`,
        anchor: { title: "Nelson, Maggie — Bluets (2009). Read propositions 1–75. Note how the form accumulates.", url: "https://wavepoetrylibrary.com/books/bluets-by-maggie-nelson/" },
        exercise: "Take a finished piece — something you consider done. Write a second version that begins exactly where the original ends. The last word of the original is the first word of the new version. Write for the full timer. In your reflection: what did the original not know yet? What did you find in the continuation?", timer: 15 },
    ],
  },
  {
    number: "IV", title: "The World", subtitle: "Where writing lives",
    modules: [
      { id: 13, title: "The Literary Ecosystem",
        brief: `The literary world is not a meritocracy, but it is not entirely arbitrary either. Understanding how it is organized is practical knowledge — the kind that most MFA programs deliver informally, in hallways, and most writers outside those programs never receive. Here is the basic structure, without mystification.\n\nLiterary journals are where most writers publish first. They are the proving ground — editors at journals are often editors at presses, and a writer with strong journal publications has a record of vetted work. Agents represent writers to commercial publishers; they are unnecessary for most literary work (poetry, essay collections, literary fiction from small presses). Small independent presses — Graywolf, Copper Canyon, BOA, Tin House Books, Coffee House — are where most serious literary work is published. The New York houses publish literary fiction and nonfiction at scale; poetry almost never.\n\nThe submission process is slower than it appears and more personal than it feels. Editors remember names. They remember pieces they declined that stayed with them. The relationship between writer and journal is long — it rewards patience, consistency, and the absence of entitlement.`,
        anchor: { title: "Poets & Writers Magazine — read any current issue, particularly the submission guidelines database at pw.org.", url: "https://www.pw.org" },
        exercise: "Build a map of the literary ecosystem as it relates to your own work. Which journals publish work in your register? Which presses publish writers you read? Who are the editors whose taste you trust? This is not a fantasy submission list — it is a reading of the landscape. Write a page on where your work belongs and why.", timer: 15 },
      { id: 14, title: "The Cover Letter",
        brief: `The cover letter is the first thing an editor reads, and the best cover letters are nearly invisible — they give the editor what they need and step aside. What they need: your name, the title and genre of the piece, the word count or line count, a single sentence of genuine context if the piece requires it, a brief publication history if you have one, and a note on simultaneous submission status. That is the entirety of what a cover letter is.\n\nMost cover letters fail because the writer is afraid — afraid of appearing unpublished, afraid of appearing arrogant, afraid that the work isn't enough. The fear produces either over-explanation (summarizing the piece, explaining its themes, telling the editor what to feel) or false modesty (apologizing for submitting, hedging the work before the editor has read it). Both are liabilities. The cover letter's only job is to demonstrate that the writer knows how to conduct themselves professionally.\n\nThe three registers: formal (for journals with established prestige where you are an unknown), concise (for journals whose work you know well), and bare (for contests or journals that explicitly want minimal letters — sometimes the right move is five lines).`,
        anchor: { title: "Submittable Blog — search how to write a cover letter for literary submissions.", url: "https://blog.submittable.com" },
        exercise: "Choose one piece you have written or are working toward submitting. Write three cover letters for it: formal (one paragraph, credentials-first), concise (four sentences maximum), and bare (name, title, genre, one line). In your reflection: which version represents you most accurately? Which is a performance?", timer: 12 },
      { id: 15, title: "The Reading Life",
        brief: `Writers who don't read become provincials of their own sensibility. The reading life is not supplemental to the writing life — it is the same life. What you read determines the range of what you can imagine doing. What you don't read creates blind spots you cannot see because you don't know they're there.\n\nThe reading curriculum is not about reading what you love. You will do that naturally. The reading curriculum is about reading what you need — the work that extends your technical range, the work that operates in a form you've avoided, the work that makes you uncomfortable in a productive way. You need to read writers who are doing something you can't do yet and understanding how they do it. You need to read across traditions — not just the Anglo-American lyric, but Latin American, Eastern European, African, Asian. The tradition is much larger than the syllabus.\n\nTwelve books is not a lifetime. It is a year's worth of serious reading alongside the writing. The curriculum should be specific, purposeful, and slightly uncomfortable.`,
        anchor: { title: `Machado, Carmen Maria — Her Body and Other Parties (2017). Read "The Husband Stitch."`, url: "https://www.graywolfpress.org/books/her-body-and-other-parties" },
        exercise: "Build a reading curriculum of 12 books organized not by what you want to enjoy but by what you need to learn. For each book, write one sentence on what specific craft question it will help you answer. The curriculum should include at least three books outside your primary tradition, at least one book in translation, and at least one book you have been avoiding.", timer: 15 },
      { id: 16, title: "The Professional Identity",
        brief: `The bio is a genre with its own constraints. It is third-person, factual, and almost always uncomfortable to write — because it requires you to see yourself from the outside, to describe a career that is in progress as if it has already arrived somewhere. The mistake most writers make is either false modesty (the bio that buries every credential in qualifications) or false completion (the bio that presents the writer as more established than they are).\n\nThe professional identity is not a performance of arrival — it is a record of trajectory. What you have published, where you have studied, what prizes or recognitions you have received, what you are working on. The bio changes as the work accumulates. The early bio is shorter and more specific; the later bio is longer and more selective.\n\nThe website is not a vanity project — it is infrastructure. A writer without a findable web presence is harder to publish, harder to invite to readings, harder to contact. It doesn't need to be elaborate. It needs to exist, to contain your bio, a selection of published work, and a way to reach you.`,
        anchor: { title: "Read the contributor bios in any issue of The Kenyon Review, Tin House, or The Sun.", url: "https://kenyonreview.org" },
        exercise: "Write your bio in three lengths: 25 words (the one-line version for contest submissions), 75 words (the standard contributor bio), and 150 words (the full version for a reading introduction). Write each as if you were writing it for a writer you respect — not performing, not hedging, not apologizing. Then in your reflection: which version is most honest about where you are?", timer: 12 },
    ],
  },
  {
    number: "V", title: "The Manuscript", subtitle: "Making a body of work",
    modules: [
      { id: 17, title: "Sequencing",
        brief: `A collection is not an anthology of your best work. It is an argument — a case made by the order and relationship of pieces, not only by the pieces themselves. The sequence creates meaning that no individual piece contains. The reader of a well-sequenced collection finishes with a feeling that is larger than the sum of the poems or essays — something has happened in the reading that would not have happened if the pieces had been read in a different order, or individually.\n\nThe principles of sequencing are roughly musical: contrast (a quiet piece after a loud one), recurrence (a motif that reappears in different contexts), escalation (pressure building across the arc), and rest (the piece that gives the reader a place to breathe before the next difficulty). But the best sequencing is usually done by feel — by reading the collection aloud, cover to cover, and noticing where the energy flags.\n\nLucie Brock-Broido's Stay, Illusion is sequenced like a piece of music — it has movements. Rita Dove's Thomas and Beulah is sequenced as two voices across a lifetime, each piece a station on a larger journey.`,
        anchor: { title: "Dove, Rita — Thomas and Beulah (1986). Read the entire collection in one sitting and note the sequencing decisions.", url: "https://www.carnegiemellonpress.com/book/thomas-and-beulah/" },
        exercise: "Take five pieces of your own work. Arrange them in three different sequences. For each arrangement, write a paragraph on what the order does — what argument it makes, how the pieces change each other's meaning, where the pressure builds and releases. Which arrangement is truest to what the work is actually about?", timer: 15 },
      { id: 18, title: "The Title",
        brief: `The title is a threshold. It is the first act of interpretation the writer performs on the work — and it tells the reader how to enter. A title that describes the poem's content (what happens, who is there, when it takes place) is a missed opportunity. A title that names the poem's subject without opening onto the poem's question is closing a door rather than opening one. The best titles are slightly oblique — they name something adjacent to the poem's center, something that creates pressure on the first line rather than resolving it.\n\nLucie Brock-Broido titled her collection Stay, Illusion — a command and an admission at once, a thing you say to something you know is going to leave. Frank O'Hara's "The Day Lady Died" is a newspaper headline — flat, factual, covering something enormous. The flatness is the whole point. The poem earns its emotion by refusing to perform it from the first word.\n\nGenerating twenty titles is not an exercise in choosing. It is an exercise in discovering what the piece is about — because the title that surprises you is usually the one that knows something you hadn't articulated yet.`,
        anchor: { title: "Brock-Broido, Lucie — Stay, Illusion (2013). Read the collection's titles alone, then read the poems.", url: "https://www.penguinrandomhouse.com/books/223488/stay-illusion-by-lucie-brock-broido/" },
        exercise: "Choose one piece you've written — something you've titled already. Generate 20 alternative titles. They don't all have to be good. Some should be terrible. Some should be too long. Some should be single words. Some should be borrowed from the poem's own language. Then: defend your original title, or abandon it. Either answer is acceptable — but the defense or the abandonment must be a craft argument, not a preference.", timer: 12 },
      { id: 19, title: "The Chapbook",
        brief: `A chapbook is a collection of 15–30 pages of poetry or prose — shorter than a full collection, longer than a journal submission. It is the traditional first book form in poetry, and it has its own aesthetic logic: the chapbook is tighter than a full collection, more concentrated, more able to sustain a single governing obsession without needing the range a full collection demands. It is also the most practical first step toward a body of work.\n\nThe chapbook submission process is different from journal submission: you are submitting a complete manuscript, usually to an open call with a reading fee ($15–25 is standard). Most chapbook presses run annual contests; some accept open submissions. The cover letter for a chapbook includes the manuscript title, page count, a one-paragraph description of the work (not a summary — a statement of its central formal preoccupation), and your publication history.\n\nThe chapbook's table of contents is itself a craft document: it is the sequence, the arc, the argument. The title of the chapbook governs how every piece inside it is read.`,
        anchor: { title: "Search the Chapbook Publishers Database at NewPages.com. Identify three presses whose aesthetic matches yours.", url: "https://www.newpages.com/small-presses/chapbook-publishers" },
        exercise: "Design a chapbook from your existing work. Give it a title. Write the table of contents — the full sequence of pieces you would include. Write one paragraph of notes on the sequencing: why this order, what arc it describes, what the first piece promises and what the last piece delivers. This is a manuscript document, not a reflection. Treat it as real.", timer: 20 },
      { id: 20, title: "The Final Assessment",
        brief: `You have completed four books of craft study and practice. The final assessment is not an exam — it is a reckoning. You will assemble a packet of work and evaluate it against the criteria you have internalized across Books I through IV. The evaluation is yours. No external feedback is given here. The work is to be honest with yourself about what the work is and what it still needs.\n\nThe packet consists of four documents: one polished piece (your strongest current work, revised to the standard this workshop has asked you to hold), one revision with process notes (a piece in two versions — original and revised — with a page of notes on what the revision discovered), one cover letter (for the polished piece, in whichever register is appropriate), and one reading curriculum (the 12-book curriculum you built in Module 15, with any revisions you would now make).\n\nThe self-assessment rubric asks you to evaluate each piece against the criteria from Books I–IV: image specificity, pressure, structural integrity, sonic architecture if relevant, opening and ending, voice consistency. You are not grading yourself. You are describing where the work is. The difference between where it is and where you want it to be is your next year of work.`,
        anchor: { title: "Return to the first piece you wrote in this workshop — Module 1's exercise. Read it now. Write one sentence on what it knows and one sentence on what it doesn't know yet.", url: null },
        exercise: "Assemble your packet: polished piece, revision with process notes, cover letter, reading curriculum. Then complete the self-assessment: for each document, write a paragraph evaluating it against the craft criteria from Books I–IV. Be specific. Be honest. Be more demanding of yourself than anyone else would be. This is the work.", timer: 30 },
    ],
  },
];

const ALL_MODULES = BOOKS.flatMap(b => b.modules);

const CRITERIA = [
  { id: "entry", label: "First Line / Entry Point", short: "Entry", question: "Does the opening create immediate pressure or pull? Does it earn the reader's continued attention without explaining itself?", prompt: "Note what the first line does or fails to do. Does it open a door or close one?" },
  { id: "image", label: "Specificity & Concreteness", short: "Specificity", question: "Are the images or details concrete and owned, or borrowed and generic? Count abstract nouns versus sensory or factual particulars.", prompt: "Flag any detail that could appear in another writer's work unchanged." },
  { id: "sonic", label: "Rhythm & Sound", short: "Rhythm", question: "Read aloud. Where does the sound and pacing work? Where does the prose go flat, or the rhythm stumble?", prompt: "Note any sentence that loses momentum in the mouth, or any unintentional effect." },
  { id: "structure", label: "Structural Integrity", short: "Structure", question: "Does the piece's architecture serve its argument? Are transitions doing work, or are they scaffolding that should be removed?", prompt: "Identify the moment where structure and content diverge, if present." },
  { id: "tone", label: "Tonal Consistency", short: "Tone", question: "Does the register hold across the full piece, or does it collapse into a different voice at any point?", prompt: "Identify the moment of collapse if present." },
  { id: "necessity", label: "Necessity", short: "Necessity", question: "Could any section be cut without losing the piece's central argument? If yes, it should be cut.", prompt: "Flag the weakest passage or section." },
  { id: "ending", label: "The Ending", short: "Ending", question: "Does the final image or line arrive at something the piece has earned, or does it explain, summarize, or over-resolve?", prompt: "Rate the ending's restraint." },
  { id: "conceit", label: "Originality of Approach", short: "Approach", question: "What is the piece's central organizing logic or conceit? Has this been done before? What makes this instance irreplaceable?", prompt: "What makes this instance irreplaceable — or doesn't?" },
];

const WRITING_TYPES = ["Poem", "Lyric essay", "Short fiction", "Flash fiction", "Personal essay", "Prose poem", "Other"];
const READINESS = [{ value: "not_ready", label: "Not ready" }, { value: "one_more_pass", label: "One more pass" }, { value: "ready", label: "Ready to submit" }];
const STATUS_COLORS = { drafting: "#555", revising: "#6A6A9A", ready: "#4A8A4A", submitted: "#9A7A3F", accepted: "#3A8A5A", rejected: "#7A3A3A" };

// ── Shared UI ─────────────────────────────────────────────────────────────────
const mono = "'Courier New', monospace";
const serif = "'Palatino Linotype', 'Book Antiqua', Palatino, serif";

function Btn({ children, onClick, disabled, gold, small, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? "#111" : gold ? C.gold : C.ink,
      color: disabled ? "#333" : gold ? C.ink : C.cream,
      border: "none", borderRadius: 2, cursor: disabled ? "not-allowed" : "pointer",
      padding: small ? "6px 16px" : "10px 24px",
      fontFamily: mono, fontSize: small ? "10px" : "11px",
      letterSpacing: "0.15em", textTransform: "uppercase",
      transition: "all 0.15s", ...style,
    }}>{children}</button>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────
function HomePage({ progress, onStart, onModule, onFeedback }) {
  const done = Object.keys(progress).filter(k => progress[k]?.completed).length;
  const total = ALL_MODULES.length;
  const inProgress = done > 0 && done < total;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>
      <div style={{ borderLeft: `2px solid ${C.gold}`, paddingLeft: 20, marginBottom: 48, opacity: 0.8 }}>
        <p style={{ fontStyle: "italic", fontSize: 17, lineHeight: 1.7, margin: "0 0 8px" }}>
          "A word is elegy to what it signifies."
        </p>
        <p style={{ fontSize: 11, letterSpacing: "0.15em", color: C.gold, margin: 0, textTransform: "uppercase" }}>— Robert Hass</p>
      </div>

      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontWeight: "normal", fontSize: 20, letterSpacing: "0.05em", marginBottom: 16 }}>On The Work</h2>
        {["This workshop does not generate writing. It does not evaluate your work or offer suggestions. It is a structure — twenty modules organized across five books, built on the model of residential literary workshops: Bread Loaf, Tin House, Kenyon Review.",
          "The thinking is yours. The writing is yours. The assessment is yours. The Press provides the conditions, the sequence, and the pressure of a timed exercise. What you bring to it determines what you leave with.",
          "Each module must be completed before the next unlocks. Each requires a reading, an exercise, and a reflection on what the exercise revealed. There is no skipping. That is not a restriction — it is the design."]
          .map((p, i) => <p key={i} style={{ lineHeight: 1.8, fontSize: 15, marginBottom: 14, color: "#3a2e1a" }}>{p}</p>)}
      </div>

      {/* Books list */}
      <div style={{ marginBottom: 48 }}>
        {BOOKS.map((book, bi) => {
          const bookDone = book.modules.filter(m => progress[m.id]?.completed).length;
          const available = bi === 0 || BOOKS[bi - 1].modules.every(m => progress[m.id]?.completed);
          return (
            <div key={book.number} style={{ display: "flex", gap: 20, padding: "16px 0", borderBottom: `1px solid ${C.border}`, opacity: available ? 1 : 0.4 }}>
              <div style={{ flexShrink: 0, width: 32, paddingTop: 3, fontSize: 12, color: C.gold, letterSpacing: "0.1em" }}>{book.number}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
                  <h3 style={{ margin: 0, fontWeight: "normal", fontSize: 17, letterSpacing: "0.03em" }}>{book.title}</h3>
                  {available && <span style={{ fontSize: 11, color: C.gold }}>{bookDone}/{book.modules.length}</span>}
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8a7a5a", fontStyle: "italic" }}>{book.subtitle}</p>
              </div>
            </div>
          );
        })}
        {/* Book VI Coming Soon */}
        <div style={{ display: "flex", gap: 20, padding: "16px 0", borderBottom: `1px solid ${C.border}`, opacity: 0.3 }}>
          <div style={{ flexShrink: 0, width: 32, paddingTop: 3, fontSize: 12, color: C.gold, letterSpacing: "0.1em" }}>VI</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontWeight: "normal", fontSize: 17 }}>The Long Form</h3>
              <span style={{ fontSize: 9, letterSpacing: "0.12em", color: C.gold, border: `1px solid ${C.gold}44`, padding: "2px 7px" }}>COMING SOON</span>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8a7a5a", fontStyle: "italic" }}>Scene, POV, and the Architecture of Fiction</p>
          </div>
        </div>
      </div>

      {/* Pricing comparison */}
      <div style={{ background: C.parchment, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.gold}`, padding: "24px 20px", marginBottom: 48 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.25em", color: C.gold, marginBottom: 20, textTransform: "uppercase" }}>What This Replaces</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 16 }}>
          {[
            { name: "Tin House Workshop", cost: "$2,500", note: "Per week + travel" },
            { name: "Kenyon Review", cost: "$2,545", note: "Per session + housing" },
            { name: "Bread Loaf", cost: "$3,000+", note: "Competitive admission" },
            { name: "The Press", cost: "$49", note: "One-time · self-paced · no application", highlight: true },
          ].map(item => (
            <div key={item.name} style={{ textAlign: "center", padding: "14px 10px", background: item.highlight ? C.ink : "transparent", borderRadius: 2 }}>
              <div style={{ fontSize: 11, color: item.highlight ? C.gold : "#8a7a5a", marginBottom: 6, lineHeight: 1.4 }}>{item.name}</div>
              <div style={{ fontSize: 20, color: item.highlight ? C.cream : C.ink, marginBottom: 4 }}>{item.cost}</div>
              <div style={{ fontSize: 10, color: item.highlight ? "#9a8a6a" : "#aaa", fontStyle: "italic" }}>{item.note}</div>
            </div>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "#8a7a5a", fontStyle: "italic", lineHeight: 1.6 }}>
          The same craft sequence. No application, no acceptance rate, no schedule to keep.
        </p>
      </div>

      {/* Testimonials — curated by hand. Add approved feedback below. */}
      {TESTIMONIALS.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <div style={{ width: 40, height: 1, background: `linear-gradient(90deg,transparent,${C.gold},transparent)`, margin: "0 auto 28px" }} />
          <div style={{ fontSize: 10, letterSpacing: "0.3em", color: C.gold, textAlign: "center", marginBottom: 24, textTransform: "uppercase" }}>From Writers</div>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{ marginBottom: 28, paddingBottom: 28, borderBottom: i < TESTIMONIALS.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <p style={{ fontStyle: "italic", fontSize: 15, lineHeight: 1.8, color: "#3a2e1a", margin: "0 0 10px" }}>"{t.quote}"</p>
              <div style={{ fontSize: 11, color: C.gold, letterSpacing: "0.1em" }}>— {t.name}{t.context ? `, ${t.context}` : ""}</div>
            </div>
          ))}
          <div style={{ width: 40, height: 1, background: `linear-gradient(90deg,transparent,${C.gold},transparent)`, margin: "28px auto 0" }} />
        </div>
      )}

      {/* CTA */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Btn gold onClick={onStart} style={{ padding: "14px 40px", fontSize: 13 }}>
          {inProgress ? `Continue → Module ${done + 1}` : "Begin →"}
        </Btn>
        {!inProgress && (
          <p style={{ marginTop: 10, fontSize: 11, color: "#8a7a5a", fontFamily: "'Courier New', monospace", letterSpacing: "0.08em" }}>
            $49 one-time · includes Editorial Review tool · self-paced
          </p>
        )}
      </div>

      {/* Feedback link */}
      <div style={{ textAlign: "center" }}>
        <button onClick={onFeedback} style={{ background: "none", border: "none", cursor: "pointer", color: "#bba87a", fontSize: 11, fontFamily: "'Courier New', monospace", letterSpacing: "0.1em", textDecoration: "underline", textDecorationColor: "#bba87a55", padding: 0 }}>
          Leave feedback on The Press
        </button>
      </div>
    </div>
  );
}

// ── Table of Contents ─────────────────────────────────────────────────────────
function TOC({ progress, onSelect }) {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 80px" }}>
      {BOOKS.map((book, bi) => {
        const available = bi === 0 || BOOKS[bi - 1].modules.every(m => progress[m.id]?.completed);
        return (
          <div key={book.number} style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 11, color: C.gold, letterSpacing: "0.2em" }}>Book {book.number}</span>
              <span style={{ fontSize: 15, fontWeight: "normal" }}>{book.title}</span>
            </div>
            {book.modules.map((m, mi) => {
              const modAvail = available && (mi === 0 || progress[book.modules[mi - 1].id]?.completed);
              const done = progress[m.id]?.completed;
              return (
                <button key={m.id} onClick={() => modAvail && onSelect(m.id)} style={{
                  display: "flex", alignItems: "center", gap: 14, width: "100%",
                  background: "none", border: "none", padding: "10px 0",
                  borderBottom: `1px solid ${C.border}22`, textAlign: "left",
                  opacity: modAvail ? 1 : 0.35, cursor: modAvail ? "pointer" : "default",
                }}>
                  <span style={{ fontSize: 10, color: done ? C.gold : "#888", fontFamily: mono, minWidth: 20 }}>{String(m.id).padStart(2, "0")}</span>
                  <span style={{ fontSize: 15, color: done ? C.ink : "#5a4a2a", flex: 1 }}>{m.title}</span>
                  {done && <span style={{ color: C.gold, fontSize: 12 }}>✦</span>}
                  {modAvail && !done && <span style={{ color: C.gold, fontSize: 11 }}>→</span>}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── Module Page ───────────────────────────────────────────────────────────────
function ModulePage({ module, book, progress, onComplete, onBack }) {
  const [reflection, setReflection] = useState(progress[module.id]?.reflection || "");
  const timer = useTimer(module.timer);
  const done = progress[module.id]?.completed;
  const canComplete = reflection.trim().length >= 60;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px 80px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: C.gold, fontSize: 12, letterSpacing: "0.15em", padding: 0, marginBottom: 28, fontFamily: mono, textTransform: "uppercase" }}>← Back</button>

      <div style={{ fontSize: 10, letterSpacing: "0.25em", color: C.gold, marginBottom: 6, textTransform: "uppercase" }}>
        Book {book.number} · Module {module.id}
      </div>
      <h2 style={{ fontSize: "clamp(22px,5vw,34px)", fontWeight: "normal", margin: "0 0 28px", paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>{module.title}</h2>

      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.25em", color: C.gold, marginBottom: 14, textTransform: "uppercase" }}>Craft Brief</div>
        {module.brief.split("\n\n").map((p, i) => (
          <p key={i} style={{ lineHeight: 1.85, fontSize: 15, marginBottom: 14, color: "#2a2010" }}>{p}</p>
        ))}
      </div>

      <div style={{ background: C.parchment, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.gold}`, padding: "16px 20px", marginBottom: 36 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.25em", color: C.gold, marginBottom: 10, textTransform: "uppercase" }}>Reading Anchor</div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, fontStyle: "italic", color: "#3a2e1a" }}>{module.anchor.title}</p>
        {module.anchor.url && (
          <a href={module.anchor.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 10, fontSize: 11, letterSpacing: "0.15em", color: C.gold, textDecoration: "none", textTransform: "uppercase" }}>Find it →</a>
        )}
      </div>

      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.25em", color: C.gold, marginBottom: 14, textTransform: "uppercase" }}>Exercise</div>
        <p style={{ lineHeight: 1.8, fontSize: 14, color: "#2a2010", padding: "16px 20px", background: "#ede5d0", borderLeft: `2px solid ${C.border}`, margin: 0 }}>{module.exercise}</p>
      </div>

      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.25em", color: C.gold, marginBottom: 14, textTransform: "uppercase" }}>Timer — {module.timer} min</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 36, fontFamily: mono, color: timer.done ? C.rust : timer.running ? C.ink : "#8a7a5a", minWidth: 90 }}>{timer.fmt}</span>
          <div style={{ display: "flex", gap: 8 }}>
            {!timer.running && !timer.done && <Btn small onClick={timer.start}>Start</Btn>}
            {timer.running && <Btn small onClick={timer.pause}>Pause</Btn>}
            {(timer.running || timer.done) && <Btn small onClick={() => timer.reset(module.timer)}>Reset</Btn>}
          </div>
          {timer.done && <span style={{ fontSize: 12, color: C.rust, letterSpacing: "0.1em" }}>Time complete</span>}
        </div>
      </div>

      {!done && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.25em", color: C.gold, marginBottom: 12, textTransform: "uppercase" }}>Reflection (min. 60 chars)</div>
          <textarea
            value={reflection} onChange={e => setReflection(e.target.value)}
            placeholder="What did the exercise reveal about the craft principle? What did you discover you didn't know you knew?"
            style={{ width: "100%", minHeight: 140, background: "#faf7f0", border: `1px solid ${C.border}`, borderRadius: 2, fontFamily: serif, fontSize: 14, lineHeight: 1.7, padding: "14px 16px", resize: "vertical", outline: "none", color: C.ink, boxSizing: "border-box" }}
          />
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <Btn gold onClick={() => onComplete(module.id, reflection)} disabled={!canComplete}>Mark Complete →</Btn>
            <span style={{ fontSize: 11, color: "#8a7a5a", fontFamily: mono }}>{reflection.trim().length}/60</span>
          </div>
        </div>
      )}

      {done && (
        <div style={{ background: C.parchment, border: `1px solid ${C.gold}44`, borderLeft: `3px solid ${C.gold}`, padding: "16px 20px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", color: C.gold, marginBottom: 8 }}>COMPLETE</div>
          <p style={{ margin: 0, fontStyle: "italic", fontSize: 14, color: "#3a2e1a", lineHeight: 1.6 }}>{reflection}</p>
        </div>
      )}
    </div>
  );
}

// ── Certificate ───────────────────────────────────────────────────────────────
function Certificate() {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 80px" }}>
      <div style={{ border: `2px solid ${C.gold}`, padding: "48px 32px", textAlign: "center", background: `linear-gradient(135deg,#faf7f0,${C.cream},#f0ead8)`, position: "relative" }}>
        {["top-left","top-right","bottom-left","bottom-right"].map(pos => (
          <div key={pos} style={{ position: "absolute", top: pos.includes("top") ? 10 : "auto", bottom: pos.includes("bottom") ? 10 : "auto", left: pos.includes("left") ? 10 : "auto", right: pos.includes("right") ? 10 : "auto", fontSize: 16, color: C.gold, opacity: 0.5 }}>✦</div>
        ))}
        <div style={{ fontSize: 10, letterSpacing: "0.35em", color: C.gold, marginBottom: 16, textTransform: "uppercase" }}>The Press Literary Workshop</div>
        <div style={{ width: 60, height: 1, background: `linear-gradient(90deg,transparent,${C.gold},transparent)`, margin: "0 auto 24px" }} />
        <h2 style={{ fontWeight: "normal", fontSize: 13, letterSpacing: "0.25em", color: "#6b5c3e", margin: "0 0 24px", textTransform: "uppercase" }}>This certifies that</h2>
        <div style={{ fontSize: "clamp(24px,6vw,44px)", letterSpacing: "0.08em", color: C.ink, margin: "0 0 24px", fontStyle: "italic" }}>The Writer</div>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: "#3a2e1a", maxWidth: 400, margin: "0 auto 24px" }}>
          has completed all five books of <em>The Press</em> — twenty modules of craft study, practice, and reflection drawn from the tradition of the serious literary workshop.
        </p>
        <div style={{ width: 60, height: 1, background: `linear-gradient(90deg,transparent,${C.gold},transparent)`, margin: "0 auto 24px" }} />
        <div style={{ display: "flex", justifyContent: "center", gap: 28, marginBottom: 32, flexWrap: "wrap" }}>
          {BOOKS.map(b => (
            <div key={b.number} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, color: C.gold, marginBottom: 4 }}>✦</div>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#6b5c3e", textTransform: "uppercase" }}>Book {b.number}</div>
              <div style={{ fontSize: 12, color: C.ink, marginTop: 2 }}>{b.title}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, fontStyle: "italic", color: "#8a7a5a", marginTop: 16 }}>{today}</div>
        <div style={{ marginTop: 24, fontSize: 12, fontStyle: "italic", color: "#8a7a5a" }}>"The work is never finished. It is only abandoned — or sent."</div>
      </div>
      <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#8a7a5a", fontStyle: "italic" }}>
        Use your browser's print or share function to save this certificate as a PDF.
      </div>
    </div>
  );
}

// ── Editorial Review ──────────────────────────────────────────────────────────
function SubmissionItem({ sub, onStatus, onDelete }) {
  const [open, setOpen] = useState(false);
  const col = STATUS_COLORS[sub.status] || "#555";
  return (
    <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderLeft: `3px solid ${col}`, borderRadius: 2, padding: "14px 16px", marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ color: "#e8d5a3", fontFamily: serif, fontSize: 14 }}>{sub.title}</span>
            <span style={{ fontSize: 9, letterSpacing: "0.1em", color: col, border: `1px solid ${col}44`, padding: "2px 6px", textTransform: "uppercase", flexShrink: 0 }}>{sub.status}</span>
          </div>
          <div style={{ color: "#555", fontSize: 11, fontFamily: mono }}>→ {sub.journal} · {sub.date}</div>
          {sub.notes && <div style={{ color: "#333", fontSize: 10, marginTop: 4, fontStyle: "italic" }}>{sub.notes.slice(0, 80)}{sub.notes.length > 80 ? "…" : ""}</div>}
        </div>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {sub.coverLetter && (
            <button onClick={() => setOpen(o => !o)} style={{ background: "none", color: "#444", border: "1px solid #1a1a1a", borderRadius: 2, padding: "3px 8px", fontFamily: mono, fontSize: 9, cursor: "pointer" }}>
              {open ? "▲" : "Letter"}
            </button>
          )}
          <select value={sub.status} onChange={e => onStatus(sub.id, e.target.value)} style={{ background: "#0d0d0d", color: "#555", border: "1px solid #1a1a1a", borderRadius: 2, padding: "3px 6px", fontFamily: mono, fontSize: 9, outline: "none", cursor: "pointer" }}>
            {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => onDelete(sub.id)} style={{ background: "none", color: "#333", border: "1px solid #111", borderRadius: 2, padding: "3px 8px", fontFamily: mono, fontSize: 9, cursor: "pointer" }}>×</button>
        </div>
      </div>
      {open && sub.coverLetter && (
        <div style={{ marginTop: 12, padding: "12px 14px", background: "#050505", border: "1px solid #111", borderRadius: 2, fontFamily: serif, fontSize: 13, lineHeight: 1.7, color: "#888", whiteSpace: "pre-wrap" }}>
          {sub.coverLetter}
        </div>
      )}
    </div>
  );
}

function EditorialReview() {
  const [tab, setTab] = useState("review"); // review | tracker
  const [piece, setPiece] = useState("");
  const [pieceType, setPieceType] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState({});
  const [readiness, setReadiness] = useState("");
  const [justification, setJustification] = useState("");
  const [verdictLocked, setVerdictLocked] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [letter, setLetter] = useState("");
  const [letterLoading, setLetterLoading] = useState(false);
  const [letterShown, setLetterShown] = useState(false);
  const [subs, setSubs] = useState(loadSubs);
  const [showAdd, setShowAdd] = useState(false);
  const [newSub, setNewSub] = useState({ title: "", journal: "", status: "drafting", coverLetter: "", notes: "" });

  const allScored = CRITERIA.every(c => scores[c.id] > 0);
  const canLock = readiness && justification.trim().length > 40;
  const radarData = CRITERIA.map(c => ({ subject: c.short, score: scores[c.id] || 0, fullMark: 5 }));
  const sortedByScore = [...CRITERIA].sort((a, b) => (scores[a.id] || 0) - (scores[b.id] || 0));
  const lowestTwo = sortedByScore.slice(0, 2);

  const updateSubs = list => { setSubs(list); saveSubs(list); };

  const addSub = () => {
    if (!newSub.title.trim() || !newSub.journal.trim()) return;
    updateSubs([...subs, { ...newSub, id: Date.now(), date: new Date().toISOString().split("T")[0] }]);
    setNewSub({ title: "", journal: "", status: "drafting", coverLetter: "", notes: "" });
    setShowAdd(false);
  };

  const generateLetter = async () => {
    setLetterLoading(true);
    setLetterShown(true);
    setLetter("");
    const block = CRITERIA.map(c => `${c.label} (${scores[c.id] || 0}/5)${notes[c.id] ? `: ${notes[c.id]}` : ""}`).join("\n");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: `You are a senior literary editor writing a craft letter. Write 4–6 paragraphs responding to this piece and self-assessment. Be specific and honest. No bullet points. Begin with the piece's strongest quality. Name its central problem. End with one revision priority. Sign as "The Editor."\n\nWRITING TYPE: ${pieceType || "Unspecified"}\n\nPIECE:\n${piece.slice(0, 2000)}\n\nSELF-ASSESSMENT:\n${block}\n\nVERDICT: ${readiness} — "${justification}"` }],
        }),
      });
      const data = await res.json();
      setLetter(data.content?.map(b => b.text || "").join("") || "Unable to generate at this time.");
    } catch { setLetter("Connection error. Please try again."); }
    setLetterLoading(false);
  };

  const reset = () => {
    setPiece(""); setPieceType(""); setSubmitted(false); setActiveCard(0);
    setScores({}); setNotes({}); setReadiness(""); setJustification("");
    setVerdictLocked(false); setShowResults(false); setLetter(""); setLetterShown(false);
  };

  const ta = (val, set, placeholder, rows = 3) => (
    <textarea value={val} onChange={e => set(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", minHeight: rows * 24 + 16, background: "#050505", border: "1px solid #1a1a1a", borderRadius: 2, color: "#ccc", fontFamily: serif, fontSize: 13, lineHeight: 1.7, padding: "10px 12px", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
  );

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#ccc", fontFamily: mono }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #111", padding: "20px 20px 0", background: "#070707", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#444", marginBottom: 4 }}>EDITORIAL SELF-REVIEW</div>
        <div style={{ fontFamily: serif, fontSize: 20, color: "#e8d5a3", marginBottom: 14 }}>The Senior Editor's Eye</div>
        <div style={{ display: "flex", gap: 0 }}>
          {[{ key: "review", label: "Self-Review" }, { key: "tracker", label: `Tracker${subs.length ? ` (${subs.length})` : ""}` }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              background: "none", border: "none", borderBottom: tab === t.key ? "2px solid #c8a96e" : "2px solid transparent",
              color: tab === t.key ? "#c8a96e" : "#444", fontFamily: mono, fontSize: 10,
              letterSpacing: "0.15em", textTransform: "uppercase", padding: "6px 14px 10px", cursor: "pointer",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 80px" }}>

        {/* ── TRACKER TAB ── */}
        {tab === "tracker" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 12 }}>
              <p style={{ margin: 0, color: "#556", fontFamily: serif, fontSize: 13, fontStyle: "italic", lineHeight: 1.6 }}>
                Track pieces, journals, cover letters. Built for the gap between finished draft and sent.
              </p>
              <button onClick={() => setShowAdd(o => !o)} style={{ background: showAdd ? "#111" : "#c8a96e", color: showAdd ? "#444" : "#000", border: "none", borderRadius: 2, padding: "8px 16px", fontFamily: mono, fontSize: 10, letterSpacing: "0.12em", cursor: "pointer", flexShrink: 0 }}>
                {showAdd ? "Cancel" : "+ Add"}
              </button>
            </div>

            {showAdd && (
              <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderLeft: "3px solid #c8a96e44", borderRadius: 2, padding: 20, marginBottom: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "#444", marginBottom: 6 }}>PIECE TITLE</div>
                    <input value={newSub.title} onChange={e => setNewSub(s => ({ ...s, title: e.target.value }))} placeholder="Title of piece" style={{ width: "100%", background: "#050505", border: "1px solid #1a1a1a", borderRadius: 2, color: "#ccc", fontFamily: mono, fontSize: 12, padding: "7px 10px", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "#444", marginBottom: 6 }}>TARGET JOURNAL</div>
                    <input value={newSub.journal} onChange={e => setNewSub(s => ({ ...s, journal: e.target.value }))} placeholder="e.g. Tin House" style={{ width: "100%", background: "#050505", border: "1px solid #1a1a1a", borderRadius: 2, color: "#ccc", fontFamily: mono, fontSize: 12, padding: "7px 10px", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "#444", marginBottom: 8 }}>STATUS</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {Object.keys(STATUS_COLORS).map(s => (
                      <button key={s} onClick={() => setNewSub(n => ({ ...n, status: s }))} style={{ background: newSub.status === s ? "#c8a96e22" : "none", color: newSub.status === s ? "#c8a96e" : "#444", border: `1px solid ${newSub.status === s ? "#c8a96e44" : "#1a1a1a"}`, borderRadius: 2, padding: "4px 10px", fontFamily: mono, fontSize: 10, cursor: "pointer" }}>{s}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "#444", marginBottom: 6 }}>COVER LETTER (optional)</div>
                  {ta(newSub.coverLetter, v => setNewSub(s => ({ ...s, coverLetter: v })), "Paste or draft your cover letter...", 4)}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "#444", marginBottom: 6 }}>NOTES</div>
                  {ta(newSub.notes, v => setNewSub(s => ({ ...s, notes: v })), "Submission windows, word counts, past history...", 2)}
                </div>
                <button onClick={addSub} disabled={!newSub.title.trim() || !newSub.journal.trim()} style={{ background: (newSub.title.trim() && newSub.journal.trim()) ? "#c8a96e" : "#111", color: (newSub.title.trim() && newSub.journal.trim()) ? "#000" : "#333", border: "none", borderRadius: 2, padding: "8px 20px", fontFamily: mono, fontSize: 10, letterSpacing: "0.12em", cursor: "pointer" }}>
                  Add to Tracker →
                </button>
              </div>
            )}

            {subs.length === 0 && !showAdd && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#2a2a2a", fontFamily: serif, fontSize: 15, fontStyle: "italic" }}>No pieces tracked yet. Add your first.</div>
            )}

            {subs.map(sub => (
              <SubmissionItem key={sub.id} sub={sub}
                onStatus={(id, s) => updateSubs(subs.map(x => x.id === id ? { ...x, status: s } : x))}
                onDelete={id => updateSubs(subs.filter(x => x.id !== id))}
              />
            ))}

            {subs.length > 0 && (
              <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[
                  { label: "Total", count: subs.length, col: "#444" },
                  { label: "In Progress", count: subs.filter(s => ["drafting","revising"].includes(s.status)).length, col: "#6a6a9a" },
                  { label: "Submitted", count: subs.filter(s => s.status === "submitted").length, col: "#9a7a3f" },
                  { label: "Accepted", count: subs.filter(s => s.status === "accepted").length, col: "#3a8a5a" },
                ].map(stat => (
                  <div key={stat.label} style={{ background: "#080808", border: `1px solid #111`, borderLeft: `2px solid ${stat.col}`, padding: "10px 12px", borderRadius: 2 }}>
                    <div style={{ color: stat.col, fontSize: 20 }}>{stat.count}</div>
                    <div style={{ color: "#333", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── REVIEW TAB ── */}
        {tab === "review" && (
          <>
            {/* Disclosure */}
            <div style={{ background: "#07070a", border: "1px solid #1c1c2a", borderLeft: "3px solid #4a4a8a", borderRadius: 2, padding: "16px 18px", marginBottom: 24 }}>
              <div style={{ color: "#6a6aaa", fontSize: 10, letterSpacing: "0.18em", marginBottom: 8 }}>AI DISCLOSURE & INTENDED USE</div>
              <p style={{ color: "#778", fontFamily: serif, fontSize: 13, lineHeight: 1.7, margin: "0 0 8px", fontStyle: "italic" }}>
                This tool uses AI-assisted criteria drawn from editorial standards at literary journals — adapted from reading practices of senior editors at <em>The Paris Review</em>, <em>Ploughshares</em>, <em>Tin House</em>, and <em>Kenyon Review</em>.
              </p>
              <p style={{ color: "#556", fontFamily: mono, fontSize: 11, lineHeight: 1.6, margin: 0 }}>
                ⚠ Practice and self-study tool only. Not a substitute for human editorial feedback. Do not use as basis for formal submission decisions.
              </p>
            </div>

            {/* Piece input */}
            {!submitted ? (
              <div>
                <p style={{ color: "#555", fontSize: 13, lineHeight: 1.7, marginBottom: 16, fontFamily: serif, fontStyle: "italic" }}>
                  Paste your writing below — poem, essay, flash fiction, lyric prose, or any form. You will evaluate it across eight editorial parameters.
                </p>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#444", marginBottom: 8 }}>WRITING TYPE (optional)</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {WRITING_TYPES.map(t => (
                      <button key={t} onClick={() => setPieceType(t === pieceType ? "" : t)} style={{ background: pieceType === t ? "#c8a96e22" : "none", color: pieceType === t ? "#c8a96e" : "#444", border: `1px solid ${pieceType === t ? "#c8a96e44" : "#1a1a1a"}`, borderRadius: 2, padding: "4px 10px", fontFamily: mono, fontSize: 10, cursor: "pointer" }}>{t}</button>
                    ))}
                  </div>
                </div>
                <textarea value={piece} onChange={e => setPiece(e.target.value)} placeholder="Paste your writing here..."
                  style={{ width: "100%", minHeight: 240, background: "#080808", border: "1px solid #1e1e1e", borderLeft: "3px solid #c8a96e33", borderRadius: 2, color: "#ddd", fontFamily: serif, fontSize: 15, lineHeight: 1.8, padding: "18px 20px", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                <div style={{ marginTop: 12 }}>
                  <Btn gold onClick={() => { if (piece.trim().length > 20) setSubmitted(true); }} disabled={piece.trim().length <= 20}>Begin Review →</Btn>
                </div>
              </div>
            ) : (
              <div>
                {/* Piece preview */}
                <div style={{ background: "#080808", border: "1px solid #111", borderLeft: "3px solid #c8a96e22", borderRadius: 2, padding: "14px 16px", marginBottom: 24, maxHeight: 130, overflowY: "auto" }}>
                  <div style={{ color: "#333", fontSize: 10, letterSpacing: "0.12em", marginBottom: 6 }}>{pieceType ? pieceType.toUpperCase() : "PIECE"} UNDER REVIEW</div>
                  <pre style={{ margin: 0, fontFamily: serif, fontSize: 12, lineHeight: 1.7, color: "#777", whiteSpace: "pre-wrap" }}>{piece}</pre>
                </div>

                {/* Progress dots */}
                <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
                  {CRITERIA.map((c, i) => (
                    <button key={c.id} onClick={() => setActiveCard(i)} title={c.label} style={{ width: 22, height: 22, borderRadius: 2, background: scores[c.id] ? "#c8a96e" : activeCard === i ? "#c8a96e22" : "#0f0f0f", border: `1px solid ${scores[c.id] ? "#c8a96e" : activeCard === i ? "#c8a96e66" : "#1a1a1a"}`, cursor: "pointer", fontSize: 9, color: scores[c.id] ? "#000" : "#444", fontFamily: mono }}>{i + 1}</button>
                  ))}
                </div>

                {/* Radar */}
                <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 2, padding: "16px 12px", marginBottom: 24 }}>
                  <div style={{ color: "#333", fontSize: 10, letterSpacing: "0.12em", marginBottom: 12 }}>SCORE PROFILE</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#1a1a1a" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#555", fontSize: 9, fontFamily: mono }} />
                      <Radar dataKey="score" stroke="#c8a96e" fill="#c8a96e" fillOpacity={0.12} strokeWidth={1.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Criterion card */}
                {(() => {
                  const c = CRITERIA[activeCard];
                  if (!c) return null;
                  const score = scores[c.id] || 0;
                  const note = notes[c.id] || "";
                  return (
                    <div style={{ background: "#0f0f0f", border: "1px solid #c8a96e", borderLeft: "3px solid #c8a96e", borderRadius: 2, padding: "18px 18px", marginBottom: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div>
                          <div style={{ color: "#333", fontSize: 10, fontFamily: mono, marginBottom: 4 }}>{String(activeCard + 1).padStart(2, "0")} / {CRITERIA.length}</div>
                          <div style={{ color: "#e8d5a3", fontFamily: serif, fontSize: 16 }}>{c.label}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          {activeCard > 0 && <button onClick={() => setActiveCard(activeCard - 1)} style={{ background: "none", color: "#444", border: "1px solid #1a1a1a", borderRadius: 2, padding: "4px 10px", fontFamily: mono, fontSize: 10, cursor: "pointer" }}>←</button>}
                          {activeCard < CRITERIA.length - 1 && <button onClick={() => setActiveCard(activeCard + 1)} style={{ background: "none", color: "#444", border: "1px solid #1a1a1a", borderRadius: 2, padding: "4px 10px", fontFamily: mono, fontSize: 10, cursor: "pointer" }}>→</button>}
                        </div>
                      </div>
                      <p style={{ color: "#aaa", fontFamily: serif, fontSize: 13, lineHeight: 1.6, marginBottom: 6, fontStyle: "italic" }}>{c.question}</p>
                      <p style={{ color: "#555", fontSize: 11, fontFamily: mono, marginBottom: 16 }}>→ {c.prompt}</p>
                      {/* Stars */}
                      <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
                        {[1,2,3,4,5].map(s => (
                          <button key={s} onClick={() => setScores(sc => ({ ...sc, [c.id]: s }))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 24, color: s <= score ? "#c8a96e" : "#2a2a2a", padding: 0, transition: "color 0.1s" }}>
                            {s <= score ? "◆" : "◇"}
                          </button>
                        ))}
                        <span style={{ color: "#666", fontSize: 12, fontFamily: mono, marginLeft: 4 }}>{score ? `${score}/5` : "—"}</span>
                      </div>
                      <textarea value={note} onChange={e => setNotes(n => ({ ...n, [c.id]: e.target.value }))} placeholder="Your notes..."
                        style={{ width: "100%", minHeight: 80, background: "#050505", border: "1px solid #222", borderRadius: 2, color: "#ccc", fontFamily: mono, fontSize: 12, lineHeight: 1.6, padding: 10, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                    </div>
                  );
                })()}

                {/* Revision readiness */}
                {allScored && !showResults && (
                  <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderLeft: "3px solid #c8a96e", borderRadius: 2, padding: "18px 18px", marginBottom: 20 }}>
                    <div style={{ color: "#c8a96e", fontSize: 11, letterSpacing: "0.12em", marginBottom: 4 }}>09 — REVISION READINESS</div>
                    <p style={{ color: "#888", fontFamily: serif, fontSize: 13, fontStyle: "italic", marginBottom: 16 }}>Based on the above: where does this piece stand? Justify your answer before this locks.</p>
                    <p style={{ color: "#4a4a6a", fontFamily: mono, fontSize: 10, marginBottom: 14 }}>⚠ This verdict is for your own study. Do not use it as the basis for submission decisions.</p>
                    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                      {READINESS.map(r => (
                        <button key={r.value} onClick={() => !verdictLocked && setReadiness(r.value)} disabled={verdictLocked} style={{ background: readiness === r.value ? "#c8a96e" : "#0d0d0d", color: readiness === r.value ? "#000" : "#555", border: `1px solid ${readiness === r.value ? "#c8a96e" : "#222"}`, borderRadius: 2, padding: "7px 14px", fontFamily: mono, fontSize: 11, cursor: verdictLocked ? "default" : "pointer" }}>{r.label}</button>
                      ))}
                    </div>
                    {readiness && !verdictLocked && (
                      <>
                        <textarea value={justification} onChange={e => setJustification(e.target.value)} placeholder="Justify your verdict. Minimum 40 characters before this locks..."
                          style={{ width: "100%", minHeight: 80, background: "#050505", border: "1px solid #222", borderRadius: 2, color: "#ccc", fontFamily: serif, fontSize: 13, lineHeight: 1.6, padding: 12, resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: 10 }} />
                        <Btn onClick={() => canLock && setVerdictLocked(true)} disabled={!canLock}>Lock Verdict</Btn>
                      </>
                    )}
                    {verdictLocked && (
                      <div>
                        <div style={{ background: "#050505", border: "1px solid #1a1a1a", borderRadius: 2, padding: 12, marginBottom: 16 }}>
                          <div style={{ color: "#444", fontSize: 10, letterSpacing: "0.1em", marginBottom: 6 }}>VERDICT LOCKED</div>
                          <p style={{ margin: 0, color: "#aaa", fontFamily: serif, fontSize: 13, fontStyle: "italic", lineHeight: 1.6 }}>"{justification}"</p>
                        </div>
                        <Btn gold onClick={() => setShowResults(true)}>View Full Assessment →</Btn>
                      </div>
                    )}
                  </div>
                )}

                {/* Priority panel */}
                {allScored && (
                  <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderLeft: "3px solid #8b3a3a", borderRadius: 2, padding: "14px 16px", marginBottom: 20 }}>
                    <div style={{ color: "#8b3a3a", fontSize: 10, letterSpacing: "0.12em", marginBottom: 10 }}>REVISION PRIORITIES</div>
                    {lowestTwo.map(c => (
                      <div key={c.id} style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#bbb", fontFamily: serif, fontSize: 13 }}>{c.label}</span>
                          <span style={{ color: "#8b3a3a", fontSize: 11, fontFamily: mono }}>{scores[c.id]}/5</span>
                        </div>
                        {notes[c.id] && <p style={{ color: "#555", fontSize: 11, fontFamily: serif, fontStyle: "italic", margin: "3px 0 0", lineHeight: 1.4 }}>"{notes[c.id].slice(0, 80)}{notes[c.id].length > 80 ? "…" : ""}"</p>}
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={reset} style={{ background: "none", color: "#333", border: "1px solid #1a1a1a", borderRadius: 2, padding: 8, fontFamily: mono, fontSize: 10, letterSpacing: "0.1em", cursor: "pointer", width: "100%" }}>RESET</button>
              </div>
            )}

            {/* Results overlay */}
            {showResults && (
              <div style={{ position: "fixed", inset: 0, background: "#030303ee", zIndex: 200, overflowY: "auto", padding: "32px 20px" }}>
                <div style={{ maxWidth: 680, margin: "0 auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                    <div>
                      <div style={{ color: "#444", fontSize: 10, letterSpacing: "0.18em", marginBottom: 4 }}>ASSESSMENT COMPLETE</div>
                      <h2 style={{ margin: 0, fontFamily: serif, fontWeight: "normal", fontSize: 22, color: "#e8d5a3" }}>{READINESS.find(r => r.value === readiness)?.label}</h2>
                    </div>
                    <button onClick={() => setShowResults(false)} style={{ background: "none", border: "1px solid #222", color: "#555", padding: "8px 14px", cursor: "pointer", fontFamily: mono, fontSize: 11, borderRadius: 2 }}>← Back</button>
                  </div>

                  <div style={{ background: "#07070a", border: "1px solid #1c1c2a", borderLeft: "3px solid #4a4a8a", borderRadius: 2, padding: "10px 14px", marginBottom: 20 }}>
                    <p style={{ color: "#4a4a8a", fontFamily: mono, fontSize: 10, letterSpacing: "0.1em", margin: 0 }}>AI-ASSISTED PRACTICE TOOL — Not for use as basis for formal submission decisions.</p>
                  </div>

                  <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 2, padding: "14px 16px", marginBottom: 20, fontFamily: serif, fontSize: 14, fontStyle: "italic", color: "#aaa", lineHeight: 1.7 }}>
                    "{justification}"
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <ResponsiveContainer width="100%" height={220}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#1a1a1a" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#666", fontSize: 10, fontFamily: mono }} />
                        <Radar dataKey="score" stroke="#c8a96e" fill="#c8a96e" fillOpacity={0.15} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {CRITERIA.map((c, i) => (
                    <div key={c.id} style={{ borderBottom: "1px solid #0f0f0f", padding: "14px 0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 4 }}>
                        <span style={{ color: lowestTwo.some(l => l.id === c.id) ? "#c87070" : "#aaa", fontFamily: serif, fontSize: 13 }}>
                          {c.label}{lowestTwo.some(l => l.id === c.id) && <span style={{ color: "#8b3a3a", fontSize: 10, marginLeft: 6 }}>↑ PRIORITY</span>}
                        </span>
                        <div style={{ display: "flex", gap: 2 }}>
                          {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= scores[c.id] ? "#c8a96e" : "#1a1a1a", fontSize: 12 }}>◆</span>)}
                        </div>
                      </div>
                      <div style={{ color: "#666", fontFamily: serif, fontSize: 13, fontStyle: notes[c.id] ? "italic" : "normal", lineHeight: 1.5 }}>
                        {notes[c.id] || <span style={{ color: "#2a2a2a" }}>No notes recorded.</span>}
                      </div>
                    </div>
                  ))}

                  {/* AI Editor's Letter */}
                  <div style={{ marginTop: 36, borderTop: "1px solid #111", paddingTop: 28 }}>
                    <div style={{ color: "#6a6aaa", fontSize: 10, letterSpacing: "0.18em", marginBottom: 4 }}>THE EDITOR'S LETTER — AI CRAFT RESPONSE</div>
                    <p style={{ color: "#556", fontFamily: serif, fontSize: 12, fontStyle: "italic", lineHeight: 1.6, marginBottom: 16 }}>
                      An AI-generated craft letter responding to your piece and self-assessment. Uses editorial standards drawn from <em>The Paris Review</em>, <em>Ploughshares</em>, <em>Tin House</em>, and <em>Kenyon Review</em>. Practice tool only.
                    </p>
                    {!letterShown && (
                      <button onClick={generateLetter} style={{ background: "#c8a96e", color: "#000", border: "none", borderRadius: 2, padding: "10px 24px", fontFamily: mono, fontSize: 11, letterSpacing: "0.15em", cursor: "pointer" }}>
                        Generate Editor's Letter →
                      </button>
                    )}
                    {letterShown && (
                      <div style={{ background: "#07070a", border: "1px solid #1c1c2a", borderLeft: "3px solid #4a4a8a", borderRadius: 2, padding: "24px 20px" }}>
                        {letterLoading && <div style={{ color: "#4a4a8a", fontFamily: mono, fontSize: 11, letterSpacing: "0.1em" }}>Reading your work…</div>}
                        {letter && !letterLoading && (
                          <>
                            <div style={{ color: "#4a4a6a", fontSize: 10, letterSpacing: "0.15em", marginBottom: 18 }}>EDITOR'S LETTER</div>
                            {letter.split("\n\n").map((p, i) => (
                              <p key={i} style={{ color: "#aaa", fontFamily: serif, fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>{p}</p>
                            ))}
                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #111", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                              <span style={{ color: "#2a2a3a", fontSize: 10, fontStyle: "italic" }}>AI-generated · Practice use only</span>
                              <button onClick={generateLetter} style={{ background: "none", color: "#4a4a6a", border: "1px solid #1c1c2a", borderRadius: 2, padding: "4px 10px", fontFamily: mono, fontSize: 9, cursor: "pointer" }}>Regenerate</button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
// To display a testimonial: add an object below with { quote, name, context }
// context is optional (e.g. "poet, New York" or "MFA grad")
// Only add quotes you've personally approved from the feedback admin view.
const TESTIMONIALS = [
  // { quote: "The craft briefs alone are worth more than most workshops I've paid ten times as much for.", name: "M.R.", context: "lyric essayist" },
];

// ── Feedback storage ──────────────────────────────────────────────────────────
function loadFeedback() {
  try { return JSON.parse(sessionStorage.getItem("press_feedback") || "[]"); } catch { return []; }
}
function saveFeedbackEntry(entry) {
  try {
    const existing = loadFeedback();
    sessionStorage.setItem("press_feedback", JSON.stringify([...existing, entry]));
  } catch {}
}

// ── Feedback Form ─────────────────────────────────────────────────────────────
function FeedbackForm({ onBack }) {
  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = quote.trim().length > 20 && rating > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    saveFeedbackEntry({
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      name: name.trim() || "Anonymous",
      context: context.trim(),
      quote: quote.trim(),
      rating,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 22, color: C.gold, marginBottom: 16 }}>✦</div>
        <p style={{ fontStyle: "italic", fontSize: 17, lineHeight: 1.7, color: "#3a2e1a", marginBottom: 24 }}>
          Thank you. Your feedback has been received.
        </p>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: C.gold, fontSize: 12, fontFamily: "'Courier New', monospace", letterSpacing: "0.15em", textTransform: "uppercase" }}>← Back to workshop</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px 80px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: C.gold, fontSize: 12, letterSpacing: "0.15em", padding: 0, marginBottom: 32, fontFamily: "'Courier New', monospace", textTransform: "uppercase" }}>← Back</button>

      <div style={{ fontSize: 10, letterSpacing: "0.3em", color: C.gold, marginBottom: 8, textTransform: "uppercase" }}>Feedback</div>
      <h2 style={{ fontWeight: "normal", fontSize: 22, margin: "0 0 8px" }}>Tell us how The Press worked for you</h2>
      <p style={{ fontSize: 13, color: "#8a7a5a", fontStyle: "italic", lineHeight: 1.6, marginBottom: 36 }}>
        Your feedback is private and will not be published without your permission. It goes directly to the people who built this.
      </p>

      {/* Rating */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.2em", color: C.gold, marginBottom: 12, textTransform: "uppercase" }}>Overall rating</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[1,2,3,4,5].map(s => (
            <button key={s} onClick={() => setRating(s)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 28, color: s <= rating ? C.gold : C.border, padding: 0, transition: "color 0.1s" }}>
              {s <= rating ? "◆" : "◇"}
            </button>
          ))}
        </div>
      </div>

      {/* Quote / experience */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.2em", color: C.gold, marginBottom: 10, textTransform: "uppercase" }}>Your experience</div>
        <p style={{ fontSize: 12, color: "#8a7a5a", fontStyle: "italic", marginBottom: 8, lineHeight: 1.5 }}>
          What did the workshop do for your writing? What would you tell another writer considering it? Be specific — vague praise isn't useful to anyone.
        </p>
        <textarea
          value={quote} onChange={e => setQuote(e.target.value)}
          placeholder="Write as much or as little as you want..."
          style={{ width: "100%", minHeight: 160, background: "#faf7f0", border: `1px solid ${C.border}`, borderRadius: 2, fontFamily: "'Palatino Linotype','Book Antiqua',Palatino,serif", fontSize: 14, lineHeight: 1.7, padding: "14px 16px", resize: "vertical", outline: "none", color: C.ink, boxSizing: "border-box" }}
        />
      </div>

      {/* Name */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.2em", color: C.gold, marginBottom: 10, textTransform: "uppercase" }}>Name (optional)</div>
        <input
          value={name} onChange={e => setName(e.target.value)}
          placeholder="How you'd like to be identified, or leave blank"
          style={{ width: "100%", background: "#faf7f0", border: `1px solid ${C.border}`, borderRadius: 2, fontFamily: "'Courier New', monospace", fontSize: 13, padding: "10px 14px", outline: "none", color: C.ink, boxSizing: "border-box" }}
        />
      </div>

      {/* Context */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.2em", color: C.gold, marginBottom: 10, textTransform: "uppercase" }}>Context (optional)</div>
        <input
          value={context} onChange={e => setContext(e.target.value)}
          placeholder="e.g. poet, MFA grad, working writer, first-time writer"
          style={{ width: "100%", background: "#faf7f0", border: `1px solid ${C.border}`, borderRadius: 2, fontFamily: "'Courier New', monospace", fontSize: 13, padding: "10px 14px", outline: "none", color: C.ink, boxSizing: "border-box" }}
        />
      </div>

      <Btn gold onClick={handleSubmit} disabled={!canSubmit}>Submit Feedback →</Btn>
      <p style={{ marginTop: 12, fontSize: 11, color: "#aaa", fontFamily: "'Courier New', monospace", lineHeight: 1.5 }}>
        Your feedback is private. It will not be shared or published without your explicit permission.
      </p>
    </div>
  );
}

// ── Admin Feedback View ───────────────────────────────────────────────────────
// Access by typing ?admin in the URL or navigating to view="admin"
function AdminFeedback({ onBack }) {
  const entries = loadFeedback();
  const [copied, setCopied] = useState(null);

  const copyEntry = (entry) => {
    const text = `"${entry.quote}"\n— ${entry.name}${entry.context ? `, ${entry.context}` : ""}\nRating: ${entry.rating}/5 · ${entry.date}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(entry.id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const STAR_COLORS = { 5: "#4a8a4a", 4: "#7a8a4a", 3: "#9a7a3f", 2: "#8a5a3a", 1: "#8b3a3a" };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: C.gold, fontSize: 12, letterSpacing: "0.15em", padding: 0, marginBottom: 32, fontFamily: "'Courier New', monospace", textTransform: "uppercase" }}>← Back</button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", color: C.gold, marginBottom: 6, textTransform: "uppercase" }}>Private Admin View</div>
          <h2 style={{ fontWeight: "normal", fontSize: 22, margin: 0 }}>Feedback Received</h2>
        </div>
        <span style={{ fontSize: 11, color: "#8a7a5a", fontFamily: "'Courier New', monospace" }}>{entries.length} {entries.length === 1 ? "entry" : "entries"}</span>
      </div>

      <div style={{ background: C.parchment, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.gold}`, padding: "14px 18px", marginBottom: 32 }}>
        <p style={{ margin: 0, fontSize: 12, color: "#6a5a3a", fontStyle: "italic", lineHeight: 1.6 }}>
          To add a testimonial to the public home page: copy an entry below, then add it to the <code style={{ fontStyle: "normal", fontSize: 11, background: "#e5dcc8", padding: "1px 5px", borderRadius: 2 }}>TESTIMONIALS</code> array in the source code with <code style={{ fontStyle: "normal", fontSize: 11, background: "#e5dcc8", padding: "1px 5px", borderRadius: 2 }}>{"{ quote, name, context }"}</code>. Only entries you manually add will be displayed.
        </p>
      </div>

      {entries.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#8a7a5a", fontStyle: "italic" }}>No feedback submitted yet.</div>
      )}

      {[...entries].reverse().map((entry) => (
        <div key={entry.id} style={{ background: C.parchment, border: `1px solid ${C.border}`, borderRadius: 2, padding: "20px 20px", marginBottom: 16, position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <div>
              <span style={{ fontSize: 14, color: C.ink, fontWeight: "normal" }}>{entry.name}</span>
              {entry.context && <span style={{ fontSize: 12, color: "#8a7a5a", marginLeft: 8, fontStyle: "italic" }}>{entry.context}</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, color: STAR_COLORS[entry.rating] || C.gold, fontFamily: "'Courier New', monospace" }}>{"◆".repeat(entry.rating)}{"◇".repeat(5 - entry.rating)} {entry.rating}/5</span>
              <span style={{ fontSize: 11, color: "#aaa", fontFamily: "'Courier New', monospace" }}>{entry.date}</span>
            </div>
          </div>
          <p style={{ fontStyle: "italic", fontSize: 14, lineHeight: 1.8, color: "#3a2e1a", margin: "0 0 14px" }}>"{entry.quote}"</p>
          <button
            onClick={() => copyEntry(entry)}
            style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 2, padding: "5px 14px", fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: "0.1em", cursor: "pointer", color: copied === entry.id ? "#4a8a4a" : C.gold, textTransform: "uppercase", transition: "color 0.2s" }}
          >
            {copied === entry.id ? "Copied ✓" : "Copy for testimonial"}
          </button>
        </div>
      ))}
    </div>
  );
}

// ── License System ────────────────────────────────────────────────────────────
// Gumroad generates and emails a unique key to each buyer automatically.
// This app validates it against Gumroad's API via a Vercel proxy function.
// No key generator needed. Refunded keys stop working automatically.

async function verifyWithGumroad(key) {
  const res = await fetch("/.netlify/functions/verify-license", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ license_key: key }),
  });
  if (!res.ok) throw new Error("Network error");
  return res.json(); // { valid: bool, error?: string }
}

function loadLicense() {
  try { return sessionStorage.getItem("press_license") || ""; } catch { return ""; }
}
function saveLicense(key) {
  try { sessionStorage.setItem("press_license", key); } catch {}
}

// ── License Gate ──────────────────────────────────────────────────────────────
function LicenseGate({ onUnlock }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  // Gumroad keys look like: A1B2C3D4-E5F60718-9ABCDEF0-1234ABCD
  // Accept any reasonable key format — don't over-restrict client-side
  const trimmed = input.trim();
  const readyToSubmit = trimmed.length >= 8 && !loading;

  const handleSubmit = async () => {
    if (!readyToSubmit) return;
    setLoading(true);
    setError("");
    try {
      const result = await verifyWithGumroad(trimmed);
      if (result.valid) {
        saveLicense(trimmed);
        onUnlock();
      } else {
        setError(result.error || "That key isn't valid. Check for typos.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError("Couldn't reach the verification server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "'Georgia', serif" }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        {/* Masthead */}
        <div style={{ fontSize: 10, letterSpacing: "0.4em", color: C.gold, marginBottom: 10, textTransform: "uppercase" }}>A Literary Workshop</div>
        <h1 style={{ fontSize: "clamp(36px,10vw,64px)", fontWeight: "normal", letterSpacing: "0.12em", margin: "0 0 6px" }}>THE PRESS</h1>
        <div style={{ width: 40, height: 1, background: `linear-gradient(90deg,transparent,${C.gold},transparent)`, margin: "0 auto 40px" }} />

        <p style={{ fontSize: 15, lineHeight: 1.7, color: "#5a4a2a", marginBottom: 40, fontStyle: "italic" }}>
          Enter your license key to access the workshop.
        </p>

        {/* Key input */}
        <div style={{ marginBottom: 16, animation: shake ? "shake 0.4s ease" : "none" }}>
          <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }`}</style>
          <input
            value={input}
            onChange={e => { setInput(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="Paste your license key here"
            disabled={loading}
            style={{
              width: "100%", textAlign: "center",
              background: "#faf7f0", border: `1px solid ${error ? "#8b3a2a" : C.border}`,
              borderRadius: 2, fontFamily: "'Courier New', monospace",
              fontSize: "clamp(13px,3.5vw,17px)", letterSpacing: "0.1em",
              padding: "14px 16px", outline: "none", color: C.ink,
              boxSizing: "border-box", transition: "border-color 0.2s",
              opacity: loading ? 0.6 : 1,
            }}
          />
        </div>

        {error && (
          <p style={{ color: "#8b3a2a", fontSize: 13, marginBottom: 16, fontStyle: "italic" }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!readyToSubmit}
          style={{
            width: "100%", background: readyToSubmit ? C.gold : C.border,
            color: readyToSubmit ? C.ink : "#aaa",
            border: "none", borderRadius: 2, padding: "14px 24px",
            fontFamily: "'Courier New', monospace", fontSize: 12,
            letterSpacing: "0.2em", textTransform: "uppercase",
            cursor: readyToSubmit ? "pointer" : "not-allowed",
            transition: "all 0.2s", marginBottom: 32,
          }}
        >
          {loading ? "Verifying…" : "Unlock The Press →"}
        </button>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24 }}>
          <p style={{ fontSize: 12, color: "#8a7a5a", lineHeight: 1.7 }}>
            Don't have a key?{" "}
            <a href="https://gumroad.com" target="_blank" rel="noopener noreferrer"
              style={{ color: C.gold, textDecoration: "none", borderBottom: `1px solid ${C.gold}44` }}>
              Purchase The Press for $49 →
            </a>
          </p>
          <p style={{ fontSize: 11, color: "#aaa", marginTop: 8, fontStyle: "italic" }}>
            Your key is emailed to you instantly after purchase.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function ThePressApp() {
  const [unlocked, setUnlocked] = useState(() => !!loadLicense());
  const [progress, setProgress] = useState(loadProgress);
  const [view, setView] = useState("home");
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Show license gate if not unlocked
  if (!unlocked) return <LicenseGate onUnlock={() => setUnlocked(true)} />;

  const done = Object.keys(progress).filter(k => progress[k]?.completed).length;
  const allComplete = done === ALL_MODULES.length;

  function getNext() { return ALL_MODULES.find(m => !progress[m.id]?.completed)?.id || null; }
  function startOrContinue() { const n = getNext(); if (n) { setActiveModuleId(n); setView("module"); setMenuOpen(false); } }
  function selectModule(id) { setActiveModuleId(id); setView("module"); setMenuOpen(false); }
  function complete(id, reflection) {
    const updated = { ...progress, [id]: { completed: true, reflection } };
    setProgress(updated); saveProgress(updated);
    const next = ALL_MODULES.find(m => !updated[m.id]?.completed);
    if (!next) { setTimeout(() => setView("certificate"), 400); }
  }

  const activeModule = ALL_MODULES.find(m => m.id === activeModuleId);
  const activeBook = activeModule ? BOOKS.find(b => b.modules.some(m => m.id === activeModuleId)) : null;

  const navItems = [
    { key: "home", label: "Home" },
    { key: "toc", label: "Contents" },
    { key: "review", label: "Editorial" },
    ...(allComplete ? [{ key: "certificate", label: "Certificate" }] : []),
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'Georgia', serif", color: C.ink, position: "relative" }}>
      {/* Grain overlay */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, opacity: 0.6 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Masthead */}
        <header onClick={() => { setView("home"); setMenuOpen(false); }} style={{ cursor: "pointer", textAlign: "center", padding: "32px 20px 20px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, letterSpacing: "0.4em", color: C.gold, marginBottom: 6, textTransform: "uppercase" }}>A Literary Workshop</div>
          <h1
            style={{ margin: 0, fontSize: "clamp(32px,8vw,60px)", fontWeight: "normal", letterSpacing: "0.12em", color: C.ink }}
            onDoubleClick={e => { e.stopPropagation(); setView("admin"); }}
            title=""
          >THE PRESS</h1>
          <div style={{ margin: "10px auto 0", width: 50, height: 1, background: `linear-gradient(90deg,transparent,${C.gold},transparent)` }} />
        </header>

        {/* Nav */}
        <nav style={{ borderBottom: `1px solid ${C.border}`, position: "relative" }}>
          {/* Mobile: hamburger */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px" }}>
            <div style={{ display: "flex", gap: 24, overflowX: "auto", padding: "14px 0" }}>
              {navItems.map(item => (
                <button key={item.key} onClick={() => { setView(item.key); setMenuOpen(false); }} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: item.key === "review" ? (view === "review" ? C.ink : "#6a6a9a") : (view === item.key ? C.ink : C.gold),
                  fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
                  borderBottom: view === item.key ? `1px solid ${C.ink}` : "1px solid transparent",
                  paddingBottom: 2, whiteSpace: "nowrap", flexShrink: 0,
                }}>
                  {item.label}
                </button>
              ))}
            </div>
            {done > 0 && (
              <span style={{ fontSize: 10, color: C.gold, fontFamily: "'Courier New', monospace", flexShrink: 0, marginLeft: 12 }}>{done}/{ALL_MODULES.length}</span>
            )}
          </div>
        </nav>

        {/* Progress bar */}
        {done > 0 && view !== "review" && (
          <div style={{ height: 2, background: C.border }}>
            <div style={{ height: "100%", width: `${(done / ALL_MODULES.length) * 100}%`, background: `linear-gradient(90deg,${C.gold},${C.goldLight})`, transition: "width 0.6s ease" }} />
          </div>
        )}

        {/* Views */}
        {view === "home" && <HomePage progress={progress} onStart={startOrContinue} onModule={selectModule} onFeedback={() => setView("feedback")} />}
        {view === "toc" && <TOC progress={progress} onSelect={selectModule} />}
        {view === "module" && activeModule && activeBook && (
          <ModulePage module={activeModule} book={activeBook} progress={progress} onComplete={complete} onBack={() => setView("toc")} />
        )}
        {view === "certificate" && <Certificate />}
        {view === "review" && <EditorialReview />}
        {view === "feedback" && <FeedbackForm onBack={() => setView("home")} />}
        {view === "admin" && <AdminFeedback onBack={() => setView("home")} />}
      </div>
    </div>
  );
}
