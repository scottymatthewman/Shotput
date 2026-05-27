import { Agentation } from 'agentation'

const AGENTATION_ENDPOINT = 'http://localhost:4747'

/** Dev-only visual feedback overlay — requires `npm run agentation:server`. */
export function AgentationDevTools() {
  return (
    <Agentation
      endpoint={AGENTATION_ENDPOINT}
      onSessionCreated={(sessionId) => {
        console.info('[agentation] Session started:', sessionId)
      }}
    />
  )
}
