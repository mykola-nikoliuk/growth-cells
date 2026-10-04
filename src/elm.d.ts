declare module '*.elm' {
  /** The config as Elm sends it, once it has been validated. */
  export interface Config {
    startCells: number;
    epochs: number;
    splitChance: number;
    splitPeriod: number;
  }

  export const Elm: {
    Main: {
      init(options: { node: HTMLElement; flags?: unknown }): {
        ports: {
          restart: { subscribe(callback: (config: Config) => void): void };
        };
      };
    };
  };
}
