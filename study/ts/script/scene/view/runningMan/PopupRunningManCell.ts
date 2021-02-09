const { ccclass, property } = cc._decorator;

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'

import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1'
import { Lang } from '../../../lang/Lang';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { G_UserData, Colors } from '../../../init';
import { RunningManHelp } from './RunningManHelp';
import { RunningManConst } from '../../../const/RunningManConst';
import CommonUI from '../../../ui/component/CommonUI';

@ccclass
export default class PopupRunningManCell extends cc.Component {

    @property({ type: cc.Sprite, visible: true })
    _resourceNode: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageBk: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textPlayerName: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _nodeButton: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imagePriceBk: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageIcon: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textPrice: cc.Label = null;

    @property({ type: CommonButtonSwitchLevel1, visible: true })
    _commonBuy: CommonButtonSwitchLevel1 = null;

    @property({ type: cc.Sprite, visible: true })
    _imageTake: cc.Sprite = null;

    @property({ type: CommonHeroIcon, visible: true })
    _commonIcon: CommonHeroIcon = null;

    @property({ type: cc.Label, visible: true })
    _textDesc3: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textDesc4: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textDesc1: cc.Label = null;

    private _heroData;
    private _index;
    private _customCallback;

    public onLoad() {
        let size = this._resourceNode.node.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }

    private _procPlayerIcon(heroData) {
        var isPlayer = heroData.isPlayer;
        if (isPlayer == null || isPlayer == 0) {
            return;
        }
        var simpleUser = heroData.user;
        this._textPlayerName.string = simpleUser.name;
        this._textPlayerName.node.color = Colors.getOfficialColor(simpleUser.office_level);
        UIHelper.enableOutline(this._textPlayerName, Colors.getOfficialColorOutline(simpleUser.office_level));

        var [baseId, avatarTable] = UserDataHelper.convertAvatarId(simpleUser);
        this._commonIcon.updateIcon(avatarTable, null, simpleUser.head_frame_id);
    }

    private _procHeroIcon(heroData) {
        var typeHeroInfo = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroData.heroId);
        this._commonIcon.updateUI(heroData.heroId);
        this._textPlayerName.string = typeHeroInfo.name;
        this._textPlayerName.node.color = typeHeroInfo.icon_color;
        UIHelper.enableOutline(this._textPlayerName, typeHeroInfo.icon_color_outline);
    }

    public updateUI(heroData, index) {
        this._index = index;
        this._imageTake.node.active = false;
        if (heroData.roadNum % 2 == 0) {
            UIHelper.loadTexture(this._imageBk, Path.getCommonRankUI('img_com_board_list01b'));
        } else {
            UIHelper.loadTexture(this._imageBk, Path.getCommonRankUI('img_com_board_list01a'));
        }
        this._imageBk.node.setContentSize(this._resourceNode.node.getContentSize());
        this._commonBuy.switchToNormal();
        this._commonBuy.setString(Lang.get('runningman_btn_desc1'));
        var heroId = heroData.heroId;
        var heroBetRate = heroData.heroBetRate;
        var heroOdds = heroData.heroOdds;
        this._heroData = heroData;
        if (heroData.isPlayer == 1) {
            this._procPlayerIcon(heroData);
        } else {
            this._procHeroIcon(heroData);
        }
        var betPrice = G_UserData.getRunningMan().getRunningCostValue();
        var image = this._imageIcon;
        if (image) {
            var imageParam = TypeConvertHelper.convert(betPrice.type, betPrice.value, betPrice.size);
            image.node.addComponent(CommonUI).loadTexture(imageParam.res_mini);
            // UIHelper.loadTexture(image, imageParam.res_mini);
        }
        this._textPrice.string = (0).toString();
        //this._textPrice.node.color = (Colors.BRIGHT_BG_ONE);
        this._textDesc1.string = (heroData.roadNum);
        //UIHelper.loadTexture(this._imagePriceBk, Path.getComplexRankUI('img_com_zhichibg01'))
        this._textDesc4.string = (heroBetRate + '%');
        if (Math.floor(heroOdds) >= heroOdds) {
            this._textDesc3.string = (heroOdds + '');
        } else {
            this._textDesc3.string = (heroOdds);
        }
        var userBet = G_UserData.getRunningMan().getUser_bet();
        if (userBet == null || userBet.length == 0) {
            this._commonBuy.setEnabled(true);
        }
        var costValue = G_UserData.getRunningMan().getRunningCostValue();
        if (userBet && userBet.length == costValue.playerMax) {
            this._commonBuy.setEnabled(false);
        }
        var betNum = G_UserData.getRunningMan().getHeroBetNum(heroId);
        if (betNum > 0) {
            this._commonBuy.setEnabled(true);
            this._commonBuy.setString(Lang.get('runningman_btn_desc2'));
            this._commonBuy.switchToHightLight();
            this._textPrice.string = (betNum);
            //this._textPrice.node.color = (Colors.BRIGHT_BG_GREEN);
            //UIHelper.loadTexture(this._imagePriceBk, Path.getComplexRankUI('img_com_zhichibg02'));
        }
        var runningState = RunningManHelp.getRunningState();
        if (runningState >= RunningManConst.RUNNING_STATE_WAIT) {
            this._commonBuy.setEnabled(false);
        }
    }

    public onCommonBuy() {
        if (this._customCallback) {
            this._customCallback(this._index);
        }
    }

    public setCustomCallback(customCallback: Function) {
        this._customCallback = customCallback;
    }
}