local WorldBossRewardPreviewNode = class("WorldBossRewardPreviewNode")
local WorldBossHelper = import(".WorldBossHelper")
function WorldBossRewardPreviewNode:ctor(target)
    self._target = target
    self._listViewItem = ccui.Helper:seekNodeByName(self._target, "CommonListViewItem")
    cc.bind(self._listViewItem,"CommonListViewLineItem")

end

function WorldBossRewardPreviewNode:updateInfo(rewards)
    rewards = rewards or WorldBossHelper.getPreviewRewards()
    self._listViewItem:updateUI(rewards)
    self._listViewItem:setMaxItemSize(5)
    self._listViewItem:setListViewSize(410,100)
    self._listViewItem:setItemsMargin(2)
end

return WorldBossRewardPreviewNode