<script lang="ts">
	import FatFingerPicassoCanvas from '$lib/canvas/components/FatFingerPicassoCanvas.svelte';
</script>

<header></header>
<main class="main">
	<section>
		<h1>Fat Finger Picasso</h1>

		<FatFingerPicassoCanvas />
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
