import { readFileSync, writeFileSync } from "node:fs";

const commits = JSON.parse(readFileSync("./gh-pages/commits.json", "utf-8"));

const filteredCommits = commits
  .toReversed()
  .filter(async (commit) => {
    const response = await fetch(`https://api.github.com/repos/utcode-learn-archive/${commit.commitHash}`);
    if (response.status === 200) {
      return false;
    }
    return true;
  })
  .slice(0, 2);

writeFileSync("./filtered-commits.json", JSON.stringify(filteredCommits));
