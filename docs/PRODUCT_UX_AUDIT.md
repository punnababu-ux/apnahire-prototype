# apnahire-db — Product & UX Audit

**Lens:** Principal PM + Lead UX Designer review of the database-adoption / DB-credits monetization prototype.
**Method:** 8 expert lenses (product strategy, IA/navigation, onboarding/FTUE, conversion/interaction, UX copy, visual consistency, accessibility, trust/ethics). Every finding was adversarially verified against the actual source before inclusion.
**Result:** 67 verified findings — **4 critical, 20 high, 34 medium, 9 low**. 0 refuted.
**Stack note:** Vite + React Router + Tailwind (not Next.js — the `src/pages/` folder is just a folder).

---

## 1. Executive summary

apnahire-db is a monetization prototype whose **entire reason to exist — selling DB credits — has no buy surface.** Every "Buy credits" / "Top up" CTA (7+ across `ActiveLeadsTab`, `EmbeddedLeadsSection`, `DatabaseTab` ×2, `Sidebar`) is a dead button, so the core conversion event cannot be demoed or usability-tested.

Compounding this, the funnel's two activation triggers misfire:

- **"First unlock is free"** is shown to paid users who actually get charged — the coach mark promising "First one is free" is pinned to the exact button that spends a credit for a has-credits new user.
- **"Credits ran out → repurchase"** never fires from real depletion — it's branched on a static archetype prop, and the global top bar permanently reads **248 credits** while the page says **0**.

Underneath, the hero concept — a **Live Lead** — has no stable identity: it renders in 3–4 visual languages across 2 unrelated datasets, so unlocking "Rohan Roy" in the Applied tab lands you on a duplicate "Shankar Gopal" **video editor** in the Database tab (on a Field Sales job).

Trust erodes precisely at the payment decision: candidates sold as "actively looking right now" carry a hardcoded **"Active on 15 Oct '21"** stamp; an unsourced **"78% response rate"** sits next to a buy button; the out-of-credits state is dressed in **red error styling** when nothing is wrong. And there's a genuine accessibility floor breach — div-based checkboxes/cards unreachable by keyboard, no focus styles, 10px money buttons.

**The four moves that matter before any new feature:**
1. Build a stub credit-purchase modal and wire every CTA to it.
2. Make credit state a single source of truth driven by runtime spend.
3. Fix the broken free-unlock promise.
4. Consolidate Live Leads into one canonical surface backed by one dataset.

These make the activation→monetization funnel demoable and honest. Everything else is polish on top.

---

## 2. What's already working (don't break these)

The prototype gets real things right, and the redesign should preserve them:

- **Coherent value-ladder story at the messaging layer.** Every archetype in `types.ts` / `Archetypes.tsx` maps to a clear funnel intent (introduce → first unlock → repurchase), with well-segmented goal/nudge copy.
- **The free-first-unlock → jump-to-database activation mechanic** (`handleUnlockAndView`, `JobDetail.tsx:114`) is a smart idea — it just needs to be honest and in-place (see conv-2, prod-4).
- **The correct mental model exists in one place:** the Database tab nests "Live Leads" as a labeled, visually distinct teal section above the general pool — Live Leads *are* a DB subset. That's the model to standardize on everywhere else.
- **Excellent post-unlock state** in `DatabaseTab` — copy-to-clipboard with "Copied!" feedback, QR "scan to call," WhatsApp, and a reassuring "No credits will be used for viewing this profile" on re-view.
- **Honest unit model:** per-candidate, per-credit ("Only pay for profiles you choose"), a genuinely free first unlock, and layered/skippable education — more honest than most paywalled-lead products.
- **A real token layer exists** in `src/apna.css` (`--green`, `--ink`, `--line`, …). The problem is purely that components bypass it — the foundation is there to adopt.

---

## 3. The seven cross-cutting themes

The 67 findings collapse into seven structural stories. This is the level a PM/UX lead should act on.

