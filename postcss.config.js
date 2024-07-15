// Import the necessary plugins
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import postcssPrefixer from 'postcss-prefixwrap';

// Export the configuration as default
export default {
  plugins: [
    tailwindcss({}),  // Initialize Tailwind CSS with default settings
    autoprefixer({}), // Initialize Autoprefixer with default settings
    postcssPrefixer("#sui", {
      prefixRootTags: true
    })
  ]
};
