async function fetchWorks() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    if (!response.ok) throw new Error("Erreur lors de la récupération des travaux");
    return await response.json();
  } catch (error) {
    console.error("Erreur Fetch :", error);
    return [];
  }
}

let currentWorks = [];

async function init() {
  currentWorks = await fetchWorks();
  displayWorks(currentWorks);
  const uniqueCategories = getUniqueCategories(currentWorks);
  createFilterButtons(uniqueCategories); 
  createAdminElements();
}

document.addEventListener("DOMContentLoaded", async () => {
  await init(); // Charge les données et crée la galerie + filtres

  const loginSection = document.getElementById("login");
  const loginForm = document.getElementById("loginForm");
  const loginNavItem = document.getElementById("nav-login");
  const projectsNavItem = document.getElementById("nav-projets");
  const token = window.localStorage.getItem("authToken");

  // Crée les éléments admin dynamiquement
  createAdminElements();

  if (!token) { // État déconnecté
    loginSection.classList.remove("show");
    loginSection.classList.add("hidden");
    document.body.classList.remove("no-scroll");
    document.getElementById("admin-banner").classList.add("hidden");
    document.getElementById("edit-projects").classList.add("hidden");
    document.querySelector(".filters").classList.remove("hidden");

    loginNavItem.addEventListener("click", (event) => {
      event.preventDefault();
      loginSection.classList.remove("hidden");
      loginSection.classList.add("show");
      document.body.classList.add("no-scroll");
    });

    projectsNavItem.addEventListener("click", () => {
      loginSection.classList.remove("show");
      loginSection.classList.add("hidden");
      document.body.classList.remove("no-scroll");
    });
  } else { // État connecté
    loginNavItem.textContent = "logout";
    document.getElementById("admin-banner").classList.remove("hidden");
    document.getElementById("edit-projects").classList.remove("hidden");
    document.querySelector(".filters").classList.add("hidden");

    loginNavItem.addEventListener("click", () => {
      window.localStorage.removeItem("authToken");
      window.location.reload();
    });

    // document.getElementById("edit-projects").addEventListener("click", () => {
    //   alert("Mode édition activé !");
    // });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("password").value;
      const credentials = { email, password };

      try {
        const response = await fetch("http://localhost:5678/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (response.status === 200 || response.status === 201) {
          window.localStorage.setItem("authToken", data.token);
          loginSection.classList.remove("show");
          loginSection.classList.add("hidden");
          document.body.classList.remove("no-scroll");
          window.location.reload();
        } else {
          const errorMessage = document.createElement("p");
          errorMessage.textContent = "Erreur : Email ou mot de passe incorrect";
          errorMessage.style.color = "red";
          errorMessage.style.textAlign = "center";
          const oldError = loginForm.querySelector("p");
          if (oldError) oldError.remove();
          loginForm.appendChild(errorMessage);
        }
      } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        const errorMessage = document.createElement("p");
        errorMessage.textContent = "Erreur réseau. Veuillez réessayer.";
        errorMessage.style.color = "red";
        errorMessage.style.textAlign = "center";
        const oldError = loginForm.querySelector("p");
        if (oldError) oldError.remove();
        loginForm.appendChild(errorMessage);
      }
    });
  }
});

function getUniqueCategories(works) {
  const categoryMap = new Map();
  for (const work of works) {
    if (!categoryMap.has(work.category.id)) {
      categoryMap.set(work.category.id, work.category);
    }
  }
  return Array.from(categoryMap.values());
}

function displayWorks(works) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = ""; // Nettoie la galerie

  works.forEach(work => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;
    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;
    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
}

function createFilterButtons(categories) {
  const filtersContainer = document.createElement("div");
  filtersContainer.classList.add("filters");

  const portfolioSection = document.getElementById("portfolio");
  portfolioSection.insertBefore(filtersContainer, portfolioSection.querySelector(".gallery"));

  const allButton = document.createElement("button");
  allButton.textContent = "Tous";
  allButton.classList.add("active");
  allButton.addEventListener("click", () => {
    displayWorks(currentWorks);
    setActiveButton(allButton);
  });
  filtersContainer.appendChild(allButton);

  categories.forEach(category => {
    const button = document.createElement("button");
    button.textContent = category.name;
    button.addEventListener("click", () => {
      const filteredWorks = currentWorks.filter(work => work.category.id === category.id);
      displayWorks(filteredWorks);
      setActiveButton(button);
    });
    filtersContainer.appendChild(button);
  });
}

function setActiveButton(activeButton) {
  const buttons = document.querySelectorAll(".filters button");
  buttons.forEach(button => button.classList.remove("active"));
  activeButton.classList.add("active");
}

