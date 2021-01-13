import noise from './perlin-noise.frag'
import main from './main.frag'
import cubicInOut from '../../../glsl-easings/cubic-in-out.glsl'

export default `
precision mediump float;

${cubicInOut}
${noise}
${main}
`
