const DB_NAME = "teto-summary";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve, reject) => {
    const db = indexedDB.open(DB_NAME, DB_VERSION);

    db.onsuccess = (ev) => {
      resolve(db.result);
    }

    db.onerror = (ev) => {
      resolve(null);
    }
    
    db.onupgradeneeded = (ev) => {
      const store = db.result;
      
      if (!store.objectStoreNames.contains("matches")) {
        const objectStore = store.createObjectStore("matches", {
          keyPath: "id"
        })
        
        objectStore.createIndex("ts", "ts", { unique: false });
        objectStore.createIndex("userid", "userid", { unique: false });
      }
    }
  });
}

async function initDb() {
  await openDb();
}

export {
  initDb,
  openDb,
}