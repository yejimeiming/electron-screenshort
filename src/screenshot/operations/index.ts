import Ok from './Ok/index.vue'
import Cancel from './Cancel/index.vue'
import Save from './Save/index.vue'
import Redo from './Redo/index.vue'
import Undo from './Undo/index.vue'
import Mosaic from './Mosaic/index.vue'
import Text from './Text/index.vue'
import Brush from './Brush/index.vue'
import Arrow from './Arrow/index.vue'
import Ellipse from './Ellipse/index.vue'
import Rectangle from './Rectangle/index.vue'
import Search from './Search/index.vue'
import Scan from './Scan/index.vue'
import Pin from './Pin/index.vue'

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
