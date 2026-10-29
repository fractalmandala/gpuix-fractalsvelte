#!/usr/bin/env node
// @ts-check
/** Print every token and class fractalstyler activates in gpuix-fractalsvelte. */

import { fractalstyler_inventory, format_fractalstyler_inventory } from 'gpuix-fractalsvelte/fractalstyler';

const json = process.argv.includes('--json') || process.argv.includes('--format=json');
try {
	const inventory = fractalstyler_inventory();
	process.stdout.write(format_fractalstyler_inventory(inventory, json ? 'json' : 'text') + '\n');
} catch (error) {
	console.error('[gpuix-fractalsvelte] fractalstyler report failed:', error instanceof Error ? error.message : error);
	process.exit(1);
}
