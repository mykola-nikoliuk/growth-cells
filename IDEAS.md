# Ideas

Demos that could run on the same engine (physics, tile grid, game loop, Elm config and ports).

## Virus spread

A fixed population moves around; when an infected cell touches a healthy one, it infects it with
some chance. Infected cells recover after a while and are immune from then on (the SIR model).

- **Config:** population, initially infected, infection chance per contact, recovery time,
  maybe a speed factor for "social distancing".
- **Engine reuse:** contacts come for free from the pair loop in `step` (pairs that overlap);
  the state is a per-cell enum (healthy, infected, recovered) in place of `marked`; no splits.
- **Lesson:** the epidemic curve rises, peaks and falls; a lower infection chance or slower
  movement flattens it. The same non-linear growth as compound interest, until immunity
  catches up.
- **Events out:** infected count over time, peak reached, outbreak over.
