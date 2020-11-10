export default class RenderBuffer {

    private _gl:any;
    public _width:number;
    public _height:number;
    private _format:any;
    private _glID:any;

    /**
     * 
     * @param {WebGLContext}gl 
     * @param format 
     * @param width 
     * @param height 
     */
    constructor(gl, format, width, height) {
      this._gl = gl;
      this._format = format;
      
      this._glID = gl.createRenderbuffer();
      this.update(width, height);
    }
  
    update (width, height) {
      this._width = width;
      this._height = height;
  
      const gl = this._gl;
      gl.bindRenderbuffer(gl.RENDERBUFFER, this._glID);
      gl.renderbufferStorage(gl.RENDERBUFFER, this._format, width, height);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }
  
    /**
     * @method destroy
     */
    destroy() {
      if (this._glID === null) {
        console.error('The render-buffer already destroyed');
        return;
      }
  
      const gl = this._gl;
  
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      gl.deleteRenderbuffer(this._glID);
  
      this._glID = null;
    }
  }