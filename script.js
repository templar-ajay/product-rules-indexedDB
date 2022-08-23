const masterProductInput = document.querySelector("#masterProductInput");
const childProductsInput = document.querySelector("#childProductsInput");

const saveRuleBtn = document.querySelector("#saveRuleBtn");
const discardRuleBtn = document.querySelector("#discardRuleBtn");

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
        autoIncrement: true,
      });
    };
  });
}

const db = await openDB();

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
    console.log(`${data} successfully added to database`);
  };
}

const data = {
  master: "apple-watch",
  childProducts: ["shoes Nike", "iPhone13proMax", "Race Bike"],
};

addData(data);
