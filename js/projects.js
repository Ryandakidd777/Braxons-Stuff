/*Copyright © 2026 Braxon's Stuff. All rights reserved.*/

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("projects-container");
  const filters = document.getElementById("projects-filters");
  const searchInput = document.getElementById("project-search");
  const tagSearchInput = document.getElementById("project-tag-search");
  const tagOptions = document.getElementById("project-tag-options");
  const emptyMessage = document.getElementById("projects-empty");
  const errorMessage = document.getElementById("projects-error");

  if (!container) return;

  const statuses = {
    "not-started": {
      label: "Not Started",
      icon: "dot"
    },
    wip: {
      label: "In Progress",
      icon: "spinner"
    },
    success: {
      label: "Complete",
      icon: "check"
    }
  };

  let data = {
    settings: {},
    availableTags: [],
    projects: []
  };

  let activeStatus = "all";
  let activeTag = "";

  async function loadProjects() {
    try {
      const response = await fetch(
        "/components/projects.json",
        {
          cache: "no-store"
        }
      );

      if (!response.ok) {
        throw new Error(
          `projects.json returned ${response.status}`
        );
      }

      data = await response.json();

      if (!Array.isArray(data.availableTags)) {
        data.availableTags = [];
      }

      if (!Array.isArray(data.projects)) {
        data.projects = [];
      }

      buildStatusFilters();
      buildTagOptions();
      renderProjects();
    } catch (error) {
      console.error(
        "Unable to load projects:",
        error
      );

      container.innerHTML = "";

      if (errorMessage) {
        errorMessage.hidden = false;
      }
    }
  }

  function applyPageSettings() {
    const title =
      document.querySelector(
        "#page-title header"
      );

    const description =
      document.querySelector(
        "#page-title #description"
      );

    if (
      title &&
      typeof data.settings.title === "string"
    ) {
      title.textContent =
        data.settings.title;
    }

    if (
      description &&
      typeof data.settings.description === "string"
    ) {
      description.textContent =
        data.settings.description;
    }

    const searchArea =
      document.querySelector(
        ".projects-search"
      );

    const statusArea =
      document.querySelector(
        ".status-filter-area"
      );

    const tagArea =
      document.querySelector(
        ".tag-search-area"
      );

    if (
      searchArea &&
      data.settings.searchEnabled === false
    ) {
      searchArea.hidden = true;
    }

    if (
      statusArea &&
      data.settings.statusFiltersEnabled === false
    ) {
      statusArea.hidden = true;
    }

    if (
      tagArea &&
      data.settings.tagSearchEnabled === false
    ) {
      tagArea.hidden = true;
    }
  }

  function buildStatusFilters() {
    if (!filters) return;

    filters.innerHTML = "";

    const allButton =
      createFilterButton(
        "all",
        "All"
      );

    allButton.classList.add(
      "is-active"
    );

    filters.appendChild(
      allButton
    );

    Object.entries(statuses).forEach(
      ([id, status]) => {
        filters.appendChild(
          createFilterButton(
            id,
            status.label
          )
        );
      }
    );
  }

  function createFilterButton(
    id,
    label
  ) {
    const button =
      document.createElement(
        "button"
      );

    button.type = "button";
    button.className =
      "project_filter";

    button.dataset.filter = id;
    button.textContent = label;

    button.addEventListener(
      "click",
      () => {
        activeStatus = id;

        filters
          .querySelectorAll(
            ".project_filter"
          )
          .forEach((item) => {
            item.classList.toggle(
              "is-active",
              item === button
            );
          });

        renderProjects();
      }
    );

    return button;
  }

  function buildTagOptions() {
    if (!tagOptions) return;

    tagOptions.innerHTML = "";

    data.availableTags.forEach(
      (tag) => {
        if (
          !tag ||
          !tag.id
        ) {
          return;
        }

        const button =
          document.createElement(
            "button"
          );

        button.type = "button";
        button.className =
          "project_tag_search_option";

        button.dataset.tagId =
          tag.id;

        button.textContent =
          tag.label ||
          tag.id;

        button.addEventListener(
          "click",
          () => {
            activeTag =
              tag.id;

            if (tagSearchInput) {
              tagSearchInput.value =
                tag.label ||
                tag.id;
            }

            tagOptions.hidden =
              true;

            renderProjects();
          }
        );

        tagOptions.appendChild(
          button
        );
      }
    );
  }

  function updateTagOptions() {
    if (
      !tagOptions ||
      !tagSearchInput
    ) {
      return;
    }

    const query =
      tagSearchInput.value
        .trim()
        .toLowerCase();

    if (!query) {
      activeTag = "";

      tagOptions.hidden =
        true;

      renderProjects();

      return;
    }

    let matches = 0;

    tagOptions
      .querySelectorAll(
        ".project_tag_search_option"
      )
      .forEach((button) => {
        const label =
          button.textContent
            .toLowerCase();

        const id =
          (
            button.dataset.tagId ||
            ""
          ).toLowerCase();

        const visible =
          label.includes(query) ||
          id.includes(query);

        button.hidden =
          !visible;

        if (visible) {
          matches++;
        }
      });

    const exactTag =
      data.availableTags.find(
        (tag) =>
          tag.id.toLowerCase() ===
            query ||
          (
            tag.label || ""
          ).toLowerCase() ===
            query
      );

    activeTag =
      exactTag
        ? exactTag.id
        : "";

    tagOptions.hidden =
      matches === 0;

    renderProjects();
  }

  function renderProjects() {
    container.innerHTML = "";

    const query =
      searchInput
        ? searchInput.value
            .trim()
            .toLowerCase()
        : "";

    let count = 0;

    data.projects.forEach(
      (project) => {
        if (
          !matchesProject(
            project,
            query
          )
        ) {
          return;
        }

        container.appendChild(
          createProjectCard(
            project
          )
        );

        count++;
      }
    );

    if (emptyMessage) {
      emptyMessage.hidden =
        count !== 0;
    }
  }

  function matchesProject(
    project,
    query
  ) {
    if (!project) {
      return false;
    }

    if (
      activeStatus !== "all" &&
      project.status !==
        activeStatus
    ) {
      return false;
    }

    if (activeTag) {
      const tags =
        Array.isArray(
          project.tags
        )
          ? project.tags
          : [];

      if (
        !tags.includes(
          activeTag
        )
      ) {
        return false;
      }
    }

    if (!query) {
      return true;
    }

    const tags =
      Array.isArray(
        project.tags
      )
        ? project.tags
        : [];

    const tagLabels =
      tags.map(
        getTagLabel
      );

    const searchable = [
      project.id,
      project.title,
      project.description,
      project.status,
      ...tags,
      ...tagLabels
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(
      query
    );
  }

  function createProjectCard(
    project
  ) {
    const card =
      document.createElement(
        "article"
      );

    card.className =
      "project_label";

    card.dataset.projectId =
      project.id || "";

    card.dataset.status =
      project.status || "";

    if (project.image) {
      const imageContainer =
        document.createElement(
          "div"
        );

      imageContainer.className =
        "project_image";

      const image =
        document.createElement(
          "img"
        );

      image.src =
        project.image;

      image.alt =
        project.imageAlt ||
        `Preview of ${
          project.title ||
          "project"
        }`;

      image.loading =
        "lazy";

      if (
        project.link &&
        project.link !== "#"
      ) {
        const imageLink =
          document.createElement(
            "a"
          );

        imageLink.href =
          project.link;

        imageLink.appendChild(
          image
        );

        imageContainer.appendChild(
          imageLink
        );
      } else {
        imageContainer.appendChild(
          image
        );
      }

      card.appendChild(
        imageContainer
      );
    }

    const title =
      document.createElement(
        "header"
      );

    title.textContent =
      project.title ||
      "Untitled Project";

    card.appendChild(
      title
    );

    if (
      project.description
    ) {
      const description =
        document.createElement(
          "p"
        );

      description.textContent =
        project.description;

      card.appendChild(
        description
      );
    }

    if (
      project.status
    ) {
      const status =
        createStatusTag(
          project.status
        );

      if (status) {
        card.appendChild(
          status
        );
      }
    }

    const tags =
      Array.isArray(
        project.tags
      )
        ? project.tags
        : [];

    if (tags.length) {
      const tagContainer =
        document.createElement(
          "div"
        );

      tagContainer.className =
        "project_tags";

      tags.forEach(
        (tagId) => {
          const tag =
            getTag(tagId);

          if (!tag) {
            return;
          }

          const element =
            document.createElement(
              "span"
            );

          element.className =
            "project_tag";

          element.dataset.tag =
            tag.id;

          element.textContent =
            tag.label ||
            tag.id;

          tagContainer.appendChild(
            element
          );
        }
      );

      card.appendChild(
        tagContainer
      );
    }

    if (project.link) {
      const link =
        document.createElement(
          "a"
        );

      link.className =
        "project_link";

      link.href =
        project.link;

      link.textContent =
        project.linkText ||
        "View Project";

      card.appendChild(
        link
      );
    }

    return card;
  }

  function createStatusTag(
    statusId
  ) {
    const status =
      statuses[statusId];

    if (!status) {
      return null;
    }

    const tag =
      document.createElement(
        "div"
      );

    tag.className =
      "project_progress_tag";

    tag.dataset.status =
      statusId;

    if (
      status.icon ===
      "dot"
    ) {
      const dot =
        document.createElement(
          "span"
        );

      dot.className =
        "dot";

      dot.setAttribute(
        "aria-hidden",
        "true"
      );

      tag.appendChild(
        dot
      );
    }

    if (
      status.icon ===
      "spinner"
    ) {
      const icon =
        document.createElement(
          "span"
        );

      icon.className =
        "icon";

      icon.setAttribute(
        "aria-hidden",
        "true"
      );

      icon.innerHTML = `
        <svg viewBox="0 0 16 16" class="spinner">
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            stroke-width="2"
          ></circle>
        </svg>
      `;

      tag.appendChild(
        icon
      );
    }

    if (
      status.icon ===
      "check"
    ) {
      const icon =
        document.createElement(
          "span"
        );

      icon.className =
        "icon";

      icon.setAttribute(
        "aria-hidden",
        "true"
      );

      icon.innerHTML = `
        <svg viewBox="0 0 16 16" class="check">
          <path
            d="M3 8l3 3 7-7"
            fill="none"
            stroke-width="2"
          ></path>
        </svg>
      `;

      tag.appendChild(
        icon
      );
    }

    tag.appendChild(
      document.createTextNode(
        status.label
      )
    );

    return tag;
  }

  function getTag(id) {
    return data.availableTags.find(
      (tag) =>
        tag.id === id
    );
  }

  function getTagLabel(id) {
    const tag =
      getTag(id);

    return tag
      ? tag.label || tag.id
      : id;
  }

  searchInput?.addEventListener(
    "input",
    renderProjects
  );

  tagSearchInput?.addEventListener(
    "input",
    updateTagOptions
  );

  tagSearchInput?.addEventListener(
    "focus",
    () => {
      if (
        tagSearchInput.value.trim()
      ) {
        updateTagOptions();
      }
    }
  );

  document.addEventListener(
    "click",
    (event) => {
      if (
        !event.target.closest(
          ".tag-search-area"
        )
      ) {
        if (tagOptions) {
          tagOptions.hidden =
            true;
        }
      }
    }
  );

  applyPageSettings();
  loadProjects();
});