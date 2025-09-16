import { readFileSync } from "node:fs";

const commits = JSON.parse(readFileSync("./gh-pages/commits.json", "utf-8"));

const filteredCommits = commits
  .filter((commit) => {
    if (existsSync(`./gh-pages/commit/${commit.commitHash}`)) {
      return false;
    }
    return true;
  })
  .slice(0, 2);

writeFileSync("./filtered-commits.json", JSON.stringify(filteredCommits));
