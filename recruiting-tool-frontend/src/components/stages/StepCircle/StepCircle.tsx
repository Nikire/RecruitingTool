import { Typography, useTheme } from "@mui/material";
import { StepCircleWrapper } from "./StepCircle.styles";
import { StageStatus } from "../../../types/stage.types";

type StepCircleProps = {
  position: number;
  status?: StageStatus;
  disabled?: boolean;
};

const StepCircle: React.FC<StepCircleProps> = ({
  position,
  status,
  disabled,
}) => {
  const theme = useTheme();

  return (
    <StepCircleWrapper
      style={
        disabled
          ? { backgroundColor: theme.palette.action.disabledBackground }
          : {
              backgroundColor:
                status == "CURRENT"
                  ? theme.palette.text.primary
                  : theme.palette.primary.light,
            }
      }
    >
      <Typography
        variant="h6"
        sx={
          disabled
            ? { color: "text.disabled" }
            : {
                color: status == "CURRENT" ? green.A400 : "text.primary",
              }
        }
      >
        {position}
      </Typography>
    </StepCircleWrapper>
  );
};

export default StepCircle;
