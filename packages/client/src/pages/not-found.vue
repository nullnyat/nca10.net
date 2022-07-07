<template>
<div class="ipledcug">
	<div class="_fullinfo">
		<img src="https://s3.nca10.net/misskey/20b71322-00a7-4f57-8eb0-947df6cc0ccb.png" class="_ghost"/>
		<div>{{ $ts.notFoundDescription }}</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.notFound,
	icon: 'fas fa-exclamation-triangle',
});
</script>
