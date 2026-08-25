# xRegistry foundations review scorecard

Status: **Hold for editorial and publication approval.** All 20 articles are drafted, but the expanded series still needs current-spec reconciliation, final browser review, publication dates, and maintainer approval.

## Series score

| Dimension | Score | Evidence |
| --- | --- | --- |
| Storytelling coherence | Recheck | The expanded sequence moves from projections and model discovery through identity, contracts, operations, tooling, scale, and alternate bindings. Read the complete 20-post arc before publication. |
| Value framing | 3 | Articles connect mechanics to review, discovery, reproducibility, and generation, but no adoption study provides measurable organizational outcomes. Adding invented measures would weaken the evidence. |
| Presence on the page | Recheck | Titles state questions or arguments and decks summarize stakes. The eleven added articles still require the final visual and fresh-reader pass. |

## Hard gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Five-minute comprehension | Pending | Repeat against the complete index and all 20 openings. |
| Recommendation traceability | Pending | Recheck every new recommendation against its pinned source and maturity label. |

## Six-pass record

| Pass | Result | Notes |
| --- | --- | --- |
| 1. Argument | Pass | Thesis sentences form an interleaved progression rather than a feature catalog. |
| 2. Structure | Draft complete | Twenty standalone articles share one evidence pattern and one navigation model. Final transition review remains. |
| 3. Evidence | Recheck | Core claims pin RC4; events pin corrected text; pagination, OPC UA, and OpenUSD pin labeled drafts. Review all new claims before publication. |
| 4. Concision | Pass with watch item | Tables replace repeated taxonomies. Recheck sentence length after specification updates. |
| 5. Voice and mechanics | Pass | Acronyms are expanded in context, actors are generally explicit, and draft dates are specific. |
| 6. Register | Pending | Run a fresh-reader and AI-tic pass across the complete 20-post series. |

## Publication defects and actions

1. **Series metadata → no publication dates →** keep status as `Publication draft` until maintainers schedule the series.
2. **Current-spec alignment → drafts cite RC4 →** compare each central claim with the approved publication revision before release.
3. **Repository verifier → full-tree execution encounters generated binary and symlink paths →** retain the passing 30-test suite and fix the verifier separately before treating a full-tree run as a publication gate.

## Runtime validation

- Previous locked `github-pages` 232 / Jekyll 3.10.0 build of the nine-post draft: pass.
- Current verifier unit suite: 30 tests passed on Python 3.14.3.
- Current 20-post generated output and browser routes: pending a Ruby/Bundler environment.
- Desktop and mobile review of all 20 posts: pending.
- Full-tree `tools/verify.py .`: blocked by existing generated PNG/symlink paths being read as UTF-8 text. This is a verifier limitation, not an article failure.

## Ship call

**Hold.** Drafting is complete. Publication requires current-spec reconciliation, full editorial and visual review, maintainer approval, and an explicit schedule.