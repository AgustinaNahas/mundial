import { debugLog } from "@/lib/debug-log"

const MAX_CONCURRENT = 2
let active = 0
const queue: (() => void)[] = []

function pump() {
  while (active < MAX_CONCURRENT && queue.length > 0) {
    const next = queue.shift()!
    next()
  }
}

/** Máx. 2 imports dinámicos a la vez: evita saturar Turbopack sin serializar todo. */
export function withConcurrentImport<T>(
  sectionId: string,
  fn: () => Promise<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const run = () => {
      const t0 = Date.now()
      // #region agent log
      debugLog(
        "concurrent-import.ts",
        "import slot started",
        { sectionId, active, queued: queue.length },
        "H9",
        "post-fix-v3",
      )
      // #endregion
      fn()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          active--
          // #region agent log
          debugLog(
            "concurrent-import.ts",
            "import slot finished",
            { sectionId, ms: Date.now() - t0, active },
            "H9",
            "post-fix-v3",
          )
          // #endregion
          pump()
        })
    }

    const enqueue = () => {
      active++
      run()
    }

    if (active < MAX_CONCURRENT) {
      enqueue()
    } else {
      queue.push(enqueue)
      // #region agent log
      debugLog(
        "concurrent-import.ts",
        "import queued",
        { sectionId, queueLen: queue.length },
        "H9",
        "post-fix-v3",
      )
      // #endregion
    }
  })
}
