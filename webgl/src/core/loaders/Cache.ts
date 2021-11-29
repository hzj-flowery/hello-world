export namespace Cache {

	export var enabled = false;

	export var files = {};

	export function add(key, file) {

		if (this.enabled === false) return;

		// console.log( 'THREE.Cache', 'Adding key:', key );

		this.files[key] = file;

	};

	export function get(key) {

		if (this.enabled === false) return;

		// console.log( 'THREE.Cache', 'Checking key:', key );

		return this.files[key];

	};

	export function remove(key) {

		delete this.files[key];

	};

	export function clear() {

		this.files = {};

	}

};
