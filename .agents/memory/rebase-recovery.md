---
name: Rebase recovery
description: Recovery guidance for an orphaned or duplicate rebase in this workspace.
---

When a rebase is detached at the remote base but the target branch already points to a clean merge commit containing the intended work, abort the duplicate rebase rather than replaying those commits again.

**Why:** The workspace may retain rebase metadata and unresolved index stages even after an earlier merge was committed, and the documented merge-resolution callbacks may be unavailable.

**How to apply:** Inspect `git status`, the rebase todo, branch refs, and merge ancestry first. If the existing branch tip is the desired clean merge, abort the stale rebase and verify that the rebase metadata, conflict stages, and conflict markers are gone.