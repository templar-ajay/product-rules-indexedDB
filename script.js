const masterProductInput = document.querySelector("#masterProductInput");
const childProductsInput = document.querySelector("#childProductsInput");
const availabilityInput = document.querySelector("#availability");

const saveRuleBtn = document.querySelector("#saveRuleBtn");
const discardRuleBtn = document.querySelector("#discardRuleBtn");

const cardsContainer = document.querySelector("#cardsContainer");

const db = await openDB();
readData().then((data) => {
  renderCards(data);
});

////////////////////////////////////variable declarations////////////////////////////////////////

saveRuleBtn.addEventListener("click", () => {
  const masterProduct = masterProductInput.value;
  const available = availabilityInput.checked;
  const childProducts = childProductsInput.value
    .split(",")
    .map((item) => item.trim());
  const numberOfChildProducts = childProducts.length;

  const data = {
    master: masterProduct,
    childProducts: childProducts,
    available: available,
    numberOfChildProducts: numberOfChildProducts,
  };

  addData(data);
  clearInputs();
  cardsContainer.appendChild(renderCard(data));
});

discardRuleBtn.addEventListener("click", () => {
  clearInputs();
});

//////////////////////////////////////function declarations//////////////////////////////////////
function openDB() {
  return new Promise((resolve) => {
    const request = indexedDB.open("ProductRules", 1);

    request.onerror = (e) => {
      console.log(`Error!! ${e.target.error}`);
    };
    request.onsuccess = (e) => {
      resolve(e.target.result);
    };

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      const objectStore = db.createObjectStore("rules", {
        keyPath: "master",
      });
    };
  });
}

async function addData(data) {
  if (!db) db = await openDB();
  const objectStore = db
    .transaction(["rules"], "readwrite")
    .objectStore("rules");

  const request = objectStore.add(data);
  request.onerror = (e) => {
    console.log(`Error !! adding data to database ${e.target.error}`);
  };
  request.onsuccess = (e) => {
    console.log(data, `successfully added to database`);
  };
}

// // adding data to the database
// const data = {
//   master: "apple-watch",
//   id: 1,
//   childProducts: ["shoes Nike", "iPhone13proMax", "Race Bike"],
// };
// const data2 = {
//   master: "apple-watch2",
//   id: 1,
//   childProducts: ["shoes Nike", "iPhone13proMax", "Race Bike"],
// };
// const data3 = {
//   master: "apple-watch3",
//   id: 1,
//   childProducts: ["shoes Nike", "iPhone13proMax", "Race Bike"],
// };

//read data

// const data = await readData(); // It works
// console.log(`data`, data);
async function readData() {
  if (!db) db = await openDB();
  return new Promise((resolve, reject) => {
    const objectStore = db
      .transaction(["rules"], "readonly")
      .objectStore("rules");

    // const request = objectStore.get("apple-watch");
    // const request = objectStore.count("apple-watch");
    // const request = objectStore.getAll();
    // const request = objectStore.getAll("apple-watch");

    // const request = objectStore.getAllKeys();
    const request = objectStore.openCursor();

    const arr = [];
    request.onsuccess = (e) => {
      const cursor = request.result || e.target.result;
      if (cursor) {
        console.log(`Requested data is `, e.target.result);
        arr.push(e.target.result.value);
        cursor.continue();
      } else {
        console.log(`all entries displayed`);
        console.log(`arr`, arr);
        resolve(arr);
      }
    };

    // request.onsuccess = (e) => {
    //   console.log(`Requested data is `, e.target.result);
    // };

    request.onerror = (e) => {
      console.log(`Error!! ${e.target.error}`);
    };
  });
}

// updating data
async function updateData(keyPath, key, value) {
  if (!db) db = await openDB();

  const objectStore = db
    .transaction(["rules"], "readwrite")
    .objectStore("rules");

  const request = objectStore.get(keyPath);

  request.onerror = (e) => {
    console.log(`Error!!! fetching "${keyPath}" from database`, e.target.error);
  };

  request.onsuccess = (e) => {
    const data = e.target.result;

    data[key] = value;

    const updateRequest = objectStore.put(data);
    updateRequest.onerror = (e) => {
      console.log("Error!!", e.target.error);
    };
    updateRequest.onsuccess = (e) => {
      console.log(`Data updated successfully`, e.target.result);
    };
  };
}

// deleting data

