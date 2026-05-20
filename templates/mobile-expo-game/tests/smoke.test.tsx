import { render } from "@testing-library/react-native";
import Home from "../app/index";

describe("clone smoke", () => {
  it("renders without crashing", () => {
    const tree = render(<Home />);
    expect(tree.toJSON()).toBeTruthy();
  });
});
