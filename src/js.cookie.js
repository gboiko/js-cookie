/*global escape: true */
/*!
 * Javascript Cookie v2.0.0-pre
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2014 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD (Register as an anonymous module)
		define(factory);
	} else if (typeof exports === 'object') {
		// Node/CommonJS
		module.exports = factory();
	} else {
		// Browser globals
		var _OldCookies = window.Cookies;
		var api = window.Cookies = factory(window.jQuery);
		api.noConflict = function() {
			window.Cookies = _OldCookies;
			return api;
		};
	}
}(function () {
	function decode (value) {
		return value.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
	}

	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var options = arguments[ i ];
			for (var key in options) {
				result[key] = options[key];
			}
		}
		return result;
	}

	function init(converter) {
		var processRead = function (value, name, json) {
			if (value.charAt(0) === '"') {
				value = value.slice(1, -1);
			}

			value = converter && converter(value, name) || decode(value);

			if (json) {
				try {
					value = JSON.parse(value);
				} catch(e) {}
			}

			return value;
		};
		var api = function (key, value, options) {
			var result;
			var args = [].slice.call(arguments);

			// Write

			if (args.length > 1) {
				options = extend(api.defaults, options);

				if (typeof options.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + options.expires * 864e+5);
					options.expires = expires;
				}

				try {
					result = JSON.stringify(value);
					if (/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/.test(result)) {
						value = result;
					}
				} catch(e) {}

				value = encodeURIComponent(String(value));
				value = value.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				return (document.cookie = [
					key, '=', value,
					options.expires && '; expires=' + options.expires.toUTCString(), // use expires attribute, max-age is not supported by IE
					options.path    && '; path=' + options.path,
					options.domain  && '; domain=' + options.domain,
					options.secure  && '; secure'
				].join(''));
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('='),
					name = decode(parts.shift()),
					cookie = parts.join('=');

				if (key === name) {
					result = processRead(cookie, name, this.json);
					break;
				}

				if (!key) {
					result[name] = processRead(cookie, name, this.json);
				}
			}

			return result;
		};

		api.get = api.set = api;
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, options) {
			api(key, '', extend(options, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init();
}));
