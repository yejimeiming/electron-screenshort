import type { Bounds } from '../types'

export type OnOk = (blob: Blob, bounds: Bounds) => void
export type OnCancel = () => void
export type OnSave = OnOk

export class Call {
  private static _onOk: OnOk | undefined
  private static _onCancel: OnCancel | undefined
  private static _onSave: OnSave | undefined

  static _init(funcs: {
    onOk: OnOk,
    onCancel: OnCancel,
    onSave: OnSave,
  }) {
    Call._onOk = funcs.onOk
    Call._onCancel = funcs.onCancel
  }

  static onOk(blob: Blob, bounds: Bounds) {
    Call._onOk?.(blob, bounds)
  }

  static onCancel() {
    Call._onCancel?.()
  }

  static onSave(blob: Blob, bounds: Bounds) {
    Call._onSave?.(blob, bounds)
  }
}
