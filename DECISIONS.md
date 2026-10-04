# Decisions

Why the component is built the way it is. One line per decision, with the reason.

1. **Growth model.** Every cell splits after a fixed period, so the population follows
   start · 2^(t / period): tiny at first, then fast. A split chance p changes the base to 1 + p,
   which shows how a rate grows the result non-linearly, the same way compound interest does.
   With a random chance this holds on average; a single run drifts a little.
2. **Collisions.** The board is split into a grid of tiles at least one cell diameter wide, so a
   cell is only checked against cells in its own tile and the 8 around it; cells further away
   cannot touch. A cell moves less than its radius per step, so two cells never tunnel through
   each other.
3. **API.** One interface shared by learning designers, the LLM content agent and the tutor:
   config in (start cell count, epochs, split chance, split period), events out (target
   population reached, epoch finished), and state plus commands for the tutor (read the
   population, pause, mark a cell). The config is validated with errors precise enough for an
   LLM to fix.
4. **Pointer and touch.** A pointer or a finger is a circle, so hit-testing uses the same grid
   and distance check as collisions, scanning as many tiles as its radius needs. A finger gets
   a larger radius than a mouse, because it is less precise and hides what it touches.
5. **Elm and TypeScript.** Elm holds the inputs and the population count. TypeScript holds every
   cell (position, velocity, mark), runs the physics on the CPU and draws on canvas/WebGL.
   Ports carry input changes one way and a throttled count and epoch number back, not every
   frame. Rule of thumb: Elm for small data and complex logic, TypeScript for hot loops where
   mutation wins.
6. **Known limitation.** Grazing contacts that happen between two steps can be missed. This is
   visual only: cells split on a timer, not on collisions, so the count and the curve stay
   exact.
7. **Ports.** Elm → TS: `restart` (the whole config, only when a setting that can't change live
   changes), `update` (split chance and period), `pause`, `resume`, `markCells n`.
   TS → Elm: `epochChanged {epoch, total, marked}` and `cellsMarked {marked}`.
   We send updates on events only. The total changes only when an epoch changes, and the marked
   count only when the user taps. That guarantees data arrives without delay and without
   redundancy, compared to polling on a timer.
8. **Population limit.** `maxCells` = 16384 is close to the limit for low-end devices at 60 fps. Also, at
   16k cells the radius is about 2 px, so more cells would blur into one solid area instead of
   separate objects.
9. **Tile grid.** Rebuild the tile grid every frame instead of updating it incrementally. Every
   cell moves every frame, so the grid changes almost entirely anyway, and rebuilding it is
   simpler and faster than removing each cell from its old tile and adding it to the new one.
   Tiles hold arrays instead of a `Set`: arrays are much faster because they don't hash on every
   add and delete, and an array is reset with `a.length = 0`.
10. **Walls.** Cells are clamped back inside right away. Overlaps that this leaves are fixed in the
    next frame, so one push does not set off a chain of corrections within the same frame.
11. **Speed.** Speed is clamped after collisions, and small random kicks keep cells moving. The demo
    is about growth, not mechanics: the count runs on a timer, so the physics only has to keep
    cells apart and moving naturally, and the energy a clamp loses is not visible.
12. **Pairs.** Each pair is handled once: only when `a.id < b.id`. Unlike a "done" flag, this keeps
    no state that has to be reset every frame, and it also skips a cell meeting itself.
13. **Fixed timestep.** We use a fixed timestep instead of a delta to keep the output predictable
    and avoid tunnelling. Limiting the steps the accumulator may run per frame guarantees that on a
    slow machine unprocessed time never keeps piling up.
14. **Cell size.** The diameter starts at `floor(sqrt(width * height / maxCells))`: each cell gets
    a square, the worst case, since circles may pack tighter but are not guaranteed to. If the
    squares still do not fit in whole rows and columns, reduce the diameter by one pixel and check
    again until they do: the edges waste space, which matters when there are few cells.
15. **Max speed.** The speed limit is `radius / 15` per step, which is two diameters per second at
    60 fps; one diameter per second felt too slow on screen. The radius is only the safety bound against tunnelling; these are cells, not molecules,
    so they should drift calmly.
16. **Split timer.** The split timer counts steps instead of real time. It guarantees that the
    simulation stays the same even when the machine cannot keep up: growth slows down together
    with the physics instead of running ahead of it.
17. **Where a child appears.** A child spawns very close to its parent, in a random direction, and
    the physics moves them apart. On the exact same point, `collide` would fall back to pushing
    along x, so every pair would split horizontally.
18. **Size after a split.** On a split, both cells get `radius / sqrt(2)`, because that keeps the
    total area of the original cell. The radius then grows linearly from `radius / sqrt(2)` back
    to the full radius over the epoch, capped at full, so a cell that split is full size again by
    the next split. Only cells that split shrink and grow; the rest stay full.
