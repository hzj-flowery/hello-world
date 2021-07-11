export default class RenderBuffer {

    private _gl:any;
    public _width:number;
    public _height:number;
    private _format:any;
    private glID:any;

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
      
      this.glID = gl.createRenderbuffer();
      this.update(width, height);
    }
  
    update (width, height) {
      this._width = width;
      this._height = height;
  
      const gl = this._gl;
      gl.bindRenderbuffer(gl.RENDERBUFFER, this.glID);
      gl.renderbufferStorage(gl.RENDERBUFFER, this._format, width, height);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }
  
    /**
     * @method destroy
     */
    destroy() {
      if (this.glID === null) {
        console.error('The render-buffer already destroyed');
        return;
      }
  
      const gl = this._gl;
  
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      gl.deleteRenderbuffer(this.glID);
  
      this.glID = null;
    }
  }