import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "../app/page";

describe("clone smoke", () => {
  it("renders the home page without crashing", () => {
    render(<Page />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
