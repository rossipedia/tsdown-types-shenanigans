# Unexpected type parameter name collisions in `tsdown` output

## TL;DR

Using `infer` in exported mapped types can cause unexpected breaking changes in DTS output due to changed type parameter names.

## Explanation

When using the `dts` generation functionality in `tsdown`, it seems to treat _inferred_ types and subsequent type parameters that have the same name as though those identifiers conflict, and appends a `$1` to the later type parameter, when no collision actually exists.

This seems to only happen when using mapped types with the `infer` keyword.

For example:

```ts
type Mapped<T> = T extends Record<string, infer U> ? U : never;

// Because this type parameter has the same name as the above inferred type, the
// output type now has a $1 appended to it
export type Fn1<U = unknown> = () => Mapped<U>;

// But as long as the type names aren't the same, the output type is left alone
export type FN2<V = unknown> = () => Mapped<V>;
```

gives the output:

```ts
type Mapped<T> = T extends Record<string, infer U> ? U : never;
type Fn1<U$1 = unknown> = () => Mapped<U$1>; // <- notice the appended $1
type FN2<V = unknown> = () => Mapped<V>;

export { FN2, Fn1 };
```

### Why does this matter?

Because changing the type signature for exported types, even if it's just the name of a type parameter, is a _breaking change_ for interfaces, due to declaration merging.

Typescript requires that all declarations of a merged interface have the same type signature, including the names of the type parameters, so changing the name of a type parameter constitutes a breaking API change.

For instance, imagine there was a `@acme/tools@v1` package which exported a `Collection<T>` interface, and the build output from `tsdown` preserved that `T`.

Also, imagine there was a `@acme/app` package that depended on `@acme/tools`, and augmented that type like so:

```ts
declare module '@acme/tools' {
  interface Collection<T> {
    someAdditionalMethod(): void;
  }
}
```

Now, let's say that `@acme/tools@v2` is published, and due to some internal changes, that `Collection<T>` interface runs into this issue, and the _output_ type is now defined as:

```ts
interface Collection<T$1> {
}

export { Collection };
```

This will cause the existing augmentation to fail type-checking _just by upgrading the package_, even though there was technically no change to that type in the source repo.