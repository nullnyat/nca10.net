<template>
<div class="jmgmzlwq _block"><i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>{{ $ts.remoteUserCaution }}<a class="link" :href="href" rel="nofollow noopener" target="_blank">{{ $ts.showOnRemote }}</a></div>
</template>

<script lang="ts" setup>
defineProps<{
	href: string;
}>();
</script>

<style lang="scss" scoped>
.jmgmzlwq {
	font-size: 0.8em;
	padding: 16px;
	background: none;
	border: solid 2px #E7E7B0;
	color: #E7E7B0;

	> .link {
		margin-left: 4px;
		color: var(--accent);

     &:hover{
		 text-shadow: -6px 0px 15px rgba(150, 204, 231, 0.83),
                  6px 0px 15px rgba(150, 204, 231, 0.83);
		}
	}
}
</style>