async function deleteData(data) {
  if (!db) db = await openDB();
  const objectStore = db
    .transaction(["rules"], "readwrite")
    .objectStore("rules");

  const request = objectStore.openCursor();
  request.onerror = (e) => {
    console.log(`Error while opening cursor in deleteData fn`, e.target.error);
  };
  request.onsuccess = (e) => {
    const cursor = request.result || e.target.result;
    if (cursor) {
      console.log(cursor);
      if (cursor.value.master === data) {
        cursor.delete();
      } else cursor.continue();
    }
    console.log(`all entries displayed`);
  };
}

function clearInputs(x) {
  masterProductInput.value = "";
  childProductsInput.value = "";
  availabilityInput.removeAttribute("checked");

  x
    ? (editAvailability.removeAttribute("checked"),
      (editChildProductsInput.value = ""),
      (editMasterProductInput.value = ""))
    : null;
}

function renderCard(data) {
  const card = document.createElement("div");
  card.className = "m-2";
  //   card.innerHTML = `<div class="card" style="width: 18rem;">
  //   <div class="card-body">
  //     <h5 class="card-title">Special title treatment</h5>
  //     <p class="card-text">With supporting text below as a natural lead-in to additional content.</p>
  //     <a href="#" class="btn btn-outline-warning">Edit Card</a>
  //     <a href="#" class="btn btn-outline-danger">Delete</a>
  //   </div>
  // </div>`;
  const cardInner = document.createElement("div");
  cardInner.className = "card";
  cardInner.style = "width: 18rem";
  card.appendChild(cardInner);

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";
  cardInner.appendChild(cardBody);

  const cardTitleEl = document.createElement("h5");
  cardTitleEl.className = "card-title";
  cardTitleEl.innerHTML = data.master;
  cardBody.appendChild(cardTitleEl);

  const cardTextEl = document.createElement("p");
  cardTextEl.className = "card-text";

  cardTextEl.innerHTML = Object.entries(data)
    .map((arr) => (arr[0] !== "numberOfChildProducts" ? arr[1] : arr.join("-")))
    .filter((a, i) => i)
    .flat()
    .join(", ");

  cardBody.appendChild(cardTextEl);

  const editRuleButton = document.createElement("button");
  editRuleButton.className = "btn btn-outline-primary";
  editRuleButton.innerHTML = "Edit Rule";

  editRuleButton.setAttribute("data-bs-toggle", "modal");
  editRuleButton.setAttribute("data-bs-target", "#staticBackdrop");

  cardBody.appendChild(editRuleButton);

  const deleteRuleBtn = document.createElement("button");
  deleteRuleBtn.className = "btn btn-outline-danger m-2";
  deleteRuleBtn.innerHTML = "Delete";
  cardBody.appendChild(deleteRuleBtn);

  deleteRuleBtn.addEventListener("click", (e) => {
    deleteData(data.master);
    readData().then((data) => {
      renderCards(data);
    });
  });

  editRuleButton.addEventListener("click", (e) => {
    const modal = document.querySelector("#staticBackdrop");
    const editMasterProductInput = document.querySelector(
      "#editMasterProductInput"
    );
    const editChildProductsInput = document.querySelector(
      "#editChildProductsInput"
    );
    const editAvailability = document.querySelector("#editAvailability");

    editMasterProductInput.value = data.master;
    editChildProductsInput.value = data.childProducts.flat().join(", ");
    data.available ? editAvailability.setAttribute("checked") : null;

    const updateRule = document.querySelector("#updateRule");
    const dismissRule = document.querySelector("#dismissRule");

    dismissRule.addEventListener("click", () => {
      clearInputs(true);
    });

    updateRule.addEventListener("click", () => {
      const available = editAvailability.checked;
      const childProducts = editChildProductsInput.value
        .split(",")
        .map((item) => item.trim());
      const numberOfChildProducts = childProducts.length;

      updateData(data.master, "childProducts", childProducts);
      updateData(data.master, "numberOfChildProducts", childProducts.length);
      updateData(data.master, "available", available);
      readData().then((data) => {
        renderCards(data);
      });
    });
  });

  return card;
}

function renderCards(data) {
  cardsContainer.innerHTML = "";
  data.forEach((data) => {
    cardsContainer.appendChild(renderCard(data));
  });
}

/*
<!-- Button trigger modal -->
  <button
    type="button"
    class="btn btn-primary"
    data-bs-toggle="modal"
    data-bs-target="#staticBackdrop"
  >
    Launch static backdrop modal
  </button>
  */
