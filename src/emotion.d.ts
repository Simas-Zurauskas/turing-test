import '@emotion/react';
import theme, { colors } from './lib/theme';

type MUITheme = typeof theme;

declare module '@emotion/react' {
  export interface Theme extends MUITheme {
    colors: typeof colors;
  }
}
