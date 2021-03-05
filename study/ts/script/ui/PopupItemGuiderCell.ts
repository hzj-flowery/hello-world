const { ccclass, property } = cc._decorator;

import { ConfigNameConst } from '../const/ConfigNameConst';
import { G_ConfigLoader, G_ConfigManager, G_UserData } from '../init';
import { Lang } from '../lang/Lang';
import { WayFuncDataHelper } from '../utils/data/WayFuncDataHelper';
import { handler } from '../utils/handler';
import { Path } from '../utils/Path';
import { Util } from '../utils/Util';
import CommonButtonLevel1Highlight from './component/CommonButtonLevel1Highlight';
import CommonLevelStar from './component/CommonLevelStar';
import { LogicCheckHelper } from '../utils/LogicCheckHelper';
import { FunctionConst } from '../const/FunctionConst';


@ccclass
export default class PopupItemGuiderCell extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelCon: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitleName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNum: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDesc: cc.Label = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonOK: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _nodeNoOpen: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageIcon: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: CommonLevelStar,
        visible: true
    })
    _starNode: CommonLevelStar = null;

    private _cellValue;
    _cfgData: any;

    start() {
        //this._buttonOK.setString('前 往');
        // this._panelTouch.setSwallowTouches(false);
        // this._panelTouch.setTouchEnabled(true);

        // this.node.on(cc.Node.EventType.TOUCH_END, ()=>{
        //     console.log('guideitem touch');
        // }, this);
        this._buttonOK.addClickEventListenerEx(handler(this, this.onGoHandler));
    }

    onGoHandler() {
        // console.log('onGoHandler>>');
        //WayFuncDataHelper.gotoModule(this._cellValue);
        this._clickCallback && this._clickCallback(this._cellValue);
    }

    private _clickCallback;
    setClickCallback(clickCallback) {
        this._clickCallback = clickCallback;
    }

    updateUI(index, cellValue) {
        var cfgData = cellValue.cfg;
        this._cellValue = cellValue;
        if (cfgData == null) {
            return;
        }
        var name:string = cfgData.name;
        var directions = cfgData.directions;
        if (!G_ConfigManager.checkCanRecharge() ) {
            name = name.replace(/商(城|店)/, '资源').replace('充值', '');
            directions = directions.replace('充值', '').replace(/商(城|店)/, '资源');
        }
        this._textTitleName.string = (name);
        Util.updatelabelRenderData(this._textTitleName);
        this._textDesc.string = (directions);
        var imagePath: string = Path.getCommonIcon('main', cfgData.icon);
        this._imageIcon.sizeMode = cc.Sprite.SizeMode.RAW;
        this._cfgData = cfgData;
        cc.resources.load(imagePath, cc.SpriteFrame, (err, data) => {
            var res = cc.resources.get(imagePath, cc.SpriteFrame);
            this._imageIcon.spriteFrame = res;
        });
        this._cellValue = cellValue;

        this._textNum.node.active = false;
        this._starNode.node.active = false;
        this._buttonOK.node.active = true;
        this._nodeNoOpen.node.active = false;

        var storyConfig = G_ConfigLoader.getConfig(ConfigNameConst.STORY_STAGE);
        var stageData = G_UserData.getStage();
        if (cfgData.type == 1) {
            var stroyData = storyConfig.get(cfgData.value);
            var stroyName = stroyData ? stroyData.name : '';
            var isOpen = G_UserData.getStage().isStageOpen(cfgData.value);
            var isSuperSweepOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_SUPER_SWEEP)[0];
            if (isOpen == true) {
                var stageCountArr = stageData.getStageCount(cfgData.value);
                var stroyCount = stageCountArr[0];
                var maxCount = stageCountArr[1];
                var leftCount = maxCount - stroyCount;
                var starCount = stageData.getStarById(cfgData.value);
                var textNumX = this._textTitleName.node.x + this._textTitleName.node.width + 5;
                this._textNum.node.x = (textNumX);
                this._textNum.string = '(' + (leftCount + ('/' + (maxCount + ')')));
                this._textNum.node.active = true;
                this._starNode.setCount(starCount, 3);
                this._starNode.node.active = true;
                this._nodeNoOpen.node.active = false;
                if (isSuperSweepOpen && starCount == 3) {
                    this._buttonOK.setString(Lang.get('common_btn_sweep_to'));
                } else {
                    this._buttonOK.setString(Lang.get('common_btn_go_to'));
                }
            } else {
                this._nodeNoOpen.node.active = true;
                this._buttonOK.node.active = false;
            }
            var dirName = Lang.getTxt(cfgData.directions, { name: stroyName });
            this._textDesc.string = (dirName);
        } else {
            this._buttonOK.setString(Lang.get('common_btn_go_to'));
        }
    }

}