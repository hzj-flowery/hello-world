export default class FrameBuffer {
    /**
     * @constructor
     * @param {WebGLContext} gl
     * @param {Number} width
     * @param {Number} height
     * @param {Object} options
     * @param {Array} options.colors
     * @param {RenderBuffer|Texture2D|TextureCube} options.depth
     * @param {RenderBuffer|Texture2D|TextureCube} options.stencil
     * @param {RenderBuffer|Texture2D|TextureCube} options.depthStencil
     */
    constructor(gl, width, height, options) {
      this._gl = gl;
      this._width = width;
      this._height = height;
  
      this._colors = options.colors || [];
      this._depth = options.depth || null;
      this._stencil = options.stencil || null;
      this._depthStencil = options.depthStencil || null;
  
      this._glID = gl.createFramebuffer();
    }

    private _gl:any;
    public _width:number;
    public _height:number;
    private _colors:Array<number>;
    private _depth:any;
    private _stencil:any;
    private _depthStencil:any;
    private _glID:any;
  
    /**
     * @method destroy
     */
    destroy() {
      if (this._glID === null) {
        console.error('The frame-buffer already destroyed');
        return;
      }
  
      const gl = this._gl;
      gl.deleteFramebuffer(this._glID);
      this._glID = null;
    }
  
    getHandle() {
      return this._glID;
    }
  }