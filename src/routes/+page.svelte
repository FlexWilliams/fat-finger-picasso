<script lang="ts">
	import FatFingerPicassoCanvas from '$lib/canvas/components/FatFingerPicassoCanvas.svelte';

	/**
	 * Here, your application would handle the blob export
	 * @param drawing the blob data from the HTML canvas (i.e., drawing)
	 */
	function handleExport(drawing: Blob): void {
		console.log(drawing);
	}
</script>

<header></header>
<main class="main">
	<section>
		<h1>Fat Finger Picasso</h1>

		<FatFingerPicassoCanvas on:export={(evt) => handleExport(evt.detail)} />
	</section>
</main>
<footer></footer>

<style lang="scss">
	.main {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
</style>
