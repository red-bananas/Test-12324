import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Home from "../app/index";
import { FeedbackProvider } from "../components/Feedback";
import { ThemeProvider } from "../lib/theme";

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe("Image to PDF smoke", () => {
  it("renders the hub without crashing", async () => {
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <ThemeProvider>
          <FeedbackProvider>
            <Home />
          </FeedbackProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    );

    expect(await screen.findByText("Image to PDF")).toBeTruthy();
    expect(screen.getByText("Camera")).toBeTruthy();
    expect(screen.getByText("Gallery")).toBeTruthy();
    expect(screen.getByLabelText("Open camera")).toBeTruthy();
    expect(screen.getByLabelText("Pick from gallery")).toBeTruthy();
    expect(screen.getByLabelText("Settings")).toBeTruthy();
    expect(screen.getByText("No recent PDFs")).toBeTruthy();
  });
});
