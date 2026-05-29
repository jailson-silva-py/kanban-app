import { floatMenuStorageCore } from "@/app/util/floatMenuStorage"
import { useSyncExternalStore } from "react"

const useFloatMenuStorage = () => {
  const storage = useSyncExternalStore(floatMenuStorageCore.subscribe, floatMenuStorageCore.getStorage, floatMenuStorageCore.getStorage)
  return storage
}

export default useFloatMenuStorage;
