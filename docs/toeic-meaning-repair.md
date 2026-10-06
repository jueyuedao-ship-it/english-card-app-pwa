# TOEIC Bridge meaning repair

## Scope and design

The user's eight requirements govern this change: correct all 5,021 Japanese
glosses; recover CEFR-J v1.5 headword/POS/CEFR identity; normalize spelling
aliases; reject errors, empty glosses and untranslated English; pin known
mistakes in regression tests; provide reproducible generation; preserve
pronunciation, level, priority, rank and application behavior; submit a new
branch as a PR without merging main.

Keep display spellings and row order unchanged because `toeic-N` IDs and IPA
are positional. Append POS and the original source headword to each generated
row. Preserve POS/source identity in the app's word objects. The authoritative
English reference is a pinned CEFR-J v1.5 CSV. Japanese glosses are authored
and reviewed against its POS, with common learner senses first, and stored
in `data/toeic/entries.json`. Generation is offline and deterministic; it
does not query a dictionary or guess a missing translation.

## Implementation and verification

- [x] Add failing tests for all-row identity/quality and known semantic mistakes.
- [x] Review three disjoint vocabulary sets, then reconcile POS assignments for
      repeated function words against their existing intended meanings.
- [x] Implement a generator that joins by headword/POS/CEFR and validates
      complete source coverage, uniqueness, aliases and Japanese glosses.
- [x] Regenerate all eight files, append POS/source fields in the loader, and
      bump the PWA cache version so corrected assets replace the prior cache.
- [x] Test generation reproducibility, invalid-source rejection, aliases,
      unchanged IPA and stable row IDs; run the existing test suite.
- [x] Verify actual list/card/quiz behavior, filters and saved progress after
      reload and offline restoration in a browser.
- [x] Obtain independent implementation and whole-vocabulary reviews and
      address material findings with regression tests.
- Delivery: push the new branch and create/attach a PR. Do not merge or deploy main.

## Review focus

Repeated headwords with different POS; abbreviations and casing; slash-separated
British/American spellings; localStorage progress tied to rank; old PWA caches.

## Execution evidence

Baseline: main `97e9650647742d8a51fad06ed93dcbba528fcea1`, two existing tests pass.
CEFR-J contains exactly 5,021 A1/A2/B1 records. Original display spelling differs
from source for `'s`, `'re`, `'m`, `true`, `false`; retain display strings while
restoring the source identity.

Final automated suite: 51/51 tests pass, including the two existing IPA tests.
All 5,021 source keys occur exactly once. Errors/empty/non-Japanese glosses: 0.
Eight assets reproduce byte-for-byte. Word/CEFR/priority/rank identity is
unchanged; pronunciation content is unchanged (newline-independent checksum).
Chrome verification passed for actual list/card/quiz interaction, existing
saved progress, reload, filters, offline restoration and switching to Kosen.

The full vocabulary was read once during authoring and again by two independent
semantic reviewers. Their five findings (shall, whenever, fry, supposedly,
immigrate) were reproduced in failing tests, fixed and made green. The browser
test was made deterministic for duplicate spellings; the historic IPA installer
was corrected to preserve cache versions newer than v9, with two regression tests.

Decisions: retain the source's irregular latter/adverb/A2 identity but explicitly
label the gloss as adjective usage, rather than inventing a nonexistent adverb
sense. Retain the source's less familiar POS assignments (wake, hello, bye, its) and source CEFR
levels. Match pacific's lowercase adjective to its peace-related meaning.
Potential cost if these reference tags are wrong: the reference metadata remains
imperfect, but normal learner meanings and identity stability are explicit.

Deferred: rank 4131 immigration's existing immigration/entry-inspection gloss
could clarify the inbound direction further; it remains a correct learner sense.
The IPA installer's pre-existing CRLF-sensitive string patches elsewhere are
unchanged and can still fail on Windows; the new meaning generator works offline
on Windows and CI. Full IPA regeneration and iPhone/Safari device testing were not
run, since this change preserves the committed IPA and existing UI behavior.
