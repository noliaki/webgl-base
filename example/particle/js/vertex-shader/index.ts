import noise from './perlin-noise.glsl'
import main from './main.vert'
import cubicInOut from '../../../glsl-easings/cubic-in-out.glsl'

export default `
${noise}
${cubicInOut}

${main}
`
