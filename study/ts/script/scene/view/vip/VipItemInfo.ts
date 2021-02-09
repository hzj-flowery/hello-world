import UIHelper from "../../../utils/UIHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class VipItemInfo extends cc.Component {

    @property(cc.Node)
    Image_down:cc.Node = null;

    @property(cc.Sprite)
    Image_gold_icon:cc.Sprite = null;

    @property(cc.Sprite)
    Image_gold_num:cc.Sprite = null;


    @property(cc.Label)
    Text_gold_num:cc.Label = null;

    @property(cc.Label)
    Text_send_value:cc.Label = null;

    @property(cc.Label)
    Text_rmb_num:cc.Label = null;

    @property(cc.Label)
    Text_rmb:cc.Label = null;

    @property(cc.Sprite)
    Image_rmb:cc.Sprite = null;

    @property(cc.Sprite)
    Image_jade_num:cc.Sprite = null;


    @property(cc.Sprite)
    Image_jade:cc.Sprite = null;

    @property(cc.Sprite)
    Image_tip:cc.Sprite = null;

    

    _touchCallBack:any;
    _idx:number;

    addTouchEventListener(callback){
        if(this._touchCallBack){
            this._touchCallBack = callback;
            return;
        }
        var node = new cc.Node();
        var comp = node.addComponent(cc.Button);
        comp.node.setContentSize(this.node.getContentSize());
        node.setAnchorPoint(0,0);
        node.name = 'touchPanel';
        this.node.addChild(node);
        this._touchCallBack = callback;
        UIHelper.addEventListener(this.node, comp, 'VipItemInfo', 'onTouchEvent');
    }
    onTouchEvent(event){
        if(this._touchCallBack){
            this._touchCallBack(this);
        }
    }
    updateImageView(name:string, params:any){
        if(typeof(params) == 'string'){
            UIHelper.loadTextureAutoSize((this[name] as cc.Sprite), params);
        }else{
            if(params.texture)
            UIHelper.loadTextureAutoSize((this[name] as cc.Sprite), params.texture);
            if(params.visible!=null)
            (this[name] as cc.Sprite).node.active = params.visible;
        }
    }
    updateLabel(name:string, params:any){
        if(params&&params.text)
         (this[name] as cc.Label).string = params.text;
         if(params&&params.visible!=null)
         (this[name] as cc.Label).node.active = params.visible;
    }
    setTag(tag){
        this._idx = tag;
    }
    getTag(): number {
        return this._idx;
    }
}
