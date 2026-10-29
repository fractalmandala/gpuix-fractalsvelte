<script lang="ts">
	let count = $state(0);
</script>

<div class="box xcenter ycenter gap-md pad-xl bg-surface text-primary wfull hfull">
	<div class="box xcenter gap-bs pad-2xl bg-raised radius-md">
		<div class="text-5xl weight-700">{count}</div>
		<div class="row gap-sm">
			<div
				class="el-variants el-size el-shape primary modern bs"
				style="cursor: pointer"
				testId="minus"
				onclick={() => count--}>-</div>
			<div
				class="box xcenter pad-sm radius-sm bg-success text-white text-lg"
				style="cursor: pointer"
				testId="plus"
				onclick={() => count++}>+</div>
		</div>
		<div class="text-sm text-secondary">Edit App.svelte and save — the window hot-reloads.</div>
	</div>
</div>
