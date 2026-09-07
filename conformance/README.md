# Experience conformance

`experience-rules.json` is the machine-readable gate registry. Consumers copy
neither the file nor the rules: CI invokes the version pinned by its
`@blackpaw/ui` dependency.

Adoption sequence:

1. run discovery and record existing debt;
2. approve a dated legacy baseline where immediate zero is impossible;
3. block every increase from the first protected commit;
4. reduce the baseline to zero; and
5. require DS-12 evidence before production promotion.

New verticals do not receive a legacy baseline.

Run against a consuming application:

```sh
node node_modules/@blackpaw/ui/scripts/check-consumer-conformance.mjs --root .
```

The consumer must commit `blackpaw.conformance.json`. The static checker
enforces DS-01 through DS-04. Import
`defineBlackpawConformance` from
`@blackpaw/ui/conformance/playwright` in the consumer's Playwright suite to
enforce DS-05 through DS-13. A registry entry, local screenshot or manual
review is not evidence of a pass; retain the browser suite's reports and traces
against the tested release commit and environment.

These gates apply to every Blackpaw/Hakiqa vertical. They complement rather
than replace Project Ironclad: Ironclad/Car Parts governs architectural
soundness, while this package governs design and experience conformance.
