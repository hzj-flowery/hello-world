local Path = {}

local function addPath(paths)
    for k, v in pairs(paths) do
        Path[k] = v
    end
end


--addPath(import(".PathNew"))
--addPath(import(".PathNew3"))
--
local png_suffix = ".png"
local jpg_suffix = ".jpg"
local json_suffix = ".json"
local mp3_suffix = ".mp3"
local csb_suffix = ".csb"
local plist_suffix = ".plist"
local ttf_suffix = ".ttf"
local mp4_suffix = ".mp4"

local fnt_suffix = ".fnt"
local shader_suffix = ".fsh"

local SERVER_STATUS_IMGS = {"","smooth","server_hot","server_weihu","server_weihu","server_weihu","smooth","smooth","","","server_xianxing02","server_weihu"}
local SERVER_STATUS_IMGS_2 = {"","server_xinfu","server_huobao","server_preserve","server_preserve","server_preserve","server_xinfu","server_xinfu","txt_return_jijiangkaifu01","","server_xianxing","txt_return_jijiangkaifu01"}

--
function Path.getCommonFont()
    -- return Path.getFont("Font_FZYHJT")
    return Path.getFont("Font_W7S")
end

function Path.getFontW8()
	return Path.getFont("Font_W8S")
end
--
function Path.getFont(id)
	return "fonts/" .. id .. ttf_suffix
end

--
function Path.getCSB(id, sceneName)
    return "csui/" .. (sceneName == nil and "" or (sceneName .. "/")) .. id .. csb_suffix
end

--
function Path.getAttackerAction(id)
	return "fight/action/" .. id .. "_attacker.ani"
end

--
function Path.getTargetAction(id, cell)
	if cell then
		return "fight/action/" .. id .. "_target_" .. cell .. ".ani"
	end
	return "fight/action/" .. id .. "_target.ani"
end

--
function Path.getSceneAction(id)
	return "fight/action/" .. id .. "_scene.ani"
end

--
function Path.getSpine(id)
	return "spine/" .. id
end

--
function Path.getEffectSpine(id)
	return "effect/spine/" .. id
end

function Path.getFightEffectSpine(id)
	return "fight/effect/" .. id
end

function Path.getImgRunway(id)
	return "ui3/runway/" ..id
end

--
function Path.getUICommon(id)
	return "ui3/common/" .. id .. png_suffix
end

function Path.getBigItemIconPath(id)
	return "icon/itembig/" .. id .. png_suffix
end

function Path.getBoutPath(id)
	return "ui3/bout/" .. id .. png_suffix
end

function Path.getBoutBottomPath(id, boutId)
	return "ui3/bout/" .."bout_0" ..boutId .."/".. id .. png_suffix
end



--注：该函数路径是临时的，将来需要调整
function Path.getUIText(id)
	return "newui/text/" .. id .. png_suffix
end

function Path.getUITemp(module,id)
	return "uitemp/" ..module.."/"..id.. png_suffix
end

function Path.getTextTeam(id)
	return "ui3/text/team/" .. id .. png_suffix
end
function Path.getTextSign(id)
	return "ui3/text/sign/" .. id .. png_suffix
end

function Path.getTextSignet(id)
	return "ui3/text/signet/" .. id .. png_suffix
end

function Path.getImgTitle(id)
	
	return "ui3/text/title/" ..id .. png_suffix
end

function Path.getDiscountImg(discount)
	return Path.getTextSignet("txt_sys_activity_sale0"..discount)
end

function Path.getTextSystemBigTab(id)
	return "ui3/text/system/big_tab/" .. id .. png_suffix
end

function Path.getTextSystem(id)
	return "ui3/text/system/" .. id .. png_suffix
end

function Path.getTextGuildCross(id)
    return "ui3/text/guild_cross_war/" .. id ..png_suffix
end

function Path.getUICommonFrame(id)
	return "ui3/common/frame/"..id..png_suffix
end

function Path.getCommonIcon(module,id)
	return "icon/" ..module.."/".. id .. png_suffix
end

--获取英雄半身像图片
function Path.getHeroBustIcon(id)
	return "icon/team_hero/".. id .. png_suffix
end

function Path.getHeroBustIconBg(id)
	return "ui3/common/frame/"..id..png_suffix
