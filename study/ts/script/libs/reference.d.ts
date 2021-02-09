declare namespace cc {
	export interface RawAsset extends Object {	
        addReference(obj: object, ignoreDepens?: boolean): void
        removeReference(obj: object): void
        getReference(): number
    }	

}

