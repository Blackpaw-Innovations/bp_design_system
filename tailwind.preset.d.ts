// Not typed as tailwindcss's `Config` -- that would resolve against
// whichever tailwindcss version happens to be installed inside this
// package (a loose >=3 peerDependency, not deduped across a
// `link:`-consumed package), which can be a different major version
// than a consuming app's own, and their `Config` shapes aren't
// mutually assignable across v3/v4. A plain object type is
// structurally compatible with any app's `presets: [...]` array
// regardless of which tailwindcss major it's typed against.
declare const preset: Record<string, unknown>;
export default preset;
