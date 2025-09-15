import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const commits = JSON.parse(readFileSync("./gh-pages/commits.json", "utf-8"));

for (const commit of commits) {
  execSync("git sparse-checkout init --no-cone || true", {
    cwd: "gh-pages",
    shell: "/bin/bash",
  });
  execSync(`git sparse-checkout set commit/${commit.commitHash}`, {
    cwd: "gh-pages",
    shell: "/bin/bash",
  });

  const targetDirectoryPath = `./gh-pages/commit/${commit.commitHash}`;

  // Skip if already deployed
  if (existsSync(targetDirectoryPath)) {
    continue;
  }

  // Checkout the commit
  execSync(`git checkout ${commit.commitHash}`, {
    cwd: "source",
    shell: "/bin/bash",
  });

  // Modify docusaurus.config.js to set the baseUrl
  writeFileSync(
    "./source/docusaurus.config.js",
    readFileSync("./source/docusaurus.config.js", "utf-8").replace(
      /baseUrl: .*,/,
      `baseUrl: "/utcode-learn-archive/commit/${commit.commitHash}/",`,
    ),
  );

  const nodeVersion = (() => {
    if (existsSync("./source/.nvmrc")) {
      return readFileSync("./source/.nvmrc", "utf-8").trim();
    } else {
      return (
        readFileSync("./source/package.json", "utf-8").match(
          /"node": "[^\d]*([\d]+)/,
        )?.[1] ?? 16
      );
    }
  })();

  // Install Node.js and dependencies
  console.log(
    `⚙️ Using Node.js version ${nodeVersion} for commit ${commit.commitHash}`,
  );
  if (existsSync("./source/package-lock.json")) {
    console.log("📦 Using npm as package manager");
    execSync(
      `source $HOME/.nvm/nvm.sh && nvm install ${nodeVersion} && nvm use ${nodeVersion} && npm ci`,
      {
        cwd: "source",
        shell: "/bin/bash",
      },
    );
  } else if (existsSync("./source/yarn.lock")) {
    console.log("📦 Using Yarn as package manager");
    execSync(
      `source $HOME/.nvm/nvm.sh && nvm install ${nodeVersion} && nvm use ${nodeVersion} && yarn install --frozen-lockfile`,
      {
        cwd: "source",
        shell: "/bin/bash",
      },
    );
  }

  try {
    // Build
    console.log(`🚧 Building...`);
    if (existsSync("./source/package-lock.json")) {
      execSync(
        `source $HOME/.nvm/nvm.sh && nvm use ${nodeVersion} && npm run build`,
        {
          cwd: "source",
          shell: "/bin/bash",
        },
      );
    } else if (existsSync("./source/yarn.lock")) {
      execSync(
        `source $HOME/.nvm/nvm.sh && nvm use ${nodeVersion} && yarn build`,
        {
          cwd: "source",
          shell: "/bin/bash",
        },
      );
    }

    // Copy files to the target directory
    execSync(
      `mkdir -p ${targetDirectoryPath} && cp -r source/build/. ${targetDirectoryPath}`,
      {
        shell: "/bin/bash",
      },
    );
  } catch (error) {
    console.error(`❌ Build failed for commit ${commit.commitHash}`);

    // Copy files to the target directory
    execSync(
      `mkdir -p ${targetDirectoryPath} && cp -r scripts/error/. ${targetDirectoryPath}`,
      {
        shell: "/bin/bash",
      },
    );
    writeFileSync(`${targetDirectoryPath}/error-log.txt`, String(error));
  }

  // Commit and push
  execSync(
    `
    git config user.name "github-actions[bot]" && \
    git config user.email "41898282+github-actions[bot]@users.noreply.github.com" && \
    git add . && \
    git commit -m "Update commit previews" && \
    git push origin gh-pages
    `,
    {
      cwd: "gh-pages",
      shell: "/bin/bash",
    },
  );

  // Restore the working directory
  execSync("git restore .", { cwd: "source", shell: "/bin/bash" });
}