end

function Path.getHeroBodyIcon(id)
	return "icon/pvpuniverse/".. id .. png_suffix
end


function Path.getTextHero(id)
	return "ui3/text/official/" .. id ..png_suffix
end

-- 获得英雄等级图片
function Path.getOfficialImg(id)
    return "ui3/official/"..id..png_suffix
end

--金将文本图片
function Path.getGoldHeroTxt(id)
    return "ui3/text/gold_hero/"..id..png_suffix
end

function Path.getGoldHero(id)
    return "ui3/gold_hero/"..id..png_suffix
end
function Path.getGoldHeroJPG(id)
    return "ui3/gold_hero/"..id..jpg_suffix
end

function Path.getTextEquipment(id)
	return "ui3/text/quipment/"..id..png_suffix
end

function Path.getText(id)
	return "ui3/text/" .. id .. png_suffix
end

function Path.getEmbattle(id)
	return "ui3/embattle/"..id..png_suffix
end

function Path.getBuffText(id)
	return "ui3/text/buff/"..id..png_suffix
end

function Path.getChapterIcon(id)
	return "mline/chapter/"..id..png_suffix
end

function Path.getChallengeIcon(id)
	return "ui3/challenge/"..id..png_suffix
end

function Path.getChallengeText(id)
	return "ui3/text/challenge/"..id..png_suffix
end

function Path.getDailyChallengeIcon(id)
	return "ui3/challenge/daily/"..id..png_suffix
end

function Path.getTowerChallengeIcon(id)
	return "ui3/challenge/tower/"..id..png_suffix
end

function Path.getEssenceText(id)
	return "ui3/text/essence/img_essence0"..id..png_suffix
end

function Path.getChatRoleRes(id)
	return "storyres/"..id..png_suffix
end

function Path.getStorySpine(id)
	return "storyspine/" ..id.."_big"
end

function Path.getChatFaceRes(id)
	return "ui3/face/mini/"..id..png_suffix
end

function Path.getChatFormRes(id)
	return "ui3/chat/form"..id..png_suffix
end

function Path.getTowerSurpriseBG(id)
	return "ui3/challenge/tower/img_bg_"..id..png_suffix
end

function Path.getBuffFightIcon(id)
	return "ui3/battle/buffcard/"..id..png_suffix
end

function Path.getShader(id)
	return "shaders/"..id..shader_suffix
end

function Path.getStageMap(id)
	return "mline/stage/"..id..jpg_suffix
end


function Path.getStageBG(id)
	return "ui3/stage/"..id..jpg_suffix
end

function Path.getStageGuildCross(id)
	return "ui3/stage/guild_cross/"..id..jpg_suffix
end

function Path.getGuildCrossCity(id)
    return "ui3/guild_cross_war/city/"..id..png_suffix
end

function Path.getExploreMainBG()
	return "ui3/stage/img_explore_map1"..jpg_suffix
end

function Path.getExploreCityRes(id)
	return "ui3/explore/city/img_city"..id..png_suffix
end

function Path.getExploreCloud()
	return "ui3/explore/img_cloud"..png_suffix
end


function Path.getExploreBlock(id)
	if not id then
		return "ui3/explore/img_road"..png_suffix
	end
	return "ui3/explore/"..id..png_suffix
end

function Path.getExploreDiscover(id)
	return "ui3/explore/discover/"..id..png_suffix
end

function Path.getExploreMapBG()
	return "ui3/stage/img_dfwddt"..jpg_suffix
end

function Path.getActDinnerRes(id)
	return "ui3/activity/dinner/"..id..png_suffix
end

function Path.getAnswerImage(id)
	return "ui3/explore/discover/answe/"..id..png_suffix
end

function Path.getDay7ActivityRes(id)
	return "ui3/activity/carnival/"..id..png_suffix
end

function Path.getExploreImage(id)
	return "ui3/explore/"..id..png_suffix
end

function Path.getExploreIconImage(id)
    return "icon/explore/"..id..png_suffix
end

function Path.getExploreTextImage(id)
    return "ui3/text/explore/"..id..png_suffix
end

function Path.getGuildCrossImage(id)
	return "ui3/guild_cross_war/"..id..png_suffix
end

