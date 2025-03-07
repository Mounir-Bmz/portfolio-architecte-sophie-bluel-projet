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
  const token = window.localStorage.getItem("authToken");

  if (token) {
    // État connecté : ajuste l’interface
    loginNavItem.textContent = "logout"; // Change "login" en "logout"
    loginNavItem.addEventListener("click", () => {
      window.localStorage.removeItem("authToken"); // Déconnexion
      window.location.reload(); // Recharge pour revenir à l’état déconnecté
    });
    // Ajoute le bandeau et le bouton modifier (voir étape 5)
  } else {
    // État déconnecté
    loginSection.classList.remove("show");
    loginSection.classList.add("hidden");
    document.body.classList.remove("no-scroll");

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
  }

  // Gestion de la soumission du formulaire de connexion
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Empêche le rechargement de la page

      // Récupère les valeurs des champs
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("password").value;

      // Crée l'objet pour la charge utile
      const credentials = { email, password };

      try {
        // Envoie la requête POST à l'API
        const response = await fetch("http://localhost:5678/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials)
        });

        const data = await response.json();

        // Vérifie la réponse
        if (response.status === 200 || response.status === 201) {
          window.localStorage.setItem("authToken", data.token);
          loginSection.classList.remove("show");
          loginSection.classList.add("hidden");
          document.body.classList.remove("no-scroll");
          window.location.reload(); // Recharge la page pour appliquer la logique connectée
        } else {
          // Gestion des erreurs
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
///////////////////////////////////////////

init();
  