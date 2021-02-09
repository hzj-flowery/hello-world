import ListViewCellBase from "../../../ui/ListViewCellBase";
import { GachaGoldenHeroConst } from "../../../const/GachaGoldenHeroConst";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { Colors } from "../../../init";
import GachaGoldenHeroHelper from "./GachaGoldenHeroHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PointRankCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resource: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBack: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRankBK: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRank: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textServerName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPoint: cc.Label = null;
    _size: cc.Size;

    onInit(){
        this._size = this._resource.getContentSize();
        this.node.setContentSize(this._size);
    }
    onCreate() {
        this._resource.active = (false);
    }
    updateUI(data) {
        var cellData = data.cfg;
        var index = data.index <= 3 && data.index || data.index % 2 + 4;
        this._resource.active = (true);
        this._updateBackImage(data.index);
        UIHelper.loadTexture(this._imageRankBK, Path.getComplexRankUI(GachaGoldenHeroConst.JOYBONUS_RANKINDEX_BG[index-1]));
        this._textRank.string = ((data.index).toString());
        var serverName = cellData.svr_name as string;
        var result = serverName.match('(%a+[%d+%-%,]+)');
        var result1 = serverName.match('([%d+%-%,]+)');
        if (result != null && result.length) {
            serverName = result[0];
        } else if (result1 != null && result1.length > 0) {
            serverName = result1[0];
        }
        this._textServerName.string = (GachaGoldenHeroHelper.getFormatServerName(serverName, 5));
        if (cellData) {
            this._textName.string = (cellData.user_name);
            this._textPoint.string = ((cellData.point).toString());
        }
        var colorIdx = data.index <= 3 && data.index || 4;
        this._textServerName.node.color = (Colors.GOLDENHERO_RANK_TOP[colorIdx-1]);
        this._textName.node.color = (Colors.GOLDENHERO_RANK_TOP[colorIdx-1]);
        this._textPoint.node.color = (Colors.GOLDENHERO_RANK_TOP[colorIdx-1]);
    }
    _updateBackImage(i) {
        var index = i % 2 + 1;
        var resPath = Path.getUICommon(GachaGoldenHeroConst.RANK_CELL_BACKBG[index-1]);
        UIHelper.loadTextureAutoSize(this._imageBack, resPath, function(sp:cc.Sprite){
            sp.node.setContentSize(this._size);
            sp.type = cc.Sprite.Type.SLICED;
            var sp_frame = sp.spriteFrame;
            if (index == 0) {
                //this._imageBack.setCapInsets(cc.rect(1, 1, 1, 1));
                sp_frame.insetLeft = 1;
                sp_frame.insetRight = 1;
                sp_frame.insetTop = 1;
                sp_frame.insetBottom = 1;
            } else {
                //this._imageBack.setCapInsets(cc.rect(4, 4, 2, 2));
                sp_frame.insetLeft = 4;
                sp_frame.insetRight = 4;
                sp_frame.insetTop = 2;
                sp_frame.insetBottom = 2;
            }
            // sp.markForUpdateRenderData(true);
            // sp_frame._calc
        }.bind(this));
    }    

}
