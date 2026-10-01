module MainTest exposing (suite)

import Expect
import Main
import Test exposing (Test, test)


suite : Test
suite =
    test "names the page" <|
        \_ -> Expect.equal "Growth Cells" Main.title
