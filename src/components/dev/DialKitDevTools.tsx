import { DialRoot } from 'dialkit'
import 'dialkit/styles.css'

/** Dev-only floating control panel for tuning motion and layout values. */
export function DialKitDevTools() {
  return <DialRoot defaultOpen={false} position="top-right" theme="system" />
}