function Path.getExploreTreasureBigIcon(id)
	return "icon/treasurebig/"..id..png_suffix
end

function Path.getResourceMiniIcon(id)
	return "icon/resourcemini/"..id..png_suffix
end

function Path.getExploreOrnament(id)
	return "ui3/explore/img_"..id..png_suffix
end

function Path.getTutorialVoice(id)
	return "audio/voice/"..id..mp3_suffix
end

function Path.getSkillVoice(id)
	return "audio/voice/"..id..mp3_suffix
end

function Path.getFightSound(id)
	return "audio/fight/" .. id .. mp3_suffix
end

function Path.getCreateRoleRes(id)
	return "ui3/create/"..id..png_suffix
end

function Path.getChapterBox(id)
	return "icon/common/"..id..png_suffix
end

--排行榜背景
-- function Path.getRankBG(id)
-- 	return "ui3/common/img_com_ranking0"..id..png_suffix
-- end

--排行榜前面排名图标
function Path.getRankIcon(id)
	return "ui3/common/icon_com_ranking0"..id..png_suffix
end

--恭喜获得资源
function Path.getPopupReward(id)
	return "ui3/gain/"..id..png_suffix
end

--获得章节地图背景
function Path.getChapterBG(id)
	return "mline/img_mline_bg0"..id..jpg_suffix
end

--获得系统字图案
function Path.getSystemImage(id)
	return "ui3/text/system/"..id..png_suffix
end

--获得战斗中ui资源
function Path.getBattleRes(id)
	return "ui3/battle/"..id..png_suffix
end

--获得标记
function Path.getBattleMark(id)
	return "ui3/battle/showmark/"..id..png_suffix
end

--获得战斗字体
function Path.getBattleFont(id)
	return "ui3/text/battle/"..id..png_suffix
end

--获得抽奖积分宝箱图
function Path.getRecruitImage(id)
	return "ui3/drawcard/"..id..png_suffix
end

--技能展示
function Path.getSkillShow(id)
	return "ui3/text/skill/"..id..png_suffix
end

--返回ui数字以及plist
function Path.getBattleNum(id)
	return "ui3/text/battle/"..id..png_suffix, "ui3/text/battle/"..id..plist_suffix
end

--返回展示资源
function Path.getShowHero(id)
	return "ui3/showhero/"..id..png_suffix
end

--展示名字
function Path.getShowHeroName(id)
	return "ui3/showhero/show_name/"..id..png_suffix
end

--返回新修改的展示资源
function Path.getShowHeroTrue(id)
	return "ui3/showherotrue/"..id..png_suffix
end

--新修改的展示名字
function Path.getShowHeroNameTrue(id)
	return "ui3/showherotrue/show_name/"..id..png_suffix
end

--神兵图片
function Path.getInstrument(id)
	return "icon/instrumentbig/"..id..png_suffix
end

--无差别竞技段位图片
function Path.getSeasonDan(id)
	return "ui3/fight/"..id..png_suffix
end

--无差别竞技星级txt图片
function Path.getSeasonStar(id)
	return "ui3/text/fight/"..id..png_suffix
end

--矿战探望权卡
function Path.getCraftPrivilege(id)
	return "ui3/mine_privilege/"..id..png_suffix
end

--故事剧情表情
function Path.getStoryChatFace(id)
	return "ui3/face/"..id..png_suffix
end


function Path.getArenaUI(id)
	return "ui3/arena/"..id..png_suffix
end

function Path.getStageMapPath(path)

	local function getfile(path, fileName)
		local fileUtils = cc.FileUtils:getInstance()
		local picName = "mline/stage/"..path..fileName..jpg_suffix
		if not fileUtils:isFileExist(picName) then
			picName = "mline/stage/"..path..fileName..png_suffix
		end
		if not fileUtils:isFileExist(picName) then
			picName = nil
		end
		return picName
	end
	local back = getfile(path, "/back")
	local mid = getfile(path, "/mid")
	local front = getfile(path, "/front")
	return back, mid, front

	-- local fileUtils = cc.FileUtils:getInstance()
	-- local back = "ui3/mline/stage/"..path.."/back"..jpg_suffix
	-- if not fileUtils:isFileExist(back) then
	-- 	back = "ui3/mline/stage/"..path.."/back"..png_suffix
	-- end
	-- if not fileUtils:isFileExist(back) then
	-- 	back = nil
	-- end

	-- local mid = "ui3/mline/stage/"..path.."/mid"..png_suffix
	-- if not fileUtils:isFileExist(mid) then
	-- 	mid = nil
	-- end

	-- local front = "ui3/mline/stage/"..path.."/front"..png_suffix
	-- if not fileUtils:isFileExist(front) then
	-- 	front = nil
	-- end

	-- return back, mid, front
