<script lang="ts">
	import FatFingerPicassoCanvas from '$lib/canvas/components/FatFingerPicassoCanvas.svelte';

	let drawing: File;

	/**
	 * Here, your application would handle the blob export
	 * @param drawing the blob data from the HTML canvas (i.e., drawing)
	 */
	function handleExport(drawing: Blob): void {
		console.log(drawing);
	}

	/**
	 * Function to handle an image upload
	 */
	function handleImageUpload(event: Event): void {
		const fileList = (event.target as any).files as FileList;
		if (!fileList || fileList.length === 0) {
			return;
		}

		drawing = fileList[0];
		console.log(drawing);
	}
</script>

<header></header>
<main class="main">
	<section>
		<h1>Fat Finger Picasso</h1>

		<FatFingerPicassoCanvas {drawing} on:export={(evt) => handleExport(evt.detail)} />

		<section class="file-input">
			<label for="file-input">Upload drawing (.PNG):</label>
			<input
				id="file-input"
				type="file"
				accept="image/png"
				on:change={(event) => handleImageUpload(event)}
			/>
		</section>
	</section>
</main>
<footer></footer>

<style lang="scss">
	.main {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.file-input {
		margin-top: 32px;

		label {
			font-size: 1.25rem;
		}

		input {
			margin-top: 8px;
		}
	}
</style>
