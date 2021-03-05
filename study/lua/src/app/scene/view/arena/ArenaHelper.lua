--竞技场帮助类


local ArenaHelper = {}

--更新竞技场排行
function ArenaHelper.updateArenaRank(node, rank)
    local textRank = nil
    if rank <= 3 and rank > 0 then
        local imagePath = Path.getArenaUI("img_qizhi0"..rank)
        node:updateImageView("Image_top_rank", {texture = imagePath, visible = true})
        node:updateLabel("Text_rank", {visible = false})
    else
        node:updateImageView("Image_top_rank", {visible = false})

        local rankDesc = tostring(rank)
        if rank ~= 0 then
            textRank = node:updateLabel("Text_rank", {visible = true, text = rankDesc})
        else
            rankDesc = Lang.get("arena_rank_zero")
            textRank = node:updateLabel("Text_rank", {visible = true, text = rankDesc, fontSize = 20})
        end
        
    end
    return textRank
end

--获取排行榜奖励，根据当前排行
function ArenaHelper.getAwardListByRank(rank)
	local awardInfo = G_UserData:getArenaData():getRankAward(rank)
    local awardList = {}
    if awardInfo == nil then
        return {}
    end

    for i= 1, 3 do
        if awardInfo["award_type_"..i] > 0 then
            local award = {}
            award.type = awardInfo["award_type_"..i]
            award.value = awardInfo["award_value_"..i]
            award.size = awardInfo["award_size_"..i]
            table.insert(awardList, award)
        end
    end

    return awardList
end
return ArenaHelper
