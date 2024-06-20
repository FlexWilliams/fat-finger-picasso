import { describe, expect, it } from 'vitest';
import { createCanvasTracking } from '../model/canvas.js';

describe('Canvas', () => {
	describe('Model', () => {
		it('should return a canvas tracking object', () => {
			expect(createCanvasTracking()).toEqual({
				drawing: false,
				x: 0,
				y: 0,
				lastX: 0,
				lastY: 0
			});
		});
	});
});
