// ------------SELECTORS (connecting JS to HTML)----------------
// ------------JS needs references to HTML elements to work with them_------------

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

const categorySelect = document.getElementById("photo-category");

const addPhotoForm = document.getElementById("add-photo-form");
const titleInput = document.getElementById("photo-title");

// ------------TOKEN (authentication)----------------
// -----------Token is stored in localStorage after successful login, and is used to determine 
// if user is admin and to authorize API requests-----

// Vai no navegador e pega o valor chamado token
function getToken() {
  return localStorage.getItem("token");
}
// Ela muda a interface quando o usuário está logado
function updateAdminUI() {
  if (getToken()) {
    loginLink.textContent = "logout";
    loginLink.href = "#";
    // remove os filtros da tela
    filtersContainer.style.display = "none";
    // mostra botão de edição
    editButton.classList.remove("hidden");
  }
}
// Essas URLs são endpoints da API que me permitem buscar dados do backend usando fetch.
const worksUrl = "http://localhost:5678/api/works";
const categoriesUrl = "http://localhost:5678/api/categories";

// -------------FETCHING DATA (works and categories)----------------
// ----FETCH (getting data from API), Go to the server → get data → convert it to JS----
// fetch(worksUrl): buscar dados do backend/ permitir que você mostre eles na tela
// Não mexe direto no HTML. 
// Alimenta outra função que mexe no HTML (displayWorks).

// cria uma função que pode usar await. 
async function fetchWorks() {
  // tenta executar o código
  try {
    // vai no backend buscar dados
    const response = await fetch(worksUrl);

    // se algo deu errado
    if (!response.ok) {
      // cria um erro manual. “Pare tudo aqui e vá para o catch”
      throw new Error(`HTTP error: ${response.status}`);
    }
// transforma resposta em dados JS. Evita que o site quebre se o backend tiver um problema.s
    return await response.json();
    // se der erro, trata aqui
  } catch (error) {
    // mostra erro e retorna lista vazia.
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

// ------DISPLAY (rendering elements)-----
// ----Data → HTML elements → display on screen-----

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

// -----FILTERS-----
// ----works.filter, Show only what the user selected----

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

//  --------------Seletores de categorias-----------------(opcao oferecida quando o usuario add uma nova foto)
  // “criei uma função que vai preencher o select”
function populateCategorySelect(categories) {   
  // “limpa o select e deixa só a primeira opção”
  categorySelect.innerHTML = '<option value="">Select a category</option>';
 // “para cada categoria que veio da API”
  categories.forEach((category) => {
    // “cria uma nova opção do select”
    const option = document.createElement("option");
    // valor que será enviado para a API depois
    option.value = category.id;
     // texto que aparece na tela
    option.textContent = category.name;
     // coloca essa opção dentro do select
    categorySelect.appendChild(option);
  });
}

// ------MODAL (open / close)-----
// -----show and hide modal, hidden = invisible-----

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

editButton.addEventListener("click", openModal); // ----EVENTS (user interactions)-----
modalClose.addEventListener("click", closeModal);
openAddPhotoButton.addEventListener("click", showAddPhotoView); // -----SWITCHING MODAL VIEWS-----
backToGalleryButton.addEventListener("click", showGalleryView); // ----One view appears, the other disappears----

loginLink.addEventListener("click", (event) => {
  if (getToken()) {
    event.preventDefault();
    localStorage.removeItem("token");
    window.location.reload();
  }
});

// ------IMAGE UPLOAD + PREVIEW------
// ----User selects image → show preview instantly----

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

  // “Quando o formulário for enviado, execute esta função.”
  // addPhotoForm → é o formulário do modal “Add Photo”
  // addEventListener → adiciona um evento
  // "submit" → esse evento acontece quando o formulário é enviado
  // (event) => { ... } → função que será executada
addPhotoForm.addEventListener("submit", (event) => { // toda esse codigo é uma etapa de validação, não de envio.
  // Prevent the default form submission behavior.
  event.preventDefault();
  // “Pegue a imagem que o usuário escolheu.”
  const file = photoFileInput.files[0];
  // Get the title entered by the user
  const title = titleInput.value;
  // Get the selected category
  const category = categorySelect.value;
  // Check if any required field is missing
  if (!file || !title || !category) {
    alert("Please fill all fields");
    // Stop the function if validation fails
    return;
  }
  // Form validation passed.
  console.log("Form is valid!");
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
      method: "DELETE",  // ------DELETE (API + DOM) Delete from backend------                
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to delete project");
    }

    figure.remove(); // ------Remove from frontend------ 

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

// -------INIT FUNCTION------
// ----When the page loads → build everything----

async function init() {

  const works = await fetchWorks();
  const categories = await fetchCategories();

  // -----Runs when the page loads.----

  displayWorks(works);
  displayModalWorks(works);
  displayFilters(categories, works);
  populateCategorySelect(categories);
  updateAdminUI();
}

init();