### Theme 1 — The conversion event the product exists for is unbuilt and untestable
*(prod-1, prod-3, conv-4, copy-2)*
There is no purchase/pack/checkout surface anywhere. Every Buy/Top-up CTA is a no-op or a non-interactive `<span>`. There is **zero price anchoring** — no rupee value, no pack tiers, no per-credit cost at the moment of intent. The unlock-and-decrement mechanics already exist; only the purchase step — the thing that makes this a business — is missing. **This is the most load-bearing gap.**

### Theme 2 — Activation & repurchase triggers fire on static props, not real user state
*(prod-2, prod-4, conv-1, ftue-7)*
Both monetization moments are decoupled from runtime behavior. Free-first-unlock is gated to no-credit users on one hardcoded candidate (`al0`). The depleted→repurchase state never fires when a user actually spends their last credit (it's branched on static `hasCredits`/`hasUsedDb`). The credit counter is incoherent — top bar hardcoded to 248, drifting from the per-scenario balance, and only `DatabaseTab` decrements the global wallet. **The headline demo loop is broken at both ends.**

### Theme 3 — "Live Lead" — the unit being sold — has no stable identity, home, or visual language
*(prod-6, ia-1, ia-2, ia-7, vis-3, copy-1)*
- **IA:** 3–4 structurally different renderers, no canonical home.
- **Data:** two unrelated arrays (`CANDIDATES` vs `ACTIVE_LEADS`) bridged by a hardcoded id map — 2 of 3 Applied-tab leads resolve to a duplicate "Shankar Gopal" video editor.
- **Visual:** the card exists in four design languages mixing teal and emerald.
- **Copy:** the feature name is capitalized three ways on *adjacent* FTUE screens.
The wedge is undefensible when the same person appears in both buckets with different salaries.

### Theme 4 — The most important action — what spends a credit — is unlearnable
*(ia-6, conv-3, conv-5, copy-7, copy-2)*
The unlock CTA is labeled and behaves differently on nearly every surface, conflating three distinct actions (spend a credit / re-view a paid contact / buy credits). Worst case: `DatabaseTab`'s credit-spending button reads **"View Phone Number"** — verbatim identical to the free re-view button. The whole card is clickable and spends instantly with no confirmation, no undo, and no pre-spend "Uses 1 credit" microcopy.

### Theme 5 — Trust erodes precisely at the payment decision
*(trust-1, trust-2, trust-3, copy-3, copy-5, trust-5)*
The product asserts algorithmic-sounding facts the data contradicts, then dresses monetization as alarm: "actively looking right now" + "Active on 15 Oct '21" on the same card; "Matches salary" and "78% response rate" asserted without source next to buy CTAs; database size stated as three figures; out-of-credits escalated to red danger styling with a warning triangle and "You're missing N candidates" loss framing; stacked "before someone else does" scarcity even on the recruiter's *own* organic applicants where no race exists.

### Theme 6 — Accessibility floor is breached on the core unlock path
*(a11y-3, a11y-4, a11y-8, a11y-5, a11y-1, a11y-6)*
Selection checkboxes (the gateway to bulk WhatsApp/Excel) and clickable candidate cards are `div`+`onClick` with no role/tabindex/key handler — **WCAG 2.1.1 Level A failures.** No visible focus styles anywhere; outline suppressed on selects. Icon-only controls have no accessible name. The money button renders at 10px; footer recency text fails contrast at ~2:1. Not polish — Level A blockers sitting on the conversion path.

### Theme 7 — Parallel, divergent, dead implementations fragmented the source of truth
*(ia-4, vis-1, vis-4, prod-5, ftue-3)*
Why nothing is consistent: 3 live-leads renderers + 2 job-tab-bars, several **dead** (`EmbeddedLeadsSection`, `ActiveLeadsGrid`, `JobHeader` never imported). The applied `CandidateCard` is duplicated 3× under one colliding name. The token layer is consumed by **zero** React components — brand teal hardcoded ~90× in 5 tint variants, already drifting (`#186b55` vs token `#1a6f59`). Plus an unreachable archetype cell and dead nudge enum values. Consolidation is the precondition that makes every consistency fix stick.

---

## 4. Prioritized roadmap

Ordered by impact-to-effort. The first four unblock the funnel; the last three are correctness/credibility obligations.

| # | Priority | Impact | Effort | Themes |
|---|----------|--------|--------|--------|
| 1 | **Build a stub credit-purchase modal**, wire it to every Buy/Top-up CTA | High | L | 1 |
| 2 | **Make `CreditsContext` the single source of truth**, init from `scenario.dbCredits`; drive top bar + nudge bar + per-card CTAs + depleted footer off runtime `remaining`/`unlocked` | High | M | 2 |
| 3 | **Fix the "first unlock is free" promise** — grant one free unlock per *user* (not scenario) regardless of balance; free candidate = top match, not hardcoded `al0`; only show the promise when it's actually available | High | M | 2 |
| 4 | **Consolidate Live Leads** to one canonical surface (the Database-tab teal section) backed by one deduplicated, role-relevant dataset keyed by a stable id; remove `CANDIDATE_TO_LEAD_ID` | High | L | 3 |
| 5 | **Standardize the unlock CTA** so spend is never confused with free: spend = "Unlock contact · 1 credit", re-view = "View number", no-credits = "Buy credits to unlock"; only the *button* spends, not the whole card | High | M | 4 |
| 6 | **Fix the keyboard/SR floor** on the unlock path: real `<button>`/checkbox controls, global `focus-visible` ring, aria-labels on icon controls, raise 10px money button to 14px | Medium | M | 6 |
| 7 | **Repair trust signals at payment**: real recency (drop "15 Oct '21"), source/soften stats, one canonical DB size, demote red urgency to neutral/teal value framing | Medium | S | 5 |

### Quick wins (S effort, ship this week)
- Wire `onClick` (even to a placeholder modal) on the 7+ dead Buy/Top-up CTAs so no monetization affordance is a visual dead end. *(prod-1, conv-4)*
- Replace the hardcoded "Active on 15 Oct '21" with a relative phrase ("Active this week") or drop the date. `DatabaseTab.tsx:725, :882` *(copy-5, trust-1)*
- Demote the out-of-credits nudge from red danger + warning triangle to neutral/teal value framing; drop "You're missing N candidates." `ActiveLeadsTab.tsx:302–317`, `EmbeddedLeadsSection.tsx:43–49` *(trust-2)*
- Standardize the feature name to Title Case **"Live Leads"** everywhere — including the adjacent-screen contradictions in `FtueModal` STEPS (`:12` vs `:21`) and `ActiveLeadsGrid` (`:41` vs `:73`). *(copy-1)*
- Standardize currency copy to plain **"credits"** (drop "DB" jargon at the payment moment); fix "Unlock · 1 DB credit (Free)" → "Unlock for free · Preview" to match `DatabaseTab`'s honest version. *(copy-2, trust-7)*
- Reconcile DB size to one canonical figure from a single constant ("42,000+"); source or soften the unsourced "78% response rate · avg reply <24h" next to the buy CTA. *(copy-3, trust-3)*
- Delete "Connect with them before someone else does!" from the organic-applicant High Matches header (no race exists there). `AppliedCandidateList.tsx:89`, `OldHasCreditsUsedDb.tsx:78` *(trust-5)*
- Add `aria-label` to all icon-only controls (WhatsApp, copy, QR, pagination, close, kebab, back) — pure addition, no visual change. *(a11y-5)*
- Raise 10px unlock labels to 14px; darken footer meta text from `#b3bac5` (~2:1) to `#5e6c84`. *(a11y-1, a11y-6)*
- Rename the "How live leads work" accordion → "How Live Leads and credits work" (2 of 3 steps are about credits). *(copy-4)*
- Delete the 3 dead duplicate components — `EmbeddedLeadsSection`, `ActiveLeadsGrid`, `JobHeader` — to stop future drift. (Keep `dbMatchCount` and the live `CandidateCard.tsx` export.) *(ia-4)*
- Fix the over-counting coach mark: drop "+" and "more" from "{dbTotal}+ more in the database" so it matches the "Database ({dbTotal})" tab. `JobDetail.tsx:201` *(copy-9)*

### Strategic bets (larger redesigns)
- **Full credit-purchase flow:** pack-selection with per-credit unit economics, a "most popular" anchor, context pre-fill ("unlock this candidate + N more locked leads"), depleted-state default to smallest top-up, and a real ledger that powers a value-recap ("you unlocked 12 candidates last week, 4 replied") for one-tap repurchase. *(prod-1, prod-3, prod-7, conv-4)*
- **Unified Live Leads** — one `LiveLeadCard` with full/compact/banner variants from props, one shared deduplicated dataset, `CANDIDATE_TO_LEAD_ID` removed. *(ia-1, ia-2, vis-3, prod-6)*
- **Credit state re-architecture** — single source of truth consumed by every monetization trigger. *(prod-2, conv-1)*
- **Tokenize the design system** — promote `apna.css` tokens into `tailwind.config` (brand/ink/line + tint scale + danger ramp); migrate ~90 hardcoded teals, 5 tint variants, divergent hovers. *(vis-1, vis-2, vis-5, vis-6, vis-8)*
- **Auditable, honest match engine** — render "Matches salary"/"Active this week" only when data substantiates; add "Why this match?" disclosure; suppress freshness badges when last-active exceeds the window. *(trust-1)*
- **FTUE re-engineering** — persist completion (localStorage); skip/retarget steps whose selectors don't resolve (today the default v2 tour silently renders **nothing** for archetypes with applicants); `scrollIntoView` before measuring; branch copy on `dbCredits`/`dbExperience`. *(ftue-1, ftue-2, ftue-5, ftue-7)*
- **Bulk actions + archetype routing** — gate Excel/WhatsApp on unlock state with explicit credit cost and candidate-protection caps; fix the unreachable old/no-credits/never-DB cell; reconcile the dual `NudgeVariant` enums. *(trust-6, prod-5)*

---

## 5. Tensions (where lenses conflict — and the recommended stance)

1. **Conversion urgency vs. trust.** Red danger styling + "You're missing N candidates" pressures repurchase but weaponizes the platform's error vocabulary against a state where nothing is wrong. → **Demote to neutral/teal value framing.** Keep the count honestly ("N live leads ready to contact") without the system-alert disguise.
2. **Friction-free activation vs. accidental-spend protection.** Whole-card click maximizes one-tap unlocks but burns a non-refundable credit on a stray tap. → **Restrict spend to the button**; add a dismissable "Unlocked — 1 credit used. Undo" toast.
3. **Aggressive scarcity vs. truthfulness.** "Before someone else does" is false on the recruiter's own applicants. → **Keep scarcity only where genuinely real** (shared DB leads); remove elsewhere.
4. **Persuasive precise stats vs. substantiation.** "78% response rate" converts but reads as puffery unsourced. → **If real, attach scope+source; if illustrative, reframe as a soft value prop.**
5. **Demo replay vs. realistic onboarding.** Re-showing FTUE every visit helps demos but is wrong onboarding. → **Persist completion with a dev/query-param override** for demos.
6. **Live Leads premium vs. Database breadth.** Showing the same candidates in both inflates volume but cannibalizes the premium subset. → **Dedupe** — exclude Live Leads from the general list or badge them inline.

---

## 6. Full findings index

Severities reflect verifier adjustments. `S/M/L` = effort.

### Product strategy
| ID | Sev | Finding | Fix |
|----|-----|---------|-----|
| prod-1 | **Critical** | Every purchase CTA is a dead end — conversion event unbuilt (7+ no-op buttons incl. Sidebar "Get apna unlimited"; `DatabaseTab` has 2 buy branches) | Build stub purchase modal, wire all CTAs (L) |
| prod-2 | High | Global balance hardcoded 248, contradicts per-scenario balance; "0 credits available" is a literal string; `ActiveLeadsTab` doesn't consume `CreditsContext` | Single source of truth from `scenario.dbCredits` (M) |
| prod-3 | High | Credit unit economics never priced — no ₹, no packs, no per-credit cost | Add unit-economics line + pack anchors (M) |
| prod-4 | High | Free first unlock gated to no-credit users + hardcoded `al0`; coach mark promises "free" on the button that charges has-credits users | Decouple free-unlock from balance; track on user (M) |
| prod-5 | Medium | Unreachable old/no-credits/never-DB cell; dead nudge enum values (`buy_credits`/`first_unlock` only drive a panel chip color) | Reorder `getAppliedComponent`; reconcile enums (M) |
| prod-6 | Medium | Live Leads cannibalize DB — cloned via modulo loop, 4× "Shankar Gopal", name collision across buckets, off-role matches | Deduplicate, role-relevant, distinct subset (M) |
| prod-7 | Medium | Repurchase leans on loss-aversion with no value recap & dead button | Value-recap + one-tap repurchase (M) |

### IA / navigation
| ID | Sev | Finding | Fix |
|----|-----|---------|-----|
| ia-1 | High | Live Leads = 3+ surfaces, 2 datasets, 3 copy strings, no single home | One canonical surface + reusable entry card (L) |
| ia-2 | High | Cross-tab id map: unlock "Rohan Roy"/"Siddharth M." → land on duplicate "Shankar Gopal" video editor (2 of 3 wrong) | One shared dataset, drop `CANDIDATE_TO_LEAD_ID` (M) |
| ia-3 | Medium | "Database" label overloaded across 3 nav levels; sidebar item is a dead `#database` anchor; dashboard link doesn't deep-link to DB tab | Differentiate by scope; wire/rename sidebar (S) |
| ia-4 | Medium | Dead duplicate components (`EmbeddedLeadsSection`, `ActiveLeadsGrid`, `JobHeader`) | Delete the 3 dead files (S) |
| ia-5 | Medium | DB count vs Live Leads count vs "42,000+" don't reconcile | One labeled hierarchy (M) |
| ia-6 | Medium | Unlock action inconsistent labels & credit semantics across surfaces | Standardize verb+cost pattern (M) |
| ia-7 | Medium | FTUE teaches a 2-place model the first unlock immediately collapses (same person, different card/tab) | Align FTUE to consolidated model (M) |
| ia-8 | Low | Live Leads entry-point prominence inconsistent across archetypes (demoted to thin mid-feed card for some) | One persistent compact entry card (M) |

### Onboarding / FTUE
| ID | Sev | Finding | Fix |
|----|-----|---------|-----|
| ftue-2 | **Critical** | Default v2 coach tour renders **nothing** for archetypes with applicants (e.g. `old-has-credits-never-db`, `old-no-credits-used-db`) — dies at step 0, silently | Skip/retarget unresolved selectors; fall through to `onComplete` (M) |
| ftue-1 | High | FTUE re-shows every visit — no persistence | localStorage flag in `handleFtueComplete` (S) |
| ftue-3 | Medium | `InlineTip` & `ProgressStrip` are dead code — no progressive disclosure toward first unlock | Wire in or delete (M) |
| ftue-5 | Medium | Coach marks don't `scrollIntoView` — spotlight can land off-screen | `scrollIntoView({block:'center'})` before measure (S) |
| ftue-6 | Medium | v1 modal is a blocking 3-slide carousel; final CTA promises navigation but only closes | Cut to 1 value slide whose CTA drops onto leads grid (M) |
| ftue-7 | Medium | Coach copy doesn't adapt to archetype; "First one is free" hardcoded for has-credits users | Branch copy on `dbCredits`/`dbExperience` (S) |
| ftue-4 | Low | Selector naming mismatch + dead `ftueVersion` prop on `ProfileRow` | Unify selector; remove dead prop; assert resolution (S) |
| ftue-8 | Low | Backdrop/overlay click silently completes FTUE (indistinguishable from skip) | Non-destructive overlay click + persistence (S) |

### Conversion / interaction
| ID | Sev | Finding | Fix |
|----|-----|---------|-----|
| conv-1 | **Critical** | Depleted→repurchase nudge never fires from real depletion (gated on static prop); per-card Unlock gated on `hasCredits` not `remaining` | Drive footer + CTA states off live `remaining`/`unlocked` (M) |
| conv-2 | High | Free unlock gives no in-place feedback — teleports to another tab/row | Reveal reward in place + confirmation (M) |
| conv-3 | High | Unlock CTA copy/meaning inconsistent; spend button = "View Phone Number" identical to free re-view | One cost-naming pattern everywhere (M) |
| conv-4 | High | Locked/no-credit CTAs dead-end, no price anchor or pack preview | Open credit-pack sheet with anchored value (M) |
| conv-5 | Medium | Unlock irreversible — no confirm, no undo, no pre-spend microcopy; whole card spends | Inline confirm or undo toast; button-only spend (M) |
| conv-6 | Medium | "+N more" vs "DB promo" cards compete; ambiguous destinations & verbs | One primary action + one verb system (M) |
| conv-7 | Medium | Cold-start educational footer hidden where the buy happens | Inline proof point next to cold-start buy CTA (S) |
| conv-8 | Medium | No "Unlocked" badge / counter feedback on leads grid after unlock | Reuse `DatabaseTab` pill + reveal number in place (S) |

### UX copy
| ID | Sev | Finding | Fix |
|----|-----|---------|-----|
| copy-1 | High | "Live Leads" capitalized 3 ways — contradicts itself on adjacent FTUE screens | Title Case everywhere (S) |
| copy-2 | High | Monetization unit named 6 ways; "DB" is jargon at the paywall | Standardize on plain "credits" (S) |
| copy-3 | Medium | One DB size (42,321) rounded inconsistently; unsourced "78% response rate" | One canonical figure; source/soften stat (S) |
| copy-4 | Medium | "How live leads work" header mismatches its credit/pricing content | Rename to "How Live Leads and credits work" (S) |
| copy-5 | High | "Actively looking" candidates stamped "Active on 15 Oct '21" | Real/relative recency; never multi-year-old (S) |
| copy-6 | Medium | Context-free "33 unlocks" badge; "Viewed number" reads as broken copy | Label explicitly; rename stat (S) |
| copy-7 | Medium | Post-unlock CTA named 4 ways (View Contact/View Phone Number/View number) across 7 locations | Standardize on "View number" (S) |
| copy-8 | Medium | Repurchase CTAs inconsistent (Top up now / Top up credits / Buy credits) | One verb pattern per state (S) |
| copy-9 | Medium | Coach mark "{dbTotal}+ more" over-counts & contradicts exact tab count | Drop "+"/"more" (S) |
| copy-10 | Low | "Connect instantly" / "Unlock & contact" overstate a navigate-only click | Match CTA to action (S) |

### Visual consistency
| ID | Sev | Finding | Fix |
|----|-----|---------|-----|
| vis-1 | High | Tokens exist but **zero** React components use them; brand teal hardcoded ~90× | Promote tokens to `tailwind.config` (M) |
| vis-3 | High | Live Lead card in 4 visual languages (teal vs emerald, stray 📍 emoji) | One canonical `LiveLeadCard` + variants (L) |
| vis-2 | Medium | Same teal as `#1f8268`, `#1F8268`, `emerald-600`, `teal-600` (`#0d9488`) | One brand teal, lowercase, drop emerald/teal utils (S) |
| vis-4 | Medium | Applied `CandidateCard` duplicated 3× under one colliding name | `OldHasCreditsUsedDb` should import shared card; rename collision (M) |
| vis-5 | Medium | Hover teal drifts: token `#1a6f59` vs buttons `#186b55` (×11) vs `emerald-700` | Tokenize one hover value (S) |
| vis-6 | Medium | 5 hexes for the "teal tint" surface (incl. case variant) | Collapse to 2 tint tokens (S) |
| vis-7 | Low | Corner radius inconsistent (`rounded` 4px vs `rounded-lg` vs `rounded-xl`) | Define & apply a radius scale (S) |
| vis-8 | Low | Alert red uses 4 palettes (`red-600`, `red-500`, `#cc0000`, `#e74c3c`) | Tokenize one danger ramp (S) |

### Accessibility
| ID | Sev | Finding | Fix |
|----|-----|---------|-----|
| a11y-3 | **Critical** | Selection checkboxes are `div`+`onClick` — not keyboard-operable, no role/state (WCAG 2.1.1/4.1.2 Level A) | Real `<input type=checkbox>` or `role=checkbox` (M) |
| a11y-4 | High | Clickable candidate cards are `div`+`onClick` — unreachable by keyboard | Rely on inner button or add role/tabindex/keydown (M) |
| a11y-5 | High | Icon-only controls (WhatsApp, copy, QR, pagination, close, kebab) have no accessible name | Add `aria-label` to each (M) |
| a11y-6 | High | Footer meta `#b3bac5` ~2:1 contrast; `gray-400` 2.54:1 — both fail AA | Darken to `#5e6c84` (S) |
| a11y-8 | High | No visible focus styles; `outline:none` on selects without replacement | Global `focus-visible` ring; real buttons (M) |
| a11y-1 | Medium | 10px text on primary unlock CTAs (compact grid); 11–12px on funnel CTAs | Raise to 14px / 12px floor (S) |
| a11y-2 | Medium | FTUE preview cards 8–9px text | Enlarge to 11px+ or `aria-hidden` decorative preview (S) |
| a11y-10 | Medium | Gradient clip-text "High Match"/tags fail contrast (lighter endpoint ~3.2–3.5:1) | Solid color ≥4.5:1 (M) |
| a11y-11 | Medium | Coach-mark overlay not a focus-managed dialog (no role/aria-modal, no focus trap/Escape) | `role=dialog` + focus trap + Escape (L) |
| a11y-7 | Low | Brand teal text fails only on light-teal hover bg (4.32:1); on white it passes (4.72:1) | Darker teal `#186b55` for text on light bg (S) |
| a11y-9 | Low | Blurred phone preview `select-none`+blur, no text alternative (narrow surface) | `aria-hidden` the fake number; label locked state (S) |

### Trust / ethics
| ID | Sev | Finding | Fix |
|----|-----|---------|-----|
| trust-1 | High | "Matches salary"/"currently active" asserted as fact over fabricated, contradictory data | Tie claims to visible, falsifiable basis (M) |
| trust-2 | High | Repurchase nudge uses red danger styling + loss framing = manufactured pressure | Demote to informational/teal value framing (S) |
| trust-3 | Medium | Unverifiable "78% response rate · avg reply <24h" as hard fact next to buy CTA | Substantiate with scope/source or soften (S) |
| trust-4 | Medium | Careless candidate representation — duplicate identities, recycled resumes, single shared phone, static "33 unlocks" | Unique identities; honest "N unlocks"; consent state (M) |
| trust-5 | Medium | Stacked "before someone else does" scarcity — incl. on the recruiter's own applicants (false) | Keep one truthful instance; remove where no race (S) |
| trust-6 | Medium | Bulk WhatsApp/Excel export with no per-candidate unlock or consent gate (currently no-op buttons) | Gate on unlock state + explicit cost + caps (M) |
| trust-7 | Low | "Unlock · 1 DB credit (Free)" mixes a price and a contradiction | Standardize on "Unlock for free · Preview" (S) |

---

*Generated from an 8-lens multi-agent audit with per-finding adversarial verification (76 agents). All file:line references verified against source at time of audit.*
