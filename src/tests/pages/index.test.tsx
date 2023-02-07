import { render, screen } from "@testing-library/react";
import { expect, vi } from "vitest";
import IndexPage from "../../pages";

vi.mock("@saleor/app-sdk/app-bridge", () => {
  return {
    useAppBridge: () => ({
      appBridgeState: {},
      appBridge: {},
    }),
  };
});

describe("App", () => {
  it("renders text", () => {
    render(<IndexPage />);

    expect(
      screen.queryByText("Install this app in your Dashboard", { exact: false }),
    ).toBeInTheDocument();
  });
});
