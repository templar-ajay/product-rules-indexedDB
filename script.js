const masterProductInput = document.querySelector("#masterProductInput");
const childProductsInput = document.querySelector("#childProductsInput");
const availabilityInput = document.querySelector("#availability");

const saveRuleBtn = document.querySelector("#saveRuleBtn");
const discardRuleBtn = document.querySelector("#discardRuleBtn");

const db = await openDB();

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
    }
  };

  // request.onsuccess = (e) => {
  //   console.log(`Requested data is `, e.target.result);
  // };

  request.onerror = (e) => {
    console.log(`Error!! ${e.target.error}`);
  };
  return arr;
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

function clearInputs() {
  masterProductInput.value = "";
  childProductsInput.value = "";
  availabilityInput.removeAttribute("checked");
}

function renderCards() {}
