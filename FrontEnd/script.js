const gallery = document.querySelector(".gallery");
const filtersContainer = document.querySelector(".filters");
const loginLink = document.querySelector(".login-link");
const editButton = document.querySelector(".edit-btn");

const modalOverlay = document.getElementById("modal-overlay");
const modalClose = document.getElementById("modal-close");
const modalGallery = document.querySelector(".modal-gallery");

const openAddPhotoButton = document.getElementById("open-add-photo");
const backToGalleryButton = document.getElementById("back-to-gallery");
const modalGalleryView = document.querySelector(".modal-gallery-view");
const modalAddView = document.querySelector(".modal-add-view");
const photoFileInput = document.getElementById("photo-file");

const uploadIcon = document.getElementById("upload-icon");
const uploadLabel = document.getElementById("upload-label");
const uploadText = document.getElementById("upload-text");
const photoPreview = document.getElementById("photo-preview");

function getToken() {
  return localStorage.getItem("token");
}

function updateAdminUI() {
  if (getToken()) {
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
      throw new Error(`HTTP error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching works:", error);
    return [];
  }
}

async function fetchCategories() {
  try {
    const response = await fetch(categoriesUrl);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

function displayWorks(works) {
  gallery.innerHTML = "";

  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.dataset.id = work.id;

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

function openModal() {
  modalOverlay.classList.remove("hidden");
}

function showGalleryView() {
  modalGalleryView.classList.remove("hidden");
  modalAddView.classList.add("hidden");
}

function showAddPhotoView() {
  modalGalleryView.classList.add("hidden");
  modalAddView.classList.remove("hidden");
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  showGalleryView();
}

editButton.addEventListener("click", openModal);
modalClose.addEventListener("click", closeModal);
openAddPhotoButton.addEventListener("click", showAddPhotoView);
backToGalleryButton.addEventListener("click", showGalleryView);

loginLink.addEventListener("click", (event) => {
  if (getToken()) {
    event.preventDefault();
    localStorage.removeItem("token");
    window.location.reload();
  }
});

photoFileInput.addEventListener("change", () => {
  const file = photoFileInput.files[0];

  if (!file) {
    return;
  }

  const imageUrl = URL.createObjectURL(file);

  photoPreview.src = imageUrl;
  photoPreview.classList.remove("hidden");

  uploadIcon.classList.add("hidden");
  uploadLabel.classList.add("hidden");
  uploadText.classList.add("hidden");
});

modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) {
    closeModal();
  }
});

function displayModalWorks(works) {
  modalGallery.innerHTML = "";  

  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.classList.add("modal-work");
    figure.dataset.id = work.id;

    const image = document.createElement("img");
    image.src = work.imageUrl;
    image.alt = work.title;

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-btn");
    deleteButton.setAttribute("type", "button");
    deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

    deleteButton.addEventListener("click", async () => {
  try {
    const response = await fetch(`http://localhost:5678/api/works/${work.id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to delete project");
    }

    figure.remove();

    const mainGalleryFigure = document.querySelector(`.gallery figure[data-id="${work.id}"]`);
    if (mainGalleryFigure) {
      mainGalleryFigure.remove();
    }
  } catch (error) {
    console.error("Error deleting project:", error);
  }
});

    figure.appendChild(image);
    figure.appendChild(deleteButton);
    modalGallery.appendChild(figure);
  });
}

async function init() {
  const works = await fetchWorks();
  const categories = await fetchCategories();

  displayWorks(works);
  displayModalWorks(works);
  displayFilters(categories, works);
  updateAdminUI();
}

init();