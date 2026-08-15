// Ad vendor integration removed. Export a lightweight stub so imports remain valid.
export const AD_SCRIPT_SRC = '';
export const AD_CONTAINER_ID = 'ad-container';

export function loadAdScript(): Promise<void> {
  return Promise.resolve();
}
