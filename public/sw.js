if (!self.define) {
	let e,
		s = {};
	const a = (a, n) => (
		(a = new URL(a + ".js", n).href),
		s[a] ||
			new Promise((s) => {
				if ("document" in self) {
					const e = document.createElement("script");
					(e.src = a), (e.onload = s), document.head.appendChild(e);
				} else (e = a), importScripts(a), s();
			}).then(() => {
				const e = s[a];
				if (!e) throw new Error(`Module ${a} didn’t register its module`);
				return e;
			})
	);
	self.define = (n, i) => {
		const t =
			e ||
			("document" in self ? document.currentScript.src : "") ||
			location.href;
		if (s[t]) return;
		const c = {};
		const o = (e) => a(e, t),
			r = { module: { uri: t }, exports: c, require: o };
		s[t] = Promise.all(n.map((e) => r[e] || o(e))).then((e) => (i(...e), c));
	};
}
define(["./workbox-e9849328"], (e) => {
	importScripts(),
		self.skipWaiting(),
		e.clientsClaim(),
		e.precacheAndRoute(
			[
				{
					url: "/_next/app-build-manifest.json",
					revision: "cc74baab6edf2a6f504cb106c3534dba",
				},
				{
					url: "/_next/static/chunks/40-3d5cfb0866554e3c.js",
					revision: "wa61XIIigo8Oa16_4dKsj",
				},
				{
					url: "/_next/static/chunks/764-782320a1a61a6775.js",
					revision: "wa61XIIigo8Oa16_4dKsj",
				},
				{
					url: "/_next/static/chunks/app/_not-found/page-b6177fc22f7a0246.js",
					revision: "wa61XIIigo8Oa16_4dKsj",
				},
				{
					url: "/_next/static/chunks/app/layout-04dd9ffdfe1b29aa.js",
					revision: "wa61XIIigo8Oa16_4dKsj",
				},
				{
					url: "/_next/static/chunks/app/page-92825da9b2567945.js",
					revision: "wa61XIIigo8Oa16_4dKsj",
				},
				{
					url: "/_next/static/chunks/dd0de53b-074afa59a8a37fad.js",
					revision: "wa61XIIigo8Oa16_4dKsj",
				},
				{
					url: "/_next/static/chunks/framework-6e06c675866dc992.js",
					revision: "wa61XIIigo8Oa16_4dKsj",
				},
				{
					url: "/_next/static/chunks/main-523ab9db8d03c997.js",
					revision: "wa61XIIigo8Oa16_4dKsj",
				},
				{
					url: "/_next/static/chunks/main-app-b4ec507f6ceb759c.js",
					revision: "wa61XIIigo8Oa16_4dKsj",
				},
				{
					url: "/_next/static/chunks/pages/_app-756956ce67c34026.js",
					revision: "wa61XIIigo8Oa16_4dKsj",
				},
				{
					url: "/_next/static/chunks/pages/_error-175f5b062d202ad5.js",
					revision: "wa61XIIigo8Oa16_4dKsj",
				},
				{
					url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
					revision: "846118c33b2c0e922d7b3a7676f81f6f",
				},
				{
					url: "/_next/static/chunks/webpack-beaff75291ccf37d.js",
					revision: "wa61XIIigo8Oa16_4dKsj",
				},
				{
					url: "/_next/static/css/13b7be3e7ca21769.css",
					revision: "13b7be3e7ca21769",
				},
				{
					url: "/_next/static/media/36966cca54120369-s.p.woff2",
					revision: "25ea4a783c12103f175f5b157b7d96aa",
				},
				{
					url: "/_next/static/media/5bbac197f803cc34-s.woff2",
					revision: "7b6ea3dd2de2dac9e36d1ad3212e9897",
				},
				{
					url: "/_next/static/media/9dd75fadc5b3df29-s.p.woff2",
					revision: "41a72a3a0ae3cacce2d69a29a9c3febf",
				},
				{
					url: "/_next/static/media/b7387a63dd068245-s.woff2",
					revision: "dea099b7d5a5ea45bd4367f8aeff62ab",
				},
				{
					url: "/_next/static/media/b8c37bb59076c047-s.woff2",
					revision: "dcb081b72429db19253e7b18aa5d39a3",
				},
				{
					url: "/_next/static/media/e1aab0933260df4d-s.woff2",
					revision: "207f8e9f3761dbd724063a177d906a99",
				},
				{
					url: "/_next/static/wa61XIIigo8Oa16_4dKsj/_buildManifest.js",
					revision: "3d186ed54ce2e59919d7b84f9a4e023e",
				},
				{
					url: "/_next/static/wa61XIIigo8Oa16_4dKsj/_ssgManifest.js",
					revision: "b6652df95db52feb4daf4eca35380933",
				},
				{ url: "/logo.svg", revision: "79fa4ef9f90459422e3ce508311e8004" },
				{ url: "/manifest.json", revision: "6c62866b2ef99303be9880feea74d61d" },
			],
			{ ignoreURLParametersMatching: [] },
		),
		e.cleanupOutdatedCaches(),
		e.registerRoute(
			"/",
			new e.NetworkFirst({
				cacheName: "start-url",
				plugins: [
					{
						cacheWillUpdate: async ({
							request: e,
							response: s,
							event: a,
							state: n,
						}) =>
							s && "opaqueredirect" === s.type
								? new Response(s.body, {
										status: 200,
										statusText: "OK",
										headers: s.headers,
									})
								: s,
					},
				],
			}),
			"GET",
		),
		e.registerRoute(
			/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
			new e.CacheFirst({
				cacheName: "google-fonts-webfonts",
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
				],
			}),
			"GET",
		),
		e.registerRoute(
			/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
			new e.StaleWhileRevalidate({
				cacheName: "google-fonts-stylesheets",
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
				],
			}),
			"GET",
		),
		e.registerRoute(
			/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
			new e.StaleWhileRevalidate({
				cacheName: "static-font-assets",
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
				],
			}),
			"GET",
		),
		e.registerRoute(
			/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
			new e.StaleWhileRevalidate({
				cacheName: "static-image-assets",
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
				],
			}),
			"GET",
		),
		e.registerRoute(
			/\/_next\/image\?url=.+$/i,
			new e.StaleWhileRevalidate({
				cacheName: "next-image",
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
				],
			}),
			"GET",
		),
		e.registerRoute(
			/\.(?:mp3|wav|ogg)$/i,
			new e.CacheFirst({
				cacheName: "static-audio-assets",
				plugins: [
					new e.RangeRequestsPlugin(),
					new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
				],
			}),
			"GET",
		),
		e.registerRoute(
			/\.(?:mp4)$/i,
			new e.CacheFirst({
				cacheName: "static-video-assets",
				plugins: [
					new e.RangeRequestsPlugin(),
					new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
				],
			}),
			"GET",
		),
		e.registerRoute(
			/\.(?:js)$/i,
			new e.StaleWhileRevalidate({
				cacheName: "static-js-assets",
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
				],
			}),
			"GET",
		),
		e.registerRoute(
			/\.(?:css|less)$/i,
			new e.StaleWhileRevalidate({
				cacheName: "static-style-assets",
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
				],
			}),
			"GET",
		),
		e.registerRoute(
			/\/_next\/data\/.+\/.+\.json$/i,
			new e.StaleWhileRevalidate({
				cacheName: "next-data",
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
				],
			}),
			"GET",
		),
		e.registerRoute(
			/\.(?:json|xml|csv)$/i,
			new e.NetworkFirst({
				cacheName: "static-data-assets",
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
				],
			}),
			"GET",
		),
		e.registerRoute(
			({ url: e }) => {
				if (!(self.origin === e.origin)) return !1;
				const s = e.pathname;
				return !s.startsWith("/api/auth/") && !!s.startsWith("/api/");
			},
			new e.NetworkFirst({
				cacheName: "apis",
				networkTimeoutSeconds: 10,
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
				],
			}),
			"GET",
		),
		e.registerRoute(
			({ url: e }) => {
				if (!(self.origin === e.origin)) return !1;
				return !e.pathname.startsWith("/api/");
			},
			new e.NetworkFirst({
				cacheName: "others",
				networkTimeoutSeconds: 10,
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
				],
			}),
			"GET",
		),
		e.registerRoute(
			({ url: e }) => !(self.origin === e.origin),
			new e.NetworkFirst({
				cacheName: "cross-origin",
				networkTimeoutSeconds: 10,
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
				],
			}),
			"GET",
		);
});
