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

export default [
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
