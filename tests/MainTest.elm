module MainTest exposing (suite)

import Expect
import Json.Encode as E
import Main
import Test exposing (Test, describe, test)
import Test.Html.Query as Query
import Test.Html.Selector exposing (tag, text)


render : E.Value -> Query.Single Never
render flags =
    Main.init flags |> Tuple.first |> Main.view |> Query.fromHtml


suite : Test
suite =
    describe "Main"
        [ test "names the page" <|
            \_ -> Expect.equal "Growth Cells" Main.title
        , test "shows the largest population for a valid config" <|
            \_ ->
                render
                    (E.object
                        [ ( "startCells", E.int 4 )
                        , ( "epochs", E.int 10 )
                        , ( "splitChance", E.float 1 )
                        , ( "splitPeriod", E.float 2 )
                        ]
                    )
                    |> Query.has [ text "Up to 4096 cells" ]
        , test "lists every problem in an invalid config" <|
            \_ ->
                render (E.object [])
                    |> Query.findAll [ tag "li" ]
                    |> Query.count (Expect.equal 4)
        ]
