import { render, screen } from "@testing-library/react"
import InBox from "./InBox."

describe("InBox component testing", () => {

  test("", () => {

    render(<InBox></InBox>)
    screen.getByText("Caixa de entrada")

  })

})
