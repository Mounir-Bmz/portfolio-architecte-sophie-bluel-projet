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
  
  init();
  