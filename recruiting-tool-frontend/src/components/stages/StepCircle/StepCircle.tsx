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

  const bgColor = disabled
    ? theme.palette.action.disabledBackground
    : status === "CURRENT"
      ? theme.palette.text.primary
      : theme.palette.primary.light;

  const textColor = disabled
    ? theme.palette.text.disabled
    : theme.palette.getContrastText(bgColor);

  return (
    <StepCircleWrapper style={{ backgroundColor: bgColor }}>
      <Typography variant="h6" sx={{ color: textColor }}>
        {position}
      </Typography>
    </StepCircleWrapper>
  );
};

export default StepCircle;
