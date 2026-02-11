consider using `simulatePageLoad` 

import { simulateDOMContentLoaded, simulatePageLoad } from 'storybook/internal/preview-api';
simulatePageLoad(canvasElement);
simulateDOMContentLoaded();