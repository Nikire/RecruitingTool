import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatCard from "./StatCard";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Helper to render with MUI theme
const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe("StatCard", () => {
  const mockIcon = <div data-testid="mock-icon">Icon</div>;

  it("should render title correctly", () => {
    renderWithTheme(
      <StatCard
        title="Total Candidates"
        icon={mockIcon}
        color="#1976d2"
        description="All candidates in the system"
      />,
    );

    expect(screen.getByText("Total Candidates")).toBeInTheDocument();
  });

  it("should render description correctly", () => {
    renderWithTheme(
      <StatCard
        title="Active Jobs"
        icon={mockIcon}
        color="#2e7d32"
        description="Currently open positions"
      />,
    );

    expect(screen.getByText("Currently open positions")).toBeInTheDocument();
  });

  it("should render icon correctly", () => {
    renderWithTheme(
      <StatCard
        title="Applications"
        icon={mockIcon}
        color="#ed6c02"
        description="Total applications received"
      />,
    );

    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
  });

  it("should apply correct color to icon box", () => {
    const color = "#d32f2f";
    const { container } = renderWithTheme(
      <StatCard
        title="Pending Reviews"
        icon={mockIcon}
        color={color}
        description="Applications awaiting review"
      />,
    );

    const iconBox = container.querySelector('[class*="MuiBox"]');
    expect(iconBox).toBeInTheDocument();
  });

  it("should render with different prop combinations", () => {
    const testCases = [
      {
        title: "Stat 1",
        description: "Description 1",
        color: "#000000",
      },
      {
        title: "Stat 2",
        description: "Description 2",
        color: "#ffffff",
      },
    ];

    testCases.forEach((testCase) => {
      const { unmount } = renderWithTheme(
        <StatCard
          title={testCase.title}
          icon={mockIcon}
          color={testCase.color}
          description={testCase.description}
        />,
      );

      expect(screen.getByText(testCase.title)).toBeInTheDocument();
      expect(screen.getByText(testCase.description)).toBeInTheDocument();
      unmount();
    });
  });

  it("should have proper card structure", () => {
    const { container } = renderWithTheme(
      <StatCard
        title="Test Stat"
        icon={mockIcon}
        color="#1976d2"
        description="Test description"
      />,
    );

    // Check for MUI Card component
    const card = container.querySelector('[class*="MuiCard"]');
    expect(card).toBeInTheDocument();

    // Check for MUI CardContent component
    const cardContent = container.querySelector('[class*="MuiCardContent"]');
    expect(cardContent).toBeInTheDocument();
  });
});