function createAdminElements() {
  // Crée le bandeau
  const adminBanner = document.createElement("div");
  adminBanner.id = "admin-banner";
  adminBanner.innerHTML = '<i class="fas fa-pen-to-square"></i> Mode édition';
  adminBanner.classList.add("hidden");

  // Insère avant le <body> dans <html>
  const body = document.querySelector("body");
  document.documentElement.insertBefore(adminBanner, body); // Ajoute avant <body>

  // Crée le "modifier"
  const editProjects = document.createElement("div");
  editProjects.id = "edit-projects";
  editProjects.innerHTML = '<i class="fas fa-pen-to-square"></i> modifier';
  editProjects.classList.add("hidden");

  const portfolioSection = document.getElementById("portfolio");
  const h2 = portfolioSection.querySelector("h2");

  // Crée un conteneur Flex pour h2 et edit-projects
  const titleContainer = document.createElement("div");
  titleContainer.classList.add("title-container");
  
  // Déplace h2 dans le conteneur et ajoute edit-projects
  h2.parentNode.insertBefore(titleContainer, h2);
  titleContainer.appendChild(h2);
  titleContainer.appendChild(editProjects);
}

//////////// MODAL //////////////////////////////////////////////////
function createModal() {
  // Vérifie et supprime une modale existante pour n’en avoir qu’une
  let modal = document.querySelector(".modal");
  if (modal) modal.remove();

  // Crée la structure de la modale
  modal = document.createElement("div");
  modal.classList.add("modal", "hidden");
  modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">×</span>
        <div class="modal-body">
          <h3>Galerie photo</h3>
          <div class="gallery-modal"></div>
          <hr class="separator">
          <button id="add-photo-btn">Ajouter une photo</button>
        </div>
      </div>
  `;
  document.body.appendChild(modal);

  // Remplit la galerie avec les travaux
  displayModalWorks(modal);

  // Gestion ouverture/fermeture
  const editProjects = document.getElementById("edit-projects");
  const closeModal = modal.querySelector(".close-modal");

  editProjects.addEventListener("click", () => {
    modal.classList.remove("hidden");
    modal.classList.add("show");
    document.body.classList.add("no-scroll");
  });

  closeModal.addEventListener("click", () => {
    modal.classList.remove("show");
    modal.classList.add("hidden");
    document.body.classList.remove("no-scroll");
  });

  // Fermeture au clic sur l'overlay
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("show");
      modal.classList.add("hidden");
      document.body.classList.remove("no-scroll");
    }
  });

  // Gestion du bouton "Ajouter une photo"
  const addPhotoBtn = modal.querySelector("#add-photo-btn");
  addPhotoBtn.addEventListener("click", () => switchToAddPhotoView(modal));
}

function displayModalWorks(modal) {
  const galleryModal = modal.querySelector(".gallery-modal");
  galleryModal.innerHTML = ""; // Nettoie avant de remplir

  currentWorks.forEach(work => {
    const figure = document.createElement("figure");
    figure.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}">
      <button class="delete-work" data-id="${work.id}"><i class="fas fa-trash-alt"></i></button>
    `;
    galleryModal.appendChild(figure);
  });
}

function switchToAddPhotoView(modal) {
  const modalBody = modal.querySelector(".modal-body");

  // Supprime tous les h3 existants
  const existingH3 = modalBody.querySelectorAll("h3");
  existingH3.forEach(h3 => h3.remove());

  modalBody.innerHTML = `
    <h3>Ajout photo</h3>
    <form id="add-photo-form">
      <input type="file" id="photo-upload" accept="image/*">
      <input type="text" id="photo-title" placeholder="Titre">
      <input type="text" id="photo-category" placeholder="Catégorie">
      <button type="submit">Valider</button>
    </form>
    <button id="back-to-gallery">Retour</button>
  `;

  const backBtn = modalBody.querySelector("#back-to-gallery");
  backBtn.addEventListener("click", () => switchToGalleryView(modal));
}

function switchToGalleryView(modal) {
  const modalBody = modal.querySelector(".modal-body");

  // Supprime tous les h3 existants
  const existingH3 = modalBody.querySelectorAll("h3");
  existingH3.forEach(h3 => h3.remove());

  modalBody.innerHTML = `
    <h3>Galerie photo</h3>
    <div class="gallery-modal"></div>
    <hr class="separator">
    <button id="add-photo-btn">Ajouter une photo</button>
  `;
  displayModalWorks(modal); // Remplit à nouveau la galerie
  const addPhotoBtn = modalBody.querySelector("#add-photo-btn");
  addPhotoBtn.addEventListener("click", () => switchToAddPhotoView(modal));
}

// Appelle createModal quand les éléments admin sont créés
function createAdminElements() {
  const adminBanner = document.createElement("div");
  adminBanner.id = "admin-banner";
  adminBanner.innerHTML = '<i class="fas fa-pen-to-square"></i> Mode édition';
  adminBanner.classList.add("hidden");
  document.documentElement.insertBefore(adminBanner, document.querySelector("body"));

  const editProjects = document.createElement("div");
  editProjects.id = "edit-projects";
  editProjects.innerHTML = '<i class="fas fa-pen-to-square"></i> modifier';
  editProjects.classList.add("hidden");

  const portfolioSection = document.getElementById("portfolio");
  const h2 = portfolioSection.querySelector("h2");

  const titleContainer = document.createElement("div");
  titleContainer.classList.add("title-container");
  
  h2.parentNode.insertBefore(titleContainer, h2);
  titleContainer.appendChild(h2);
  titleContainer.appendChild(editProjects);

  createModal(); // Crée la modale ici
}
/////////////////////////////////////////////////////////////////////