end

function Path.getStageSceneName(scene)
	return "app.scene.view.stage.scene.Scene"..scene
end

function Path.getComplexRankUI(id)
	return "ui3/complexrank/"..id..png_suffix
end

function Path.getCommonRankUI(id)
    return "ui3/common/"..id..png_suffix
end

function Path.getWorldBossUI(id)
	return "ui3/challenge/world_boss/"..id..png_suffix
end

function Path.getFightSceneEffect(effect)
	return "moving_"..effect
end

function Path.getFightSceneBackground(id)
	return "fight/scene/"..id
end

function Path.getCommonFrame(id)
	return "ui3/common/frame/"..id..png_suffix
end

function Path.getCrossBossImage(id)
	return "ui3/cross_boss/"..id..png_suffix
end

function Path.getCommonImage(id)
	return "ui3/common/"..id..png_suffix
end

function Path.getParticle(id)
	return "effect/particle/"..id..plist_suffix
end

function Path.getRanking(id)
	return "ui3/ranking/"..id..png_suffix
end

function Path.getVipNum(id)
	return "ui3/vip/vip_"..id..png_suffix
end

function Path.getVipJpgImage(id)
	return "ui3/vip/"..id..jpg_suffix
end

function Path.getVipImage(id)
	return "ui3/vip/"..id..png_suffix
end

function Path.getHeroVoice(id)
	return "audio/voice/"..id..mp3_suffix
end

function Path.getNextFunctionOpen(id)
	return "ui3/newopen/"..id..png_suffix
end


function Path.getChooseServerRes(id)
	return "ui3/chooseserver/"..id..png_suffix
end

function Path.getServerStatusIcon(status)
	local img = SERVER_STATUS_IMGS[status]
	local statusIcon =  Path.getChooseServerRes(img)
	return statusIcon,img and img ~= ""
end

function Path.getServerStatusBigIcon(status)
	return Path.getChooseServerRes(SERVER_STATUS_IMGS_2[status])
end

function Path.getGuildRes(id)
	return "ui3/guild/"..id..png_suffix
end

function Path.getRechargeRmb(id)
	return "ui3/vip/rmb_" .. id .. png_suffix
end


function Path.getRechargeVip(id)
	return "ui3/vip/vip_" .. id .. png_suffix
end

function Path.getFetterRes(id)
	return "ui3/fetter/"..id..png_suffix
end

function Path.getBackground(id, suffix)
	suffix = suffix or jpg_suffix
	return "ui3/background/"..id..suffix
end

function Path.getBackground4(id, suffix)
	suffix = suffix or jpg_suffix
	return "ui3/background/"..id..suffix
end

function Path.getMonthlyCardRes(id)
	return "ui3/activity/"..id..png_suffix
end


function Path.getActivityRes(id)
	return "ui3/activity/"..id..png_suffix
end

function Path.getActivityTextRes(id)
	return "ui3/text/activity/"..id..png_suffix
end


function Path.getVoiceRes(id)
	return "ui3/voice/"..id..png_suffix
end


function Path.getTextMain(id)
	return "ui3/text/main/"..id..png_suffix
end

function Path.getDrawCard(id)
	return "ui3/drawcard/"..id..png_suffix
end

function Path.getGuide(id)
	return "ui3/guide/"..id..png_suffix
end

function Path.getChatFaceMiniRes(id)
	return "ui3/face/mini/"..id..png_suffix
end

function Path.getBackgroundEffect(id)
	return "ui3/background/effects/"..id..png_suffix
end


function Path.getTextBattle(id)
	return "ui3/text/battle/" .. id ..png_suffix
end




function Path.getPlayerVip(id)
	return "ui3/main/img_main_vip" .. id .. png_suffix
end

