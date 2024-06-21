<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import {
		createCanvasTracking,
		type CanvasDrawingType,
		type CanvasTracking
	} from '../model/canvas.js';

	/**
	 * The id of the canvas element
	 */
	export let canvasId: string = 'fat-finger-picasso';

	/**
	 * The width of the canvas element in pixels. Defaults to 350.
	 */
	export let width: number = 350;

	/**
	 * The height of the canvas element in pixels. Defaults to 350.
	 */
	export let height: number = 350;

	/**
	 * A drawing to upload onto the canvas.
	 */
	export let drawing: File | undefined = undefined;

	/**
	 * Event dispatcher
	 */
	const dispatch = createEventDispatcher();

	/**
	 * The meta object to handle coordinate and drawing info
	 * // REFACTOR: rename?
	 */
	const canvasTracking: CanvasTracking = createCanvasTracking();

	/**
	 * The canvas background color
	 */
	let canvasBackgroundColor: string = '#ffffff';

	/**
	 * The color of the brush
	 */
	let brushColor: string = '#263238';

	/**
	 * The width of the brush
	 */
	let brushWidth: number = 3;

	/**
	 * Flag indicating that the canvas is exporting the image to the parent component
	 */
	let exporting: boolean = false;

	/**
	 * Listener for the drawing file input from parent component
	 */
	$: {
		if (drawing) {
			setDrawingOnCanvas();
		}
	}

	/**
	 * Returns the native HTML Canvas element that is created in this component or undefined if error occurs.
	 */
	function getCanvas(): HTMLCanvasElement | undefined {
		const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		if (!canvas) {
			console.error(`Error getting the canvas: undefined`);
		}

		return canvas;
	}

	/**
	 * Returns the native HTML Canvas element that is created in this component or undefined if error occurs.
	 */
	function getCanvas2dContext(): CanvasRenderingContext2D | null {
		const canvas = getCanvas();

		if (!canvas) {
			console.error(`Error getting the canvas context. No canvas found!`);
			return null;
		}

		if (!canvas.getContext) {
			console.error(`Error getting the canvas context. Possibly not supported in this browser.`);
			return null;
		}

		return canvas.getContext('2d');
	}

	/**
	 * Draws a line connecting two points on a canvas.
	 * @param canvasDrawingType
	 */
	function draw(canvasDrawingType: CanvasDrawingType): void {
		if (canvasDrawingType === 'up') {
			canvasTracking.drawing = false;
		}

		if (canvasDrawingType === 'down') {
			canvasTracking.drawing = true;
		}

		if (!canvasTracking.drawing) {
			return;
		}

		const context = getCanvas2dContext();
		if (!context) {
			console.error(`Unable to draw, no canvas context was provided!`);
			return;
		}

		context.beginPath();
		context.moveTo(canvasTracking.lastX, canvasTracking.lastY);
		context.lineTo(canvasTracking.x, canvasTracking.y);
		context.strokeStyle = brushColor;
		context.lineWidth = brushWidth;
		context.stroke();
		context.closePath();
	}

	/**
	 * Sets up the canvas's look and feel
	 * @param canvas
	 */
	function setupCanvasUX(canvas: HTMLCanvasElement): void {
		brushColor = (
			document.getElementById('fat-finger-picasso-color-picker-input') as HTMLInputElement
		)?.value;
		brushWidth = parseInt(
			(document.getElementById('fat-finger-picasso-brush-width-input') as HTMLInputElement)?.value
		); // REFACTOR: plz

		const parentElem = canvas.parentElement;
		if (parentElem) {
			canvas.width = parentElem.clientWidth;
		} else {
			canvas.width = width;
		}

		canvas.style.border = '1px solid black'; // TODO: make into component prop or remove
		canvas.height = height;

		const context = getCanvas2dContext();
		if (!context) {
			console.error(`Error setting up the Canvas UX, no context was provided!`);
			return;
		}

		context.fillStyle = canvasBackgroundColor;
		context.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
	}

	function clearCanvas(): void {
		const canvas = getCanvas();
		if (!canvas) {
			console.error(`Error clearing the canvas, no canvas was found!`);
			return;
		}

		const context = getCanvas2dContext();
		if (!context) {
			console.error(`Error clearing the canvas, no context was provided!`);
			return;
		}

		context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

		// Reset BG
		context.fillStyle = canvasBackgroundColor;
		context.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
	}

	function handleClearCanvas(): void {
		clearCanvas();
		togglePopover('confirm-clear-canvas');
	}

	/**
	 * Sets up the canvas's event listenres
	 * @param canvas
	 */
	function setupCanvasEventListeners(canvas: HTMLCanvasElement): void {
		canvas.addEventListener('mousemove', (e) => {
			canvasTracking.lastX = canvasTracking.x;
			canvasTracking.lastY = canvasTracking.y;
			canvasTracking.x = e.x - canvas.offsetLeft;
			canvasTracking.y = e.y - canvas.offsetTop;

			draw('move');
		});

		canvas.addEventListener('touchmove', (e) => {
			canvasTracking.lastX = canvasTracking.x;
			canvasTracking.lastY = canvasTracking.y;

			const touches = e.changedTouches;
			if (touches.length === 0) {
				return;
			}

			const touch = touches[0];
			canvasTracking.x = touch.clientX - canvas.offsetLeft;
			canvasTracking.y = touch.clientY - canvas.offsetTop;

			draw('move');
		});

		canvas.addEventListener('mousedown', () => {
			draw('down');
		});

		canvas.addEventListener('mouseup', () => {
			draw('up');
		});

		canvas.addEventListener('mouseout', () => {
			draw('up');
		});

		canvas.addEventListener('touchstart', (e) => {
			const touches = e.targetTouches;
			if (touches.length === 0) {
				return;
			}

			const touch = touches[0];
			canvasTracking.x = touch.clientX - canvas.offsetLeft;
			canvasTracking.y = touch.clientY - canvas.offsetTop;
			canvasTracking.lastX = touch.clientX - canvas.offsetLeft;
			canvasTracking.lastY = touch.clientY - canvas.offsetTop;

			draw('down');
		});

		canvas.addEventListener('touchend', () => {
			draw('up');
		});

		canvas.addEventListener('touchcancel', () => {
			draw('up');
		});
	}

	function togglePopover(popoverId: string): void {
		const popover = document.getElementById(popoverId) as any;
		if (!popover) {
			return;
		}

		popover?.togglePopover();
	}

	function downloadImage(): void {
		const canvas = getCanvas();
		if (!canvas) {
			console.error(`Error downloading the canvas image, no canvas found!`);
			return;
		}

		const now = new Date();
		const url = canvas.toDataURL();
		const imageName = `fat-finger-picasso-image-${now.toLocaleDateString()}_${now.toLocaleTimeString()}.png`;
		const downloadLink = document.createElement('a');
		downloadLink.setAttribute('download', imageName);
		downloadLink.href = url;

		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	}

	/**
	 * Emits an event for the consuming application to handle
	 */
	function handleExport(): void {
		exporting = true;
		const canvas = getCanvas();
		if (!canvas) {
			console.error(`Error exporting the canvas image, no canvas found!`);
			return;
		}

		canvas.toBlob((blob) => {
			dispatch('export', blob);
			exporting = false;
		});
	}

	/**
	 * TODO: impl
	 * See: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
	 * @param drawing
	 */
	function validateFile(drawing: File): boolean {
		// TODO: validate file input size!
		const allowedFileTypes = ['image/png'];

		return allowedFileTypes.includes(drawing.type);
	}

	function setDrawingOnCanvas(): void {
		if (!drawing) {
			return;
		}

		if (!validateFile(drawing)) {
			console.error(`Error setting the drawing on the canvas, invalid file type.`);
			return;
		}

		const url = URL.createObjectURL(drawing);
		const image = new Image();

		image.onload = function (e) {
			URL.revokeObjectURL(url);

			const context = getCanvas2dContext();
			if (!context) {
				console.error(`Error setting the drawing on the canvas, no context was provided!`);
				return;
			}

			context.drawImage(image, 0, 0);
		};

		image.src = url;
	}

	/**
	 * Initializes the canvas.
	 */
	function initCanvas(): void {
		const canvas = getCanvas();

		if (!canvas) {
			console.error(`Unable to initialize canvas as it was undefined!`);
			return;
		}

		setupCanvasUX(canvas);
		setupCanvasEventListeners(canvas);
	}

	onMount(() => {
		initCanvas();
		console.debug(`Fat Finger Picasso initialized!`);
	});
