
import { Animation } from "./Animation"
import { MixBlend } from "./MixBlend"
import { MixDirection } from "./MixDirection"
import { TimelineType } from "./TimelineType"
import { CurveTimeline } from "./CurveTimeline"
import { RotateTimeline } from "./RotateTimeline"
import { TranslateTimeline } from "./TranslateTimeline"
import { ScaleTimeline } from "./ScaleTimeline"
import { ShearTimeline } from "./ShearTimeline"
import { ColorTimeline } from "./ColorTimeline"
import { TwoColorTimeline } from "./TwoColorTimeline"
import { AttachmentTimeline } from "./AttachmentTimeline"
import { DeformTimeline } from "./DeformTimeline"
import { EventTimeline } from "./EventTimeline"
import { DrawOrderTimeline } from "./DrawOrderTimeline"
import { IkConstraintTimeline } from "./IkConstraintTimeline"
import { TransformConstraintTimeline } from "./TransformConstraintTimeline"
import { PathConstraintPositionTimeline } from "./PathConstraintPositionTimeline"
import { PathConstraintSpacingTimeline } from "./PathConstraintSpacingTimeline"
import { PathConstraintMixTimeline } from "./PathConstraintMixTimeline"
import { AnimationState } from "./AnimationState"
import { TrackEntry } from "./TrackEntry"
import { EventQueue } from "./EventQueue"
import { EventType } from "./EventType"
import { AnimationStateAdapter } from "./AnimationStateAdapter"
import { AnimationStateData } from "./AnimationStateData"
import { AssetManager } from "./AssetManager"
import { AtlasAttachmentLoader } from "./AtlasAttachmentLoader"
import { BlendMode } from "./BlendMode"
import { Bone } from "./Bone"
import { BoneData } from "./BoneData"
import { TransformMode } from "./TransformMode"
import { ConstraintData } from "./ConstraintData"
import { Event } from "./Event"
import { EventData } from "./EventData"
import { IkConstraint } from "./IkConstraint"
import { IkConstraintData } from "./IkConstraintData"
import { PathConstraint } from "./PathConstraint"
import { PathConstraintData } from "./PathConstraintData"
import { PositionMode } from "./PositionMode"
import { SpacingMode } from "./SpacingMode"
import { RotateMode } from "./RotateMode"
import { SharedAssetManager } from "./SharedAssetManager"
import { Skeleton } from "./Skeleton"
import { SkeletonBinary } from "./SkeletonBinary"
import { SkeletonBounds } from "./SkeletonBounds"
import { SkeletonClipping } from "./SkeletonClipping"
import { SkeletonData } from "./SkeletonData"
import { SkeletonJson } from "./SkeletonJson"
import { SkinEntry } from "./SkinEntry"
import { Skin } from "./Skin"
import { Slot } from "./Slot"
import { SlotData } from "./SlotData"
import { Texture } from "./Texture"
import { TextureFilter } from "./TextureFilter"
import { TextureWrap } from "./TextureWrap"
import { TextureRegion } from "./TextureRegion"
import { FakeTexture } from "./FakeTexture"
import { TextureAtlas } from "./TextureAtlas"
import { TextureAtlasPage } from "./TextureAtlasPage"
import { TextureAtlasRegion } from "./TextureAtlasRegion"
import { TransformConstraint } from "./TransformConstraint"
import { TransformConstraintData } from "./TransformConstraintData"
import { Triangulator } from "./Triangulator"
import { IntSet } from "./IntSet"
import { Color } from "./Color"
import { MathUtils } from "./MathUtils"
import { Interpolation } from "./Interpolation"
import { Pow } from "./Pow"
import { PowOut } from "./PowOut"
import { Utils } from "./Utils"
import { DebugUtils } from "./DebugUtils"
import { Pool } from "./Pool"
import { TimeKeeper } from "./TimeKeeper"
import { WindowedMean } from "./WindowedMean"
import { Attachment } from "./Attachment"
import { VertexAttachment } from "./VertexAttachment"
import { AttachmentType } from "./AttachmentType"
import { BoundingBoxAttachment } from "./BoundingBoxAttachment"
import { ClippingAttachment } from "./ClippingAttachment"
import { MeshAttachment } from "./MeshAttachment"
import { PathAttachment } from "./PathAttachment"
import { PointAttachment } from "./PointAttachment"
import { RegionAttachment } from "./RegionAttachment"
import { JitterEffect } from "./JitterEffect"
import { SwirlEffect } from "./SwirlEffect"
export namespace sySpine{ 
export var Animation:Animation;
export var MixBlend:MixBlend;
export var MixDirection:MixDirection;
export var TimelineType:TimelineType;
export var CurveTimeline:CurveTimeline;
export var RotateTimeline:RotateTimeline;
export var TranslateTimeline:TranslateTimeline;
export var ScaleTimeline:ScaleTimeline;
export var ShearTimeline:ShearTimeline;
export var ColorTimeline:ColorTimeline;
export var TwoColorTimeline:TwoColorTimeline;
export var AttachmentTimeline:AttachmentTimeline;
export var DeformTimeline:DeformTimeline;
export var EventTimeline:EventTimeline;
export var DrawOrderTimeline:DrawOrderTimeline;
export var IkConstraintTimeline:IkConstraintTimeline;
export var TransformConstraintTimeline:TransformConstraintTimeline;
export var PathConstraintPositionTimeline:PathConstraintPositionTimeline;
export var PathConstraintSpacingTimeline:PathConstraintSpacingTimeline;
export var PathConstraintMixTimeline:PathConstraintMixTimeline;
export var AnimationState:AnimationState;
export var TrackEntry:TrackEntry;
export var EventQueue:EventQueue;
export var EventType:EventType;
export var AnimationStateAdapter:AnimationStateAdapter;
export var AnimationStateData:AnimationStateData;
export var AssetManager:AssetManager;
export var AtlasAttachmentLoader:AtlasAttachmentLoader;
export var BlendMode:BlendMode;
export var Bone:Bone;
export var BoneData:BoneData;
export var TransformMode:TransformMode;
export var ConstraintData:ConstraintData;
export var Event:Event;
export var EventData:EventData;
export var IkConstraint:IkConstraint;
export var IkConstraintData:IkConstraintData;
export var PathConstraint:PathConstraint;
export var PathConstraintData:PathConstraintData;
export var PositionMode:PositionMode;
export var SpacingMode:SpacingMode;
export var RotateMode:RotateMode;
export var SharedAssetManager:SharedAssetManager;
export var Skeleton:Skeleton;
export var SkeletonBinary:SkeletonBinary;
export var SkeletonBounds:SkeletonBounds;
export var SkeletonClipping:SkeletonClipping;
export var SkeletonData:SkeletonData;
export var SkeletonJson:SkeletonJson;
export var SkinEntry:SkinEntry;
export var Skin:Skin;
export var Slot:Slot;
export var SlotData:SlotData;
export var Texture:Texture;
export var TextureFilter:TextureFilter;
export var TextureWrap:TextureWrap;
export var TextureRegion:TextureRegion;
export var FakeTexture:FakeTexture;
export var TextureAtlas:TextureAtlas;
export var TextureAtlasPage:TextureAtlasPage;
export var TextureAtlasRegion:TextureAtlasRegion;
export var TransformConstraint:TransformConstraint;
export var TransformConstraintData:TransformConstraintData;
export var Triangulator:Triangulator;
export var IntSet:IntSet;
export var Color:Color;
export var MathUtils:MathUtils;
export var Interpolation:Interpolation;
export var Pow:Pow;
export var PowOut:PowOut;
export var Utils:Utils;
export var DebugUtils:DebugUtils;
export var Pool:Pool;
export var TimeKeeper:TimeKeeper;
export var WindowedMean:WindowedMean;
export var Attachment:Attachment;
export var VertexAttachment:VertexAttachment;
export var AttachmentType:AttachmentType;
export var BoundingBoxAttachment:BoundingBoxAttachment;
export var ClippingAttachment:ClippingAttachment;
export var MeshAttachment:MeshAttachment;
export var PathAttachment:PathAttachment;
export var PointAttachment:PointAttachment;
export var RegionAttachment:RegionAttachment;
export var JitterEffect:JitterEffect;
export var SwirlEffect:SwirlEffect;
} 
