# Ignoring files

This document provides an overview of the DeepSeek Ignore (`.deepseekignore`)
feature of the DeepSeek CLI.

The DeepSeek CLI includes the ability to automatically ignore files, similar to
`.gitignore` (used by Git) and `.aiexclude` (used by DeepSeek Code Assist). Adding
paths to your `.deepseekignore` file will exclude them from tools that support
this feature, although they will still be visible to other services (such as
Git).

## How it works

When you add a path to your `.deepseekignore` file, tools that respect this file
will exclude matching files and directories from their operations. For example,
when you use the `@` command to share files, any paths in your `.deepseekignore`
file will be automatically excluded.

For the most part, `.deepseekignore` follows the conventions of `.gitignore`
files:

- Blank lines and lines starting with `#` are ignored.
- Standard glob patterns are supported (such as `*`, `?`, and `[]`).
- Putting a `/` at the end will only match directories.
- Putting a `/` at the beginning anchors the path relative to the
  `.deepseekignore` file.
- `!` negates a pattern.

You can update your `.deepseekignore` file at any time. To apply the changes, you
must restart your DeepSeek CLI session.

## How to use `.deepseekignore`

To enable `.deepseekignore`:

1. Create a file named `.deepseekignore` in the root of your project directory.

To add a file or directory to `.deepseekignore`:

1. Open your `.deepseekignore` file.
2. Add the path or file you want to ignore, for example: `/archive/` or
   `apikeys.txt`.

### `.deepseekignore` examples

You can use `.deepseekignore` to ignore directories and files:

```
# Exclude your /packages/ directory and all subdirectories
/packages/

# Exclude your apikeys.txt file
apikeys.txt
```

You can use wildcards in your `.deepseekignore` file with `*`:

```
# Exclude all .md files
*.md
```

Finally, you can exclude files and directories from exclusion with `!`:

```
# Exclude all .md files except README.md
*.md
!README.md
```

To remove paths from your `.deepseekignore` file, delete the relevant lines.
