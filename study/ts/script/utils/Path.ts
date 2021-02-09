export class Path {
    public static png_suffix = '';
    public static jpg_suffix = '';
    public static json_suffix = '.json';
    public static mp3_suffix = '.mp3';
    public static csb_suffix = '.csb';
    public static plist_suffix = '.plist';
    public static ttf_suffix = '.ttf';
    public static mp4_suffix = '.mp4';
    public static fnt_suffix = '.fnt';
    public static shader_suffix = '.fsh';
    public static SERVER_STATUS_IMGS = [
        '',
        'smooth',
        'server_hot',
        'server_weihu',
        'server_weihu',
        'server_weihu',
        'smooth',
        'smooth',
        '',
        '',
        'server_xianxing02',
        "server_weihu"
    ];
    public static SERVER_STATUS_IMGS_2 = [
        '',
        'server_xinfu',
        'server_huobao',
        'server_preserve',
        'server_preserve',
        'server_preserve',
        'server_xinfu',
        'server_xinfu',
        'txt_return_jijiangkaifu01',
        '',
        'server_xianxing',
        'txt_return_jijiangkaifu01'
    ];
    public static getCommonFont = function () {
        // return Path.getFont('Font_W7S');
        return Path.getFont('Font_W7S_Bitmap');
    };
    public static getCommonFontLineHeight = function () {
        return 26;
    };
    public static getFontW8 = function () {
        // return Path.getFont('Font_W8S');
        return Path.getFont('Font_W7S_Bitmap');
    };
    public static getFont = function (id) {
        // return 'fonts/' + (id + Path.ttf_suffix);
        return 'fonts/' + (id);
    };
    public static getCSB = function (id, sceneName) {
        return 'csui/' + ((sceneName == null && '' || sceneName + '/') + (id + Path.csb_suffix));
    };
    public static getPrefab = function (id, sceneName) {
        return 'prefab/' + ((sceneName == null && '' || sceneName + '/') + (id));
    };
    public static getCommonPrefab = function (id) {
        return 'prefab/common/' + (id);
    };
    public static getFightAction = function (id) {
        return 'fight/action/' + id;
    }
    public static getAttackerAction = function (id) {
        // return 'fight/action/' + (id + '_attacker.ani');
        return 'fight/action/' + (id + '_attacker');
    };
    public static getTargetAction = function (id, cell?) {
        if (cell) {
            // return 'fight/action/' + (id + ('_target_' + (cell + '.ani')));
            return 'fight/action/' + (id + ('_target_' + (cell)));
        }
        // return 'fight/action/' + (id + '_target.ani');
        return 'fight/action/' + (id + '_target');
    };
    public static getSceneAction = function (id) {
        // return 'fight/action/' + (id + '_scene.ani');
        return 'fight/action/' + (id + '_scene');
    };
    public static getSpine = function (id) {
        return 'spine/' + id;
    };
    public static getEffectSpine = function (id) {
        return 'effect/spine/' + id;
    };
    public static getFightEffectSpine = function (id) {
        return 'fight/effect/' + id;
    };
    public static getImgRunway = function (id) {
        return 'ui3/runway/' + id;
    };
    public static getUICommon = function (id) {
        return 'ui3/common/' + (id + Path.png_suffix);
    };
    public static getBigItemIconPath = function (id) {
        return 'icon/itembig/' + (id + Path.png_suffix);
    };
    public static getBoutPath = function (id) {
        return 'ui3/bout/' + (id + Path.png_suffix);
    };
    public static getBoutBottomPath = function (id, boutId) {
        return 'ui3/bout/' + ('bout_0' + (boutId + ('/' + (id + Path.png_suffix))));
    };
    public static getUIText = function (id) {
        return 'newui/text/' + (id + Path.png_suffix);
    };
    public static getUITemp = function (module, id) {
        return 'uitemp/' + (module + ('/' + (id + Path.png_suffix)));
    };
    public static getTextTeam = function (id) {
        return 'ui3/text/team/' + (id + Path.png_suffix);
    };
    public static getTextSign = function (id) {
        return 'ui3/text/sign/' + (id + Path.png_suffix);
    };
    public static getTextSignet = function (id) {
        return 'ui3/text/signet/' + (id + Path.png_suffix);
    };
    public static getImgTitle = function (id) {
        return 'ui3/text/title/' + (id + Path.png_suffix);
    };
    public static getAchievementIcon = function (id) {
        return 'icon/achievement/' + (id + Path.png_suffix);
    };
    public static getAchievementIconBg = function (id) {
        return 'ui3/activity/achievement/' + (id + Path.png_suffix);
    };
    public static getDiscountImg = function (discount) {
        return Path.getTextSignet('txt_sys_activity_sale0' + discount);
    };
    public static getTextSystemBigTab = function (id) {
        return 'ui3/text/system/big_tab/' + (id + Path.png_suffix);
    };
    public static getTextSystem = function (id) {
        return 'ui3/text/system/' + (id + Path.png_suffix);
    };
    public static getTextGuildCross = function (id) {
        return 'ui3/text/guild_cross_war/' + (id + Path.png_suffix);
    };
    public static getUICommonFrame = function (id) {
        return 'ui3/common/frame/' + (id + Path.png_suffix);
    };
    public static getCommonIcon = function (module, id) {
        return 'icon/' + (module + ('/' + (id + Path.png_suffix)));
    };
    public static getTacticsImage = function (id) {
        return 'ui3/tactics/' + (id + Path.png_suffix);
    };
    public static getTextTactics = function (id) {
        return 'ui3/common/frame/' + (id + Path.png_suffix);
    };
    public static getHeroBustIcon = function (id) {
        return 'icon/team_hero/' + (id + Path.png_suffix);
    };
    public static getHeroBodyIcon(id) {
        return "ui3/pvpuniverse/" + (id + Path.png_suffix);
    }
    public static getHeroBustIconBg = function (id) {
        return 'ui3/common/frame/' + (id + Path.png_suffix);
    };
    public static getTextHero = function (id) {
        return 'ui3/text/official/' + (id + Path.png_suffix);
    };
    public static getOfficialImg = function (id) {
        return 'ui3/official/' + (id + Path.png_suffix);
    };
    public static getGoldHeroTxt = function (id) {
        return 'ui3/text/gold_hero/' + (id + Path.png_suffix);
    };
    public static getGoldHero = function (id) {
        return 'ui3/gold_hero/' + (id + Path.png_suffix);
    };
    public static getGoldHeroJPG = function (id) {
        return 'ui3/gold_hero/' + (id + Path.jpg_suffix);
    };
    public static getTextEquipment = function (id) {
        return 'ui3/text/quipment/' + (id + Path.png_suffix);
    };
    public static getText = function (id) {
        return 'ui3/text/' + (id + Path.png_suffix);
    };
    public static getEmbattle = function (id) {
        return 'ui3/embattle/' + (id + Path.png_suffix);
    };
    public static getBuffText = function (id) {
        return 'ui3/text/buff/' + (id + Path.png_suffix);
    };
    public static getChapterIcon = function (id) {
        return 'mline/chapter/' + (id + Path.png_suffix);
    };
    public static getChallengeIcon = function (id) {
        return 'ui3/challenge/' + (id + Path.png_suffix);
    };
    public static getChallengeText = function (id) {
        return 'ui3/text/challenge/' + (id + Path.png_suffix);
    };
    public static getDailyChallengeIcon = function (id) {
        return 'ui3/challenge/daily/' + (id + Path.png_suffix);
    };
    public static getTowerChallengeIcon = function (id) {
        return 'ui3/challenge/tower/' + (id + Path.png_suffix);
    };
    public static getEssenceText = function (id) {
        return 'ui3/text/essence/img_essence0' + (id + Path.png_suffix);
    };
    public static getChatRoleRes = function (id) {
        return 'storyres/' + (id + Path.png_suffix);
    };
    public static getStorySpine = function (id) {
        return 'storyspine/' + (id + '_big');
    };
    public static getChatFaceRes = function (id) {
        return 'ui3/face/mini/' + (id + Path.png_suffix);
    };
    public static getChatFormRes = function (id) {
        return 'ui3/chat/form' + (id + Path.png_suffix);
    };
    public static getTowerSurpriseBG = function (id) {
        return 'ui3/challenge/tower/img_bg_' + (id + Path.png_suffix);
    };
    public static getBuffFightIcon = function (id) {
        return 'ui3/battle/buffcard/' + (id + Path.png_suffix);
    };
    public static getShader = function (id) {
        return 'shaders/' + (id + Path.shader_suffix);
    };
    public static getStageMap = function (id) {
        return 'mline/stage/' + (id + Path.jpg_suffix);
    };
    public static getStageBG = function (id) {
        return 'ui3/stage/' + (id + Path.jpg_suffix);
    };
    public static getStageGuildCross = function (id) {
        return 'ui3/stage/guild_cross/' + (id + Path.jpg_suffix);
    };
    public static getGuildCrossCity = function (id) {
        return 'ui3/guild_cross_war/city/' + (id + Path.png_suffix);
    };
    public static getExploreMainBG = function () {
        return 'ui3/stage/img_explore_map1' + Path.jpg_suffix;
    };
    public static getExploreCityRes = function (id) {
        return 'ui3/explore/city/img_city' + (id + Path.png_suffix);
    };
    public static getExploreCloud = function () {
        return 'ui3/explore/img_cloud' + Path.png_suffix;
    };
    public static getExploreBlock = function (id) {
        if (!id) {
            return 'ui3/explore/img_road' + Path.png_suffix;
        }
        return 'ui3/explore/' + (id + Path.png_suffix);
    };
    public static getExploreDiscover = function (id) {
        return 'ui3/explore/discover/' + (id + Path.png_suffix);
    };
    public static getExploreMapBG = function () {
        return 'ui3/stage/img_dfwddt' + Path.jpg_suffix;
    };
    public static getActDinnerRes = function (id) {
        return 'ui3/activity/dinner/' + (id + Path.png_suffix);
    };
    public static getAnswerImage = function (id) {
        return 'ui3/explore/discover/answe/' + (id + Path.png_suffix);
    };
    public static getDay7ActivityRes = function (id) {
        return 'ui3/activity/carnival/' + (id + Path.png_suffix);
    };
    public static getExploreImage = function (id) {
        return 'ui3/explore/' + (id + Path.png_suffix);
    };
    public static getExploreIconImage = function (id) {
        return 'icon/explore/' + (id + Path.png_suffix);
    };
    public static getExploreTextImage = function (id) {
        return 'ui3/text/explore/' + (id + Path.png_suffix);
    };
    public static getGuildCrossImage = function (id) {
        return 'ui3/guild_cross_war/' + (id + Path.png_suffix);
    };
    public static getExploreTreasureBigIcon = function (id) {
        return 'icon/treasurebig/' + (id + Path.png_suffix);
    };
    public static getResourceMiniIcon = function (id) {
        return 'icon/resourcemini/' + (id + Path.png_suffix);
    };
    public static getExploreOrnament = function (id) {
        return 'ui3/explore/img_' + (id + Path.png_suffix);
    };
    public static getTutorialVoice = function (id) {
        return 'audio/voice/' + (id + Path.mp3_suffix);
    };
    public static getSkillVoice = function (id) {
        return 'audio/voice/' + (id + Path.mp3_suffix);
    };
    public static getFightSound = function (id) {
        return 'audio/fight/' + (id + Path.mp3_suffix);
    };
    public static getCreateRoleRes = function (id) {
        return 'ui3/create/' + (id + Path.png_suffix);
    };
    public static getChapterBox = function (id) {
        return 'icon/common/' + (id + Path.png_suffix);
    };
    public static getRankIcon = function (id) {
        return 'ui3/common/icon_com_ranking0' + (id + Path.png_suffix);
    };
    public static getPopupReward = function (id) {
        return 'ui3/gain/' + (id + Path.png_suffix);
    };
    public static getSuperChargeGiftTitleBg = function (id) {
        return 'ui3/recharge_activity/' + (id + Path.png_suffix);
    }
    public static getChapterBG = function (id) {
        return 'mline/img_mline_bg0' + (id + Path.jpg_suffix);
    };
    public static getSystemImage = function (id) {
        return 'ui3/text/system/' + (id + Path.png_suffix);
    };
    public static getBattleRes = function (id) {
        return 'ui3/battle/' + (id + Path.png_suffix);
    };
    public static getBattleMark = function (id) {
        return 'ui3/battle/showmark/' + (id + Path.png_suffix);
    };
    public static getBattleFont = function (id) {
        return 'ui3/text/battle/' + (id + Path.png_suffix);
    };
    public static getBattleFontLableAtlas = function (id) {
        return 'ui3/text/battle/' + (id + "_labelatlas");
    };
    public static getRecruitImage = function (id) {
        return 'ui3/drawcard/' + (id + Path.png_suffix);
    };
    public static getSkillShow = function (id) {
        return 'ui3/text/skill/' + (id + Path.png_suffix);
    };
    public static getBattleNum = function (id) {
        return [
            'ui3/text/battle/' + (id + Path.png_suffix),
            'ui3/text/battle/' + (id + Path.plist_suffix)
        ];
    };
    public static getShowHero = function (id) {
        return 'ui3/showhero/' + (id + Path.png_suffix);
    };
    public static getShowHeroName = function (id) {
        return 'ui3/showhero/show_name/' + (id + Path.png_suffix);
    };
    public static getShowHeroTrue = function (id) {
        return 'ui3/showherotrue/' + (id + Path.png_suffix);
    };
    public static getShowHeroNameTrue = function (id) {
        return 'ui3/showherotrue/show_name/' + (id + Path.png_suffix);
    };
    public static getInstrument = function (id) {
        return 'icon/instrumentbig/' + (id + Path.png_suffix);
    };
    public static getSeasonDan = function (id) {
        return 'ui3/fight/' + (id + Path.png_suffix);
    };
    public static getSeasonStar = function (id) {
        return 'ui3/text/fight/' + (id + Path.png_suffix);
    };
    public static getSeasonSportUI = function (id) {
        return 'ui3/seasonsport/' + (id + Path.png_suffix);
    };
    public static getCraftPrivilege = function (id) {
        return 'ui3/mine_privilege/' + (id + Path.png_suffix);
    };
    public static getStoryChatFace = function (id) {
        return 'ui3/face/' + (id + Path.png_suffix);
    };
    public static getArenaUI = function (id) {
        return 'ui3/arena/' + (id + Path.png_suffix);
    };


    public static getStageMapPath = function (path): any[] {
        var back = 'mline/stage/' + (path + ('/back'));
        var mid = 'mline/stage/' + (path + ('/mid'));
        var front = 'mline/stage/' + (path + ('/front'));
        return [
            back,
            mid,
            front
        ];
    };
    public static getStageSceneName = function (scene) {
        return 'app.scene.view.stage.scene.Scene' + scene;
    };
    public static getComplexRankUI = function (id) {
        return 'ui3/complexrank/' + (id + Path.png_suffix);
    };
    public static getCommonRankUI = function (id) {
        return 'ui3/common/' + (id + Path.png_suffix);
    };
    public static getWorldBossUI = function (id) {
        return 'ui3/challenge/world_boss/' + (id + Path.png_suffix);
    };
    public static getFightSceneEffect = function (effect) {
        return 'moving_' + effect;
    };
    public static getFightSceneBackground = function (id) {
        return 'fight/scene/' + id;
    };
    public static getCommonFrame = function (id) {
        return 'ui3/common/frame/' + (id + Path.png_suffix);
    };
    public static getCrossBossImage = function (id) {
        return 'ui3/cross_boss/' + (id + Path.png_suffix);
    };
    public static getCommonImage = function (id) {
        return 'ui3/common/' + (id + Path.png_suffix);
    };
    public static getParticle = function (id) {
        return 'effect/particle/' + (id);
    };
    public static getRanking = function (id) {
        return 'ui3/ranking/' + (id + Path.png_suffix);
    };
    public static getVipNum = function (id) {
        return 'ui3/vip/vip_' + (id + Path.png_suffix);
    };
    public static getVipJpgImage = function (id) {
        return 'ui3/vip/' + (id + Path.jpg_suffix);
    };
    public static getVipImage = function (id) {
        return 'ui3/vip/' + (id + Path.png_suffix);
    };
    public static getHeroVoice = function (id) {
        return 'audio/voice/' + (id + Path.mp3_suffix);
    };
    public static getNextFunctionOpen = function (id) {
        return 'ui3/newopen/' + (id + Path.png_suffix);
    };
    public static getChooseServerRes = function (id) {
        return 'ui3/chooseserver/' + (id + Path.png_suffix);
    };
    public static getServerStatusIcon = function (status): [string, boolean] {
        var img = Path.SERVER_STATUS_IMGS[status - 1];
        var statusIcon = Path.getChooseServerRes(img);
        return [
            statusIcon,
            img && img != ''
        ];
    };
    public static getServerStatusBigIcon = function (status) {
        return Path.getChooseServerRes(Path.SERVER_STATUS_IMGS_2[status - 1]);
    };
    public static getGuildRes = function (id) {
        return 'ui3/guild/' + (id + Path.png_suffix);
    };
    public static getRechargeRmb = function (id) {
        return 'ui3/vip/rmb_' + (id + Path.png_suffix);
    };
    public static getRechargeVip = function (id) {
        return 'ui3/vip/vip_' + (id + Path.png_suffix);
    };
    public static getFetterRes = function (id) {
        return 'ui3/fetter/' + (id + Path.png_suffix);
    };
    public static getBackground = function (id, suffix?) {
        suffix = suffix || Path.jpg_suffix;
        return 'ui3/background/' + (id + suffix);
    };
    public static getBackground4 = function (id, suffix) {
        suffix = suffix || Path.jpg_suffix;
        return 'ui3/background/' + (id + suffix);
    };
    public static getMonthlyCardRes = function (id) {
        return 'ui3/activity/' + (id + Path.png_suffix);
    };
    public static getActivityRes = function (id) {
        return 'ui3/activity/' + (id + Path.png_suffix);
    };
    public static getActivityTextRes = function (id) {
        return 'ui3/text/activity/' + (id + Path.png_suffix);
    };
    public static getVoiceRes = function (id) {
        return 'ui3/voice/' + (id + Path.png_suffix);
    };
    public static getTextMain = function (id) {
        return 'ui3/text/main/' + (id + Path.png_suffix);
    };
    public static getDrawCard = function (id) {
        return 'ui3/drawcard/' + (id + Path.png_suffix);
    };
    public static getGuide = function (id) {
        return 'ui3/guide/' + (id + Path.png_suffix);
    };
    public static getChatFaceMiniRes = function (id) {
        return 'ui3/face/mini/' + id;
    };
    public static getBackgroundEffect = function (id) {
        return 'ui3/background/effects/' + (id + Path.png_suffix);
    };
    public static getTextBattle = function (id) {
        return 'ui3/text/battle/' + (id + Path.png_suffix);
    };
    public static getPlayerVip = function (id) {
        return 'ui3/main/img_main_vip' + (id + Path.png_suffix);
    };
    public static getPlayerIcon = function (id) {
        return 'ui3/main/' + (id + Path.png_suffix);
    };
    public static getMainDir = function () {
        return 'ui3/text/main/';
    };
    public static getBattleDir = function () {
        return 'ui3/text/battle/';
    };
    public static getBattlePowerDir = function () {
        return 'ui3/text/battlepower/';
    };
    public static getChapterNameIcon = function (id) {
        return 'ui3/text/city/' + (id + Path.png_suffix);
    };
    public static getTeamUI = function (id) {
        return 'ui3/team/' + (id + Path.png_suffix);
    };
    public static getTextGuild = function (id) {
        return 'ui3/text/guild/' + (id + Path.png_suffix);
    };
    public static getFamousImage = function (id) {
        return 'mline/general/' + (id + Path.png_suffix);
    };
    public static getPreBattleImg = function (id) {
        return 'ui3/prebattle/' + (id + Path.png_suffix);
    };
    public static getTimeActivities = function (id) {
        return 'ui3/time_activities/' + (id + Path.png_suffix);
    };
    public static getTurnscard = function (id, suffix?) {
        suffix = suffix || Path.png_suffix;
        return 'ui3/turnscard/' + (id + suffix);
    };
    public static getTask = function (id) {
        return 'ui3/task/' + (id + Path.png_suffix);
    };
    public static getMail = function (id) {
        return 'ui3/mail/' + (id + Path.png_suffix);
    };
    public static getMailIconBg = function (id) {
        return 'ui3/mail/' + (id + Path.png_suffix);
    };
    public static getPet = function (id) {
        return 'ui3/beast/' + (id + Path.png_suffix);
    };
    public static getCrystalShop = function (id) {
        return 'ui3/crystalshop/' + (id + Path.png_suffix);
    };
    public static getCrystalShopText = function (id) {
        return 'ui3/text/activity/' + (id + Path.png_suffix);
    };
    public static getGuildDungeonUI = function (id) {
        return 'ui3/guilddungeon/' + (id + Path.png_suffix);
    };
    public static getGuildDungeonJPG = function (id) {
        return 'ui3/guilddungeon/' + (id + Path.jpg_suffix);
    };
    public static getTalent = function (id) {
        return 'ui3/text/talent/' + (id + Path.png_suffix);
    };
    public static getMineNodeTxt = function (id) {
        return 'ui3/text/mine_craft/' + (id + Path.png_suffix);
    };
    public static getMineImage = function (id) {
        return 'ui3/minecraft/' + (id + Path.png_suffix);
    };
    public static getRedPetImage = function (id) {
        return 'ui3/activity/pet_red/' + (id + Path.png_suffix);
    };
    public static getGuildAnswerText = function (id) {
        return 'ui3/text/answer/' + (id + Path.png_suffix);
    };
    public static getLimitActivityIcon = function (id) {
        return 'icon/time_limit/' + (id + Path.png_suffix);
    };
    public static getCustomActivityUIBg = function (id) {
        return 'ui3/activity/limit/' + (id + Path.jpg_suffix);
    };
    public static getCustomActivityUI = function (id) {
        return 'ui3/activity/limit/' + (id + Path.png_suffix);
    };
    public static getGuildFlagImage = function (index) {
        return 'ui3/guild/img_flag_colour%02d%s'.format(index, Path.png_suffix);
    };
    public static getGuildVerticalFlagImage = function (index) {
        return 'ui3/guild/img_flag_colour%02da%s'.format(index, Path.png_suffix);
    };
    public static getGuildFlagColorImage = function (index) {
        return 'ui3/guild/img_colour%02d%s'.format(index, Path.png_suffix);
    };
    public static getShareImage = function (id, suffix) {
        suffix = suffix || Path.jpg_suffix;
        return 'ui3/share/' + (id + suffix);
    };
    public static getCountryBossText = function (id) {
        return 'ui3/text/guild/' + (id + Path.png_suffix);
    };
    public static getCountryBossImage = function (id) {
        return 'ui3/countryboss/' + (id + Path.png_suffix);
    };
    // public static getLinkageActivity = function (id) {
    //     return 'ui3/gang_activity/' + (id + Path.png_suffix);
    // };
    public static getTextHomeland = function (id) {
        return 'ui3/text/homeland/' + (id + Path.png_suffix);
    };
    public static getHomelandUI = function (id) {
        return 'ui3/homeland/' + (id + Path.png_suffix);
    };
    public static getTextCampRace = function (id) {
        return 'ui3/text/camp_battle/' + (id + Path.png_suffix);
    };
    public static getCampImg = function (id) {
        return 'ui3/camp_battle/' + (id + Path.png_suffix);
    };
    public static getCampJpg = function (id) {
        return 'ui3/camp_battle/' + (id + Path.jpg_suffix);
    };
    public static getRunningMan = function (id) {
        return 'ui3/runway/' + (id + Path.png_suffix);
    };
    public static getGuildWar = function (id) {
        return 'ui3/war/' + (id + Path.png_suffix);
    };
    public static getTextLimit = function (id) {
        return 'ui3/text/limit/' + (id + Path.png_suffix);
    };
    public static getLimitImg = function (id) {
        return 'ui3/limit/' + (id + Path.png_suffix);
    };
    public static getLimitImgBg = function (id) {
        return 'ui3/limit/' + (id + Path.jpg_suffix);
    };
    public static getHorseRaceImg = function (id) {
        return 'ui3/horserace/' + (id + Path.png_suffix);
    };
    public static getSvip = function (id, suffix) {
        suffix = suffix || Path.jpg_suffix;
        return 'ui3/service/' + (id + suffix);
    };
    public static getMineDoubleImg = function (id) {
        return 'ui3/text/signet/img_mine_craft0' + (id + Path.png_suffix);
    };
    public static getQinTomb = function (id) {
        return 'ui3/qintomb/' + (id + Path.png_suffix);
    };
    public static getQinTombMini = function (id) {
        return 'ui3/qintomb/resourcemini/' + (id + Path.png_suffix);
    };
    public static getTextQinTomb = function (id) {
        return 'ui3/text/qintomb/' + (id + Path.png_suffix);
    };
    public static getLinkageActivity = function (id) {
        return 'ui3/linkageactivity/' + (id + Path.png_suffix);
    };
    public static getBattlePet = function (id) {
        return 'ui3/battle/pet/' + (id + Path.png_suffix);
    };
    public static getLimitBG = function (id) {
        return 'ui3/limit/' + (id + Path.jpg_suffix);
    };
    public static getHorseImg = function (id) {
        return 'ui3/horse/' + (id + Path.png_suffix);
    };
    public static getTrainIcon = function (id) {
        return 'ui3/guild/' + (id + Path.png_suffix);
    };
    public static getJadeImg = function (id) {
        return 'ui3/jade/' + (id + Path.png_suffix);
    };
    public static getShopBG = function (id) {
        return 'ui3/shop/' + (id + Path.jpg_suffix);
    };
    public static getTrainAcceptImg = function (id) {
        return 'ui3/train/' + (id + Path.png_suffix);
    };
    public static getTestImg = function (id) {
        return 'ui3/test/test' + (id + Path.png_suffix);
    };
    public static getTestImgSelected = function () {
        return 'ui3/test/selected' + Path.png_suffix;
    };
    public static getIndividualCompetitiveImg = function (id) {
        return 'ui3/individual_competitive/' + (id + Path.png_suffix);
    };
    public static getTrainInviteBg = function (id) {
        return 'ui3/train/' + (id + Path.png_suffix);
    };
    public static getAnswerBg = function (id) {
        return 'ui3/answer/' + (id + Path.jpg_suffix);
    };
    public static getAnswerImg = function (id) {
        return 'ui3/answer/' + (id + Path.png_suffix);
    };
    public static getDefaultIcon = function (id) {
        return id + Path.png_suffix;
    };
    public static getFrameIcon = function (id) {
        return 'ui3/head_frame/' + (id + Path.png_suffix);
    };
    public static getRedBagImg = function (id) {
        return 'ui3/redbag/' + (id + Path.png_suffix);
    };
    public static getAnniversaryImg = function (id) {
        return 'ui3/anniversary/' + (id + Path.png_suffix);
    };
    public static getTextAnniversaryImg = function (id, suffix) {
        suffix = suffix || Path.png_suffix;
        return 'ui3/text/anniversary/' + (id + suffix);
    };
    public static getReturnText = function (id) {
        return 'ui3/text/return/' + (id + Path.png_suffix);
    };
    public static getHistoryHeroImg = function (id) {
        return 'ui3/historical_hero/' + (id + Path.png_suffix);
    };
    public static getReturnBgImg = function (id) {
        return 'ui3/return/' + (id + Path.png_suffix);
    };
    public static getHistoryHeroWeaponImg = function (id) {
        return 'icon/historicalweapon/' + (id + Path.png_suffix);
    };
    public static getHistoryHeroWeaponBigImg = function (id) {
        return 'icon/historicalweaponbig/' + (id + Path.png_suffix);
    };
    public static getVideo = function (id) {
        return 'audio/' + (id + Path.mp4_suffix);
    };
    public static getCreateImage = function (id) {
        return 'ui3/create/' + (id + Path.png_suffix);
    };
    public static getRedPointImage = function () {
        return 'ui3/common/img_redpoint';
    };
    public static getMaterial = function (name: string) {
        return "materials/" + name;
    }
    public static getTextVoice = function (id) {
        return 'ui3/text/voice/' + (id + Path.png_suffix);
    };
    public static getGrainCar = function (id) {
        return 'ui3/escort/' + (id + Path.png_suffix);
    };
    public static getGrainCarText = function (id) {
        return 'ui3/text/escort/' + (id + Path.png_suffix);
    };
    public static getPvpUniverseImage = function (id) {
        return 'ui3/pvp_universe/' + (id + Path.png_suffix);
    };
    public static getPvpUniverseText = function (id) {
        return 'ui3/text/pvp_universe/' + (id + Path.png_suffix);
    };
    public static getActTShirt = function (id) {
        return 'ui3/activity/tshirt/' + (id + Path.png_suffix);
    };
    public static getFirstCharge = function (id) {
        return 'ui3/the_first_charge/' + (id + Path.png_suffix);
    };
}
