export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ValueOf<T> = T[keyof T];

export type Entries<T> = Array<[keyof T, T[keyof T]]>;

export function entriesOf<T extends object>(obj: T): Entries<T> {
  return Object.entries(obj) as Entries<T>;
}