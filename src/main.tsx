export default () => {
  const clickScreenshot = () => {
    window.ipcRenderer.invoke('call-screenshot')
  }

  return (
    <div className='app-main'>
      <div className='inner-box'>
        <button onClick={clickScreenshot}>点击截图</button>
        <br/>
        <span>快捷键: Command/Control + Shift + S</span>
      </div>
    </div>
  )
}
