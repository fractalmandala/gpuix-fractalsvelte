<script lang="ts">
	import { onMount } from 'svelte';
	import { use_palette } from '@fractaldesign/gpuix-fractalsvelte';
	import { check_for_update, type Update } from '@fractaldesign/gpuix-fractalsvelte/update';

	// fractalstyler's layers: tokens, utilities and component classes, from the copies in styles/.
	// The import registers every class and tag rule with the renderer, once per process.
	import './styles/index.css';

	let count = $state(0);

	// Each `[data-mode='light']`/`['dark']` block in the stylesheet became a palette; this picks one,
	// and every element reading a token restyles in one batch when it changes.
	let mode = $state<'light' | 'dark'>('dark');
	$effect(() => use_palette(mode));

	// A built app with `update` in its app options checks its manifest; under `npm start` this is null.
	let update = $state<Update | null>(null);
	let progress = $state<number | null>(null);
	let error = $state('');

	onMount(() => {
		check_for_update().then((found) => (update = found), (e) => console.warn('update check failed:', e));
	});

	async function install() {
		try {
			await update!.download({ onProgress: (received, total) => (progress = total ? received / total : null) });
			await update!.install();
		} catch (e) {
			error = (e as Error).message;
		}
	}
</script>

<div class="full bg column xcenter ycenter gap-lg pad-lg">
	<div class="card-box column xcenter gap-md pad-lg curved border bg-panel">
		{#if update}
			<div class="column xcenter gap-sm pad-sm bb full">
				<div class="text-md text-secondary">Version {update.version} is available</div>
				{#if error}
					<div class="text-sm text-danger">{error}</div>
				{:else if update.installable}
					<button class="themed curved pad-sm" onclick={install}>
						{progress === null ? 'Install and restart' : `${Math.round(progress * 100)}%`}
					</button>
				{:else if update.url}
					<div class="text-sm text-muted">Get it at {update.url}</div>
				{/if}
			</div>
		{/if}

		<div class="text-5xl weight-600 text-primary" testId="count">{count}</div>

		<div class="row gap-md">
			<button class="themed curved pad-md" testId="minus" onclick={() => count--}>-</button>
			<button class="themed curved pad-md" testId="plus" onclick={() => count++}>+</button>
		</div>

		<div class="text-sm text-secondary">Edit App.svelte and save — the window hot-reloads.</div>

		<button class="outline curved pad-sm text-sm" onclick={() => (mode = mode === 'dark' ? 'light' : 'dark')}>
			{mode === 'dark' ? 'Light mode' : 'Dark mode'}
		</button>
	</div>
</div>

<style>
	.card-box {
		width: 420px;
		max-width: 100%;
	}
</style>
