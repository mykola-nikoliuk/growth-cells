declare module '*.elm' {
  /** The config as Elm sends it, once it has been validated. */
  export interface Config {
    startCells: number;
    epochs: number;
    splitChance: number;
    splitPeriod: number;
  }

  /** What the simulation reports to Elm after every epoch. */
  export interface Progress {
    epoch: number;
    total: number;
    marked: number;
  }

  export const Elm: {
    Main: {
      init(options: { node: HTMLElement; flags?: unknown }): {
        ports: {
          restart: { subscribe(callback: (config: Config) => void): void };
          epochChanged: { send(progress: Progress): void };
        };
      };
    };
  };
}
