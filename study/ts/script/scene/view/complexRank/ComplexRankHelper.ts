import { table } from "../../../utils/table";
import { Lang } from "../../../lang/Lang";
import { ComplexRankConst } from "../../../const/ComplexRankConst";
import { unpack } from "../../../utils/GlobleFunc";
import { SignalConst } from "../../../const/SignalConst";
import { ArraySort } from "../../../utils/handler";
import { G_UserData } from "../../../init";
import { PopupHonorTitleHelper } from "../playerDetail/PopupHonorTitleHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";

export namespace ComplexRankHelper {
    export let getComplexTab = function () {
        var list = [];
        var indexlist = [];
        for (const i in ComplexRankConst.RANK_TAB_LIST) {
            var info = ComplexRankConst.RANK_TAB_LIST[i];
            var functionId = info[2];
            if (_checkIsOpen(functionId)) {
                list.push(Lang.get('complex_rank_tab' + (Number(i) + 1)));
                indexlist.push([
                    Lang.get('complex_rank_tab' + (Number(i) + 1)),
                    info[0]
                ])
            }
        }
        return [
            list,
            indexlist
        ];
    };

    let _checkIsOpen = (functionId: number) => {
        if (functionId) {
            return FunctionCheck.funcIsOpened(functionId);
        } else {
            return true;
        }
    }

    export let getRankTypeByTabIndex = function (index) {
        var [complexList, indexlist] = ComplexRankHelper.getComplexTab();
        var tabName = complexList[index];
        for (var i in indexlist) {
            var value = indexlist[i];
            var name = value[0];
            var constIndex = value[1];
            if (name == tabName) {
                return constIndex;
            }
        }
        return 1;
    };
    export let getTabIndexByRankType = function (index) {
        var [complexList, indexlist] = ComplexRankHelper.getComplexTab();
        for (var i in indexlist) {
            var value = indexlist[i];
            var constIndex = value[1];
            if (constIndex == index) {
                return parseInt(i);
            }
        }
        return 1;
    };
    export let makeUserRank = function (id, serverData) {
        var userData: any = {};
        userData.userId = serverData['user_id'];
        userData.name = serverData['name'];
        userData.rank = serverData['rank'];
        userData.baseId = serverData['base_id'];
        userData.avatarBaseId = serverData['avatar_base_id'];
        var [baseId, playerHeadInfo] = UserDataHelper.convertAvatarId(serverData);
        userData.baseId = baseId;
        userData.playerHeadInfo = playerHeadInfo;
        userData.power = serverData['power'];
        userData.officialLv = serverData['officer_level'] || serverData['office_level'];
        if (userData.officialLv == null) {
            userData.officialLv = 0;
        }
        userData.guildName = serverData['guild_name'] || serverData['guild'] || '';
        if (id == SignalConst.EVENT_COMPLEX_GUILD_RANK) {
            userData.guildName = serverData['name'];
            userData.guildIconId = serverData['base_id'] || 1;
            userData.baseId = 1;
        }
        if (userData.guildName == '') {
            userData.guildName = Lang.get('complex_rank_no_guild');
        }
        userData.level = serverData['level'];
        userData.leaderName = serverData['leader_name'];
        userData.leaderOfficialLv = serverData['leader_office_level'] || 0;
        userData.memberCount = serverData['member_count'];
        userData.chapter = serverData['chapter'];
        userData.star = serverData['star'];
        userData.layer = serverData['layer'];
        userData.titleId = serverData['title'] || 0;
        userData.photo_count = serverData['photo_count'] || 0;
        userData.head_frame_id = serverData['head_frame_id'] || 0;
        userData.avaterNum = serverData['avater_num'] || 0;
        return userData;
    };
    export let covertServerData = function (id, message) {
        var userData = {};
        var list = [];
        var myData: any = {};
        myData.myRank = message['user_rank'];
        if (myData.myRank == null || myData.myRank <= 0) {
            myData.myRank = message['self_rank'] || 0;
        }
        myData.myLevel = message['user_level'] || 0;
        myData.myPower = message['user_power'] || message['power'] || 0;
        myData.myGuildLevel = message['guild_level'] || Lang.get('complex_rank_no_guild');
        myData.myStar = message['star'] || 0;
        myData.user_photocount = message['user_photocount'] || 0;
        myData.avaterNum = message['avater_num'] || 0;
        var myTitle = PopupHonorTitleHelper.getEquipedTitle();
        myData.titleId = myTitle && myTitle.getId() || 0;
        myData.baseId = G_UserData.getBase().getPlayerBaseId();
        if (id == SignalConst.EVENT_COMPLEX_ARENA_RANK) {
            myData.myRank = message['user_arena_rank'] || 0;
            var serverList = message['user_list'] || {};
            for (var i in serverList) {
                var value = serverList[i];
                table.insert(list, ComplexRankHelper.makeUserRank(id, value));
            }
        }
        if (id == SignalConst.EVENT_COMPLEX_STAGE_STAR_RANK || id == SignalConst.EVENT_COMPLEX_ELITE_STAR_RANK || id == SignalConst.EVENT_COMPLEX_TOWER_STAR_RANK) {
            var serverList = message['ranks'] || {};
            for (i in serverList) {
                var value = serverList[i];
                table.insert(list, ComplexRankHelper.makeUserRank(id, value));
            }
        }
        if (id == SignalConst.EVENT_COMPLEX_POWER_RANK || id == SignalConst.EVENT_COMPLEX_LEVEL_RANK || id == SignalConst.EVENT_COMPLEX_GUILD_RANK || id == SignalConst.EVENT_COMPLEX_ACTIVE_PHOTO_RANK || id == SignalConst.EVENT_COMPLEX_USER_AVATAR_PHOTO_RANK) {
            var serverList = message['rank_list'] || {};
            for (i in serverList) {
                var value = serverList[i];
                table.insert(list, ComplexRankHelper.makeUserRank(id, value));
            }
        }
        if (myData.myRank == null || myData.myRank == 0) {
            myData.myRank = Lang.get('complex_rank_no_guild');
        }
        var sortFunc = function (obj1, obj2) {
            return obj1.rank < obj2.rank;
        };
        ArraySort(list, sortFunc);
        return [
            list,
            myData
        ];
    };
}