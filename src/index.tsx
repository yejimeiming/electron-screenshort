import ReactDOM from 'react-dom/client'
import Screenshot from './screenshot'
import Main from './main'
import './index.scss'

const search = import.meta.url.split('?')[1]
const query = Object.fromEntries(new URLSearchParams(search).entries()) as { view: 'main' | 'screenshot' }
const root = ReactDOM.createRoot(document.getElementById('app')!)

if (query.view === 'screenshot') {
  window
    .ipcRenderer
    .invoke('get-screenshort-image')
    .then((screenshort: string) => root.render(<Screenshot screenshot={screenshort} />))
} else {
  root.render(<Main />)
}
