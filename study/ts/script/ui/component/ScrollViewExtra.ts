/**
 * view content item 统一在左下角画圆
 * 以view坐标原点为原点坐标（0，0）
 * 绘制可见区域矩形
 * 父子关系 view-->content-->item...
 */
export default class ScrollViewExtra extends cc.Component{
    private _content:cc.Node;
    private _view:cc.Node;
    private _contentChildrenRect:cc.Rect;//每个子节点矩形
    private _viewRect:cc.Rect;//可见区域矩形
    private _viewStartPos:cc.Vec2;
    private _isInitFinished:boolean = false;
    onLoad(){
        this._view = this.node.getChildByName("view");
        this._content = this._view.getChildByName("content");
        this._contentChildrenRect = new cc.Rect();
        this._viewStartPos = new cc.Vec2();
        this._createViewRect();
    }

    public init(view:cc.Node,content:cc.Node):void{
        this._isInitFinished = true;
    }

    //想象以左下角为原点绘制矩形
    private _createViewRect():void{
        this._viewStartPos.x = -this._view.anchorX*this._view.width;
        this._viewStartPos.y = -this._view.anchorY*this._view.height;
        this._viewRect = new cc.Rect(this._viewStartPos.x,this._viewStartPos.y,this._view.width,this._view.height);
    }

    onEnable():void{

    }
    onDisable():void{

    }
    update():void{
        this._updateChidrenOpacity(this._content.children,this._content.x,this._content.y);
    }
    private _updateChidrenOpacity(children:Array<cc.Node>,startX:number,startY:number):void{
        var len = children.length;
         for(var j = 0;j<len;j++)
         {
             this._contentChildrenRect.x = children[j].x+startX-children[j].anchorX*children[j].width;
             this._contentChildrenRect.y = children[j].y+startY-children[j].anchorY*children[j].height;
             this._contentChildrenRect.height = children[j].height;
             this._contentChildrenRect.width = children[j].width;
             //使用透明度 如果透明度为0则不进行渲染
             if(this._viewRect.intersects(this._contentChildrenRect))
             {
                children[j].opacity = 255;
             }
             else
             {
                 children[j].opacity = 0;
             }
         }
    }
    private _updateDeepChildrenOpacity(children:Array<cc.Node>,startX:number,startY:number):void{
        var len = children.length;
        for(var j = 0;j<len;j++)
        {
            this._contentChildrenRect.x = children[j].x+startX-children[j].anchorX*children[j].width;
            this._contentChildrenRect.y = children[j].y+startY-children[j].anchorY*children[j].height;
            this._contentChildrenRect.height = children[j].height;
            this._contentChildrenRect.width = children[j].width;
            //使用透明度 如果透明度为0则不进行渲染
            if(this._viewRect.intersects(this._contentChildrenRect))
            {
                children[j].opacity = 255;
            }
            else
            {
                children[j].opacity = 0;
            }
        }
    }

}