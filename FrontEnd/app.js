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
    gallery.innerHTML = ""; // clean de la galerie
  
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
  
    // Bouton "Tous"
    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.classList.add("active");
    allButton.addEventListener("click", () => {
      displayWorks(currentWorks);
      setActiveButton(allButton);
    });
    filtersContainer.appendChild(allButton);
  
    // Boutons des autres catégorie
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
  
  let currentWorks = [];
  
  async function init() {
    currentWorks = await fetchWorks();
    const uniqueCategories = getUniqueCategories(currentWorks);
  
    createFilterButtons(uniqueCategories);
  
    // Affiche tous les travaux au démarrage
    displayWorks(currentWorks);
  }

////////////////// LOGIN ////////////////// 
document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("login");
  const loginForm = document.getElementById("loginForm");
  const loginNavItem = document.getElementById("nav-login");
  const projectsNavItem = document.getElementById("nav-projets");

  // Masque la section login au chargement de la page
  if (loginSection) {
    loginSection.classList.remove("show");
    loginSection.classList.add("hidden");
    document.body.classList.remove("no-scroll");
  }

  // Affiche la section login au clic sur "login"
  if (loginNavItem) {
    loginNavItem.addEventListener("click", (event) => {
      event.preventDefault();
      loginSection.classList.remove("hidden");
      loginSection.classList.add("show");
      document.body.classList.add("no-scroll");
    });
  }

  // Masque la section login pour afficher la galerie
  if (projectsNavItem) {
    projectsNavItem.addEventListener("click", () => {
      loginSection.classList.remove("show");
      loginSection.classList.add("hidden");
      document.body.classList.remove("no-scroll");
    });
  }

  // Gestion de la soumission du formulaire de connexion
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Empêche le rechargement de la page

      // Récupère les valeurs des champs
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("password").value;

      // Crée l'objet pour la charge utile
      const credentials = {
        email: email,
        password: password
      };

      try {
        // Envoie la requête POST à l'API
        const response = await fetch("http://localhost:5678/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials)
        });

        // Vérifie la réponse
        if (response.ok) {
          const data = await response.json();
          // Stocke le token dans localStorage
          window.localStorage.setItem("authToken", data.token);
          
          // Masque la section login et redirige vers la page d'accueil
          loginSection.classList.remove("show");
          loginSection.classList.add("hidden");
          document.body.classList.remove("no-scroll");
          window.location.href = "/"; // Redirection vers la page d'accueil
        } else {
          // Affiche un message d'erreur
          const errorMessage = document.createElement("p");
          errorMessage.textContent = "Erreur : Email ou mot de passe incorrect";
          errorMessage.style.color = "red";
          errorMessage.style.textAlign = "center";
          // Supprime un ancien message d'erreur s'il existe
          const oldError = loginForm.querySelector("p");
          if (oldError) oldError.remove();
          loginForm.appendChild(errorMessage);
        }
      } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        // Affiche un message d'erreur générique en cas de problème réseau
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
///////////////////////////////////////////

init();
  