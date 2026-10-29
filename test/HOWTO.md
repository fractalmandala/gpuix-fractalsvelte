# How to Check Fixture

1. Run the existing test that uses a fixture
ex:

```
cd /Users/amrit/fractaldesign/packages/gpuix-fractalsvelte
npm run test:fractalstyler
```

2. Open any fixture in a real window
Create a temporary entry beside the fixture:

```
// test/fixtures/fractalstyler/main.ts
import { render_hot } from 'gpuix-fractalsvelte';

render_hot(new URL('./App.svelte', import.meta.url), {
	title: 'fractalstyler fixture',
	width: 640,
	height: 480
});
```

Run `node bin/gpuix-fractalsvelte.js test/fixtures/fractalstyler/main.ts`

3. Headless inspection
Create a temporary test file:

```
// test/check-fixture.ts
import 'gpuix-fractalsvelte';
import { mount_headless, tree, all_text, screenshot, finish } from 'gpuix-fractalsvelte/test';
import App from './fixtures/fractalstyler/App.svelte';

mount_headless(App, { width: 400, height: 300 });

console.log(JSON.stringify(tree(), null, 2));
console.log(all_text());
console.log(screenshot('/tmp/fixture.png'));

finish('fixture', 0);
```

Run `node bin/gpuix-fractalsvelte.js test/check-fixture.ts`. tree() shows the renderer’s nodes and computed styles. screenshot() writes a PNG.

4. Typecheck a fixture
Fixtures under test/ are covered by the package typecheck:

```
npm run typecheck
```

5. Run the whole suite
Runs every test/*.ts entry, including the fixture-backed tests:

```
npm test
```

