import { Colors, G_UserData } from "../../../init";
import CommonListView from "../../../ui/component/CommonListView";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CampRaceRankNode extends cc.Component {
    @property({ type: cc.Label, visible: true })
    _textMyPoint: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textMyRank: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textMyName: cc.Label = null;
    @property({ type: cc.Sprite, visible: true })
    _imageCountry: cc.Sprite = null;
    @property({ type: cc.Sprite, visible: true })
    _imageRankTitle: cc.Sprite = null;
    @property({ type: CommonListView, visible: true })
    _listRank: CommonListView = null;
    @property(cc.Prefab)
    campRaceRankCell: cc.Prefab = null;
    _rankData: any;

    init() {
        this._listRank.init(this.campRaceRankCell, handler(this, this._onItemUpdate))
        this._setMyInfo();
        this._setTitle();
    }
    _setMyInfo() {
        var myName = G_UserData.getBase().getName();
        this._textMyName.string = (myName);
        var myOfficerLevel = G_UserData.getBase().getOfficer_level();
        this._textMyName.node.color = (Colors.getOfficialColor(myOfficerLevel));
    }
    _setTitle() {
        var camp = G_UserData.getCampRaceData().getMyCamp();
        var smallCamps = [
            4,
            1,
            3,
            2
        ];
        var campSmall = Path.getTextSignet('img_com_camp0' + smallCamps[camp]);
        UIHelper.loadTexture(this._imageCountry, campSmall);
        var titleEnd = [
            '',
            'b',
            'c',
            'd'
        ];
        var titleText = Path.getTextCampRace('txt_camp_01' + titleEnd[camp]);
        UIHelper.loadTexture(this._imageRankTitle, titleText);
    }
    setRankData(rankData) {
        this._rankData = rankData;
        this._listRank.setData(rankData.length);
    }
    refreshMyRank() {
        var camp = G_UserData.getCampRaceData().getMyCamp();
        var preRankData = G_UserData.getCampRaceData().getPreRankWithCamp(camp);
        var myRank = preRankData.getSelf_rank();
        this._textMyRank.string = (myRank);
        var myPoint = preRankData.getSelf_score();
        this._textMyPoint.string = (myPoint);
    }
    _onItemUpdate(item, index) {
        item.updateItem(index, this._rankData[index]);
    }
    _onItemSelected(item, index) {
    }
}