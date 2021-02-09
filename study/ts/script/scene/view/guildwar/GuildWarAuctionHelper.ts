import { G_SignalManager, G_ServerTime, G_ServiceManager, G_UserData, G_SceneManager } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { GuildWarDataHelper } from "../../../utils/data/GuildWarDataHelper";
import { AuctionConst } from "../../../const/AuctionConst";
import { Lang } from "../../../lang/Lang";
import { GuildWarConst } from "../../../const/GuildWarConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import PopupSystemAlert from "../../../ui/PopupSystemAlert";

export default class GuildWarAuctionHelper {
     _cityId: any;
     _signalGetAuctionInfo: any;
     constructor(cityId) {
        this._cityId = cityId;
    }
     onEnter() {
        this._signalGetAuctionInfo = G_SignalManager.add(SignalConst.EVENT_GET_ALL_AUCTION_INFO, handler(this, this.onEventGetAuctionInfo));
        var timeRegion = GuildWarDataHelper.getGuildWarTimeRegion();
        var endTime = timeRegion.endTime;
        if (endTime > G_ServerTime.getTime()) {
            G_ServiceManager.registerOneAlarmClock('GuildWarAuctionHelper_Aution', endTime + 2, function () {
                G_UserData.getAuction().c2sGetAllAuctionInfo();
            });
        }
    }
     onExit() {
        this._signalGetAuctionInfo.remove();
        this._signalGetAuctionInfo = null;
        G_ServiceManager.DeleteOneAlarmClock('GuildWarAuctionHelper_Aution');
    }
     onEventGetAuctionInfo(id, message) {
    }
     setCityId(cityId) {
        this._cityId = cityId;
    }
     checkShowDlg() {
        //logWarn('GuildWarAuctionHelper:_showGuildDlg show !!!!!!!!!!! start');
        var isAuctionWorldEnd = G_UserData.getAuction().isAuctionShow(AuctionConst.AC_TYPE_GUILD_WAR_ID);
        if (isAuctionWorldEnd == false) {
            //logWarn('GuildWarAuctionHelper:_showGuildDlg  isAuctionShow = false ');
            return;
        }
        if (this.needShowAutionDlg() == true) {
            var isInGuild = G_UserData.getGuild().isInGuild();
            if (isInGuild) {
                this._showGuildDlg();
            }
        } else {
            //logWarn('GuildWarAuctionHelper:_showGuildDlg needShowAutionDlg false');
        }
    }
     _showGuildDlg() {
        var personDlg = '';
        var itemList = G_UserData.getAuction().getAuctionData(AuctionConst.AC_TYPE_GUILD_WAR_ID), bouns;
        if (itemList.length <= 0) {
            personDlg = Lang.get('guildwar_auction_content3');
        } else {
            var [state, cityId] = GuildWarDataHelper.getBattleResultState(this._cityId);
            var config = GuildWarDataHelper.getGuildWarCityConfig(cityId);
            if (state == GuildWarConst.BATTLE_RESULT_ATTACK_SUCCESS) {
                personDlg = Lang.get('guildwar_auction_content1', { name: config.name });
            } else if (state == GuildWarConst.BATTLE_RESULT_ATTACK_FAIL) {
                personDlg = Lang.get('guildwar_auction_content2');
            } else if (state == GuildWarConst.BATTLE_RESULT_DEFENDER_SUCCESS) {
                personDlg = Lang.get('guildwar_auction_content1', { name: config.name });
            } else {
                personDlg = Lang.get('guildwar_auction_content2');
            }
            //logWarn('ddddddd ' + (state + (' ' + tostring(cityId))));
        }
        function onBtnGo() {
            G_SceneManager.popScene();
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_AUCTION);
        }
        // var PopupSystemAlert = new (require('PopupSystemAlert'))(Lang.get('worldboss_popup_title1'), personDlg, onBtnGo);

        G_SceneManager.openPopup("prefab/common/PopupSystemAlert", (popup: PopupSystemAlert) => {
            popup.setup(Lang.get('worldboss_popup_title1'), personDlg, onBtnGo);
            popup.setCheckBoxVisible(false);
            popup.showGoButton(Lang.get('worldboss_go_btn2'));
            popup.setCloseVisible(true);
            popup.openWithAction();
        });
    }
     needShowAutionDlg() {
        var oldEndTime = G_UserData.getGuildWar().getAutionDlgTime();
        var timeRegion = GuildWarDataHelper.getGuildWarTimeRegion();
        var endTime = timeRegion.endTime;
        var curTime = G_ServerTime.getTime();
        if (curTime >= timeRegion.startTime && curTime < timeRegion.endTime) {
            //logWarn(' GuildDungeonDataHelper:needShopPromptDlg is open  ret false');
            return false;
        }
        if (oldEndTime == 0) {
            G_UserData.getGuildWar().saveAutionDlgTime(endTime);
            //logWarn(' GuildDungeonDataHelper:needShopPromptDlg  oldEndTime = 0 ret true');
            return true;
        }
        if (oldEndTime < endTime) {
            G_UserData.getGuildWar().saveAutionDlgTime(endTime);
            //logWarn(' GuildDungeonDataHelper:needShopPromptDlg  oldEndTime < endTime ret true');
            return true;
        }
        // dump(oldEndTime);
        // dump(endTime);
        return false;
    }
}