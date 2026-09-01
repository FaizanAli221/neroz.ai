import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Logo from "../src/components/Logo.jsx";

describe("Logo", () => {
  it("identifies Vermex AI and the product domain", () => {
    render(<Logo />);
    expect(screen.getByText("Vermex AI")).toBeInTheDocument();
    expect(screen.getByText(/vermex\.ai/i)).toBeInTheDocument();
  });
});
