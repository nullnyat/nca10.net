<template>
<MkSpacer :content-max="700" :margin-min="16" :margin-max="32">
	<div class="cwepdizn _formRoot">
		<FormInput v-model="emojiName" class="_formBlock">
			<template #label>{{ $ts.emojiName }}</template>
		</FormInput>

		<FormTextarea v-model="text" class="_formBlock">
			<template #label>{{ $ts.text }}</template>
		</FormTextarea>

		<FormRadios v-model="emojiAlign" class="_formBlock">
			<template #label>{{ $ts.emojiAlign }}</template>
			<option value="left"><i class="fa-solid fa-align-left"/></option>
			<option value="center"><i class="fa-solid fa-align-center"></i></option>
			<option value="right"><i class="fa-solid fa-align-right"/></option>
		</FormRadios>

		<FormSection>
			<template #label>{{ $ts.emojiSizeSetting }}</template>
			<FormSwitch v-model="emojiSizeFixed" class="_formBlock">
				<template #label>{{ $ts.emojiSizeFixed }}</template>
			</FormSwitch>

			<FormSwitch v-model="emojiStretch" class="_formBlock">
				<template #label>{{ $ts.emojiStretch }}</template>
			</FormSwitch>
		</FormSection>

		<FormRadios v-model="font" class="_formBlock">
			<template #label>{{ $ts.font }}</template>
			<option value="notosans-mono-bold">Noto Sans Mono CJK JP Bold</option>
			<option value="mplus-1p-black">M+ 1p black</option>
			<option value="rounded-x-mplus-1p-black">Rounded M+ 1p black</option>
			<option value="ipamjm">IPAmj明朝</option>
			<option value="aoyagireisyoshimo">青柳隷書しも</option>
			<option value="LinLibertine_RBah">LinLibertine Bold</option>
		</FormRadios>

		<FormSection>
			<template #label>{{ $ts.emojiColor }}</template>
			<div class="cwepdizn-colors">
				<div class="row">
					<button v-for="color in accentColors" :key="color" class="color rounded _button" @click="setAccentColor(color)">
						<div class="preview" :style="{ background: color }"></div>
					</button>
				</div>
			</div>

			<FormInput v-model="emojiColor" class="_formBlock">
				<template #prefix><i class="fas fa-palette"></i></template>
				<template #label>{{ $ts.emojiColor }}</template>
				<template #caption>#RRGGBB</template>
			</FormInput>
		</FormSection>

		<FormButton primary class="_formBlock" @click="emojiGenerate">{{ $ts.emojiGenerate }}</FormButton>

		<FormSection>
			<template #label>{{ $ts.preview }}</template>
			<img :src="emojiUrl" class="img" :alt="emojiName"/>
			<a href="{{ emojiUrl }}"><p>{{ emojiUrl }}</p></a>
		</FormSection>
		<FormButton primary class="_formBlock" @click="emojiApproval">{{ $ts.emojiApproval }}</FormButton>
	</div>
</MkSpacer>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import FormSwitch from '@/components/form/switch.vue';
import FormInput from '@/components/form/input.vue';
import FormTextarea from '@/components/form/textarea.vue';
import FormRadios from '@/components/form/radios.vue';
import FormSection from '@/components/form/section.vue';
import FormButton from '@/components/ui/button.vue';
import * as os from '@/os';
import * as symbols from '@/symbols';
import {defaultStore} from "@/store";
import {stream} from "@/stream";


