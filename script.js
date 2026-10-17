// ====== (projet gestion des etudiants) =======
const formulaire = document.getElementById("form-etudiant");

let indexModification = null;

let pageActuelle = 1;
const etudiantsParPage = 5;

formulaire.addEventListener("submit", function (e) {
  e.preventDefault();

  const messageErreur = document.getElementById("message-erreur");
  messageErreur.textContent = "";

  document.getElementById("message-succes").textContent = "";

  const nomSaisie = document.getElementById("nom").value.trim();
  const prenomSaisie = document.getElementById("prenom").value.trim();
  const mailSaisie = document.getElementById("email").value.trim();
  const classeSaisie = document.getElementById("classe").value.trim();
  const noteSaisie = document.getElementById("note").value.trim();

  if (
    nomSaisie === "" ||
    prenomSaisie === "" ||
    mailSaisie === "" ||
    classeSaisie === "" ||
    noteSaisie === ""
  ) {
    // alert("Tous les champs doivent être remplis !");
    // return;

    messageErreur.textContent = "Tous les champs sont obligatoires !";
    return;
  }

  const noteNombre = Number(noteSaisie);

  if (isNaN(noteNombre) || noteNombre < 0 || noteNombre > 20) {
    // alert("Saisissez une note valide !");
    // return;

    messageErreur.textContent = "Tous les champs sont obligatoires !";
    return;
  }

  // console.log("nom : " + nomSaisie, "," + "prenom : " + prenomSaisie, "," + "E-mail : " + mailSaisie, "," + "Classe : " + classeSaisie, "," + "note : " + noteSaisie);

  let passage = "";

  if (noteNombre < 10) {
    passage = "Echec";
  } else {
    passage = "Admis";
  }

  const etudiantAjt = {
    nomE: nomSaisie,
    prenomE: prenomSaisie,
    mailE: mailSaisie,
    classeE: classeSaisie,
    noteE: noteNombre,
    passageE: passage,
  };

  const etudiants = JSON.parse(localStorage.getItem("etudiants")) || [];

  // Vérifier si l'email existe déjà
  let emailExiste = false;

  if (indexModification === null) {
    // Mode ajout
    emailExiste = etudiants.some(function (etudiant) {
      return etudiant.mailE === mailSaisie;
    });
  } else {
    // Mode modification
    // On vérifie seulement si l'email appartient à un autre étudiant
    emailExiste = etudiants.some(function (etudiant, index) {
      return etudiant.mailE === mailSaisie && index !== indexModification;
    });
  }

  if (emailExiste) {
    alert("Cet email est déjà utilisé !");
    return;
  }

  if (indexModification === null) {
    etudiants.push(etudiantAjt);
  } else {
    etudiants[indexModification] = etudiantAjt;
  }

  localStorage.setItem("etudiants", JSON.stringify(etudiants));

  console.log(etudiantAjt);

  const messageSucces = document.getElementById("message-succes");

  if (indexModification === null) {
    messageSucces.textContent = "Étudiant ajouté avec succès !";
  } else {
    messageSucces.textContent = "Étudiant modifié avec succès !";
  }

  setTimeout(function () {
    messageSucces.textContent = "";
  }, 3000);

  afficherEtudiant();

  formulaire.reset();

  // Remettre le bouton en mode ajout
  formulaire.querySelector("button[type='submit']").textContent =
    "Ajouter étudiant";

  indexModification = null;
});

