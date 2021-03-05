const { ccclass, property } = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'

import CommonPlayerName from '../../../ui/component/CommonPlayerName'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import UIHelper from '../../../utils/UIHelper';
import { GuildCrossWarConst } from '../../../const/GuildCrossWarConst';
import { Colors, G_ConfigLoader } from '../../../init';
import { Path } from '../../../utils/Path';

@ccclass
export default class GuildCrossWarRankCell extends ListViewCellBase {

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
        type: cc.Label,
        visible: true
    })
    _textRank: cc.Label = null;

    @property({
        type: CommonPlayerName,
        visible: true
    })
    _fileNodeName: CommonPlayerName = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageHonorTitle: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textKilledNum: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDeathNum: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textScore: cc.Label = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _fileNodeIcon: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textBoxNum: cc.Label = null;

    onCreate() {
        var size = this._resource.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    _updateBack(index) {
        index = index % 2 + 1;
        UIHelper.loadTexture(this._imageBack, Path.getComplexRankUI(GuildCrossWarConst.PERSONNAL_LADDER_CELL_BG[index]));
    }
    _updateNameAndOfficial(index, name, officialLv, gameTitle) {
        this._textRank.string = (parseInt(index) + "");
        this._textRank.node.color = (Colors.getOfficialColor(officialLv));
        UIHelper.updateTextOfficialOutline(this._textRank.node, officialLv);
        // this._fileNodeName.updateUI(name, officialLv);
        var titleInfo = G_ConfigLoader.getConfig('title');
        if (gameTitle >= 1 && gameTitle <= titleInfo.length()) {
            var titleData = titleInfo.get(gameTitle);
            // var targetPosX = this._fileNodeName.getPositionX() + this._fileNodeName.getWidth() + 5;
            // this._imageHonorTitle.node.x = (targetPosX);
            UIHelper.loadTexture(this._imageHonorTitle, Path.getImgTitle(titleData.resource));
            // this._imageHonorTitle.ignoreContentAdaptWithSize(true);
            this._imageHonorTitle.node.active = (true);
        } else {
            this._imageHonorTitle.node.active = (false);
        }
    }
    _updateNums(killNum, deathNum, score) {
        this._textKilledNum.string = ((killNum));
        this._textDeathNum.string = (deathNum);
        this._textScore.string = (score);
    }
    updateUI(data) {
        if (!data) {
            return;
        }
        this._updateBack(data.index);
        this._updateNums(data.killed_num, data.attack_num, data.score);
        this._updateNameAndOfficial(data.index, data.name, data.officer_level, data.title);
    }

}