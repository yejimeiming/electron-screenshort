import { inject } from 'vue'

export const USE_CALL_KEY = '@hooks/use-call'

export function useCall() {
  const call = inject<ScreenshotProps>(USE_CALL_KEY)

  return call
}
