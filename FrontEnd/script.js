const gallery = document.querySelector(".gallery");
const filtersContainer = document.querySelector(".filters");
const loginLink = document.querySelector(".login-link");
const portfolioTitle = document.querySelector("#portfolio h2");
const editButton = document.querySelector(".edit-btn");

const token = localStorage.getItem("token");

function updateAdminUI() {
  if (token) {
    loginLink.textContent = "logout";
    loginLink.href = "#";
    filtersContainer.style.display = "none";
    editButton.classList.remove("hidden");
  }
}

const worksUrl = "http://localhost:5678/api/works";
const categoriesUrl = "http://localhost:5678/api/categories";

async function fetchWorks() {
  try {
    const response = await fetch(worksUrl);

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des travaux :", error);
    return [];
  }
}

async function fetchCategories() {
  try {
    const response = await fetch(categoriesUrl);

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories :", error);
    return [];
  }
}

function displayWorks(works) {
  gallery.innerHTML = "";

  works.forEach((work) => {
    const figure = document.createElement("figure");

    const image = document.createElement("img");
    image.src = work.imageUrl;
    image.alt = work.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;

    figure.appendChild(image);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
}

function createFilterButton(name, categoryId, works) {
  const button = document.createElement("button");
   button.textContent = name.replace(/\b\w/g, letter => letter.toUpperCase());
  button.dataset.id = categoryId;

  button.addEventListener("click", () => {
    document.querySelectorAll(".filters button").forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    if (categoryId === 0) {
      displayWorks(works);
    } else {
      const filteredWorks = works.filter((work) => work.categoryId === categoryId);
      displayWorks(filteredWorks);
    }
  });

  return button;
}

function displayFilters(categories, works) {
  filtersContainer.innerHTML = "";

  const allButton = createFilterButton("All", 0, works);
  allButton.classList.add("active");
  filtersContainer.appendChild(allButton);

  categories.forEach((category) => {
    const button = createFilterButton(category.name, category.id, works);
    filtersContainer.appendChild(button);
  });
}

async function init() {
  const works = await fetchWorks();
  const categories = await fetchCategories();

  displayWorks(works);
  displayFilters(categories, works);
  updateAdminUI();
}

init();