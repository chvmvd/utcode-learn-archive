const list = document.getElementById("list");

try {
  const response = await fetch("./commits.json");
  const commits = (await response.json()).toReversed();

  if (commits.length === 0) {
    list.innerHTML = `<tr><td colspan="6">No commits</td></tr>`;
  } else {
    list.innerHTML = "";
    for (const commit of commits) {
      const tr = document.createElement("tr");

      // No.
      const numberTd = document.createElement("td");
      numberTd.textContent = commits.length - commits.indexOf(commit);
      tr.appendChild(numberTd);

      // Commit Hash
      const commitHashTd = document.createElement("td");
      const commitHashLink = document.createElement("a");
      commitHashLink.href = `https://github.com/ut-code/utcode-learn/commit/${commit.commitHash}`;
      commitHashLink.target = "_blank";
      commitHashLink.rel = "noopener";
      const commitHashCode = document.createElement("code");
      commitHashCode.textContent = commit.abbreviatedCommitHash;
      commitHashLink.appendChild(commitHashCode);
      commitHashTd.appendChild(commitHashLink);
      tr.appendChild(commitHashTd);

      // Subject / Body
      const subjectBodyTd = document.createElement("td");
      const subjectDiv = document.createElement("div");
      subjectDiv.className = "subject";
      subjectDiv.textContent = commit.subject;
      subjectBodyTd.appendChild(subjectDiv);
      if (commit.body.trim() !== "") {
        const bodyPre = document.createElement("pre");
        bodyPre.className = "body";
        bodyPre.textContent = commit.body;
        subjectBodyTd.appendChild(bodyPre);
      }
      tr.appendChild(subjectBodyTd);

      // Author / Committer / Co-authors
      const authorCommitterCoAuthorsTd = document.createElement("td");
      const authorDiv = document.createElement("div");
      const authorStrong = document.createElement("strong");
      authorStrong.textContent = "Author:";
      authorDiv.appendChild(authorStrong);
      const authorText = document.createTextNode(` ${commit.author.name}`);
      authorDiv.appendChild(authorText);
      authorCommitterCoAuthorsTd.appendChild(authorDiv);
      if (
        commit.author.name !== commit.committer.name &&
        commit.author.email !== commit.committer.email
      ) {
        const committerDiv = document.createElement("div");
        const committerStrong = document.createElement("strong");
        committerStrong.textContent = "Committer:";
        committerDiv.appendChild(committerStrong);
        const committerText = document.createTextNode(
          ` ${commit.committer.name}`,
        );
        committerDiv.appendChild(committerText);
        authorCommitterCoAuthorsTd.appendChild(committerDiv);
      }
      if (commit.coAuthors.length > 0) {
        const coAuthorsDiv = document.createElement("div");
        const coAuthorsStrong = document.createElement("strong");
        coAuthorsStrong.textContent = "Co-authors:";
        coAuthorsDiv.appendChild(coAuthorsStrong);
        const coAuthorsText = document.createTextNode(
          ` ${commit.coAuthors.map((coAuthor) => coAuthor.name).join(", ")}`,
        );
        coAuthorsDiv.appendChild(coAuthorsText);
        authorCommitterCoAuthorsTd.appendChild(coAuthorsDiv);
      }
      tr.appendChild(authorCommitterCoAuthorsTd);

      // Date
      const dateTd = document.createElement("td");
      const time = document.createElement("time");
      time.dateTime = commit.author.date;
      time.textContent = new Date(commit.author.date).toLocaleString();
      dateTd.appendChild(time);
      tr.appendChild(dateTd);

      // Preview
      const previewTd = document.createElement("td");
      const previewLink = document.createElement("a");
      previewLink.className = "button";
      previewLink.href = `./commit/${commit.commitHash}/`;
      previewLink.target = "_blank";
      previewLink.rel = "noopener";
      previewLink.innerHTML = `Preview <span class="arrow">↗</span>`;
      previewTd.appendChild(previewLink);
      tr.appendChild(previewTd);

      list.appendChild(tr);
    }
  }
} catch (error) {
  console.error(error);
  list.innerHTML = `<tr><td colspan="6">Failed to load commits.json</td></tr>`;
}