function Path.getPlayerIcon(id)
	return "ui3/main/" .. id .. png_suffix
end

function Path.getMainDir()
	return "ui3/text/main/"
end

function Path.getBattleDir()
	return "ui3/text/battle/"
end

function Path.getBattlePowerDir()
	return "ui3/text/battlepower/"
end

function Path.getChapterNameIcon(id)
	return "ui3/text/city/" .. id .. png_suffix
end

function Path.getTeamUI(id)
	return "ui3/team/"..id..png_suffix
end

function Path.getTextGuild(id)
	return "ui3/text/guild/" .. id .. png_suffix
end

function Path.getFamousImage(id)
	return "mline/general/"..id..png_suffix
end

function Path.getPreBattleImg(id)
	return "ui3/prebattle/"..id..png_suffix
end

function Path.getTimeActivities(id)
	return "ui3/time_activities/"..id..png_suffix
end

function Path.getTurnscard(id, suffix)
	suffix = suffix or png_suffix
	return "ui3/turnscard/"..id..suffix
end

function Path.getTask(id)
	return "ui3/task/"..id..png_suffix
end

function Path.getMail(id)
	return "ui3/mail/"..id..png_suffix
end

function Path.getMailIconBg(id)
	return "ui3/mail/"..id..png_suffix
end

function Path.getPet( id )
	-- body
	return "ui3/beast/"..id..png_suffix
end
function Path.getCrystalShop( id )
	-- body
	return "ui3/crystalshop/"..id..png_suffix
end

function Path.getCrystalShopText( id )
	-- body
	return "ui3/text/activity/"..id..png_suffix
end

function Path.getGuildDungeonUI( id )
	return "ui3/guilddungeon/"..id..png_suffix
end

function Path.getGuildDungeonJPG( id )
	return "ui3/guilddungeon/"..id..jpg_suffix
end

function Path.getTalent( id )
	return "ui3/text/talent/"..id..png_suffix
end

function Path.getMineNodeTxt(id)
	return "ui3/text/mine_craft/"..id..png_suffix
end

function Path.getMineImage(id)
	return "ui3/minecraft/"..id..png_suffix
end

function Path.getRedPetImage(id)
	return "ui3/activity/pet_red/"..id..png_suffix
end

function Path.getGuildAnswerText(id)
	return "ui3/text/answer/"..id..png_suffix
end

function Path.getLimitActivityIcon(id)
	return "icon/time_limit/"..id..png_suffix
end

function Path.getCustomActivityUIBg(id)
	return "ui3/activity/limit/"..id..jpg_suffix
end

function Path.getCustomActivityUI(id)
	return "ui3/activity/limit/"..id..png_suffix
end

function Path.getGuildFlagImage(index)
	return string.format("ui3/guild/img_flag_colour%02d%s",index,png_suffix)
end

function Path.getGuildVerticalFlagImage(index)
	return string.format("ui3/guild/img_flag_colour%02da%s",index,png_suffix)
end

function Path.getGuildFlagColorImage(index)
	return string.format("ui3/guild/img_colour%02d%s",index,png_suffix)
end


function Path.getShareImage(id, suffix)
	suffix = suffix or jpg_suffix
	return "ui3/share/"..id..suffix
end

function Path.getCountryBossText(id)
	return "ui3/text/guild/"..id..png_suffix
end

function Path.getCountryBossImage(id)
	return "ui3/countryboss/"..id..png_suffix
end


function Path.getLinkageActivity(id)
	return "ui3/gang_activity/"..id..png_suffix
end

function Path.getTextHomeland(id)
	return "ui3/text/homeland/"..id..png_suffix
end

function Path.getHomelandUI(id)
	return "ui3/homeland/"..id..png_suffix
end

function Path.getTextCampRace(id)
	return "ui3/text/camp_battle/"..id..png_suffix
end

function Path.getCampImg(id)
	return "ui3/camp_battle/"..id..png_suffix
end

function Path.getCampJpg(id)
	return "ui3/camp_battle/"..id..jpg_suffix
end

function Path.getRunningMan( id )
	-- body
	return "ui3/runway/"..id..png_suffix
end

function Path.getGuildWar( id )
	return "ui3/war/"..id..png_suffix
end