</script>

<canvas id={canvasId} class="canvas" data-testid={canvasId}
	>Your browser does not support the canvas element.</canvas
>

<section class="canvas-actions">
	<section class="canvas-action-row">
		<section class="fat-finger-picasso-color-picker">
			<label for="fat-finger-picasso-color-picker-input">Pick Color:</label>
			<input type="color" id="fat-finger-picasso-color-picker-input" bind:value={brushColor} />
		</section>

		<section class="fat-finger-picasso-brush-width">
			<label for="fat-finger-picasso-brush-width-input">Brush Width:</label>
			<input
				type="range"
				id="fat-finger-picasso-brush-width-input"
				min="1"
				max="10"
				bind:value={brushWidth}
			/>
		</section>
	</section>
	<section class="fat-finger-picasso-clear-canavas canvas-action-row">
		<div id="confirm-clear-canvas" popover="auto" class="popover">
			<section class="confirmation-popover">
				<h5 class="confirmation">Are you sure?</h5>
				<button class="confirmation-button confirmation-yes" on:click={() => handleClearCanvas()}
					>Yes</button
				>
				<button
					class="confirmation-button confirmation-cancel"
					on:click={() => togglePopover('confirm-clear-canvas')}>Cancel</button
				>
			</section>
		</div>

		<button type="button" popovertarget="confirm-clear-canvas" class="canvas-action-button"
			>Clear</button
		>
		<button class="canvas-action-button" disabled={exporting} on:click={() => handleExport()}
			>Export</button
		>
		<button on:click={() => downloadImage()} class="canvas-action-button">Download</button>
	</section>
</section>

<style lang="scss">
	.canvas {
		cursor: url('images/icons/brush_cartoon-hand.png'), auto;
	}

	.canvas-actions {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.canvas-action-button {
		width: 100px;
		height: 30px;
	}

	.canvas-action-row {
		display: flex;
		justify-content: space-between;
	}

	.popover {
		border: none;
		padding: 0;
		width: fit-content;
		box-shadow: rgba(17, 12, 46, 0.15) 0px 48px 100px 0px;
	}

	.confirmation-popover {
		padding: 32px;
	}

	.confirmation {
		text-align: center;
		font-size: 1.25rem;
	}

	.confirmation-button {
		width: 80px;
		height: 30px;
		border-radius: 30px;
		border: none;
	}

	.confirmation-yes {
		background-color: #bbdefb;
	}
</style>
