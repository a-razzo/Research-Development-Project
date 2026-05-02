// This script was created with the support of Github Copilot to help connect the article page to the JSON data source.
fetch("./articles/students-article.json")
  .then((response) => response.json())
  .then((data) => {
    document.title = `EH News - ${data.title}`;

    document.getElementById("article-hero-image").src = data.hero.image.src;
    document.getElementById("article-hero-image").alt = data.hero.image.alt;
    document.getElementById("article-author").textContent = `Author: ${data.author}`;
    document.getElementById("article-hero-kicker").textContent = data.hero.kicker;
    document.getElementById("event-hero-title").textContent = data.title;

    document.getElementById("event-summary-heading").textContent = data.summary.heading;
    document.getElementById("event-summary-head").innerHTML =
      `<tr>${data.summary.headers.map((header) => `<th scope="col">${header}</th>`).join("")}</tr>`;
    document.getElementById("event-summary-body").innerHTML =
      data.summary.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("");

    document.getElementById("article-summary").textContent = data.abstract;

    document.getElementById("article-main-content").innerHTML = `
      <h2 class="story-section-title">The Story</h2>
      <p class="story-intro">${data.intro}</p>
      ${data.sections.map((section) => `
        <div class="story-split ${section.reverse ? "reverse-order" : ""}">
          <figure class="story-inline-image">
            <span class="ai-disclaimer-wrap"><img src="${section.image.src}" alt="${section.image.alt}"><span class="ai-disclaimer-label">This Image is AI Generated</span></span>
          </figure>
          <div class="story-text-box">
            ${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}
          </div>
        </div>
      `).join("")}
    `;
  })
  .catch(() => {
    document.getElementById("event-hero-title").textContent = "Unable to load article content.";
  });