function Path.getTextLimit(id)
	return "ui3/text/limit/"..id..png_suffix
end

function Path.getLimitImg(id)
	return "ui3/limit/"..id..png_suffix
end

function Path.getLimitImgBg(id)
	return "ui3/limit/"..id..jpg_suffix
end

function Path.getHorseRaceImg(id)
	return "ui3/horserace/"..id..png_suffix
end

function Path.getSvip(id, suffix)
	suffix = suffix or jpg_suffix
	return "ui3/service/"..id..suffix
end

function Path.getMineDoubleImg(id)
	return "ui3/text/signet/img_mine_craft0"..id..png_suffix
end


function Path.getQinTomb( id )
	-- body
	return "ui3/qintomb/"..id..png_suffix
end

function Path.getTextQinTomb(id)
	return "ui3/text/qintomb/"..id..png_suffix
end

function Path.getLinkageActivity(id)
	return "ui3/linkageactivity/"..id..png_suffix
end

function Path.getBattlePet(id)
	return "ui3/battle/pet/"..id..png_suffix
end

function Path.getLimitBG(id)
	return "ui3/limit/"..id..jpg_suffix
end

function Path.getHorseImg(id)
    return "ui3/horse/"..id..png_suffix
end

function Path.getTrainIcon( id )
	return "ui3/guild/"..id..png_suffix
end

function Path.getJadeImg(id)
    return "ui3/jade/"..id..png_suffix
end

function Path.getShopBG(id)
	return "ui3/shop/"..id..jpg_suffix
end

function Path.getTrainAcceptImg( id )
	return "ui3/train/"..id..png_suffix
end

function Path.getTestImg( id )
	return "ui3/test/test"..id..png_suffix
end

function Path.getTestImgSelected( ... )
	return  "ui3/test/selected"..png_suffix
end

function Path.getIndividualCompetitiveImg(id)
	return "ui3/individual_competitive/"..id..png_suffix
end

function Path.getTrainInviteBg(id)
	return "ui3/train/"..id..png_suffix
end

function Path.getAnswerBg(id)
	return "ui3/answer/"..id..jpg_suffix
end

function Path.getAnswerImg(id)
	return "ui3/answer/"..id..png_suffix
end

function Path.getDefaultIcon(id)
	return id..png_suffix
end

function Path.getFrameIcon( id )
	return "ui3/head_frame/"..id..png_suffix
end

function Path.getRedBagImg(id)
	return "ui3/redbag/"..id..png_suffix
end

function Path.getAnniversaryImg(id)
	return "ui3/anniversary/"..id..png_suffix
end

function Path.getTextAnniversaryImg(id, suffix)
	suffix = suffix or png_suffix
	return "ui3/text/anniversary/"..id..suffix
end

function Path.getReturnText(id)
	return "ui3/text/return/"..id..png_suffix
end

function Path.getHistoryHeroImg(id)
	return "ui3/historical_hero/"..id..png_suffix
end

function Path.getReturnBgImg(id)
	return "ui3/return/"..id..png_suffix
end

function Path.getHistoryHeroWeaponImg(id)
	return "icon/historicalweapon/"..id..png_suffix
end

function Path.getHistoryHeroWeaponBigImg(id)
	return "icon/historicalweaponbig/"..id..png_suffix
end

function Path.getVideo(id)
    return "audio/"..id..mp4_suffix
end

function Path.getCreateImage(id)
    return "ui3/create/"..id..png_suffix
end

function Path.getTextVoice(id)
    return "ui3/text/voice/"..id..png_suffix
end

function Path.getGrainCar(id)
    return "ui3/escort/"..id..png_suffix
end

function Path.getGrainCarText(id)
    return "ui3/text/escort/"..id..png_suffix
end

-- 战法
function Path.getTacticsImage(id)
	return "ui3/tactics/"..id..png_suffix
end

function Path.getTextTactics(id)
	return "ui3/text/tactics/" .. id .. png_suffix
end

function Path.getPvpUniverseImage(id)
	return "ui3/pvp_universe/"..id..png_suffix
end

function Path.getPvpUniverseText(id)
	return "ui3/text/pvp_universe/"..id..png_suffix
end

function Path.getActTShirt(id)
	return "ui3/activity/tshirt/"..id..png_suffix
end

return Path