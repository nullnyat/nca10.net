<template>
<div class="ipledcug">
	<div class="_fullinfo">
		<img src="https://s3.nca10.net/misskey/20b71322-00a7-4f57-8eb0-947df6cc0ccb.png" class="_ghost"/>
		<div>{{ $ts.notFoundDescription }}</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import * as symbols from '@/symbols';
import { i18n } from '@/i18n';

defineExpose({
	[symbols.PAGE_INFO]: {
		title: i18n.ts.notFound,
		icon: 'fas fa-exclamation-triangle',
		bg: 'var(--bg)',
	},
});
</script>