function afficherEtudiant(texteRecherche = "") {
  const etudiantRecuperer = JSON.parse(localStorage.getItem("etudiants")) || [];
  // ============
  // totale etutudiants
  // ============
  let totaleEtudiant = etudiantRecuperer.length;

  let somme = etudiantRecuperer.reduce(
    (total, etudiant) => total + Number(etudiant.noteE),
    0,
  );
  let moyenne = somme / totaleEtudiant;
  console.log(parseFloat(moyenne));

  let etudiantAdmis = etudiantRecuperer.filter(function (etudiant) {
    return Number(etudiant.noteE) >= 10;
  });

  let nombreAdmis = etudiantAdmis.length;

  let tauxReussite = 0;

  if (totaleEtudiant > 0) {
    tauxReussite = (nombreAdmis / totaleEtudiant) * 100;
  }

  let meilleurEtudiant = null;

  if (etudiantRecuperer.length > 0) {
    meilleurEtudiant = etudiantRecuperer.reduce(function (meilleur, etudiant) {
      if (Number(etudiant.noteE) > Number(meilleur.noteE)) {
        return etudiant;
      }
      return meilleur;
    });
  }

  let texteMeilleur = "Aucun étudiant";

  if (meilleurEtudiant !== null) {
    texteMeilleur = `${meilleurEtudiant.prenomE} ${meilleurEtudiant.nomE} (${meilleurEtudiant.noteE}/20)`;
  }

  const corps = document.getElementById("liste-etudiants");

  corps.innerHTML = "";

  const recherche = texteRecherche.toLowerCase().trim();

  const classeChoisie = document
    .getElementById("filtre-classe")
    .value.toLowerCase();
  const triChoisi = document.getElementById("tri").value;
  let etudiantsFiltres = etudiantRecuperer
    .map(function (etudiant, index) {
      return {
        etudiant: etudiant,
        index: index,
      };
    })
    .filter(function (element) {
      const etudiant = element.etudiant;

      const correspondRecherche =
        etudiant.nomE.toLowerCase().includes(recherche) ||
        etudiant.prenomE.toLowerCase().includes(recherche) ||
        etudiant.mailE.toLowerCase().includes(recherche) ||
        etudiant.classeE.toLowerCase().includes(recherche);

      const correspondClasse =
        classeChoisie === "" ||
        etudiant.classeE.toLowerCase() === classeChoisie;

      return correspondRecherche && correspondClasse;
    });

  if (triChoisi === "nom-az") {
    etudiantsFiltres.sort(function (a, b) {
      return a.etudiant.nomE.localeCompare(b.etudiant.nomE);
    });
  } else if (triChoisi === "nom-za") {
    etudiantsFiltres.sort(function (a, b) {
      return b.etudiant.nomE.localeCompare(a.etudiant.nomE);
    });
  } else if (triChoisi === "note-desc") {
    etudiantsFiltres.sort(function (a, b) {
      return Number(b.etudiant.noteE) - Number(a.etudiant.noteE);
    });
  } else if (triChoisi === "note-asc") {
    etudiantsFiltres.sort(function (a, b) {
      return Number(a.etudiant.noteE) - Number(b.etudiant.noteE);
    });
  }

  const totalPages = Math.max(
    1,
    Math.ceil(etudiantsFiltres.length / etudiantsParPage),
  );

  if (pageActuelle > totalPages) {
    pageActuelle = totalPages;
  }

  const debut = (pageActuelle - 1) * etudiantsParPage;
  const etudiantsPage = etudiantsFiltres.slice(debut, debut + etudiantsParPage);

  // ==== messages =====
  if (etudiantsFiltres.length === 0) {
    let message = "Aucun étudiant ne correspond à votre recherche.";

    if (etudiantRecuperer.length === 0) {
      message = "Aucun étudiant enregistré pour le moment.";
    }

    corps.innerHTML = `
      <tr>
        <td colspan="8" class="message-vide">${message}</td>
      </tr>
    `;
  }

  etudiantsPage.forEach(function (element) {
    const etudiant = element.etudiant;
    const index = element.index;

    const ligne = document.createElement("tr");

    let classeResultat;

    if (Number(etudiant.noteE) >= 10) {
      classeResultat = "admis";
    } else {
      classeResultat = "echec";
    }

    ligne.innerHTML = ` 
            <td>${etudiant.nomE}</td> 
            <td>${etudiant.prenomE}</td> 
            <td>${etudiant.mailE}</td> 
            <td>${etudiant.classeE}</td> 
            <td>${etudiant.noteE}</td> 
            <td class="${classeResultat}">${etudiant.passageE}</td> 

            
 
            <td> 
                <button class="btn-supprimer" onclick="supprimerEtudiant(${index})"> 
                    Supprimer 
                </button> 
            </td> 
 
            <td> 
                <button class="btn-modifier" onclick="modifierEtudiant(${index})"> 
                    Modifier 
                </button> 
            </td> 
        `;

    corps.appendChild(ligne);
  });

  // =================
  // =================
  let colones = document.querySelector(".colones");
  colones.textContent = totaleEtudiant;

  colones.innerHTML = "";
  const contain = document.createElement("div");
  contain.innerHTML = `
        <div class="conteneur">
            <div class="item">
                <p>Total étudiants</p>
                <span>${totaleEtudiant}</span>
            </div>
            <div class="item">
                <p>Moyenne generale</p>
                <span>${moyenne.toFixed(2)}</span>
            </div>
            <div class="item">
                <p>Etudiants admis</p>
                <span>${nombreAdmis}</span>
            </div>
            <div class="item">
                <p>Meilleur étudiant</p>
                <span>${texteMeilleur}</span>
            </div>
        </div>
        <div class="item">
            <p>Taux de réussite</p>
            <span>${Math.round(tauxReussite)} %</span>
        </div>
      `;
  colones.appendChild(contain);

  // ===== pagination =====
  const pagination = document.getElementById("pagination");

  pagination.innerHTML = `
    <button onclick="changerPage(-1)" ${pageActuelle === 1 ? "disabled" : ""}>
      Précédent
    </button>
    <span>Page ${pageActuelle} sur ${totalPages}</span>
    <button onclick="changerPage(1)" ${pageActuelle === totalPages ? "disabled" : ""}>
      Suivant
    </button>
  `;
}

