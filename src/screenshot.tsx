import Screenshots from './Screenshots'
import './Screenshots/screenshots.scss'

export default (props: { screenshot: string }) => {
  const onOk = async (blob: Blob) => {
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])

    alert('已经复制截图到剪切板 ^_^')

    window.ipcRenderer.invoke('exit-screenshot')
  }

  const onCancel = () => {
    window.ipcRenderer.invoke('exit-screenshot')
  }

  return (
    <div className='app-screenshot'>
      <Screenshots
        url={props.screenshot}
        width={window.innerWidth}
        height={window.innerHeight}
        onCancel={onCancel}
        onOk={onOk}
      />
    </div>
  )
}
