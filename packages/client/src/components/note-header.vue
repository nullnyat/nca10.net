<template>
<header class="kkwtjztg">
	<MkA v-user-preview="note.user.id" class="name" :to="userPage(note.user)">
		<MkUserName :user="note.user"/>
	</MkA>
	<div class="username"><MkAcct :user="note.user"/></div>
	<div class="info">
		<MkA class="created-at" :to="notePage(note)">
			<MkTime :time="note.createdAt"/></MkA>
		<span v-if="note.user.isBot"><svg xmlns="http://www.w3.org/2000/svg" class="is-bot" fill="var(--fg)" viewBox="0 0 512 512"><title>Hardware Chip</title><path d="M352 128H160a32 32 0 00-32 32v192a32 32 0 0032 32h192a32 32 0 0032-32V160a32 32 0 00-32-32zm0 216a8 8 0 01-8 8H168a8 8 0 01-8-8V168a8 8 0 018-8h176a8 8 0 018 8z" fill="none"/><rect x="160" y="160" width="192" height="192" rx="8" ry="8"/><path d="M464 192a16 16 0 000-32h-16v-32a64.07 64.07 0 00-64-64h-32V48a16 16 0 00-32 0v16h-48V48a16 16 0 00-32 0v16h-48V48a16 16 0 00-32 0v16h-32a64.07 64.07 0 00-64 64v32H48a16 16 0 000 32h16v48H48a16 16 0 000 32h16v48H48a16 16 0 000 32h16v32a64.07 64.07 0 0064 64h32v16a16 16 0 0032 0v-16h48v16a16 16 0 0032 0v-16h48v16a16 16 0 0032 0v-16h32a64.07 64.07 0 0064-64v-32h16a16 16 0 000-32h-16v-48h16a16 16 0 000-32h-16v-48zm-80 160a32 32 0 01-32 32H160a32 32 0 01-32-32V160a32 32 0 0132-32h192a32 32 0 0132 32z"/></svg></span>
		<span v-if="note.visibility !== 'public'" class="visibility"><i v-if="note.visibility === 'home'" class="fas fa-home"></i>
			<i v-else-if="note.visibility === 'followers'" class="fas fa-unlock"></i>
			<i v-else-if="note.visibility === 'specified'" class="fas fa-envelope"></i>
		</span>
		<span v-if="note.localOnly" class="localOnly"><i class="fas fa-biohazard"></i></span>
	</div>
</header>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as misskey from 'misskey-js';
import { notePage } from '@/filters/note';
import { userPage } from '@/filters/user';

defineProps<{
	note: misskey.entities.Note;
	pinned?: boolean;
}>();
</script>

<style lang="scss" scoped>
.kkwtjztg {
	display: flex;
	align-items: baseline;
	white-space: nowrap;

	> .name {
		flex-shrink: 1;
		display: block;
		margin: 0 .5em 0 0;
		padding: 0;
		overflow: hidden;
		font-size: 1em;
		font-weight: bold;
		text-decoration: none;
		text-overflow: ellipsis;

		&:hover {
			text-decoration: underline;
		}
	}

	> .username {
		flex-shrink: 9999999;
		margin: 0 .5em 0 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	> .info {
		flex-shrink: 0;
		margin-left: auto;
		font-size: 0.9em;

		.is-bot {
			width: 18px;
			margin-left: 8px;
			transform: translateY(4px);
		}

		> .visibility {
			margin-left: 8px;
		}

		> .localOnly {
			margin-left: 8px;
		}
	}
}
</style>
