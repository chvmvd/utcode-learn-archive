import { writeFileSync } from "node:fs";
import { execSync } from "child_process";

const unitSeparator = "\x1f";
const recordSeparator = "\x1e";

const rawString = execSync(
  `git log --first-parent --pretty=format:"${
    ["%H", "%h", "%an", "%ae", "%aI", "%cn", "%ce", "%cI", "%s", "%b"].join(
      unitSeparator,
    ) + recordSeparator
  }"`,
  { cwd: "source", encoding: "utf-8", shell: "/bin/bash" },
);

const commits = rawString
  .split(recordSeparator)
  .filter((line) => line.trim() !== "")
  .map((line) => {
    const [
      commitHash,
      abbreviatedCommitHash,
      authorName,
      authorEmail,
      authorDate,
      committerName,
      committerEmail,
      committerDate,
      subject,
      body,
    ] = line.split(unitSeparator);
    const coAuthors = Array.from(
      body.matchAll(/Co-authored-by: (.+) <(.+)>/gi),
      ([, name, email]) => ({ name, email }),
    );
    return {
      commitHash: commitHash.trim(),
      abbreviatedCommitHash,
      subject,
      body: body.trim(),
      author: {
        name: authorName,
        email: authorEmail,
        date: authorDate,
      },
      committer: {
        name: committerName,
        email: committerEmail,
        date: committerDate,
      },
      coAuthors,
    };
  });

writeFileSync("./frontend/commits.json", JSON.stringify(commits, null, 2));
