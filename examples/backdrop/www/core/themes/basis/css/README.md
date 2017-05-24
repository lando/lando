Basis inludes very granular CSS files so that a sub theme can override
only the files it needs to and inherit the rest.

## CSS Files
The types of CSS files in the theme include:
* Base      - Normalizes rendering across browsers.
* Layout    - Modifies page layout.
* Component - Specific styles for individual pieces of functionality.
* Skin      - The colors, fonts, and aesthetic CSS

A good way to think about overriding files:
 * Start by overriding skin.css with the colors and fonts you'd prefer
 * If there are other changes to be made, copy over the files one by one and
   override as needed

 ### To override a CSS file:
 Declare it in your .info file with the same file name.
 The file in Basis with the same name will not be loaded. The file in the active
 theme will be used in it's place.

 # CSS Guidelines
 [See Backdrop's CSS Standards](https://api.backdropcms.org/css-standards)
