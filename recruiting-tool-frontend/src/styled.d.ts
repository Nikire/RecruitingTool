import "styled-components";
import { Theme as MuiTheme } from "@mui/material/styles";

declare module "styled-components" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends MuiTheme {}
}