function supprimerEtudiant(index) {
  const confirmation = confirm("Voulez-vous vraiment supprimer cet étudiant ?");

  if (confirmation) {
    const etudiants = JSON.parse(localStorage.getItem("etudiants")) || [];

    etudiants.splice(index, 1);

    localStorage.setItem("etudiants", JSON.stringify(etudiants));

    afficherEtudiant();
  }
}

function modifierEtudiant(index) {
  const etudiants = JSON.parse(localStorage.getItem("etudiants")) || [];

  const etudiant = etudiants[index];

  document.getElementById("nom").value = etudiant.nomE;
  document.getElementById("prenom").value = etudiant.prenomE;
  document.getElementById("email").value = etudiant.mailE;
  document.getElementById("classe").value = etudiant.classeE;
  document.getElementById("note").value = etudiant.noteE;

  indexModification = index;

  formulaire.querySelector("button[type='submit']").textContent =
    "Enregistrer les modifications";
}

// ==========
function changerPage(direction) {
  pageActuelle = pageActuelle + direction;
  afficherEtudiant(recherche.value);
}

const recherche = document.getElementById("recherche");

recherche.addEventListener("input", function () {
  pageActuelle = 1;
  afficherEtudiant(recherche.value);
});

function exporterCSV() {
  const etudiants = JSON.parse(localStorage.getItem("etudiants")) || [];

  if (etudiants.length === 0) {
    alert("Aucun étudiant à exporter !");
    return;
  }

  const entetes = ["Nom", "Prénom", "Email", "Classe", "Note", "Résultat"];

  const lignes = etudiants.map(function (etudiant) {
    return [
      etudiant.nomE,
      etudiant.prenomE,
      etudiant.mailE,
      etudiant.classeE,
      etudiant.noteE,
      etudiant.passageE,
    ]
      .map(function (valeur) {
        return '"' + String(valeur).replace(/"/g, '""') + '"';
      })
      .join(";");
  });

  const contenu = [entetes.join(";")].concat(lignes).join("\n");

  const blob = new Blob(["\uFEFF" + contenu], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = "etudiants.csv";
  lien.click();
  URL.revokeObjectURL(url);
}

function exporterExcel() {
  const etudiants = JSON.parse(localStorage.getItem("etudiants")) || [];

  if (etudiants.length === 0) {
    alert("Aucun étudiant à exporter !");
    return;
  }

  const donnees = etudiants.map(function (etudiant) {
    return {
      Nom: etudiant.nomE,
      Prénom: etudiant.prenomE,
      Email: etudiant.mailE,
      Classe: etudiant.classeE,
      Note: etudiant.noteE,
      Résultat: etudiant.passageE,
    };
  });

  const feuille = XLSX.utils.json_to_sheet(donnees);
  const classeur = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(classeur, feuille, "Étudiants");
  XLSX.writeFile(classeur, "etudiants.xlsx");
}

const triSelect = document.getElementById("tri");

triSelect.addEventListener("change", function () {
  pageActuelle = 1;
  afficherEtudiant(recherche.value);
});

const filtreClasse = document.getElementById("filtre-classe");

filtreClasse.addEventListener("change", function () {
  pageActuelle = 1;
  afficherEtudiant(recherche.value);
});

const btnExportCSV = document.getElementById("btn-export-csv");

btnExportCSV.addEventListener("click", exporterCSV);

const btnExportExcel = document.getElementById("btn-export-xlsx");

btnExportExcel.addEventListener("click", exporterExcel);

afficherEtudiant();
