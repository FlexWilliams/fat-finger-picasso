export interface CanvasTracking {
	drawing: boolean;
	x: number;
	y: number;
	lastX: number;
	lastY: number;
}

export function createCanvasTracking(): CanvasTracking {
	const canvasTracking: CanvasTracking = {
		drawing: false,
		x: 0,
		y: 0,
		lastX: 0,
		lastY: 0
	};

	return canvasTracking;
}

export type CanvasDrawingType = 'up' | 'down' | 'move';
