import { G_EffectGfxMgr } from "../../../init";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HeroGoldLevelNode extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _image1: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _image2: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _image3: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _image4: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _image5: cc.Node = null;
    setCount(count) {
        for (var i = 1; i <= 5; i++) {
            if (i <= count) {
                
                this['_image' + i].active = (true);
                this['_image' + i].removeAllChildren();
                G_EffectGfxMgr.createPlayMovingGfx(this['_image' + i], 'moving_jinjiangyangcheng_bagua', null, null);
            } else {
                this['_image' + i].active = (false);
            }
        }
    }
}