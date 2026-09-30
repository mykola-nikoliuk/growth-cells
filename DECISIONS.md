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
3. **Cell size.** Once the inputs are known, the cell radius is set so that the largest possible
   population (start · 2^epochs) fits the vessel, allowing for loose packing (about 60–70 % of
   the area). The last split always fits on screen.
4. **API.** One interface shared by learning designers, the LLM content agent and the tutor:
   config in (start cell count, epochs, split chance, split period), events out (target
   population reached, epoch finished), and state plus commands for the tutor (read the
   population, pause, mark a cell). The config is validated with errors precise enough for an
   LLM to fix.
5. **Pointer and touch.** A pointer or a finger is a circle, so hit-testing uses the same grid
   and distance check as collisions, scanning as many tiles as its radius needs. A finger gets
   a larger radius than a mouse, because it is less precise and hides what it touches.
6. **Elm and TypeScript.** Elm holds the inputs and the population count. TypeScript holds every
   cell (position, velocity, mark), runs the physics on the CPU and draws on canvas/WebGL.
   Ports carry input changes one way and a throttled count and epoch number back, not every
   frame.
7. **Known limitation.** Grazing contacts that happen between two steps can be missed. This is
   visual only: cells split on a timer, not on collisions, so the count and the curve stay
   exact.
