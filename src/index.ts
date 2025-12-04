type Mapped<T> = T extends Record<string, infer U> ? U : never;
// Because this type parameter has the same name as the above inferred type, the
// output type now has a $1 appended to it
export type Fn1<U = unknown> = () => Mapped<U>;
// But as long as the type names aren't the same, the output type is left alone
export type FN2<V = unknown> = () => Mapped<V>;
