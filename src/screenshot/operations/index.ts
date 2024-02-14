import Ok from './ok/index.vue'
import Cancel from './cancel/index.vue'
import Save from './save/index.vue'
import Redo from './redo/index.vue'
import Undo from './undo/index.vue'
import Mosaic from './mosaic/index.vue'
import Text from './text/index.vue'
import Brush from './brush/index.vue'
import Arrow from './arrow/index.vue'
import Ellipse from './ellipse/index.vue'
import Rectangle from './rectangle/index.vue'
import Search from './search/index.vue'
import Scan from './scan/index.vue'
import Pin from './pin/index.vue'

export const OperationsRectKey = '@operations/rect'

export default [
  Pin,
  Scan,
  Search,
  '|',
  Rectangle,
  Ellipse,
  Arrow,
  Brush,
  Text,
  Mosaic,
  '|',
  Undo,
  Redo,
  '|',
  Save,
  Cancel,
  Ok,
]
