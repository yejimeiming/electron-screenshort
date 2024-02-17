/** 画框画布 */
export class Canvas {
  private static _ctx: CanvasRenderingContext2D | null

  static get ctx(): CanvasRenderingContext2D | null {
    return Canvas._ctx
  }

  static set ctx(ctx: CanvasRenderingContext2D | null) {
    Canvas._ctx = ctx
  }
}
