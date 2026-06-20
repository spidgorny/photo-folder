const fs = require('fs');

// Read the .thumbnails.json file (from grandparent directory)
const filePath = '../../.thumbnails.json';
const data: any[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Analyze each key in the objects
const keyStats: Record<string, { count: number; totalSize: number; sizes: number[] }> = {};

data.forEach(item => {
	Object.keys(item).forEach(key => {
		const value = item[key];
		let size = 0;

		if (typeof value === 'string') {
			size = value.length;
		} else if (typeof value === 'object') {
			size = JSON.stringify(value).length;
		} else if (typeof value === 'number') {
			size = String(value).length;
		} else if (typeof value === 'boolean') {
			size = 4; // "true" or "false"
		}

		if (!keyStats[key]) {
			keyStats[key] = { count: 0, totalSize: 0, sizes: [] };
		}

		keyStats[key].count++;
		keyStats[key].totalSize += size;
		keyStats[key].sizes.push(size);
	});
});

// Calculate averages and display as table
console.log('\nKey Statistics for .thumbnails.json:');
console.log('='.repeat(80));
console.log('Key'.padEnd(30) + 'Count'.padEnd(15) + 'Avg Size'.padEnd(15) + 'Total Size');
console.log('='.repeat(80));

Object.keys(keyStats).sort().forEach(key => {
	const stats = keyStats[key];
	const avgSize = (stats.totalSize / stats.count).toFixed(2);
	console.log(
		key.padEnd(30) +
		stats.count.toString().padEnd(15) +
		avgSize.padEnd(15) +
		stats.totalSize.toString()
	);
});

console.log('='.repeat(80));
console.log(`\nTotal entries: ${data.length}`);
console.log(`Total file size: ${fs.readFileSync(filePath, 'utf8').length} bytes`);