export default defineComponent({
	components: {
		FormInput,
		FormTextarea,
		FormRadios,
		FormSection,
		FormSwitch,
		FormButton,
	},

	emits: ['info'],

	data() {
		return {
			[symbols.PAGE_INFO]: {
				title: this.$ts.emojiGen,
				icon: 'fas fa-laugh',
				bg: 'var(--bg)',
			},
			emojiName: '',
			text: '',
			emojiAlign: 'center',
			emojiSizeFixed: false,
			emojiStretch: false,
			font: 'notosans-mono-bold',
			emojiColor: '38BA91',
			emojiUrl: '',
			accentColors: ['#e36749', '#f29924', '#98c934', '#34c9a9', '#34a1c9', '#606df7', '#8d34c9', '#e84d83']
		}
	},

	methods: {
		async init() {
		},

		emojiGenerate() {
			//https://emoji-gen.ninja/result?text=%E7%B5%B5%E6%96%87%0A%E5%AD%97%E3%80%82&color=EC71A1FF&back_color=00000000&font=notosans-mono-bold&size_fixed=false&align=center&stretch=true&public_fg=true&locale=ja

			const apiUrl = `https://emoji-gen.ninja/emoji`
			let query = {"text": encodeURI(this.text), "color": this.emojiColor.replace('#','') + "FF", "back_color": "00000000", "font": this.font, "size_fixed": this.emojiSizeFixed, "align": this.emojiAlign, "stretch": this.emojiStretch, "public_fg": "false", "locale": "ja"}

			this.emojiUrl = apiUrl + '?' + Object.entries(query).map((e) => `${e[0]}=${e[1]}`).join('&');



		},

		emojiApproval: function () {

			//emojiUploadでは、絵文字をdrive/files/upload-from-urlでアップロードしたあと、emojiAddでリネーム、登録をして、emojiAddの戻り値(絵文字のid)を返す
			const emojiUpload = () => new Promise(async resolve => {
				const marker = Math.random().toString(); // TODO: UUIDとか使う

				//先にコネクションを貼って監視する
				const connection = stream.useChannel('main');
				connection.on('urlUploadFinished', async data => {
					if (data.marker === marker) {
						const fileId = await emojiAdd(data.file.id);
						resolve(fileId);
						connection.dispose();
					}
				});

				await os.api('drive/files/upload-from-url', {
					url: this.emojiUrl,
					folderId: defaultStore.state.uploadFolder,
					marker
				});

				//リネーム→登録→登録されたIDを返す
				const emojiAdd = (fileId) => new Promise<Record<string, any> | null>(async resolve => {
					await os.api('drive/files/update', {
						fileId,
						name: this.emojiName + '.png',
					});

					const response = await os.api('admin/emoji/add', {
						fileId,
					})

					resolve(response);
				})
			});

			//emoji関数 admin/emoji/listでは、idによる検索ができないため、自分のidをuntilIdに入れて1つ前のidを取得してからそれをsinceIdに指定して、絵文字情報をlist→objectで取得する
			const emoji = (emojiId) => new Promise<Record<string, any> | null>(async resolve => {
				const sinceId = await os.api('admin/emoji/list', {
					limit: 1,
					untilId: emojiId.id
				})

				if (!sinceId) {
					resolve(null);
					return;
				}

				const id = await os.api('admin/emoji/list', {
					limit: 1,
					sinceId: sinceId[0].id
				});

				if (!id) {
					resolve(null);
					return;
				}

				resolve(id[0]);
			});

			//edit関数には、emojiのobjectを渡す
			const edit = (emoji) => {
				os.popup(import('./emoji-edit-dialog.vue'), {
					emoji: emoji
				});
			};


			(async () => {
				await this.emojiGenerate()
				const emojiId = await emojiUpload();//emojiIdはファイルID emojiUploadはファイルIDを返す
				const emojiObj = await emoji(emojiId);//emojiObjはemojiオブジェクト emoji関数はemojiIdを引数に受け取りemojiオブジェクトを返す
				edit(emojiObj);
			})();
		},

		setAccentColor(color){
			this.emojiColor = color.replace('#', '');
		}
	},
});


</script>

<style lang="scss" scoped>
.cwepdizn {
	::v-deep(.cwepdizn-colors) {
		text-align: center;

		> .row {
			> .color {
				display: inline-block;
				position: relative;
				width: 64px;
				height: 64px;
				border-radius: 8px;

				> .preview {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					margin: auto;
					width: 42px;
					height: 42px;
					border-radius: 4px;
					box-shadow: 0 2px 4px rgb(0 0 0 / 30%);
					transition: transform 0.15s ease;
				}

				&:hover {
					> .preview {
						transform: scale(1.1);
					}
				}

				&.active {
					box-shadow: 0 0 0 2px var(--divider) inset;
				}

				&.rounded {
					border-radius: 999px;

					> .preview {
						border-radius: 999px;
					}
				}

				&.char {
					line-height: 42px;
				}
			}
		}
	}
}
</style>

