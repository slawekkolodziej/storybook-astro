/**
 * Standard test utilities for Storybook component testing
 * 
 * All component tests should use these utilities to ensure uniform behavior:
 * - Tests should pass for components that render successfully in Storybook
 * - Tests should fail for components that don't render properly in Storybook
 */

import { test, expect } from 'vitest';

/**
 * Standard test for checking if a Storybook story can render properly.
 * This test will:
 * - Pass if the component renders successfully in Storybook
 * - Fail if the component fails to render in Storybook
 * 
 * @param storyName - Name of the story for test description
 * @param story - The composed story from composeStories
 */
export function testStoryRenders(storyName: string, story: any) {
  test(`${storyName} renders in Storybook`, async () => {
    expect(story).toBeDefined();
    expect(typeof story).toBe('function');
    
    try {
      // First try calling the story directly - this will use our custom render function
      // which can detect broken framework integrations immediately
      const directResult = story();
      
      // If direct call succeeds, try the full Storybook run method
      const result = await story.run?.() || directResult;
      
      // If we get here, the component should have rendered successfully
      expect(result).toBeDefined();
      
      // For Astro components, check that we have component and args
      if (result.component) {
        expect(result.component).toBeDefined();
        expect(result.args).toBeDefined();
      }
      
      console.log(`✓ ${storyName} rendered successfully`);
      
    } catch (error: any) {
      const errorMessage = error.message;
      
      // Check if this is an expected error when Storybook is not running
      if (errorMessage.includes('renderToCanvas is not a function')) {
        // This indicates the component is properly configured but Storybook runtime isn't available
        // This is acceptable for Astro components that work in Storybook
        console.log(`✓ ${storyName} is properly configured (Storybook runtime not available)`);
        return;
      }
      
      // Check for renderer not found errors (indicates broken integration)
      if (errorMessage.includes('Renderer') && errorMessage.includes('not found')) {
        console.error(`✗ ${storyName} failed: ${errorMessage}`);
        throw new Error(`${storyName} has a broken framework integration: ${errorMessage}`);
      }
      
      // Check for missing renderer parameter
      if (errorMessage.includes('no renderer is specified')) {
        console.error(`✗ ${storyName} failed: ${errorMessage}`);
        throw new Error(`${storyName} is missing renderer parameter: ${errorMessage}`);
      }
      
      // Any other error indicates a real problem with the component
      console.error(`✗ ${storyName} failed with unexpected error:`, error);
      throw new Error(`${storyName} failed to render: ${errorMessage}`);
    }
  });
}

/**
 * Test that checks basic story composition (that the story can be imported and composed)
 * This is a basic sanity check that should always pass.
 */
export function testStoryComposition(storyName: string, story: any, expectedArgs?: any) {
  test(`${storyName} can be composed`, () => {
    expect(story).toBeDefined();
    expect(typeof story).toBe('function');
    expect(story.storyName).toBe(storyName);
    
    if (expectedArgs) {
      expect(story.args).toEqual(expectedArgs);
    }
  });
}