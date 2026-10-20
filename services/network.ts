import NetInfo from "@react-native-community/netinfo";
import { syncNotes } from "./syncService";

let isSyncing = false;

async function performSync() {
  if (isSyncing) {
    return;
  }

  try {
    isSyncing = true;

    await syncNotes();
  } catch (error) {
    console.error(
      "Automatic sync failed:",
      error
    );
  } finally {
    isSyncing = false;
  }
}

export function startNetworkSync() {
  const unsubscribe =
    NetInfo.addEventListener(
      async (state) => {
        const isOnline =
          state.isConnected === true &&
          state.isInternetReachable !== false;

        if (!isOnline) {
          console.log("Network: offline");
          return;
        }

        console.log("Network: online");

        await performSync();
      }
    );

  return unsubscribe;
}