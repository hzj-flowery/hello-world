export namespace PopUpPlayerFrameHelper
{
    let currentTouchIndexId = 0;
    export let getCurrentTouchIndex = function()
    {
        return currentTouchIndexId;
    }

    export let setCurrentTouchIndex = function(indexId)
    {
        currentTouchIndexId = indexId;
    }
}