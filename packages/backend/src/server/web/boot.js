/**
 * BOOT LOADER
 * サーバーからレスポンスされるHTMLに埋め込まれるスクリプトで、以下の役割を持ちます。
 * - 翻訳ファイルをフェッチする。
 * - バージョンに基づいて適切なメインスクリプトを読み込む。
 * - キャッシュされたコンパイル済みテーマを適用する。
 * - クライアントの設定値に基づいて対応するHTMLクラス等を設定する。
 * テーマをこの段階で設定するのは、メインスクリプトが読み込まれる間もテーマを適用したいためです。
 * 注: webpackは介さないため、このファイルではrequireやimportは使えません。
 */

'use strict';

// ブロックの中に入れないと、定義した変数がブラウザのグローバルスコープに登録されてしまい邪魔なので
(async () => {
	window.onerror = (e) => {
		renderError('SOMETHING_HAPPENED', e);
	};
	window.onunhandledrejection = (e) => {
		renderError('SOMETHING_HAPPENED_IN_PROMISE', e);
	};

	const v = localStorage.getItem('v') || VERSION;

	//#region Detect language & fetch translations
	const localeVersion = localStorage.getItem('localeVersion');
	const localeOutdated = (localeVersion == null || localeVersion !== v);

	if (!localStorage.hasOwnProperty('locale') || localeOutdated) {
		const supportedLangs = LANGS;
		let lang = localStorage.getItem('lang');
		if (lang == null || !supportedLangs.includes(lang)) {
			if (supportedLangs.includes(navigator.language)) {
				lang = navigator.language;
			} else {
				lang = supportedLangs.find(x => x.split('-')[0] === navigator.language);

				// Fallback
				if (lang == null) lang = 'en-US';
			}
		}

		const res = await fetch(`/assets/locales/${lang}.${v}.json`);
		if (res.status === 200) {
			localStorage.setItem('lang', lang);
			localStorage.setItem('locale', await res.text());
			localStorage.setItem('localeVersion', v);
		} else {
			await checkUpdate();
			renderError('LOCALE_FETCH_FAILED');
			return;
		}
	}
	//#endregion

	//#region Script
	import(`/assets/${CLIENT_ENTRY}`)
		.catch(async e => {
			await checkUpdate();
			renderError('APP_FETCH_FAILED', e);
		})
	//#endregion

	//#region Theme
	const theme = localStorage.getItem('theme');
	if (theme) {
		for (const [k, v] of Object.entries(JSON.parse(theme))) {
			document.documentElement.style.setProperty(`--${k}`, v.toString());

			// HTMLの theme-color 適用
			if (k === 'htmlThemeColor') {
				for (const tag of document.head.children) {
					if (tag.tagName === 'META' && tag.getAttribute('name') === 'theme-color') {
						tag.setAttribute('content', v);
						break;
					}
				}
			}
		}
	}
	//#endregion

	const fontSize = localStorage.getItem('fontSize');
	if (fontSize) {
		document.documentElement.classList.add('f-' + fontSize);
	}

	const useSystemFont = localStorage.getItem('useSystemFont');
	if (useSystemFont) {
		document.documentElement.classList.add('useSystemFont');
	}

	const wallpaper = localStorage.getItem('wallpaper');
	if (wallpaper) {
		document.documentElement.style.backgroundImage = `url(${wallpaper})`;
	}

	const customCss = localStorage.getItem('customCss');
	if (customCss && customCss.length > 0) {
		const style = document.createElement('style');
		style.innerHTML = customCss;
		document.head.appendChild(style);
	}

	async function addStyle(styleText) {
		let css = document.createElement('style');
		css.appendChild(document.createTextNode(styleText));
		document.head.appendChild(css);
	}

	function renderError(code, details) {
		document.documentElement.innerHTML = `
			<style>body { background-color: #010080; }</style>
			<div style="color: #FFF; padding: 128px;">
				<h1 style="font-family: system-ui; font-size: 100px; margin: 0;">:(</h1>
				<h1>おまえが悪い</h1>
				<p>問題が解決しない場合はおまえが修正しろ。以下のオプションを試すこともできる:</p>
				<div style="display: flex; flex-direction: row;">
				    <img style="width: 192px; image-rendering: pixelated;" src="data:image/gif;base64,R0lGODlhIwAjAIAAAP///wEAgCH5BAAAAAAALAAAAAAjACMAAAK1hI+py+0Pozyh2mAquBtdq2DeplGjaCYYuIpr97avSsZZ1sJ1R7O3XItpUKkiLGfkeT625vEjkRFJ0Z6LKsRNTaDgrIvd3nC/kBZSGpdYnLQZOPSVRzSdN73Oh67I3VtMFUbh1mZHx0d2dQIo6KfFBNSAJKXjoqgydMSlGSEUR2TJxlhnQ2a6AHnW5QNWZ/TleLk4E8QD2ceVOfi4p5RL+/OVakYXa1u7lZqHqDbh/AwdLZ1QAAA7">
					<div style="display: flex; flex-direction: column; justify-content: space-between; padding-block: 16px;">
						<ul style="margin: 0;">
							<li><a style="color: red;" href="/cli">簡易クライアント</a>を起動しろ</li>
							<li><a style="color: red;" href="/bios">BIOS</a>で修復を試みろ</li>
							<li><a style="color: red;" href="/flush">キャッシュを消せ</a></li>
						</ul>
						<div style="padding-left: 40px;">
				    		<p style="margin: 0;"><code>停止コード: ${code}</code></p>
							<p style="margin: 0;"><code>失敗した内容: ${details}</code></p>
						</div>
					</div>
				</div>
			</div>
		`;
	}

	// eslint-disable-next-line no-inner-declarations
	async function checkUpdate() {
		// TODO: サーバーが落ちている場合などのエラーハンドリング
		const res = await fetch('/api/meta', {
			method: 'POST',
			cache: 'no-cache'
		});

		const meta = await res.json();

		if (meta.version != v) {
			localStorage.setItem('v', meta.version);
			refresh();
		}
	}

	// eslint-disable-next-line no-inner-declarations
	function refresh() {
		// Clear cache (service worker)
		try {
			navigator.serviceWorker.controller.postMessage('clear');
			navigator.serviceWorker.getRegistrations().then(registrations => {
				registrations.forEach(registration => registration.unregister());
			});
		} catch (e) {
			console.error(e);
		}

		location.reload();
	}
})();
