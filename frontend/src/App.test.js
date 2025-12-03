import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders app title", () => {
  render(<App />);
  const titleElements = screen.getAllByText(/Roommate Finder/i);
  expect(titleElements[0]).toBeInTheDocument(); // Lấy cái đầu tiên (trong header)
});
