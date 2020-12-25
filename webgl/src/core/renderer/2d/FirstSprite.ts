import { SY } from "../base/Sprite";

var vertexshader3d =
    'attribute vec4 a_position;' +
    'uniform mat4 u_PVM_Matrix;' +
    'void main() {' +
    'gl_Position = u_PVM_Matrix * a_position;' +
    '}'

var fragmentshader3d =
    'precision mediump float;' +
    'uniform vec4 u_lightColor;' +
    'void main() {' +
    'gl_FragColor = u_lightColor;' +
    '}'

export default class FirstSprite extends SY.SpriteBase {
    constructor(gl) {
        super(gl);
        this._cameraType = 1;
    }
    protected onInit(): void {
        var z = 0;
        var positions = [-0.1, 0.4, z,
        -0.1, -0.4, z,
            0.1, -0.4, z,
            0.1, -0.4, z,
        -0.1, 0.4, z,
            0.1, 0.4, z,
            0.4, -0.1, z,
        -0.4, -0.1, z,
        -0.4, 0.1, z,
        -0.4, 0.1, z,
            0.4, -0.1, z,
            0.4, 0.1, z,
        ]
        this.createVertexsBuffer(positions, 3);

        this.setShader(vertexshader3d, fragmentshader3d);
    }

    public draw(time): void {
        const numInstances = 10000;
        var matrices = [];
        for (var j = 0; j < numInstances; j++) {
            let out = this._glMatrix.mat4.create();
            this._glMatrix.mat4.identity(out);
            matrices.push(out);
        }

        var colors = [
            [1, 0, 0, 1,],  // red
            [0, 1, 0, 1,],  // green
            [0, 0, 1, 1,],  // blue
            [1, 0, 1, 1,],  // magenta
            [0, 1, 1, 1,],  // cyan
        ];

        for(var j=0;j<numInstances;j++)
        {
            var res = this.getRandowColor();
            colors.push(res);
        }

        time *= 0.001; // seconds
        var gl = this.gl;

        this._shader.active();
        this._shader.setUseVertexAttribPointerForVertex(this.getGLID(SY.GLID_TYPE.VERTEX), this.getBufferItemSize(SY.GLID_TYPE.VERTEX));

        matrices.forEach((mat, ndx) => {
            this._glMatrix.mat4.identity(mat);
            if(Math.random()>0.5)
            this._glMatrix.mat4.translate(mat, mat, [-0.5 + ndx * 0.025, 0, 0]);
            else
            this._glMatrix.mat4.translate(mat, mat, [-0.5,-0.5 + ndx * 0.025, 0]);

            this._glMatrix.mat4.rotateZ(mat, mat, time * (0.1 + 0.1 * ndx));

                 const color = colors[ndx];
            this._shader.setUseLightColor(color);
            this._shader.setUseProjectViewModelMatrix(mat);

            gl.drawArrays(
                gl.TRIANGLES,
                0,             // offset
                12,   // num vertices per instance
            );
        });

    }

    private ColorTest = 
    [1, 0, 0, 1,  // red
    0, 1, 0, 1,  // green
    0, 0, 1, 1,  // blue
    1, 0, 1, 1,  // magenta
    0, 1, 1, 1,  // cyan
    ]
    private getRandowColor(){
        var p = Math.floor(Math.random()*10/2);
        if(p>=5)p=4;
        var data = this.ColorTest.slice(p*4,p*4+4);
        return data;
    }
}