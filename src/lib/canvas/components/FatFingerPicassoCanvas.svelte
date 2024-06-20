<script lang="ts">
	import { onMount } from 'svelte';
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
	 * The meta object to handle coordinate and drawing info
	 * // REFACTOR: rename?
	 */
	const canvasTracking: CanvasTracking = createCanvasTracking();

	/**
	 * The color of the brush
	 */
	let brushColor: string = '#263238';

	/**
	 * The width of the brush
	 */
	let brushWidth: number = 10;

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

		console.debug('Drawing...');

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

		console.debug('Drawing done...');
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

		canvas.style.border = '1px solid black'; // TODO: update
		canvas.width = width;
		canvas.height = height;
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

<style lang="scss">
	.canvas {
		// cursor: url('images/icons/brush_cartoon-hand.png'), auto;
	}

	.canvas-actions {
		display: flex;
		gap: 16px;
	}
</style>
